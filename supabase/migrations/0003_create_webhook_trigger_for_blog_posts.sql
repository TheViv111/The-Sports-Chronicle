-- Create function to trigger Vercel redeploy when blog posts change
CREATE OR REPLACE FUNCTION trigger_vercel_redeploy()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the Supabase Edge Function to trigger Vercel webhook
  -- This will be called when a blog post is inserted, updated, or deleted
  PERFORM net.http_post(
    url := current_setting('app.settings.supabase_url', true) || '/functions/v1/trigger-vercel-redeploy',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.supabase_service_role_key', true),
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'event', TG_OP,
      'table', TG_TABLE_NAME,
      'timestamp', now()
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for blog_posts table
DROP TRIGGER IF EXISTS blog_posts_webhook_trigger ON public.blog_posts;
CREATE TRIGGER blog_posts_webhook_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_vercel_redeploy();

-- Set required settings (these should be configured in Supabase dashboard)
-- You'll need to set these in your Supabase project settings:
-- app.settings.supabase_url = 'https://your-project-ref.supabase.co'
-- app.settings.supabase_service_role_key = 'your-service-role-key'
