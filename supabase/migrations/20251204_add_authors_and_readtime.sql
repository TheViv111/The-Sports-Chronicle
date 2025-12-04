-- Create authors table to store team member information
-- Each author can be assigned to multiple blog posts

CREATE TABLE IF NOT EXISTS public.authors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  bio TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS authors_name_idx ON public.authors(name);

-- Enable RLS
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;

-- Allow public read access to authors
CREATE POLICY "Allow public read access to authors"
ON public.authors FOR SELECT
USING (true);

-- Allow authenticated users to insert/update authors (admin only in practice)
CREATE POLICY "Allow authenticated users to manage authors"
ON public.authors FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_authors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_authors_updated_at
BEFORE UPDATE ON public.authors
FOR EACH ROW
EXECUTE FUNCTION public.update_authors_updated_at();

-- Seed initial author data from team members
INSERT INTO public.authors (id, name, title, bio, avatar_url) VALUES
(
  'vivaan-handa',
  'Vivaan Handa',
  'Research Head and Website Manager',
  'Leading our research initiatives and managing the digital platform with expertise in data analysis and web development.',
  '/src/assets/vivaan-handa-new.jpg'
),
(
  'ved-mehta',
  'Ved Mehta',
  'Blog Author and Skill Demonstrator',
  'Creating engaging content and showcasing sports techniques through detailed analysis and expert commentary.',
  '/src/assets/ved-mehta-new.png'
),
(
  'shourya-gupta',
  'Shourya Gupta',
  'Social Media Administrator',
  'Managing our social media presence and community engagement across all digital platforms.',
  '/src/assets/shourya-gupta-new.jpg'
),
(
  'shaurya-gupta',
  'Shaurya Gupta',
  'Feedback and Data Analytics',
  'Analyzing user feedback and performance metrics to continuously improve our platform and content quality.',
  '/src/assets/shaurya-gupta-new.jpg'
)
ON CONFLICT (id) DO NOTHING;

-- Add author_id column to blog_posts
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS author_id TEXT REFERENCES public.authors(id);

-- Add word_count column for analytics
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS word_count INTEGER;

-- Set default author for existing posts (Ved Mehta - Blog Author)
UPDATE public.blog_posts
SET author_id = 'ved-mehta'
WHERE author_id IS NULL;

-- Create index for author lookups
CREATE INDEX IF NOT EXISTS blog_posts_author_id_idx ON public.blog_posts(author_id);

COMMENT ON TABLE public.authors IS 'Stores information about blog post authors (team members)';
COMMENT ON COLUMN public.blog_posts.author_id IS 'References the author who wrote this blog post';
COMMENT ON COLUMN public.blog_posts.word_count IS 'Word count of the blog post content for analytics';
