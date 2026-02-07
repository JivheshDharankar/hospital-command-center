import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  user_id?: string;
  phone_number: string;
  channel: "sms" | "whatsapp";
  notification_type: string;
  message: string;
  template_data?: Record<string, string>;
}

// Message templates
const TEMPLATES: Record<string, string> = {
  critical_capacity: `[CRITICAL] MediQueue AI Alert
Hospital: {hospital_name}
Status: Critical Capacity
Available Beds: {beds}
Action Required: Review patient transfers

Reply STOP to unsubscribe`,

  transfer_request: `[URGENT] MediQueue AI
New Transfer Request
From: {source_hospital}
Patient: {patient_name}
Urgency: {urgency}
Specialty Needed: {specialty}

Please respond in app.`,

  capacity_warning: `[WARNING] MediQueue AI
Hospital: {hospital_name}
Occupancy: {occupancy}%
Predicted to reach critical in {eta} minutes

Consider activating surge protocols.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");
    const twilioWhatsAppNumber = Deno.env.get("TWILIO_WHATSAPP_NUMBER");

    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: NotificationRequest = await req.json();
    const { user_id, phone_number, channel, notification_type, message, template_data } = body;

    // Validate required fields
    if (!phone_number || !channel || !notification_type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build message from template or use provided message
    let finalMessage = message;
    if (!message && TEMPLATES[notification_type]) {
      finalMessage = TEMPLATES[notification_type];
      if (template_data) {
        Object.entries(template_data).forEach(([key, value]) => {
          finalMessage = finalMessage.replace(new RegExp(`{${key}}`, "g"), value);
        });
      }
    }

    // Record notification attempt
    const { data: notification, error: insertError } = await supabase
      .from("external_notifications")
      .insert({
        user_id,
        notification_type,
        channel,
        recipient: phone_number,
        message: finalMessage,
        status: "pending"
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error recording notification:", insertError);
    }

    // Check if Twilio is configured
    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      console.log("Twilio not configured - simulating notification send");
      
      // Update status to simulated
      if (notification) {
        await supabase
          .from("external_notifications")
          .update({ 
            status: "sent", 
            sent_at: new Date().toISOString(),
            external_id: `simulated-${Date.now()}`
          })
          .eq("id", notification.id);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          simulated: true,
          message: "Notification simulated (Twilio not configured)",
          notification_id: notification?.id
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    
    const fromNumber = channel === "whatsapp" 
      ? `whatsapp:${twilioWhatsAppNumber || twilioPhoneNumber}`
      : twilioPhoneNumber;
    
    const toNumber = channel === "whatsapp"
      ? `whatsapp:${phone_number}`
      : phone_number;

    const twilioResponse = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: fromNumber,
        To: toNumber,
        Body: finalMessage,
      }),
    });

    const twilioData = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error("Twilio error:", twilioData);
      
      // Update notification with error
      if (notification) {
        await supabase
          .from("external_notifications")
          .update({ 
            status: "failed",
            error_message: twilioData.message || "Failed to send"
          })
          .eq("id", notification.id);
      }

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: twilioData.message || "Failed to send notification"
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update notification with success
    if (notification) {
      await supabase
        .from("external_notifications")
        .update({ 
          status: "sent",
          sent_at: new Date().toISOString(),
          external_id: twilioData.sid
        })
        .eq("id", notification.id);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message_sid: twilioData.sid,
        notification_id: notification?.id
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
