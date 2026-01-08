import { createClient } from "@supabase/supabase-js";

// --- Configuration ---
const BATCH_SIZE = 20; // Number of chunks to process per minute (Throttle limit)

Deno.serve(async (req) => {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: "Missing Supabase Environment Variables" }), { status: 500 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    console.log(`[BatchWorker] Starting batch processing (Limit: ${BATCH_SIZE})...`);

    // 1. Fetch chunks that are 'pending' (The Queue)
    // We order by creation time to process older chunks first (FIFO)
    const { data: pendingChunks, error: pendingError } = await supabase
      .from('translation_chunks')
      .select('*')
      .eq('status', 'pending')
      .order('chunk_index', { ascending: true }) // Prioritize early parts of articles
      .order('created_at', { ascending: true })
      .limit(BATCH_SIZE);

    if (pendingError) throw pendingError;

    let chunksToProcess = pendingChunks || [];

    // 2. If we have space left in the batch, check for 'retry' or 'stuck' items
    if (chunksToProcess.length < BATCH_SIZE) {
        const slotsRemaining = BATCH_SIZE - chunksToProcess.length;
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
        
        const { data: retryChunks, error: retryError } = await supabase
            .from('translation_chunks')
            .select('*')
            .or(`status.eq.retry,and(status.eq.processing,updated_at.lt.${twoMinutesAgo})`)
            .limit(slotsRemaining);
            
        if (retryError) throw retryError;
        
        if (retryChunks && retryChunks.length > 0) {
            chunksToProcess = [...chunksToProcess, ...retryChunks];
        }
    }

    if (chunksToProcess.length === 0) {
      console.log("[BatchWorker] No chunks to process.");
      return new Response(JSON.stringify({ message: "Queue empty" }), { headers: { "Content-Type": "application/json" } });
    }

    console.log(`[BatchWorker] Processing ${chunksToProcess.length} chunks...`);

    // 3. Trigger the Translation Worker for each chunk
    // We use fetch to call the translate-chunk function for each item
    const triggerPromises = chunksToProcess.map(async (chunk) => {
        // Update status to 'processing' immediately to prevent double-picking next run
        await supabase.from('translation_chunks').update({ status: 'processing', updated_at: new Date().toISOString() }).eq('id', chunk.id);

        return fetch(`${SUPABASE_URL}/functions/v1/translate-chunk`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` // Use Service Key to bypass RLS/Auth checks
            },
            body: JSON.stringify({ record: chunk })
        }).catch(err => console.error(`Failed to trigger chunk ${chunk.id}:`, err));
    });

    // We don't await the results of the translation itself, just the firing of the triggers
    await Promise.all(triggerPromises);

    console.log(`[BatchWorker] Successfully triggered ${chunksToProcess.length} jobs.`);

    return new Response(JSON.stringify({ success: true, processed: chunksToProcess.length }), { headers: { "Content-Type": "application/json" } });

  } catch (error) {
    console.error("[BatchWorker] Critical Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});