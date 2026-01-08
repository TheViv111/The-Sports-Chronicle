import { createClient } from "npm:@supabase/supabase-js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

Deno.serve(async (req) => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: "Missing Supabase Environment Variables" }), { status: 500 });
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  let payload;
  try {
    payload = await req.json();
    console.log("[Reassemble] Received payload:", payload);
  } catch (error) {
    console.error("[Reassemble] Error parsing request body:", error);
    return new Response(JSON.stringify({ error: "Invalid JSON payload" }), { status: 400 });
  }

  const { translation_job_id: parentJobId, language_code: targetLang, blog_post_id: postId } = payload;

  if (!parentJobId || !targetLang || !postId) {
    console.error("[Reassemble] Missing required payload data: translation_job_id, language_code, blog_post_id.");
    return new Response(JSON.stringify({ error: "Missing required payload data" }), { status: 400 });
  }

  try {
    // 1. Fetch the parent translation_job to get total_chunks
    const { data: parentJob, error: fetchJobError } = await supabase
      .from('translation_jobs')
      .select('total_chunks, chunks_completed')
      .eq('id', parentJobId)
      .single();

    if (fetchJobError || !parentJob) {
      console.error(`[Reassemble] Failed to fetch parent job ${parentJobId}:`, fetchJobError);
      return new Response(JSON.stringify({ error: `Job not found: ${fetchJobError?.message}` }), { status: 404 });
    }

    // 2. Count completed chunks
    const { count: completedChunksCount, error: countChunksError } = await supabase
      .from('translation_chunks')
      .select('id', { count: 'exact' })
      .eq('translation_job_id', parentJobId)
      .eq('language_code', targetLang)
      .eq('status', 'completed');

    if (countChunksError) {
      console.error(`[Reassemble] Error counting completed chunks for job ${parentJobId}, lang ${targetLang}:`, countChunksError);
      return new Response(JSON.stringify({ error: `Error counting chunks: ${countChunksError.message}` }), { status: 500 });
    }

    console.log(`[Reassemble] Job ${parentJobId} (${targetLang}): Total chunks expected: ${parentJob.total_chunks}, Completed so far: ${completedChunksCount}`);

    // If not all chunks are completed, update parent job's chunks_completed and exit
    if (completedChunksCount < parentJob.total_chunks) {
        await supabase.from('translation_jobs').update({ chunks_completed: completedChunksCount }).eq('id', parentJobId);
        console.log(`[Reassemble] Not all chunks completed for job ${parentJobId}. Current completed: ${completedChunksCount}`);
        return new Response(JSON.stringify({ success: true, message: "Not all chunks completed yet." }), { headers: { "Content-Type": "application/json" } });
    }

    // --- All chunks are completed! Proceed with reassembly ---
    console.log(`[Reassemble] All ${parentJob.total_chunks} chunks completed for job ${parentJobId}, language ${targetLang}. Reassembling...`);

    // 3. Fetch all completed chunks, ordered by index and type
    const { data: chunks, error: fetchChunksError } = await supabase
      .from('translation_chunks')
      .select('chunk_index, translated_text, chunk_type')
      .eq('translation_job_id', parentJobId)
      .eq('language_code', targetLang)
      .eq('status', 'completed')
      .order('chunk_index', { ascending: true });

    if (fetchChunksError) {
      console.error(`[Reassemble] Error fetching chunks for reassembly job ${parentJobId}, lang ${targetLang}:`, fetchChunksError);
      return new Response(JSON.stringify({ error: `Error fetching chunks for reassembly: ${fetchChunksError.message}` }), { status: 500 });
    }

    let reassembledTitle = "";
    let reassembledExcerpt = "";
    let reassembledContent = "";

    // Group and reassemble by chunk_type
    chunks.forEach(c => {
        if (c.chunk_type === 'title') {
            reassembledTitle += c.translated_text;
        } else if (c.chunk_type === 'excerpt') {
            reassembledExcerpt += c.translated_text;
        } else if (c.chunk_type === 'content') {
            // Content chunks might be joined with line breaks if they represent paragraphs
            reassembledContent += (reassembledContent ? '\n\n' : '') + c.translated_text;
        }
    });

    // 4. Update blog_posts.translations (using merge_jsonb_column RPC)
    const singleLangUpdate = { 
        [targetLang]: { 
            title: reassembledTitle,
            excerpt: reassembledExcerpt,
            content: reassembledContent
        } 
    };

    console.log(`[Reassemble] Attempting to update blog_posts ID: ${postId} for language: ${targetLang}.`);

    const { error: updatePostError } = await supabase.rpc(
      'merge_jsonb_column',
      {
        table_name: 'blog_posts',
        row_id: postId,
        column_name: 'translations',
        new_jsonb_data: singleLangUpdate
      }
    );

    if (updatePostError) {
      console.error(`[Reassemble] Error updating blog_posts for post ${postId}, lang ${targetLang}:`, updatePostError);
      await supabase.from('translation_jobs').update({ status: 'retry', error_message: `Reassembly DB update failed: ${updatePostError.message}` }).eq('id', parentJobId);
      return new Response(JSON.stringify({ error: `Failed to update blog_posts: ${updatePostError.message}` }), { status: 500 });
    }

    // 5. Mark parent translation_job as completed
    const { error: updateJobError } = await supabase
      .from('translation_jobs')
      .update({ status: 'completed', chunks_completed: parentJob.total_chunks, error_message: null })
      .eq('id', parentJobId);

    if (updateJobError) {
      console.error(`[Reassemble] Error marking parent job ${parentJobId} as completed:`, updateJobError);
      return new Response(JSON.stringify({ error: `Failed to mark job complete: ${updateJobError.message}` }), { status: 500 });
    }

    console.log(`[Reassemble] Post ID ${postId} successfully reassembled and updated for language ${targetLang}. Parent job marked completed.`);
    return new Response(JSON.stringify({ success: true, postId: postId, language: targetLang, status: "Reassembled" }), { headers: { "Content-Type": "application/json" } });

  } catch (error) {
    console.error("[Reassemble] Critical Error in reassemble-translations:", error);
    // Attempt to mark parent job as failed/retry if possible
    if (parentJobId) {
        await supabase.from('translation_jobs').update({ status: 'retry', error_message: `Reassembly critical error: ${error.message}` }).eq('id', parentJobId);
    }
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});