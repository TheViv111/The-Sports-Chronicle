import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Save, Clock } from 'lucide-react';
import LogoLoader from '@/components/common/LogoLoader';
import CustomQuillEditor from './CustomQuillEditor';


import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

import { useTranslation } from '@/contexts/TranslationContext';
import { BlogPost } from '@/types/supabase';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

const blogPostSchema = z.object({
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
  status: z.enum(['draft', 'published', 'scheduled']),
  scheduled_publish_at: z.string().optional().nullable(),
});

type BlogPostFormValues = z.infer<typeof blogPostSchema>;

interface Author {
  id: string;
  full_name: string;
  email: string;
}

interface BlogPostFormProps {
  initialData?: BlogPost | null;
  onSubmit: (values: BlogPostFormValues) => Promise<void>;
  onCancel?: () => void;
  isSubmitting: boolean;
  authors: Author[];
}

const BlogPostForm: React.FC<BlogPostFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  authors,
}) => {
  const { t } = useTranslation();

  // Theme handling is now managed by CustomQuillEditor

  const tf = (key: string, fallback: string) => {
    if (!key) return fallback;
    const translation = t(key);
    return (translation && translation !== key) ? translation : fallback;
  };

  // Get translations with fallbacks
  const coverImageLabel = t("admin.coverImage") || "Cover image";
  const coverImagePlaceholder = t("admin.coverImageUrl") || "Paste image URL or upload below";
  const uploadText = t("admin.upload") || "Upload";

  const form = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: initialData?.title || "",
      category: initialData?.category || "",
      excerpt: initialData?.excerpt || "",
      content: initialData?.content || "",
      cover_image: (initialData as any)?.cover_image || "",
      author_id: (initialData as any)?.author || "",
      status: (initialData as any)?.status || "draft",
      scheduled_publish_at: (initialData as any)?.scheduled_publish_at || null,
    },
  });

  React.useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title || "",
        category: initialData.category || "",
        excerpt: initialData.excerpt || "",
        content: initialData.content || "",
        cover_image: (initialData as any)?.cover_image || "",
        author_id: (initialData as any)?.author || "",
        status: (initialData as any)?.status || "draft",
        scheduled_publish_at: (initialData as any)?.scheduled_publish_at || null,
      });
    } else {
      form.reset({
        title: "",
        category: "",
        excerpt: "",
        content: "",
        cover_image: "",
        author_id: "",
        status: "draft",
        scheduled_publish_at: null,
      });
    }
  }, [initialData]);

  const handleSubmit = async (values: BlogPostFormValues) => {
    // If scheduled, ensure date is set
    if (values.status === 'scheduled' && !values.scheduled_publish_at) {
      form.setError('scheduled_publish_at', { message: 'Date is required for scheduled posts' });
      return;
    }
    await onSubmit(values);
  };

  // Calculate read time
  const content = form.watch('content');
  const readTime = React.useMemo(() => {
    const text = content.replace(/<[^>]*>/g, '');
    const wordCount = text.trim().split(/\s+/).length;
    return Math.ceil(wordCount / 200);
  }, [content]);

  const quillRef = useRef<any>(null);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{tf("admin.postTitle", "Post title")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={tf("admin.enterPostTitle", "Enter post title")}
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tf("admin.postCategory", "Category")}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={tf("admin.selectCategory", "Select category")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Basketball">Basketball</SelectItem>
                    <SelectItem value="Football">Football</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="author_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tf("admin.author", "Author")}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={tf("admin.selectAuthor", "Select author")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {authors.map((author) => (
                      <SelectItem key={author.id} value={author.id}>
                        {author.full_name || author.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{tf("admin.postExcerpt", "Excerpt")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={tf("admin.briefDescription", "Brief description")}
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cover_image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{coverImageLabel}</FormLabel>
              <FormControl>
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder={coverImagePlaceholder}
                    {...field}
                    disabled={isSubmitting}
                  />
                  <input
                    id="cover-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const ext = file.name.split('.').pop() || 'png';
                      const filename = `${uuidv4()}.${ext}`;
                      const path = `blog-images/${filename}`;
                      const { error } = await supabase.storage.from('blog-assets').upload(path, file);
                      if (!error) {
                        const { data } = supabase.storage.from('blog-assets').getPublicUrl(path);
                        form.setValue('cover_image', data.publicUrl, { shouldValidate: true, shouldDirty: true });
                      }
                      // reset input
                      (e.target as HTMLInputElement).value = '';
                    }}
                  />
                  <Button type="button" variant="outline" onClick={() => document.getElementById('cover-upload')?.click()} disabled={isSubmitting}>
                    {uploadText}
                  </Button>
                </div>
              </FormControl>
              {field.value && (
                <div className="mt-2">
                  <img
                    src={field.value}
                    alt="Cover preview"
                    className="w-full max-w-md h-40 object-cover rounded border"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center">
                <FormLabel>{tf("admin.postContent", "Content")}</FormLabel>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {readTime} min read
                </span>
              </div>
              <div className="mt-1">
                <CustomQuillEditor
                  ref={quillRef}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Write your blog post content here..."
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border-t pt-4 mt-6">
          <div className="flex gap-2 items-center">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex-1 min-w-[140px]">
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('status') === 'scheduled' && (
              <FormField
                control={form.control}
                name="scheduled_publish_at"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <LogoLoader size="xs" className="mr-2" />
              ) : initialData ? (
                <Save className="mr-2 h-4 w-4" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              {initialData ? t("admin.updatePost") : t("admin.createPost")}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                {t("common.cancel")}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
};

export default BlogPostForm;