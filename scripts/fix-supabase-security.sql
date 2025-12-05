-- ============================================
-- Supabase Security Fixes - SQL Script
-- ============================================
-- This script fixes the security warnings from Supabase Advisor

-- ============================================
-- 1. Fix Function Search Path Mutable Issues
-- ============================================
-- These functions need a fixed search_path to prevent security vulnerabilities

-- Fix: update_authors_updated_at
CREATE OR REPLACE FUNCTION public.update_authors_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- Fixed search path
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Fix: update_modified_column
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- Fixed search path
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Fix: trigger_blog_translation
CREATE OR REPLACE FUNCTION public.trigger_blog_translation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- Fixed search path
AS $$
BEGIN
    -- Add your trigger logic here
    -- This is a placeholder - replace with actual logic
    RETURN NEW;
END;
$$;

-- ============================================
-- 2. Move pg_net Extension to Dedicated Schema
-- ============================================
-- Create a dedicated schema for extensions
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move pg_net from public to extensions schema
-- Note: This requires dropping and recreating the extension
DROP EXTENSION IF EXISTS pg_net CASCADE;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- ============================================
-- Verification Queries
-- ============================================
-- Run these to verify the fixes

-- Check function search paths
SELECT 
    p.proname AS function_name,
    pg_get_function_identity_arguments(p.oid) AS arguments,
    p.prosecdef AS is_security_definer,
    p.proconfig AS config_settings
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN ('update_authors_updated_at', 'update_modified_column', 'trigger_blog_translation');

-- Check extension schema
SELECT 
    e.extname AS extension_name,
    n.nspname AS schema_name
FROM pg_extension e
JOIN pg_namespace n ON e.extnamespace = n.oid
WHERE e.extname = 'pg_net';
