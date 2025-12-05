-- ============================================
-- Supabase Performance Optimization - RLS Policies
-- ============================================
-- This script fixes performance warnings from Supabase Advisor
-- Run this in the Supabase SQL Editor

-- ============================================
-- PART 1: Fix Auth RLS Initialization Plan Issues
-- ============================================
-- Wrap auth.uid() calls with (SELECT auth.uid()) to prevent re-evaluation per row

-- ============================================
-- 1. PROFILES Table - Fix all 4 policies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;

-- Recreate with optimized auth checks
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = (SELECT auth.uid()))
WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
TO authenticated
USING (id = (SELECT auth.uid()));

-- ============================================
-- 2. COMMENTS Table - Fix 2 policies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;

-- Recreate with optimized auth checks
CREATE POLICY "Users can update their own comments"
ON public.comments
FOR UPDATE
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own comments"
ON public.comments
FOR DELETE
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- ============================================
-- PART 2: Fix Multiple Permissive Policies
-- ============================================
-- Consolidate duplicate policies into single optimized policies

-- ============================================
-- 3. AUTHORS Table - Consolidate 2 policies into 1
-- ============================================

-- Drop duplicate policies
DROP POLICY IF EXISTS "Allow authenticated users to manage authors" ON public.authors;
DROP POLICY IF EXISTS "Allow public read access to authors" ON public.authors;

-- Create single consolidated policy for SELECT
CREATE POLICY "Public and authenticated can read authors"
ON public.authors
FOR SELECT
TO public
USING (true);

-- Keep separate policies for write operations if needed
-- (Add INSERT/UPDATE/DELETE policies for authenticated users only)

-- ============================================
-- 4. BLOG_POSTS Table - Consolidate policies
-- ============================================

-- Drop duplicate policies
DROP POLICY IF EXISTS "Admin can manage blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Anyone can view blog posts" ON public.blog_posts;

-- Create single consolidated policy for SELECT (public read)
CREATE POLICY "Public can read blog posts"
ON public.blog_posts
FOR SELECT
TO public
USING (true);

-- Create admin-only policies for write operations
-- Note: You'll need to define admin check logic
-- Example using email check:
CREATE POLICY "Admins can manage blog posts"
ON public.blog_posts
FOR ALL
TO authenticated
USING (
  (SELECT auth.jwt()->>'email') IN (
    'vivaan.handa@pathwaysschool.in',
    'shouryag258@gmail.com',
    'ved.mehta@pathwaysschool.in'
  )
)
WITH CHECK (
  (SELECT auth.jwt()->>'email') IN (
    'vivaan.handa@pathwaysschool.in',
    'shouryag258@gmail.com',
    'ved.mehta@pathwaysschool.in'
  )
);

-- ============================================
-- 5. COMMENTS Table - Fix UPDATE policies
-- ============================================

-- Note: The "delete" and "update" policies are separate operations
-- They should NOT be combined. The warning is about having multiple
-- policies for the SAME operation. Since these are different operations,
-- we just need to ensure they're optimized (already done above).

-- ============================================
-- 6. PROFILES Table - Consolidate SELECT policies
-- ============================================

-- Drop duplicate SELECT policies
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_public_read_policy" ON public.profiles;
-- Keep "Users can view their own profile" (already recreated above)

-- Create single policy for viewing all profiles
CREATE POLICY "Authenticated users can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- ============================================
-- Verification Queries
-- ============================================

-- Check all policies on profiles table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY tablename, policyname;

-- Check all policies on blog_posts table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'blog_posts'
ORDER BY tablename, policyname;

-- Check all policies on comments table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'comments'
ORDER BY tablename, policyname;

-- Check all policies on authors table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'authors'
ORDER BY tablename, policyname;
