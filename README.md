# The Sports Chronicle

The Sports Chronicle is a React + Vite web app for publishing multi-language sports articles with Supabase-backed authentication, profiles, comments, and a translated blog experience. It uses Tailwind CSS and shadcn/ui for UI, React Query for data, and a simple translation system that applies per-language content at render time.

## Tech Stack
- React 18, Vite 5
- Tailwind CSS, shadcn/ui
- Supabase (`auth`, `database`, `storage`)
- React Router, React Query
- Embla Carousel

## Features
- Blog posts with per-language translations (title, excerpt, category, content)
- Client-side translation application via `transformBlogPostForDisplay`
- Supabase Auth with profile management and comments
- Floating, rounded glassmorphism navbar
- SEO helpers and lazy-loaded images

## Requirements
- `Node.js` 18+ (recommended: 18.17 or newer)
- `npm` 9+
- Supabase CLI (`npm i -g supabase`) or download from supabase.com

Note on Windows: this project uses `@vitejs/plugin-react` (Babel) instead of SWC to avoid native binding issues with `@swc/core`.

## Getting Started

1. Install dependencies
   - `npm install`

2. Environment variables
   - Create a `.env` file at the project root and set:
     - `VITE_SUPABASE_URL=<your-supabase-url>`
     - `VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>`

3. Run the dev server
   - `npm run dev`
   - The server starts at `http://localhost:8081/` (or next free port, e.g., `8082`).

4. Build and preview
   - Build: `npm run build`
   - Preview: `npm run preview`

## Supabase Setup and Migrations

This repo includes migrations under `supabase/migrations` for creating tables and seeding translations.

Basic steps:
- Log in and link your project:
  - `supabase login`
  - Ensure `supabase/config.toml` has `project_id` set.
  - Optionally: `supabase link --project-ref <project_id>`

- Push migrations:
  - `supabase db push`

### Translations Storage
- `blog_posts` has a JSONB column `translations` with keys per language, each containing `title`, `content`, `excerpt`, and `category`.
- The app applies translations in `src/lib/blog-utils.ts` using `transformBlogPostForDisplay`.

### Seeding Hindi Translations
- Hindi seeds are included:
  - `20251026133500_seed_hi_translation_three_pointer.sql`
  - `20251026134500_seed_hi_translation_false_nine.sql`
- Apply seeds with `supabase db push`.

## Translations (UI)
- General UI translations live under `src/data/translations/*.json` (e.g., `hi.json`, `gu.json`, `mr.json`).
- The app uses `TranslationContext` (`src/contexts/TranslationContext.tsx`) to switch languages.

## Notable Implementation Details
- Floating glass navbar: `src/components/layout/Header.tsx` and layout spacing in `src/components/layout/Layout.tsx` (`pt-24` to avoid overlap).
- Blog image rendering: `src/components/blog/BlogCard.tsx` uses `cover_image`/`image` with a `/placeholder.svg` fallback.
- Client-side translation fallback: for specific posts (e.g., “False Nine”), `src/lib/blog-utils.ts` provides a Hindi fallback to ensure immediate display even before DB seeds are applied.

## Troubleshooting
- SWC native binding error on Windows:
  - This project uses `@vitejs/plugin-react` (Babel). If you previously had SWC installed, remove it:
    - `npm uninstall @vitejs/plugin-react-swc @swc/core`
  - Clean install if needed:
    - Delete `node_modules` and `package-lock.json`, then `npm install`.
  - Confirm Node version: `node -v` (ensure 18+).

- Supabase migration errors:
  - Ensure you are authenticated and linked to the correct project.
  - Verify that `supabase/config.toml` has the correct `project_id`.

## Scripts
- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run preview` — preview built app
- `npm run lint` — lint codebase

## Folder Structure (excerpt)
- `src/components` — UI, layout, blog, profile components
- `src/pages` — app pages (Home, Blog, BlogPost, Admin, etc.)
- `src/lib/blog-utils.ts` — blog post transformation and translation application
- `src/contexts/TranslationContext.tsx` — language switch and i18n provider
- `supabase/migrations` — database schema and seed migrations