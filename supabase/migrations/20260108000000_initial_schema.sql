

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."check_chunk_batch_completion"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  pending_chunks_count integer;
  retry_chunks_count integer;
  total_chunks_for_job integer;
  reassemble_request_url text := 'https://whgjiirmcbsiqhjzgldy.supabase.co/functions/v1/reassemble-translations';
  retry_worker_url text := 'https://whgjiirmcbsiqhjzgldy.supabase.co/functions/v1/retry-failed-translations';
  auth_header jsonb := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoZ2ppaXJtY2JzaXFoanpnbGR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNjY5ODAsImV4cCI6MjA3MTk0Mjk4MH0.P4gXbWSPBX1qtfDTCQXjTA_0rcl84mAJXXRqdflpV9Y"}'::jsonb;
  parent_job_status text;
begin
  -- Get total chunks from the parent job
  SELECT total_chunks, status INTO total_chunks_for_job, parent_job_status
  FROM public.translation_jobs
  WHERE id = NEW.translation_job_id;

  -- Only proceed if the parent job isn't already completed/failed and has chunks to process
  IF parent_job_status IN ('completed', 'failed') OR total_chunks_for_job = 0 THEN
      RETURN NEW;
  END IF;

  -- Count chunks that are still being worked on for this job/language
  SELECT count(*) INTO pending_chunks_count
  FROM public.translation_chunks
  WHERE translation_job_id = NEW.translation_job_id
  AND status IN ('pending', 'processing');

  -- Count chunks that need retrying for this job/language
  SELECT count(*) INTO retry_chunks_count
  FROM public.translation_chunks
  WHERE translation_job_id = NEW.translation_job_id
  AND status = 'retry';
  
  -- Update chunks_completed count in parent job
  UPDATE public.translation_jobs
  SET chunks_completed = (SELECT count(*) FROM public.translation_chunks WHERE translation_job_id = NEW.translation_job_id AND status = 'completed')
  WHERE id = NEW.translation_job_id;

  -- If there are no chunks pending/processing and no chunks needing retry, all must be completed
  IF pending_chunks_count = 0 AND retry_chunks_count = 0 THEN
    -- All chunks are completed (or permanently failed/skipped)
    -- Trigger reassembly
    perform
      net.http_post(
        url := reassemble_request_url,
        headers := auth_header,
        body := json_build_object(
                    'translation_job_id', NEW.translation_job_id,
                    'language_code', NEW.language_code,
                    'blog_post_id', NEW.blog_post_id
                )::jsonb
      );
  ELSIF pending_chunks_count = 0 AND retry_chunks_count > 0 THEN
    -- No chunks are currently pending/processing, but some are marked for retry.
    -- Trigger the retry worker to pick them up.
    perform
      net.http_post(
        url := retry_worker_url,
        headers := auth_header,
        body := '{}'::jsonb -- Retry worker checks globally, doesn't need specific job info
      );
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."check_chunk_batch_completion"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, first_name, last_name, preferred_language, avatar_url)
  VALUES (
    new.id,
    NEW.raw_user_meta_data->>'display_name', -- Set display_name to NULL if not provided in raw_user_meta_data
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://www.gravatar.com/avatar/' || md5(new.email) || '?d=identicon&s=256') -- Use Gravatar as default if no avatar_url from OAuth
  );
  RETURN new;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."invoke_retry_translations"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions'
    AS $$
declare
  request_url text := 'https://whgjiirmcbsiqhjzgldy.supabase.co/functions/v1/retry-failed-translations';
  auth_header jsonb := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoZ2ppaXJtY2JzaXFoanpnbGR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNjY5ODAsImV4cCI6MjA3MTk0Mjk4MH0.P4gXbWSPBX1qtfDTCQXjTA_0rcl84mAJXXRqdflpV9Y"}'::jsonb;
begin
  perform
    net.http_post(
      url := request_url,
      headers := auth_header,
      body := '{}'::jsonb
    );
end;
$$;


ALTER FUNCTION "public"."invoke_retry_translations"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT (
    current_setting('request.jwt.claims', true)::jsonb ->> 'email'
  ) = ANY (ARRAY['vivaan.handa@pathwaysschool.in', 'shouryag258@gmail.com', 'ved.mehta@pathwaysschool.in']);
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."merge_jsonb_column"("table_name" "text", "row_id" "uuid", "column_name" "text", "new_jsonb_data" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions'
    AS $_$
BEGIN
    EXECUTE format('UPDATE %I SET %I = coalesce(%I, ''{}''::jsonb) || $1 WHERE id = $2', table_name, column_name, column_name)
    USING new_jsonb_data, row_id;
END;
$_$;


ALTER FUNCTION "public"."merge_jsonb_column"("table_name" "text", "row_id" "uuid", "column_name" "text", "new_jsonb_data" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_blog_translation"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
    -- Add your trigger logic here
    -- This is a placeholder - replace with actual logic
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_blog_translation"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_check_for_initial_chunk_processing"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  retry_worker_url text := 'https://whgjiirmcbsiqhjzgldy.supabase.co/functions/v1/retry-failed-translations';
  auth_header jsonb := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoZ2ppaXJtY2JzaXFoanpnbGR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNjY5ODAsImV4cCI6MjA3MTk0Mjk4MH0.P4gXbWSPBX1qtfDTCQXjTA_0rcl84mAJXXRqdflpV9Y"}'::jsonb;
begin
  -- Trigger the retry worker to ensure initial chunks get picked up
  perform
    net.http_post(
      url := retry_worker_url,
      headers := auth_header,
      body := '{}'::jsonb
    );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_check_for_initial_chunk_processing"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_create_translation_jobs"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  request_url text := 'https://whgjiirmcbsiqhjzgldy.supabase.co/functions/v1/create-translation-jobs';
  auth_header jsonb := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoZ2ppaXJtY2JzaXFoanpnbGR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNjY5ODAsImV4cCI6MjA3MTk0Mjk4MH0.P4gXbWSPBX1qtfDTCQXjTA_0rcl84mAJXXRqdflpV9Y"}'::jsonb;
begin
  -- Perform the call asynchronously
  perform
    net.http_post(
      url := request_url,
      headers := auth_header,
      body := json_build_object('record', NEW)::jsonb
    );
  return new;
end;
$$;


ALTER FUNCTION "public"."trigger_create_translation_jobs"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_translate_post"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions'
    AS $$
declare
  request_url text := 'https://whgjiirmcbsiqhjzgldy.supabase.co/functions/v1/create-translation-jobs';
  auth_header jsonb := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoZ2ppaXJtY2JzaXFoanpnbGR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNjY5ODAsImV4cCI6MjA3MTk0Mjk4MH0.P4gXbWSPBX1qtfDTCQXjTA_0rcl84mAJXXRqdflpV9Y"}'::jsonb;
begin
  -- Use pg_net extension to fire the webhook
  perform
    net.http_post(
      url := request_url,
      headers := auth_header,
      body := json_build_object('record', NEW)::jsonb
    );
  return new;
end;
$$;


ALTER FUNCTION "public"."trigger_translate_post"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_update_translation_jobs"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
DECLARE
  request_url text := 'https://whgjiirmcbsiqhjzgldy.supabase.co/functions/v1/create-translation-jobs';
  auth_header jsonb := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoZ2ppaXJtY2JzaXFoanpnbGR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNjY5ODAsImV4cCI6MjA3MTk0Mjk4MH0.P4gXbWSPBX1qtfDTCQXjTA_0rcl84mAJXXRqdflpV9Y"}'::jsonb;
BEGIN
  -- Check if relevant fields changed
  IF (OLD.title IS DISTINCT FROM NEW.title) OR 
     (OLD.content IS DISTINCT FROM NEW.content) OR 
     (OLD.excerpt IS DISTINCT FROM NEW.excerpt) THEN
     
     -- We invoke the SAME 'create-translation-jobs' function.
     -- IMPORTANT: The Edge Function logic for 'create-translation-jobs' needs to be smart enough 
     -- to handle UPSERTS (updating status to pending if job exists).
     -- Currently it does a simple INSERT which might fail on unique constraint.
     -- We need to update the Edge Function first or handle it here?
     -- Actually, better to just call the function, and let the function handle the logic.
     -- But wait, `create-translation-jobs` does `supabase.from("translation_jobs").insert(jobs)`. 
     -- This will fail if jobs exist.
     
     -- So we should actually UPDATE the translation_jobs status to 'pending' directly here?
     -- YES. This is much faster and cheaper than calling an Edge Function to call the DB back.
     
     UPDATE public.translation_jobs
     SET status = 'pending',
         attempts = 0,
         error_message = NULL,
         updated_at = now()
     WHERE blog_post_id = NEW.id;
     
     -- If NO jobs exist (e.g. legacy post), we should probably call the creator function.
     -- But for now, let's assume jobs exist because of the INSERT trigger.
     -- If we want to be 100% robust, we can check if update count = 0.
     
     IF NOT FOUND THEN
        -- If no jobs found, treat it like a new post and call the creator function
        PERFORM net.http_post(
          url := request_url,
          headers := auth_header,
          body := json_build_object('record', NEW)::jsonb
        );
     END IF;
     
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_update_translation_jobs"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_authors_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_authors_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_modified_column"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_modified_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."authors" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "title" "text" NOT NULL,
    "bio" "text" NOT NULL,
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."authors" OWNER TO "postgres";


COMMENT ON TABLE "public"."authors" IS 'Stores information about blog post authors (team members)';



CREATE TABLE IF NOT EXISTS "public"."blog_posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "excerpt" "text" NOT NULL,
    "content" "text",
    "category" "text" NOT NULL,
    "cover_image" "text",
    "slug" "text" NOT NULL,
    "read_time" "text" DEFAULT '5 min read'::"text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "author" "text" DEFAULT 'Sports Chronicle Team'::"text" NOT NULL,
    "language" character varying(5) DEFAULT 'en'::character varying NOT NULL,
    "translations" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "author_id" "text",
    "word_count" integer,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "published_at" timestamp with time zone,
    "scheduled_publish_at" timestamp with time zone,
    CONSTRAINT "blog_posts_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'published'::"text", 'scheduled'::"text"])))
);


ALTER TABLE "public"."blog_posts" OWNER TO "postgres";


COMMENT ON COLUMN "public"."blog_posts"."author_id" IS 'References the author who wrote this blog post';



COMMENT ON COLUMN "public"."blog_posts"."word_count" IS 'Word count of the blog post content for analytics';



CREATE TABLE IF NOT EXISTS "public"."comments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "author_name" "text" NOT NULL,
    "content" "text" NOT NULL,
    "is_edited" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "display_name" "text",
    "first_name" "text",
    "last_name" "text",
    "avatar_url" "text",
    "bio" "text",
    "preferred_language" character varying(10) DEFAULT 'en'::character varying,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."translation_chunks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "translation_job_id" "uuid" NOT NULL,
    "blog_post_id" "uuid" NOT NULL,
    "language_code" character varying(10) NOT NULL,
    "chunk_index" integer NOT NULL,
    "original_text" "text" NOT NULL,
    "translated_text" "text",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "attempts" integer DEFAULT 0 NOT NULL,
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "chunk_type" "text" DEFAULT 'content'::"text" NOT NULL
);


ALTER TABLE "public"."translation_chunks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."translation_jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "blog_post_id" "uuid" NOT NULL,
    "language_code" character varying(10) NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "attempts" integer DEFAULT 0 NOT NULL,
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "total_chunks" integer DEFAULT 0 NOT NULL,
    "chunks_completed" integer DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."translation_jobs" OWNER TO "postgres";


ALTER TABLE ONLY "public"."authors"
    ADD CONSTRAINT "authors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "blog_posts_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."translation_chunks"
    ADD CONSTRAINT "translation_chunks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."translation_chunks"
    ADD CONSTRAINT "translation_chunks_translation_job_id_language_code_chunk_i_key" UNIQUE ("translation_job_id", "language_code", "chunk_index");



ALTER TABLE ONLY "public"."translation_jobs"
    ADD CONSTRAINT "translation_jobs_pkey" PRIMARY KEY ("id");



CREATE INDEX "authors_name_idx" ON "public"."authors" USING "btree" ("name");



CREATE INDEX "blog_posts_author_id_idx" ON "public"."blog_posts" USING "btree" ("author_id");



CREATE INDEX "idx_blog_posts_language" ON "public"."blog_posts" USING "btree" ("language");



CREATE INDEX "idx_comments_post_id" ON "public"."comments" USING "btree" ("post_id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_comments_user_id" ON "public"."comments" USING "btree" ("user_id") WHERE (("user_id" IS NOT NULL) AND ("deleted_at" IS NULL));



CREATE INDEX "idx_translation_chunks_job_id" ON "public"."translation_chunks" USING "btree" ("translation_job_id");



CREATE INDEX "idx_translation_chunks_post_lang_index" ON "public"."translation_chunks" USING "btree" ("blog_post_id", "language_code", "chunk_index");



CREATE INDEX "idx_translation_chunks_status" ON "public"."translation_chunks" USING "btree" ("status");



CREATE INDEX "idx_translation_jobs_blog_post_id" ON "public"."translation_jobs" USING "btree" ("blog_post_id");



CREATE UNIQUE INDEX "idx_translation_jobs_unique_job" ON "public"."translation_jobs" USING "btree" ("blog_post_id", "language_code");



CREATE OR REPLACE TRIGGER "on_blog_post_created" AFTER INSERT ON "public"."blog_posts" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_create_translation_jobs"();



CREATE OR REPLACE TRIGGER "on_blog_post_updated_content" AFTER UPDATE ON "public"."blog_posts" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_update_translation_jobs"();



CREATE OR REPLACE TRIGGER "on_translation_chunk_finished" AFTER UPDATE OF "status" ON "public"."translation_chunks" FOR EACH ROW WHEN (("new"."status" = ANY (ARRAY['completed'::"text", 'failed'::"text", 'retry'::"text"]))) EXECUTE FUNCTION "public"."check_chunk_batch_completion"();



CREATE OR REPLACE TRIGGER "on_translation_job_status_change" AFTER UPDATE OF "status" ON "public"."translation_jobs" FOR EACH ROW WHEN ((("new"."status" = 'pending_chunks'::"text") AND ("old"."status" IS DISTINCT FROM 'pending_chunks'::"text"))) EXECUTE FUNCTION "public"."trigger_check_for_initial_chunk_processing"();



CREATE OR REPLACE TRIGGER "update_authors_updated_at" BEFORE UPDATE ON "public"."authors" FOR EACH ROW EXECUTE FUNCTION "public"."update_authors_updated_at"();



CREATE OR REPLACE TRIGGER "update_blog_posts_updated_at" BEFORE UPDATE ON "public"."blog_posts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_comments_modtime" BEFORE UPDATE ON "public"."comments" FOR EACH ROW EXECUTE FUNCTION "public"."update_modified_column"();



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "blog_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."authors"("id");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."blog_posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."translation_chunks"
    ADD CONSTRAINT "translation_chunks_blog_post_id_fkey" FOREIGN KEY ("blog_post_id") REFERENCES "public"."blog_posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."translation_chunks"
    ADD CONSTRAINT "translation_chunks_translation_job_id_fkey" FOREIGN KEY ("translation_job_id") REFERENCES "public"."translation_jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."translation_jobs"
    ADD CONSTRAINT "translation_jobs_blog_post_id_fkey" FOREIGN KEY ("blog_post_id") REFERENCES "public"."blog_posts"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can delete blog posts" ON "public"."blog_posts" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admins can insert blog posts" ON "public"."blog_posts" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can update blog posts" ON "public"."blog_posts" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Public and authenticated can read authors" ON "public"."authors" FOR SELECT USING (true);



CREATE POLICY "Public can view all profiles" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Public can view blog posts" ON "public"."blog_posts" FOR SELECT USING (true);



CREATE POLICY "Public comments are viewable by everyone" ON "public"."comments" FOR SELECT USING (("deleted_at" IS NULL));



CREATE POLICY "Service role can manage translation chunks" ON "public"."translation_chunks" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role can manage translation jobs" ON "public"."translation_jobs" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role can update blog posts" ON "public"."blog_posts" FOR UPDATE TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Users can delete their own comments" ON "public"."comments" FOR DELETE TO "authenticated" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can delete their own profile" ON "public"."profiles" FOR DELETE TO "authenticated" USING (("id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can insert their own comments" ON "public"."comments" FOR INSERT TO "authenticated" WITH CHECK ((auth.uid() = user_id));



CREATE POLICY "Users can insert their own profile" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can update their own comments" ON "public"."comments" FOR UPDATE TO "authenticated" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("id" = ( SELECT "auth"."uid"() AS "uid")));



ALTER TABLE "public"."authors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."blog_posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."translation_chunks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."translation_jobs" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";












GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";







































































































































































































































GRANT ALL ON FUNCTION "public"."check_chunk_batch_completion"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_chunk_batch_completion"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_chunk_batch_completion"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."invoke_retry_translations"() TO "anon";
GRANT ALL ON FUNCTION "public"."invoke_retry_translations"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."invoke_retry_translations"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."merge_jsonb_column"("table_name" "text", "row_id" "uuid", "column_name" "text", "new_jsonb_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."merge_jsonb_column"("table_name" "text", "row_id" "uuid", "column_name" "text", "new_jsonb_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."merge_jsonb_column"("table_name" "text", "row_id" "uuid", "column_name" "text", "new_jsonb_data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_blog_translation"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_blog_translation"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_blog_translation"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_check_for_initial_chunk_processing"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_check_for_initial_chunk_processing"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_check_for_initial_chunk_processing"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_create_translation_jobs"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_create_translation_jobs"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_create_translation_jobs"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_translate_post"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_translate_post"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_translate_post"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_update_translation_jobs"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_update_translation_jobs"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_update_translation_jobs"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_authors_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_authors_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_authors_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_modified_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_modified_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_modified_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";
























GRANT ALL ON TABLE "public"."authors" TO "anon";
GRANT ALL ON TABLE "public"."authors" TO "authenticated";
GRANT ALL ON TABLE "public"."authors" TO "service_role";



GRANT ALL ON TABLE "public"."blog_posts" TO "anon";
GRANT ALL ON TABLE "public"."blog_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."blog_posts" TO "service_role";



GRANT ALL ON TABLE "public"."comments" TO "anon";
GRANT ALL ON TABLE "public"."comments" TO "authenticated";
GRANT ALL ON TABLE "public"."comments" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."translation_chunks" TO "anon";
GRANT ALL ON TABLE "public"."translation_chunks" TO "authenticated";
GRANT ALL ON TABLE "public"."translation_chunks" TO "service_role";



GRANT ALL ON TABLE "public"."translation_jobs" TO "anon";
GRANT ALL ON TABLE "public"."translation_jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."translation_jobs" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























