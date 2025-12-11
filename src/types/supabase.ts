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
  translations?: any;
  // Compatibility fields for UI (not in database)
  author_id?: string;
  word_count?: number | undefined;
  status?: 'draft' | 'published' | 'scheduled';
  published_at?: string | null;
  scheduled_publish_at?: string | null;
}
