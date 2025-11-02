import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Plus, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useTranslation } from '@/contexts/TranslationContext';
import { Tables } from '@/integrations/supabase/types';
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
});

type BlogPostFormValues = z.infer<typeof blogPostSchema>;

interface BlogPostFormProps {
  initialData?: Tables<'blog_posts'> | null;
  onSubmit: (values: BlogPostFormValues) => Promise<void>;
  onCancel?: () => void;
  isSubmitting: boolean;
}

const BlogPostForm: React.FC<BlogPostFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const { t } = useTranslation();
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
      });
    } else {
      form.reset({
        title: "",
        category: "",
        excerpt: "",
        content: "",
        cover_image: "",
      });
    }
  }, [initialData]);

  const handleSubmit = async (values: BlogPostFormValues) => {
    await onSubmit(values);
  };

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

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{tf("admin.postCategory", "Category")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={tf("admin.enterCategory", "Enter category")}
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
              <FormLabel>{tf("admin.postContent", "Content")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={tf("admin.postContent", "Write your content here...")}
                  className="min-h-64 h-96"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
      </form>
    </Form>
  );
};

export default BlogPostForm;