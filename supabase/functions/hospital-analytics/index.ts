import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HospitalAnalytics {
  totalHospitals: number;
  averageOccupancy: number;
  criticalCount: number;
  busyCount: number;
  normalCount: number;
  totalBeds: number;
  availableBeds: number;
  totalDoctors: number;
  recentUpdates: number;
  activeAlerts: number;
  byType: Record<string, number>;
  topCritical: Array<{
    name: string;
    occupancy: number;
    availableBeds: number;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase credentials not configured");
      return new Response(
        JSON.stringify({ error: 'Service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log("Fetching hospital analytics...");

    // Fetch all hospitals
    const { data: hospitals, error: hospitalError } = await supabase
      .from('hospitals')
      .select('*');
    
    if (hospitalError) {
      console.error("Error fetching hospitals:", hospitalError);
      throw hospitalError;
    }

    // Fetch recent bed updates (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentUpdates, error: updatesError } = await supabase
      .from('bed_updates')
      .select('id')
      .gte('created_at', twentyFourHoursAgo);
    
    if (updatesError) {
      console.error("Error fetching updates:", updatesError);
    }

    // Fetch active alerts
    const { data: activeAlerts, error: alertsError } = await supabase
      .from('hospital_alerts')
      .select('id')
      .eq('acknowledged', false);
    
    if (alertsError) {
      console.error("Error fetching alerts:", alertsError);
    }

    // Calculate analytics
    const totalHospitals = hospitals?.length || 0;
    const totalBeds = hospitals?.reduce((sum, h) => sum + (h.total_beds || 0), 0) || 0;
    const availableBeds = hospitals?.reduce((sum, h) => sum + (h.available_beds || 0), 0) || 0;
    const totalDoctors = hospitals?.reduce((sum, h) => sum + (h.doctors_available || 0), 0) || 0;
    
    const averageOccupancy = totalBeds > 0 
      ? Math.round((1 - availableBeds / totalBeds) * 100) 
      : 0;

    const criticalCount = hospitals?.filter(h => h.status === 'critical').length || 0;
    const busyCount = hospitals?.filter(h => h.status === 'busy').length || 0;
    const normalCount = hospitals?.filter(h => h.status === 'normal').length || 0;

    // Group by type
    const byType: Record<string, number> = {};
    hospitals?.forEach(h => {
      byType[h.type] = (byType[h.type] || 0) + 1;
    });

    // Top critical hospitals
    const topCritical = hospitals
      ?.map(h => ({
        name: h.name,
        occupancy: h.total_beds > 0 ? Math.round((1 - h.available_beds / h.total_beds) * 100) : 0,
        availableBeds: h.available_beds,
      }))
      .sort((a, b) => b.occupancy - a.occupancy)
      .slice(0, 5) || [];

    const analytics: HospitalAnalytics = {
      totalHospitals,
      averageOccupancy,
      criticalCount,
      busyCount,
      normalCount,
      totalBeds,
      availableBeds,
      totalDoctors,
      recentUpdates: recentUpdates?.length || 0,
      activeAlerts: activeAlerts?.length || 0,
      byType,
      topCritical,
    };

    console.log("Analytics computed successfully:", {
      totalHospitals,
      averageOccupancy,
      criticalCount,
    });

    return new Response(
      JSON.stringify(analytics),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Unexpected error in hospital-analytics:", error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
