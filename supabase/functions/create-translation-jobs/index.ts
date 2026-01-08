import { createClient } from "@supabase/supabase-js";

// Full list of languages to translate to
const ALL_LANGUAGES = [
    'es', 'fr', 'de', 'it', 'pt', 'ru', 'pl', 'nl', 'sv', 'no', 'da',
    'fi', 'zh', 'ja', 'ko', 'hi', 'bn', 'ta', 'te', 'mr', 'gu', 'ar',
    'he', 'fa', 'tr', 'th'
];

// --- Chunking Configuration ---
const MAX_CHUNK_LENGTH = 1500; // Max characters per chunk. Adjust based on Groq limits and desired granularity.

// --- Helper to split text into chunks ---
function chunkText(text: string): string[] {
    if (!text || text.length === 0) return ["" ];

    const chunks: string[] = [];
    let currentPosition = 0;

    while (currentPosition < text.length) {
        let endPosition = Math.min(currentPosition + MAX_CHUNK_LENGTH, text.length);

        // Try to break at a sentence or paragraph boundary if possible
        let idealBreak = text.lastIndexOf('.', endPosition);
        if (idealBreak > currentPosition + MAX_CHUNK_LENGTH * 0.7) { // Ensure chunk isn't too small
            endPosition = idealBreak + 1;
        } else {
            idealBreak = text.lastIndexOf('\n', endPosition);
            if (idealBreak > currentPosition + MAX_CHUNK_LENGTH * 0.7) {
                endPosition = idealBreak + 1;
            }
        }
        
        // Fallback to word boundary if no ideal break is found
        if (endPosition === currentPosition + MAX_CHUNK_LENGTH && endPosition < text.length) {
            const lastSpace = text.lastIndexOf(' ', endPosition);
            if (lastSpace > currentPosition) {
                endPosition = lastSpace;
            }
        }

        chunks.push(text.substring(currentPosition, endPosition).trim());
        currentPosition = endPosition;
        // Skip leading whitespace for the next chunk
        while (currentPosition < text.length && /\s/.test(text[currentPosition])) {
            currentPosition++;
        }
    }
    return chunks.filter(chunk => chunk.length > 0); // Filter out empty chunks
}


Deno.serve(async (req) => {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: "Missing Supabase Environment Variables" }), { status: 500 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const { record } = await req.json(); // record is the new/updated blog_post

    if (!record || !record.id) {
      return new Response("No blog_post record provided", { status: 400 });
    }

    console.log(`[CreateJobs] Processing blog post: ${record.id} (${record.title})`);

    // --- 1. Create/Reset Parent translation_jobs for each language ---
    // This will create a job if it doesn't exist, or update it to 'pending_chunks' if it does
    const jobInserts = ALL_LANGUAGES.map(lang => ({
      blog_post_id: record.id,
      language_code: lang,
      status: 'pending_chunks', // New status for overall job orchestration
      attempts: 0,
      total_chunks: 0, // Will be updated after chunking
      chunks_completed: 0
    }));

    const { data: createdJobs, error: upsertJobsError } = await supabase
        .from("translation_jobs")
        .upsert(jobInserts, { onConflict: 'blog_post_id,language_code' }) // Update if exists, insert if not
        .select('id, language_code'); // Select IDs of the jobs for chunk linking

    if (upsertJobsError) {
        console.error("[CreateJobs] Error upserting translation jobs:", upsertJobsError);
        return new Response(JSON.stringify({ error: `Failed to upsert translation jobs: ${upsertJobsError.message}` }), { status: 500 });
    }

    if (!createdJobs || createdJobs.length === 0) {
        console.warn("[CreateJobs] No jobs were created or updated.");
        return new Response(JSON.stringify({ success: false, message: "No jobs processed" }), { headers: { "Content-Type": "application/json" } });
    }

    console.log(`[CreateJobs] Upserted/Reset ${createdJobs.length} parent translation jobs.`);

    // --- 2. Chunk the content and create/reset translation_chunks entries ---
    const contentChunks = chunkText(record.content || "");
    const titleChunks = chunkText(record.title || ""); // Treat title as a chunk
    const excerptChunks = chunkText(record.excerpt || ""); // Treat excerpt as a chunk

    const chunkInserts: any[] = [];

    // Process chunks for each created job
    for (const job of createdJobs) {
        let jobSpecificChunkIndex = 0; // Reset index for each job

        // Insert title chunks
        for (const originalTitleChunk of titleChunks) {
            chunkInserts.push({
                translation_job_id: job.id,
                blog_post_id: record.id,
                language_code: job.language_code,
                chunk_index: jobSpecificChunkIndex++,
                chunk_type: 'title', // Assign type
                original_text: originalTitleChunk,
                status: 'pending',
                attempts: 0
            });
        }

        // Insert excerpt chunks
        for (const originalExcerptChunk of excerptChunks) {
            chunkInserts.push({
                translation_job_id: job.id,
                blog_post_id: record.id,
                language_code: job.language_code,
                chunk_index: jobSpecificChunkIndex++,
                chunk_type: 'excerpt', // Assign type
                original_text: originalExcerptChunk,
                status: 'pending',
                attempts: 0
            });
        }

        // Insert content chunks
        for (const originalContentChunk of contentChunks) {
            chunkInserts.push({
                translation_job_id: job.id,
                blog_post_id: record.id,
                language_code: job.language_code,
                chunk_index: jobSpecificChunkIndex++,
                chunk_type: 'content', // Assign type
                original_text: originalContentChunk,
                status: 'pending',
                attempts: 0
            });
        }

        // Update the total_chunks for this specific parent translation_job
        await supabase
            .from("translation_jobs")
            .update({ total_chunks: jobSpecificChunkIndex, chunks_completed: 0, status: 'processing_chunks' })
            .eq('id', job.id);
    }
    
    if (chunkInserts.length === 0) {
        console.warn(`[CreateJobs] No chunks generated for post ${record.id}.`);
        // If no chunks, mark parent jobs as completed if post content is empty
        await supabase
            .from("translation_jobs")
            .update({ status: 'completed', total_chunks: 0, chunks_completed: 0 })
            .in('id', createdJobs.map(j => j.id));
        return new Response(JSON.stringify({ success: true, message: "No chunks to process." }), { headers: { "Content-Type": "application/json" } });
    }

    const { error: upsertChunksError } = await supabase
        .from("translation_chunks")
        .upsert(chunkInserts, { onConflict: 'translation_job_id,language_code,chunk_index' }); // Conflict: update existing chunk

    if (upsertChunksError) {
        console.error("[CreateJobs] Error upserting translation chunks:", upsertChunksError);
        return new Response(JSON.stringify({ error: `Failed to upsert translation chunks: ${upsertChunksError.message}` }), { status: 500 });
    }

    console.log(`[CreateJobs] Successfully created/reset ${chunkInserts.length} translation chunks.`);
    
    // The total_chunks for each parent job was already updated inside the loop
    // No need for a separate loop here

    return new Response(JSON.stringify({ success: true, jobsCreated: createdJobs.length, chunksCreated: chunkInserts.length }), { headers: { "Content-Type": "application/json" } });

  } catch (error) {
    console.error("[CreateJobs] Critical Error in create-translation-jobs:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});