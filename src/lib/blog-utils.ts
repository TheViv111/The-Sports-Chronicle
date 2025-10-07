import { Tables } from "@/integrations/supabase/types";

// Define the type for a blog post with display-specific fields
export type BlogPostWithDisplay = Tables<'blog_posts'> & {
  date: string;
  readTime: string;
  image: string;
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
 * Adds formatted date, default read time, and a fallback image.
 * @param post The raw blog post object from Supabase.
 * @returns A BlogPostWithDisplay object.
 */
export const transformBlogPostForDisplay = (post: Tables<'blog_posts'>): BlogPostWithDisplay => {
  return {
    ...post,
    date: formatBlogPostDate(post.created_at),
    readTime: post.read_time || "5 min read",
    image: post.cover_image || "https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg"
  };
};