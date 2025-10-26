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

const blogPostSchema = z.object({
  title: z.string().min(1, { message: "Title cannot be empty." }),
  category: z.string().min(1, { message: "Category cannot be empty." }),
  excerpt: z.string().min(1, { message: "Excerpt cannot be empty." }),
  content: z.string().min(1, { message: "Content cannot be empty." }),
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

  const form = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: initialData?.title || "",
      category: initialData?.category || "",
      excerpt: initialData?.excerpt || "",
      content: initialData?.content || "",
    },
  });

  React.useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title || "",
        category: initialData.category || "",
        excerpt: initialData.excerpt || "",
        content: initialData.content || "",
      });
    } else {
      form.reset({
        title: "",
        category: "",
        excerpt: "",
        content: "",
      });
    }
  }, [initialData, form.reset]);

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
              <FormLabel>{t("admin.postTitle")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("admin.enterPostTitle")}
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
              <FormLabel>{t("admin.postCategory")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("admin.enterCategory")}
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
              <FormLabel>{t("admin.postExcerpt")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("admin.briefDescription")}
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
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("admin.postContent")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("admin.writeContent")}
                  className="min-h-[300px]"
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