-- Create user_roles table to manage admin access
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on user_roles (only admins can see the list of admins)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to see their own role
DROP POLICY IF EXISTS "Users can see their own role" ON public.user_roles;
CREATE POLICY "Users can see their own role" 
ON public.user_roles FOR SELECT 
USING (auth.jwt() ->> 'email' = user_email);

-- Insert initial admin users
INSERT INTO public.user_roles (user_email, role)
VALUES 
  ('vivaan.handa@pathwaysschool.in', 'admin'),
  ('shouryag258@gmail.com', 'admin'),
  ('ved.mehta@pathwaysschool.in', 'admin'),
  ('shaurya.gupta@pathwaysschool.in', 'admin')
ON CONFLICT (user_email) DO NOTHING;

-- Update RLS Policies for blog_posts
-- We drop them first to avoid "already exists" errors

DROP POLICY IF EXISTS "Admins can insert blog posts" ON public.blog_posts;
CREATE POLICY "Admins can insert blog posts" 
ON public.blog_posts FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_email = auth.jwt() ->> 'email' 
    AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can update blog posts" ON public.blog_posts;
CREATE POLICY "Admins can update blog posts" 
ON public.blog_posts FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_email = auth.jwt() ->> 'email' 
    AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can delete blog posts" ON public.blog_posts;
CREATE POLICY "Admins can delete blog posts" 
ON public.blog_posts FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_email = auth.jwt() ->> 'email' 
    AND role = 'admin'
  )
);
