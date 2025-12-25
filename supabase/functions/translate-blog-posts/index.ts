    /// <reference path="../global.d.ts" />

    Deno.serve(async (req: Request) => {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (req.method === "OPTIONS") {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const TARGET_LANGUAGES = [
        { code: "es", name: "Spanish" },
        { code: "fr", name: "French" },
        { code: "de", name: "German" },
        { code: "it", name: "Italian" },
        { code: "pt", name: "Portuguese" },
        { code: "ru", name: "Russian" },
        { code: "pl", name: "Polish" },
        { code: "nl", name: "Dutch" },
        { code: "sv", name: "Swedish" },
        { code: "no", name: "Norwegian" },
        { code: "da", name: "Danish" },
        { code: "fi", name: "Finnish" },
        { code: "zh", name: "Chinese (Simplified)" },
        { code: "ja", name: "Japanese" },
        { code: "ko", name: "Korean" },
        { code: "hi", name: "Hindi" },
        { code: "bn", name: "Bengali" },
        { code: "ta", name: "Tamil" },
        { code: "te", name: "Telugu" },
        { code: "mr", name: "Marathi" },
        { code: "gu", name: "Gujarati" },
        { code: "ar", name: "Arabic" },
        { code: "he", name: "Hebrew" },
        { code: "fa", name: "Persian" },
        { code: "tr", name: "Turkish" },
        { code: "th", name: "Thai" },
    ];

    async function geminiTranslate(key: string, prompt: string): Promise<string> {
        const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${key}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 8192 },
            }),
        }
        );
        if (!res.ok) {
        let errorText = '';
        try {
            errorText = await res.text();
        } catch (e) {
            errorText = 'Could not read error response';
        }
        throw new Error(`Gemini ${res.status}: ${errorText.substring(0, 200)}`);
        }
        let data: any;
        try {
        data = await res.json();
        } catch (e) {
        throw new Error(`Gemini returned invalid JSON response`);
        }
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (!text) throw new Error("Gemini returned empty response");
        return text;
    }

    async function groqTranslate(key: string, prompt: string): Promise<string> {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({
            model: "llama-3.1-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
            max_tokens: 8192,
        }),
        });
        if (!res.ok) {
        let errorText = '';
        try {
            errorText = await res.text();
        } catch (e) {
            errorText = 'Could not read error response';
        }
        throw new Error(`Groq ${res.status}: ${errorText.substring(0, 200)}`);
        }
        let data: any;
        try {
        data = await res.json();
        } catch (e) {
        throw new Error(`Groq returned invalid JSON response`);
        }
        const text = data?.choices?.[0]?.message?.content?.trim();
        if (!text) throw new Error("Groq returned empty response");
        return text;
    }

    async function deepseekTranslate(key: string, prompt: string): Promise<string> {
        const res = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({
            model: "deepseek-chat",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
            max_tokens: 8192,
        }),
        });
        if (!res.ok) {
        let errorText = '';
        try {
            errorText = await res.text();
        } catch (e) {
            errorText = 'Could not read error response';
        }
        throw new Error(`DeepSeek ${res.status}: ${errorText.substring(0, 200)}`);
        }
        let data: any;
        try {
        data = await res.json();
        } catch (e) {
        throw new Error(`DeepSeek returned invalid JSON response`);
        }
        const text = data?.choices?.[0]?.message?.content?.trim();
        if (!text) throw new Error("DeepSeek returned empty response");
        return text;
    }

    async function translateWithFallback(
        keys: { gemini?: string; groq?: string; deepseek?: string },
        text: string,
        lang: string,
        isHtml: boolean
    ): Promise<{ text: string; provider: string }> {
        const htmlNote = isHtml ? " Preserve all HTML tags exactly as they are - only translate the text content within the tags." : "";
        const prompt = `Translate the following text to ${lang}.${htmlNote} Return ONLY the translated text, nothing else.

    Text to translate:
    ${text}`;

        const providers: { name: string; key?: string; fn: (k: string, p: string) => Promise<string> }[] = [
        { name: "Gemini", key: keys.gemini, fn: geminiTranslate },
        { name: "Groq", key: keys.groq, fn: groqTranslate },
        { name: "DeepSeek", key: keys.deepseek, fn: deepseekTranslate },
        ];

        for (const provider of providers) {
        if (!provider.key) continue;

        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
            const result = await provider.fn(provider.key, prompt);
            if (result) return { text: result, provider: provider.name };
            } catch (e: unknown) {
            const error = e instanceof Error ? e : new Error(String(e));
            console.log(`${provider.name} attempt ${attempt} failed: ${error.message}`);
            
            // If rate limited, wait longer and try next provider
            if (error.message.includes("429")) {
                console.log(`${provider.name} rate limited, switching to next provider...`);
                await delay(5000 * attempt); // 5s, 10s for rate limits
                break;
            }
            
            // Retry with delay for other errors
            if (attempt < 2) {
                await delay(2000 * attempt); // 2s, 4s
            }
            }
        }
        }

        throw new Error("All translation providers failed");
    }

    try {
        const keys = {
        gemini: Deno.env.get("GEMINI_API_KEY"),
        groq: Deno.env.get("GROQ_API_KEY"),
        deepseek: Deno.env.get("DEEPSEEK_API_KEY"),
        };

        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        // Validate environment
        const availableProviders = [
        keys.gemini && "Gemini",
        keys.groq && "Groq",
        keys.deepseek && "DeepSeek",
        ].filter(Boolean) as string[];

        if (availableProviders.length === 0) {
        return new Response(
            JSON.stringify({ success: false, error: "No API keys configured" }),
            { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
        }

        if (!supabaseUrl || !serviceKey) {
        return new Response(
            JSON.stringify({ success: false, error: "Supabase credentials missing" }),
            { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
        }

        // Parse request
        let postId: string | undefined;
        let limit = 1; // Default to 1 post for safety
        try {
        const contentType = req.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            try {
            const body = await req.json();
            if (body && typeof body === 'object') {
                postId = body.postId;
                if (typeof body.limit === 'number') {
                limit = Math.min(Math.max(1, body.limit), 10); // Clamp between 1-10
                }
            }
            } catch (e) {
            // Invalid JSON, use defaults
            console.log("Invalid JSON in request body, using defaults");
            }
        }
        } catch (e: unknown) {
        // No body or invalid JSON, use defaults
        console.log("No request body or invalid JSON, using defaults");
        }

        // Fetch posts - we'll filter client-side for posts needing translation
        // (PostgREST can't easily query for empty JSON objects, so we filter after fetching)
        let url = `${supabaseUrl}/rest/v1/blog_posts?select=id,title,excerpt,content,category,translations&order=created_at.desc`;
        if (postId) {
        url += `&id=eq.${postId}`;
        } else {
        // Fetch a reasonable batch (up to 50) to find posts needing translation
        // Most posts likely need translation, so this should be sufficient
        url += `&limit=50`;
        }

        console.log("Fetching posts...");
        const postsRes = await fetch(url, {
        headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
        });

        if (!postsRes.ok) {
        let errorText = '';
        try {
            errorText = await postsRes.text();
        } catch (e) {
            errorText = 'Could not read error response';
        }
        return new Response(
            JSON.stringify({ 
            success: false, 
            error: `Failed to fetch posts: ${postsRes.status}`,
            details: errorText.substring(0, 500)
            }),
            { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
        }

        let posts: Array<{
        id: string;
        title: string;
        excerpt: string;
        content: string;
        category: string;
        translations: Record<string, any> | null | string | undefined;
        }>;
        try {
        posts = await postsRes.json();
        if (!Array.isArray(posts)) {
            throw new Error("Posts response is not an array");
        }
        } catch (e: unknown) {
        const error = e instanceof Error ? e : new Error(String(e));
        return new Response(
            JSON.stringify({ 
            success: false, 
            error: `Failed to parse posts response: ${error.message}`
            }),
            { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
        }

        console.log(`Fetched ${posts.length} total posts`);
        if (posts.length > 0) {
        console.log(`Sample post translations value:`, JSON.stringify(posts[0].translations));
        }

        // Filter to only posts that need translation
        // Handle: null, undefined, empty string, empty object, or object with no language keys
        const postsNeedingTranslation = posts.filter(p => {
        const trans = p.translations;
        
        // null or undefined
        if (trans == null) return true;
        
        // empty string
        if (typeof trans === 'string' && trans.trim() === '') return true;
        
        // empty object or object with no meaningful translations
        if (typeof trans === 'object') {
            const keys = Object.keys(trans);
            // Empty object or object with only empty/null values
            if (keys.length === 0) return true;
            // Check if all values are empty/null
            const hasValidTranslations = keys.some(key => {
            const langTrans = trans[key];
            return langTrans && typeof langTrans === 'object' && 
                    (langTrans.title || langTrans.content || langTrans.excerpt);
            });
            return !hasValidTranslations;
        }
        
        return false; // has valid translations
        }).slice(0, limit); // Apply limit after filtering

        console.log(`Found ${postsNeedingTranslation.length} posts needing translation (out of ${posts.length} total)`);

        if (!postsNeedingTranslation.length) {
        return new Response(
            JSON.stringify({ 
            success: true, 
            message: `No posts need translation. Checked ${posts.length} posts, all appear to have translations.`,
            availableProviders,
            totalPostsChecked: posts.length
            }),
            { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
        }

        console.log(`Providers: ${availableProviders.join(", ")}`);
        console.log(`Processing ${postsNeedingTranslation.length} post(s) that need translation...`);

        const results: Array<{
        postId: string;
        title: string;
        success: boolean;
        languages: number;
        providersUsed: string[];
        error?: string;
        }> = [];

        for (const post of postsNeedingTranslation) {
        console.log(`\n=== ${post.title} ===`);
        const translations: Record<string, {
            title: string;
            excerpt: string;
            content: string;
            category: string;
        }> = {};
        const providersUsed = new Set<string>();

        for (let i = 0; i < TARGET_LANGUAGES.length; i++) {
            const lang = TARGET_LANGUAGES[i];
            try {
            console.log(`${lang.name} (${i + 1}/${TARGET_LANGUAGES.length})...`);

            const t = await translateWithFallback(keys, post.title, lang.name, false);
            providersUsed.add(t.provider);
            await delay(1000);

            const e = await translateWithFallback(keys, post.excerpt, lang.name, false);
            providersUsed.add(e.provider);
            await delay(1000);

            const c = await translateWithFallback(keys, post.content, lang.name, true);
            providersUsed.add(c.provider);
            await delay(1000);

            const cat = await translateWithFallback(keys, post.category, lang.name, false);
            providersUsed.add(cat.provider);

            translations[lang.code] = {
                title: t.text,
                excerpt: e.text,
                content: c.text,
                category: cat.text,
            };

            console.log(`✓ ${lang.name} done`);
            await delay(2000);
            } catch (e: unknown) {
            const error = e instanceof Error ? e : new Error(String(e));
            console.log(`✗ ${lang.name} failed: ${error.message}`);
            }
        }

        // Save to DB
        const updateRes = await fetch(`${supabaseUrl}/rest/v1/blog_posts?id=eq.${post.id}`, {
            method: "PATCH",
            headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
            },
            body: JSON.stringify({ translations }),
        });

        if (!updateRes.ok) {
            let errorText = '';
            try {
            errorText = await updateRes.text();
            } catch (e) {
            errorText = 'Could not read error response';
            }
            results.push({
            postId: post.id,
            title: post.title,
            success: false,
            languages: Object.keys(translations).length,
            providersUsed: Array.from(providersUsed),
            error: `Database update failed: ${updateRes.status} - ${errorText.substring(0, 200)}`,
            });
        } else {
            results.push({
            postId: post.id,
            title: post.title,
            success: true,
            languages: Object.keys(translations).length,
            providersUsed: Array.from(providersUsed),
            });
        }

        // 3 seconds between posts
        if (postsNeedingTranslation.indexOf(post) < postsNeedingTranslation.length - 1) {
            await delay(3000);
        }
        }

        const successCount = results.filter((r) => r.success).length;
        const totalLangs = results.reduce((sum, r) => sum + r.languages, 0);

        return new Response(
        JSON.stringify({
            success: successCount > 0,
            message: `Processed ${successCount}/${postsNeedingTranslation.length} posts (${totalLangs} total translations)`,
            availableProviders,
            results,
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
    } catch (e: unknown) {
        let errorMessage = "Unknown error";
        try {
        if (e instanceof Error) {
            errorMessage = e.message || "Error occurred";
        } else if (e && typeof e === 'object' && 'message' in e) {
            errorMessage = String((e as any).message) || "Error occurred";
        } else {
            errorMessage = String(e) || "Unknown error";
        }
        } catch (parseError) {
        errorMessage = "Failed to parse error";
        }
        console.error("Fatal error:", errorMessage);
        return new Response(
        JSON.stringify({ success: false, error: errorMessage }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
    }
    });
