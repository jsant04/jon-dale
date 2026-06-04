import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = "re_PUsV8We4_KqTFgF1YEoaNPGNLib6oREvs";
const NOTIFY_EMAIL   = "ddjeasidao@gmail.com";
const FROM_EMAIL     = "onboarding@resend.dev";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { guestName, seats, status } = await req.json();

    const attending   = status === "attending";
    const statusLabel = attending ? "Attending" : "Declined";
    const seatsLine   = attending
      ? `<p><strong>Confirmed seats:</strong> ${seats}</p>`
      : "";

    const html = `
      <h2>New RSVP Response</h2>
      <p><strong>Guest:</strong> ${guestName}</p>
      <p><strong>Status:</strong> ${statusLabel}</p>
      ${seatsLine}
      <hr/>
      <p style="color:#888;font-size:12px">Sent automatically from your wedding RSVP site.</p>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to:   [NOTIFY_EMAIL],
        subject: `RSVP: ${guestName} - ${statusLabel}`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", err);
      return new Response(JSON.stringify({ error: err }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    return new Response(JSON.stringify({ sent: true }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
