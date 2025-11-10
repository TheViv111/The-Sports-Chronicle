-- Drop the comments table and related objects
DROP TRIGGER IF EXISTS update_comments_updated_at ON public.comments;
DROP FUNCTION IF EXISTS public.handle_new_comment();
DROP POLICY IF EXISTS "Enable read access for all users" ON public.comments;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;
DROP TABLE IF EXISTS public.comments;
