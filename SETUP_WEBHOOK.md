# Setting Up Automatic Sitemap Regeneration

This guide walks you through setting up automatic sitemap regeneration when blog posts are added, updated, or deleted.

## Overview

The system uses a webhook trigger that:
1. Detects changes to the `blog_posts` table in Supabase
2. Calls a Supabase Edge Function
3. The Edge Function triggers a Vercel webhook
4. Vercel automatically rebuilds and deploys the site with the updated sitemap

## Step 1: Get Your Vercel Webhook URL

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Git**
3. Scroll down to **Deploy Hooks**
4. Click **Create Hook**
5. Give it a name like "Sitemap Update"
6. Copy the webhook URL (it will look like: `https://api.vercel.com/v1/integrations/deploy/prj_.../...`)

## Step 2: Configure Supabase Environment Variables

In your Supabase project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add these variables:

### Edge Function Environment Variables
- `VERCEL_WEBHOOK_URL`: Your Vercel webhook URL from Step 1
- `SUPABASE_SERVICE_ROLE_KEY`: Your service role key (found in Settings → API)

### Database Settings
Run this SQL in the Supabase SQL Editor:

```sql
-- Set database settings for the webhook function
INSERT INTO public.settings (key, value) VALUES 
('app.settings.supabase_url', 'https://your-project-ref.supabase.co'),
('app.settings.supabase_service_role_key', 'your-service-role-key')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

Replace `your-project-ref` and `your-service-role-key` with your actual values.

## Step 3: Deploy the Edge Function

1. Make sure you have the Supabase CLI installed
2. Run this command to deploy the function:

```bash
supabase functions deploy trigger-vercel-redeploy
```

## Step 4: Run the Database Migration

Apply the trigger to your database:

```bash
supabase db push
```

Or run the migration manually in the Supabase SQL Editor with the contents of:
`supabase/migrations/0003_create_webhook_trigger_for_blog_posts.sql`

## Step 5: Test It

1. Add a new blog post through your admin interface
2. Check your Vercel dashboard - you should see a new deployment starting
3. Once deployed, check `/sitemap.xml` to see the updated content

## How It Works

- **Trigger**: Database trigger fires on INSERT/UPDATE/DELETE of blog_posts
- **Edge Function**: Receives the trigger call and forwards it to Vercel
- **Vercel**: Receives webhook and starts a new build
- **Build Process**: Runs `node scripts/build-sitemap.cjs && vite build`
- **Result**: New sitemap with updated blog post URLs

## Troubleshooting

### Edge Function Not Working
- Check the function logs in Supabase Dashboard → Edge Functions
- Verify environment variables are set correctly
- Make sure the function was deployed successfully

### Database Trigger Not Firing
- Check that the migration was applied
- Verify the trigger exists: `\df+ trigger_vercel_redeploy` in SQL Editor
- Check Supabase logs for any errors

### Vercel Webhook Not Triggering
- Verify the webhook URL is correct
- Check Vercel webhook logs (if available)
- Make sure the Edge Function is calling the right URL

## Security Notes

- The Edge Function validates requests using the service role key
- Database calls are made with proper authentication
- Webhook URLs should be kept secure and not exposed in client-side code
