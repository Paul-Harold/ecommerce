import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  try {
    const payload = await req.json()
    const order = payload.record

    const resendApiKey = Deno.env.get('RESEND_API_KEY')

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: 'Midnight OS <onboarding@resend.dev>',
        to: order.customer_email,
        subject: `[MIDNIGHT] Deployment Authorized: ${order.id}`,
        html: `
          <div style="font-family: monospace; background-color: #050608; color: #ffffff; padding: 40px;">
            <div style="max-width: 600px; margin: 0 auto; border: 1px solid #1f2937; padding: 40px; border-radius: 8px;">
              <h1 style="color: #40E0FF; text-transform: uppercase; letter-spacing: 2px;">Deployment Authorized</h1>
              <p style="color: #9ca3af;">Transmission routed to: ${order.customer_first_name} ${order.customer_last_name}</p>
              
              <hr style="border: 1px dashed #374151; margin: 30px 0;" />
              
              <h3 style="text-transform: uppercase; color: #39FF14;">Order Manifest</h3>
              <p><strong>Order ID:</strong> ${order.id}</p>
              <p><strong>Total Authorized:</strong> $${order.total_amount}</p>
              <p><strong>Shipping To:</strong><br/>
              ${order.shipping_address}<br/>
              ${order.shipping_city}, ${order.shipping_zip}
              </p>

              <hr style="border: 1px dashed #374151; margin: 30px 0;" />
              <p style="color: #6b7280; font-size: 10px; text-transform: uppercase;">End of Transmission /// Midnight Hardware Division</p>
            </div>
          </div>
        `
      })
    })

    const data = await res.json()
    return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})