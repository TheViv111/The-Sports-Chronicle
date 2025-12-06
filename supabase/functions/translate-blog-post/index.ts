
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// All 26 target languages
const ALL_LANGUAGES = [
    'es', 'fr', 'de', 'it', 'pt', 'ru', 'pl', 'nl', 'sv', 'no', 'da',
    'fi', 'zh', 'ja', 'ko', 'hi', 'bn', 'ta', 'te', 'mr', 'gu', 'ar',
    'he', 'fa', 'tr', 'th'
];

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
        if (!geminiApiKey) {
            throw new Error('GEMINI_API_KEY is not set')
        }

        const genAI = new GoogleGenerativeAI(geminiApiKey)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

        const payload = await req.json()
        const blogPost = payload.record || payload

        // Safety Loop Protection:
        // If this is an UPDATE, check if only translations changed.
        // If title/content/excerpt/category are identical to old_record, we skip.
        if (payload.type === 'UPDATE' && payload.old_record) {
            const old = payload.old_record;
            // Check if "content" fields are same. 
            // Note: Supabase webhooks send all columns.
            const isContentSame =
                old.title === blogPost.title &&
                old.content === blogPost.content &&
                old.excerpt === blogPost.excerpt &&
                old.category === blogPost.category;

            if (isContentSame) {
                console.log(`Skipping translation for ${blogPost.id} - Content unchanged.`);
                return new Response(
                    JSON.stringify({ message: "Skipped: Content unchanged" }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }
        }

        if (!blogPost || !blogPost.id) {
            throw new Error('No blog post record provided')
        }

        console.log(`Processing translation for: ${blogPost.title} (${blogPost.id})`)

        const contentToTranslate = {
            title: blogPost.title,
            content: blogPost.content,
            excerpt: blogPost.excerpt,
            category: blogPost.category
        }

        // BATCHING STRATEGY
        // We split languages into chunks of 5 to avoid output token limits.
        const BATCH_SIZE = 5;
        let combinedTranslations = {};

        // We can run batches in parallel or series. 
        // Parallel is faster but might hit Rate Limits (15 RPM for free tier).
        // 26 langs / 5 = 6 requests. 6 requests is fine for 15 RPM if we are the only user.
        // But to be safe, we'll do them sequentially or with small concurrency.
        // Let's do sequential for maximum safety on Free Tier.

        for (let i = 0; i < ALL_LANGUAGES.length; i += BATCH_SIZE) {
            const batch = ALL_LANGUAGES.slice(i, i + BATCH_SIZE);
            console.log(`Translating batch: ${batch.join(', ')}`);

            const prompt = `
          You are a professional translator. 
          Translate the following JSON object into these languages: ${batch.join(', ')}.
          
          Input JSON:
          ${JSON.stringify(contentToTranslate)}

          Instructions:
          - PROHIBITED: Do not include markdown code blocks (like \`\`\`json). Return RAW JSON only.
          - Output format: a JSON object where keys are language codes and values are the translated objects.
          - Example: { "es": { "title": "...", ... }, "fr": { ... } }
        `

            try {
                const result = await model.generateContent(prompt)
                const response = await result.response
                const text = response.text()

                // Clean up
                const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim()
                const batchResult = JSON.parse(cleanText)

                combinedTranslations = { ...combinedTranslations, ...batchResult }

            } catch (batchError) {
                console.error(`Error translating batch ${batch}:`, batchError)
                // We continue to next batch, best effort
            }
        }

        // Update Supabase
        // We fetch current translations first to merge? 
        // Or just overwrite? The prompt implies we want to have ALL translations.
        // If we overwrite, we might lose manual fixes? 
        // Requirement was "translate them all". Overwriting is safer to ensure consistency with latest content.
        // BUT we should merge with existing keys if they are NOT in our list? (Unlikely).
        // Let's simplified: Overwrite or Merge with existing?
        // Given we are doing "all languages", we can just save our result.
        // Actually, safer to merge with existing in DB *if* we want to preserve other langs not in list?
        // But we cover all langs.
        // Let's do a merge: existing || new

        // Actually, simple update is best.
        const { error: updateError } = await supabaseClient
            .from('blog_posts')
            .update({ translations: combinedTranslations })
            .eq('id', blogPost.id)

        if (updateError) throw updateError

        return new Response(
            JSON.stringify({ success: true, translated_languages: Object.keys(combinedTranslations) }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('Error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
    }
})
