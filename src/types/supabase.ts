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
  author_id?: string;
  word_count?: number;
  language: string;
  created_at?: string;
  updated_at?: string;
  status: 'draft' | 'published' | 'scheduled';
  published_at?: string | null;
  scheduled_publish_at?: string | null;
  translations?: any; // Add translations field
  // Add any other fields that exist in your blog_posts table
}
