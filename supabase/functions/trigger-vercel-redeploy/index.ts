import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify the request is from Supabase
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Unauthorized')
    }

    const token = authHeader.replace('Bearer ', '')
    if (token !== Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')) {
      throw new Error('Invalid token')
    }

    // Get Vercel webhook URL from environment variables
    const vercelWebhookUrl = Deno.env.get('VERCEL_WEBHOOK_URL')
    if (!vercelWebhookUrl) {
      throw new Error('Vercel webhook URL not configured')
    }

    // Trigger Vercel redeploy
    const response = await fetch(vercelWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'sitemap-update',
        timestamp: new Date().toISOString(),
        message: 'Blog post updated - regenerating sitemap'
      })
    })

    if (!response.ok) {
      throw new Error(`Vercel webhook failed: ${response.statusText}`)
    }

    console.log('✅ Successfully triggered Vercel redeploy for sitemap update')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Vercel redeploy triggered successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('❌ Error triggering Vercel redeploy:', errorMessage)
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
