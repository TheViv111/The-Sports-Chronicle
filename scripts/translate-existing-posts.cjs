
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
// Use Service Role Key for backfill to bypass potential RLS or trigger issues if needed
// Fallback to Anon Key if user hasn't set Service Key (might fail RLS)
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";

if (!SUPABASE_URL || !GEMINI_API_KEY) {
    console.error('❌ Missing credentials.');
    console.error('Ensure .env has VITE_SUPABASE_URL and GEMINI_API_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const ALL_LANGUAGES = [
    'es', 'fr', 'de', 'it', 'pt', 'ru', 'pl', 'nl', 'sv', 'no', 'da',
    'fi', 'zh', 'ja', 'ko', 'hi', 'bn', 'ta', 'te', 'mr', 'gu', 'ar',
    'he', 'fa', 'tr', 'th'
];

async function translatePost(post) {
    console.log(`\n--------------------------------------------------`);
    console.log(`Processing: "${post.title}" (${post.id})`);

    const contentToTranslate = {
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        category: post.category
    };

    const BATCH_SIZE = 5;
    let combinedTranslations = { ...post.translations }; // Keep existing, overwrite with new

    for (let i = 0; i < ALL_LANGUAGES.length; i += BATCH_SIZE) {
        const batch = ALL_LANGUAGES.slice(i, i + BATCH_SIZE);
        // Skip if specific language already exists? 
        // User said "translate them all". Better to refresh all to ensure consistency.
        // But passing "translate missing" might be efficient?
        // Let's refresh ALL for now as requested.

        console.log(`  > Translating batch: ${batch.join(', ')} ...`);

        const prompt = `
        You are a professional translator. 
        Translate the following JSON object into these languages: ${batch.join(', ')}.
        
        Input JSON:
        ${JSON.stringify(contentToTranslate)}

        Instructions:
        - Return valid JSON only. No markdown.
        - Format: { "lang_code": { "title": "...", ... } }
      `;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            if (!response.ok) {
                const txt = await response.text();
                throw new Error(`API Error ${response.status}: ${txt}`);
            }

            const data = await response.json();
            const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!candidate) throw new Error('No response content');

            const cleanJson = candidate.replace(/```json/g, '').replace(/```/g, '').trim();
            const batchResult = JSON.parse(cleanJson);

            // Merge
            combinedTranslations = { ...combinedTranslations, ...batchResult };

        } catch (err) {
            console.error(`  ❌ Failed batch ${batch}:`, err.message);
        }

        // Small delay to be nice to API
        await new Promise(r => setTimeout(r, 1000));
    }

    // Update DB
    const { error } = await supabase
        .from('blog_posts')
        .update({ translations: combinedTranslations })
        .eq('id', post.id);

    if (error) {
        console.error(`❌ DB Update Error:`, error.message);
    } else {
        console.log(`✅ Successfully updated post.`);
    }
}

async function run() {
    console.log('🚀 Starting Backfill Translation...');

    const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('*');

    if (error) {
        console.error('Error fetching posts:', error);
        return;
    }

    // Filter? Or just update all? User said "translate them all".
    console.log(`Found ${posts.length} posts. Starting processing...`);

    for (const post of posts) {
        await translatePost(post);
    }

    console.log('\n🎉 All done!');
}

run();
