export type BlogPost = {
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  cover_image?: string | null;
  slug: string;
  read_time: string;
  author: string;
  language: string;
  created_at?: string;
  updated_at?: string;
  // Add any other fields that exist in your blog_posts table
}
