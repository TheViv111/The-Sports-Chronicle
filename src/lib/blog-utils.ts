import { Tables } from "@/integrations/supabase/types";
import { getTranslationWithEnglishFallback } from "@/utils/translations";

// Define the type for a blog post with display-specific fields
export type BlogPostWithDisplay = Tables<'blog_posts'> & {
  date: string;
  readTime: string;
  image: string;
  displayCategory?: string;
};

/**
 * Formats a date string into a readable format.
 * @param dateString The date string to format.
 * @returns A formatted date string (e.g., "Oct 26, 2023").
 */
export const formatBlogPostDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

/**
 * Transforms a raw blog post from the database into a display-ready format.
 * Applies translations from `post.translations` when available for `currentLanguage`.
 * @param post The raw blog post object from Supabase.
 * @param currentLanguage Optional current language code (e.g., 'hi').
 * @returns A BlogPostWithDisplay object with translated fields when available.
 */
export const transformBlogPostForDisplay = (
  post: Tables<'blog_posts'>,
  currentLanguage?: string
): BlogPostWithDisplay => {
  const lang = currentLanguage || 'en';

  const translatedTitle = getTranslationWithEnglishFallback(post.translations, 'title', lang, post.title);
  const translatedContent = getTranslationWithEnglishFallback(post.translations, 'content', lang, post.content);
  const translatedExcerpt = getTranslationWithEnglishFallback(post.translations, 'excerpt', lang, post.excerpt);
  const translatedCategory = getTranslationWithEnglishFallback(post.translations, 'category', lang, post.category);

  return {
    ...post,
    title: translatedTitle,
    content: translatedContent,
    excerpt: translatedExcerpt,
    // Keep canonical category for logic; expose translated as displayCategory
    category: post.category,
    displayCategory: translatedCategory,
    date: formatBlogPostDate(post.created_at),
    readTime: post.read_time || "5 min read",
    image: post.cover_image || "https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg"
  };
};