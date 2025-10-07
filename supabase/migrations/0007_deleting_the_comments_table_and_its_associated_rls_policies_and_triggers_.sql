-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS update_comments_updated_at ON public.comments;

-- Drop any RLS policies on the comments table
DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;

-- Drop the comments table
DROP TABLE IF EXISTS public.comments;