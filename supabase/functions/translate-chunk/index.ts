import { createClient } from "@supabase/supabase-js";

// --- Configuration ---
// Providers will be tried in this order
const PROVIDER_ORDER = ['GROQ', 'GEMINI', 'REKA', 'OPENAI'];

// --- Secrets ---
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// --- Helpers ---
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// --- Provider Interface ---
interface TranslationProvider {
    name: string;
    translate(text: string, targetLang: string): Promise<string>;
}

// --- 1. Groq Provider (Primary) ---
class GroqProvider implements TranslationProvider {
    name = "GROQ";
    apiKey = Deno.env.get("GROQ_API_KEY");

    async translate(text: string, targetLang: string): Promise<string> {
        if (!this.apiKey) throw new Error("Groq API Key missing");

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: `You are a translator. Translate the text to ${targetLang}. Return ONLY the translation.` },
                    { role: "user", content: text },
                ],
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Groq Error: ${response.status} - ${err}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content?.trim() || "";
    }
}

// --- 2. Gemini Provider (Fallback 1) ---
class GeminiProvider implements TranslationProvider {
    name = "GEMINI";
    apiKey = Deno.env.get("GEMINI_API_KEY");

    async translate(text: string, targetLang: string): Promise<string> {
        if (!this.apiKey) throw new Error("Gemini API Key missing");
        
        // Updated to Gemini 2.5 Flash (Stable/GA)
        // Note: Using v1beta endpoint which supports the newer models
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`;
        
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `Translate the following text to ${targetLang}. Return ONLY the translation:\n\n${text}` }]
                }]
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Gemini Error: ${response.status} - ${err}`);
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    }
}

// --- 3. Reka Provider (Fallback 2) ---
class RekaProvider implements TranslationProvider {
    name = "REKA";
    apiKey = Deno.env.get("REKA_API_KEY");

    async translate(text: string, targetLang: string): Promise<string> {
        if (!this.apiKey) throw new Error("Reka API Key missing");

        const response = await fetch("https://api.reka.ai/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                // Updated to reka-flash for better speed/cost in fallback scenarios
                model: "reka-flash", 
                messages: [
                    { role: "user", content: `Translate the following text to ${targetLang}. Return ONLY the translation:\n\n${text}` },
                ],
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Reka Error: ${response.status} - ${err}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content?.trim() || "";
    }
}

// --- 4. OpenAI Provider (Fallback 3) ---
class OpenAIProvider implements TranslationProvider {
    name = "OPENAI";
    apiKey = Deno.env.get("OPENAI_API_KEY");

    async translate(text: string, targetLang: string): Promise<string> {
        if (!this.apiKey) throw new Error("OpenAI API Key missing");

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                // Keeping gpt-4o-mini as the most reliable/universally accessible backup
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: `You are a translator. Translate the text to ${targetLang}. Return ONLY the translation.` },
                    { role: "user", content: text },
                ],
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`OpenAI Error: ${response.status} - ${err}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content?.trim() || "";
    }
}

// --- Main Translation Logic with Waterfall ---
async function translateWithWaterfall(text: string, targetLang: string): Promise<{ text: string, provider: string }> {
    const providers: Record<string, TranslationProvider> = {
        'GROQ': new GroqProvider(),
        'GEMINI': new GeminiProvider(),
        'REKA': new RekaProvider(),
        'OPENAI': new OpenAIProvider()
    };

    let lastError = null;

    for (const providerName of PROVIDER_ORDER) {
        const provider = providers[providerName];
        try {
            console.log(`[Waterfall] Trying ${provider.name}...`);
            const translation = await provider.translate(text, targetLang);
            if (translation && translation.length > 0) {
                console.log(`[Waterfall] Success with ${provider.name}`);
                return { text: translation, provider: provider.name };
            }
        } catch (error) {
            console.warn(`[Waterfall] ${provider.name} failed:`, error.message);
            lastError = error;
            // Continue to next provider
        }
    }

    throw new Error(`All providers failed. Last error: ${lastError?.message}`);
}

// --- Handler ---
Deno.serve(async (req) => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: "Missing Supabase Environment Variables" }), { status: 500 });
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  let chunkRecord;
  try {
    const body = await req.json(); 
    chunkRecord = body.record || body; // Expect a translation_chunk record

    if (!chunkRecord || !chunkRecord.id || !chunkRecord.original_text || !chunkRecord.language_code) {
      return new Response("Invalid chunk record provided", { status: 400 });
    }

    const { id: chunkId, original_text: textToTranslate, language_code: targetLang, attempts: currentAttempts } = chunkRecord;

    console.log(`Processing chunk ${chunkId}: translating to ${targetLang}. Attempt: ${currentAttempts + 1}`);

    // Update chunk status to processing
    await supabase.from('translation_chunks').update({ status: 'processing', attempts: currentAttempts + 1 }).eq('id', chunkId);

    let translatedContent = "";
    let providerUsed = "";
    let translationFailed = false;
    let failureReason = "";

    try {
      const result = await translateWithWaterfall(textToTranslate, targetLang);
      translatedContent = result.text;
      providerUsed = result.provider;
    } catch (err) {
      console.error(`Failed to translate chunk ${chunkId} to ${targetLang}:`, err);
      translationFailed = true;
      failureReason = err.message;
    }

    if (translationFailed) {
      const newStatus = 'retry'; 
      const errorMessage = `Waterfall failed: ${failureReason}`;
      await supabase.from('translation_chunks').update({ status: newStatus, error_message: errorMessage }).eq('id', chunkId);
      return new Response(JSON.stringify({ success: false, message: errorMessage, newStatus }), { headers: { "Content-Type": "application/json" }, status: 500 });
    }

    // Update the chunk with translated text and set status to completed
    const { error: updateError } = await supabase
      .from('translation_chunks')
      .update({
          status: 'completed',
          translated_text: translatedContent,
          error_message: null,
      })
      .eq('id', chunkId);

    if (updateError) {
      console.error(`Failed to update translation_chunks table for chunk ${chunkId}:`, updateError);
      const newStatus = 'retry';
      await supabase.from('translation_chunks').update({ status: newStatus, error_message: `DB update failed: ${updateError.message}` }).eq('id', chunkId);
      return new Response(JSON.stringify({ error: `Failed to update database: ${updateError.message}`, newStatus }), { status: 500 });
    }

    console.log(`Chunk ${chunkId} translated and updated successfully to ${targetLang} using ${providerUsed}.`);

    return new Response(JSON.stringify({ success: true, chunkId: chunkId, language: targetLang, provider: providerUsed }), { headers: { "Content-Type": "application/json" } });

  } catch (error) {
    console.error("Critical Error in translate-chunk worker:", error);
    if (chunkRecord?.id) {
      const newStatus = 'retry';
      await supabase.from('translation_chunks').update({ status: newStatus, error_message: `Critical function error: ${error.message}` }).eq('id', chunkRecord.id);
    }
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});