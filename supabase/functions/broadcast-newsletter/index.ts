import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: subscribers } = await supabase
      .from('subscribers')
      .select('email')

    if (!subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ message: "No subscribers found." }), { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    const emails = subscribers.map(sub => ({
      from: 'Midnight OS <onboarding@resend.dev>',
      to: sub.email,
      subject: payload.subject,
      html: `
        <div style="font-family: monospace; background-color: #050608; color: #ffffff; padding: 40px; text-align: center;">
          <div style="max-width: 600px; margin: 0 auto; border: 1px solid #1f2937; padding: 40px; border-radius: 8px;">
            <h1 style="color: #40E0FF; text-transform: uppercase; letter-spacing: 2px;">${payload.heading}</h1>
            <p style="color: #9ca3af; line-height: 1.6;">${payload.message}</p>
            
            <div style="margin: 40px 0; padding: 20px; background-color: #111827; border: 1px dashed #40E0FF;">
              <p style="margin: 0; color: #39FF14; font-size: 24px; font-weight: bold; letter-spacing: 4px;">${payload.promo_code}</p>
            </div>

            <hr style="border: 1px dashed #374151; margin: 30px 0;" />
            <p style="color: #6b7280; font-size: 10px; text-transform: uppercase;">End of Transmission /// Midnight OS</p>
          </div>
        </div>
      `
    }))

    const res = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify(emails)
    })

    const data = await res.json()
    return new Response(JSON.stringify(data), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})