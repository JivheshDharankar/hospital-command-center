import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TriageResponse {
  urgency_level: 'low' | 'medium' | 'high' | 'emergency';
  recommended_department: string;
  message: string;
  risk_signals: string[];
  what_if_analysis: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symptoms, user_id } = await req.json();
    
    if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length === 0) {
      console.error("Invalid symptoms input received");
      return new Response(
        JSON.stringify({ error: 'Symptoms text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyzing symptoms for user: ${user_id || 'anonymous'}`);
    console.log(`Symptoms: ${symptoms.substring(0, 100)}...`);

    // Call Lovable AI Gateway
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are an AI medical triage assistant for MediQueue AI, a hospital queue management system. 
Your role is to analyze patient symptoms and provide preliminary triage recommendations.

IMPORTANT DISCLAIMERS:
- You are NOT a doctor and this is NOT medical advice
- Always recommend professional medical consultation
- For emergencies, always recommend calling emergency services

Respond in JSON format with these exact fields:
{
  "urgency_level": "low" | "medium" | "high" | "emergency",
  "recommended_department": "department name",
  "message": "brief assessment message",
  "risk_signals": ["list of concerning symptoms detected"],
  "what_if_analysis": "scenario if symptoms worsen"
}

Department options: General Medicine, Cardiology, Neurology, Orthopedics, Pediatrics, Emergency, Gastroenterology, Pulmonology, Dermatology, Psychiatry`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze these symptoms and provide triage recommendation:\n\n${symptoms}` }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error(`AI API error: ${aiResponse.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ error: 'AI analysis failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error("No content in AI response");
      return new Response(
        JSON.stringify({ error: 'Invalid AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("AI response received successfully");

    // Parse JSON from AI response
    let triageResult: TriageResponse;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      triageResult = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      // Fallback response
      triageResult = {
        urgency_level: 'medium',
        recommended_department: 'General Medicine',
        message: 'Please consult with a healthcare professional for proper evaluation.',
        risk_signals: [],
        what_if_analysis: 'If symptoms persist or worsen, seek immediate medical attention.'
      };
    }

    // Log to database if Supabase is available
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { error: logError } = await supabase.from('triage_logs').insert({
        user_id: user_id || null,
        symptoms: symptoms,
        ai_response: triageResult,
        recommended_department: triageResult.recommended_department,
        urgency_level: triageResult.urgency_level,
      });
      
      if (logError) {
        console.error("Failed to log triage result:", logError);
      } else {
        console.log("Triage result logged successfully");
      }
    }

    return new Response(
      JSON.stringify(triageResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Unexpected error in analyze-symptoms:", error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
