import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

// Environment variables for SMTP configuration
const SMTP_HOST = Deno.env.get("SMTP_HOST")!;
const SMTP_PORT = parseInt(Deno.env.get("SMTP_PORT")!, 10);
const SMTP_USER = Deno.env.get("SMTP_USER")!;
const SMTP_PASSWORD = Deno.env.get("SMTP_PASSWORD")!;
const SENDER_EMAIL_ADDRESS = Deno.env.get("SENDER_EMAIL_ADDRESS")!;
const SUPPORT_EMAIL_ADDRESS = Deno.env.get("SUPPORT_EMAIL_ADDRESS")!;

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", 
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { feedbackMessage, userEmail } = await req.json();

    if (!feedbackMessage) {
      return new Response(JSON.stringify({ error: "Feedback message is required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const client = new SmtpClient();

    // For STARTTLS (typically port 587 or 25), use connect.
    // The library should handle the STARTTLS command during the handshake.
    await client.connect({
      hostname: SMTP_HOST,
      port: SMTP_PORT,
      username: SMTP_USER,
      password: SMTP_PASSWORD,
      // The library usually infers STARTTLS or handles it automatically on port 587/25.
      // If explicit STARTTLS is needed and not automatic, check library docs for an option.
    });

    const subject = userEmail 
      ? \`New Feedback from User: \${userEmail}\` 
      : "New Anonymous Feedback";
    
    const emailBody = \`
      A user has submitted feedback:
      --------------------------------
      \${feedbackMessage}
      --------------------------------
      User Email (if provided): \${userEmail || 'Not provided'}
    \`;

    await client.send({
      from: SENDER_EMAIL_ADDRESS,
      to: SUPPORT_EMAIL_ADDRESS,
      subject: subject,
      content: emailBody, // Changed variable name from 'body' to 'emailBody' to avoid conflict
    });

    await client.close();

    return new Response(JSON.stringify({ message: "Feedback sent successfully!" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error sending feedback email:", error);
    // Check if error object has a more specific message or stack
    const errorMessage = error instanceof Error ? error.message : "Failed to send feedback.";
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Error details:", errorStack || error); 
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}); 