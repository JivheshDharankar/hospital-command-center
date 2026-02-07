import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch hospitals
    const { data: hospitals, error: hospitalError } = await supabase
      .from("hospitals")
      .select("id, name, available_beds, total_beds, status, doctors_available");

    if (hospitalError) throw hospitalError;

    // Fetch last 30 days of analytics
    const { data: analytics, error: analyticsError } = await supabase
      .from("analytics_snapshots")
      .select("*")
      .gte("snapshot_date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
      .order("snapshot_date", { ascending: false });

    if (analyticsError) throw analyticsError;

    // Fetch current department stats
    const { data: deptStats, error: deptError } = await supabase
      .from("department_stats")
      .select("*");

    if (deptError) throw deptError;

    // Calculate predictions using AI if available
    let predictions = [];

    if (lovableApiKey) {
      // Use Lovable AI for sophisticated predictions
      const currentHour = new Date().getHours();
      const dayOfWeek = new Date().getDay();
      
      const prompt = `You are a hospital wait time prediction AI. Analyze the following data and predict wait times for each hospital.

Current time: ${currentHour}:00, Day: ${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayOfWeek]}

Hospitals:
${hospitals?.map(h => `- ${h.name}: ${h.available_beds}/${h.total_beds} beds, ${h.doctors_available} doctors, status: ${h.status}`).join("\n")}

Historical patterns (last 30 days avg):
- Average occupancy: ${analytics?.length ? Math.round(analytics.reduce((s, a) => s + Number(a.occupancy_rate), 0) / analytics.length) : 75}%
- Average wait time: ${analytics?.length ? Math.round(analytics.reduce((s, a) => s + a.avg_wait_minutes, 0) / analytics.length) : 25} minutes

Department current queues:
${deptStats?.map(d => `- ${d.department}: ${d.current_queue} waiting, avg ${d.avg_wait_minutes} min`).join("\n")}

For each hospital, provide a JSON array with predictions. Consider:
1. Time of day patterns (rush hours: 9-11am, 5-8pm)
2. Day of week (weekdays busier than weekends)
3. Current occupancy and queue lengths
4. Staff availability

Return ONLY a valid JSON array like:
[{"hospital_id": "uuid", "hospital_name": "name", "predicted_wait_minutes": 25, "confidence": "medium", "trend": "stable", "reasoning": "brief explanation"}]`;

      try {
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: "You are a hospital analytics AI. Return only valid JSON arrays." },
              { role: "user", content: prompt }
            ],
            temperature: 0.3,
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content || "";
          
          // Extract JSON from response
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            predictions = parsed.map((p: any) => ({
              hospital_id: p.hospital_id || hospitals?.find(h => h.name === p.hospital_name)?.id,
              hospital_name: p.hospital_name,
              predicted_wait_minutes: p.predicted_wait_minutes || 25,
              confidence: p.confidence || "medium",
              trend: p.trend || "stable",
              reasoning: p.reasoning || "Based on current occupancy and historical patterns"
            }));
          }
        }
      } catch (aiError) {
        console.error("AI prediction failed, using fallback:", aiError);
      }
    }

    // Fallback: Calculate predictions using simple heuristics
    if (predictions.length === 0) {
      predictions = hospitals?.map(h => {
        const occupancyRate = 1 - h.available_beds / h.total_beds;
        const baseWait = 15;
        const occupancyFactor = occupancyRate * 40;
        const doctorFactor = Math.max(0, (5 - h.doctors_available) * 5);
        
        const predictedWait = Math.round(baseWait + occupancyFactor + doctorFactor);
        
        let confidence: "low" | "medium" | "high" = "medium";
        if (analytics && analytics.length > 20) confidence = "high";
        else if (analytics && analytics.length < 5) confidence = "low";

        let trend: "increasing" | "stable" | "decreasing" = "stable";
        if (occupancyRate > 0.8) trend = "increasing";
        else if (occupancyRate < 0.5) trend = "decreasing";

        return {
          hospital_id: h.id,
          hospital_name: h.name,
          predicted_wait_minutes: predictedWait,
          confidence,
          trend,
          reasoning: `Based on ${Math.round(occupancyRate * 100)}% occupancy and ${h.doctors_available} available doctors`
        };
      }) || [];
    }

    return new Response(
      JSON.stringify({
        predictions,
        generated_at: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error predicting wait times:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
