import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const payload = await req.json()
    const subscriber = payload.record

    // 1. Connect back to Supabase to fetch your custom email text
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: templateData } = await supabase
      .from('site_content')
      .select('content_data')
      .eq('page_name', 'newsletter_template')
      .maybeSingle()

    // Use the custom content, or fallbacks if it's missing
    const content = templateData?.content_data || {
      subject: "Welcome to Midnight OS",
      heading: "WELCOME TO THE GRID",
      message: "Thanks for subscribing.",
      promo_code: "WELCOME10"
    }

    // 2. Send the email via Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: 'Midnight OS <onboarding@resend.dev>',
        to: subscriber.email,
        subject: content.subject,
        html: `
          <div style="font-family: monospace; background-color: #050608; color: #ffffff; padding: 40px; text-align: center;">
            <div style="max-width: 600px; margin: 0 auto; border: 1px solid #1f2937; padding: 40px; border-radius: 8px;">
              <h1 style="color: #40E0FF; text-transform: uppercase; letter-spacing: 2px;">${content.heading}</h1>
              <p style="color: #9ca3af; line-height: 1.6;">${content.message}</p>
              
              <div style="margin: 40px 0; padding: 20px; background-color: #111827; border: 1px dashed #40E0FF;">
                <p style="margin: 0; color: #39FF14; font-size: 24px; font-weight: bold; letter-spacing: 4px;">${content.promo_code}</p>
              </div>

              <hr style="border: 1px dashed #374151; margin: 30px 0;" />
              <p style="color: #6b7280; font-size: 10px; text-transform: uppercase;">End of Transmission /// Midnight OS</p>
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