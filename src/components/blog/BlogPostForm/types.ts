import { z } from 'zod';
import { Tables } from '@/integrations/supabase/types';

export const blogPostSchema = z.object({
  title: z.string().min(1, { message: "Title cannot be empty." }),
  category: z.string().min(1, { message: "Category cannot be empty." }),
  excerpt: z.string().min(1, { message: "Excerpt cannot be empty." }),
  content: z.string().min(1, { message: "Content cannot be empty." }),
  cover_image: z
    .string()
    .url({ message: 'Must be a valid URL' })
    .optional()
    .or(z.literal('')),
  author_id: z.string().min(1, { message: "Author is required." }),
});

export type BlogPostFormValues = z.infer<typeof blogPostSchema>;

export interface BlogPostFormProps {
  initialData?: Tables<'blog_posts'> | null;
  onSubmit: (values: BlogPostFormValues) => Promise<void>;
  onCancel?: () => void;
  isSubmitting: boolean;
}

export interface FormFieldProps {
  name: 'title' | 'category' | 'excerpt' | 'content' | 'cover_image' | 'author_id';
  label: string;
  placeholder: string;
  type?: string;
  className?: string;
  rows?: number;
  component?: 'input' | 'textarea' | 'editor';
  editorRef?: React.RefObject<any>;
  editorConfig?: any;
}
