-- Add status column to blog_posts
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled'));

-- Add published_at column to blog_posts
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

-- Add scheduled_publish_at column to blog_posts
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS scheduled_publish_at TIMESTAMP WITH TIME ZONE;

-- Update existing posts to be published if they don't have a status (optional, but good for migration)
UPDATE blog_posts SET status = 'published', published_at = created_at WHERE status = 'draft' AND created_at IS NOT NULL;
