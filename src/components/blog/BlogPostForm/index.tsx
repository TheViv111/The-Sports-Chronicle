import React, { useMemo, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/contexts/TranslationContext';

import { blogPostSchema, BlogPostFormValues, BlogPostFormProps } from './types';
import FormField from './FormField';
import ImageUploader from './ImageUploader';
import { getAllAuthors } from '@/data/authors';

const BlogPostForm: React.FC<BlogPostFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const { t } = useTranslation();
  const editorRef = useRef(null);

  const form = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: '',
      category: '',
      excerpt: '',
      content: '',
      cover_image: '',
      author_id: 'ved-mehta', // Default to Ved Mehta (Blog Author)
    },
  });

  // Initialize form with initialData
  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title || '',
        category: initialData.category || '',
        excerpt: initialData.excerpt || '',
        content: initialData.content || '',
        cover_image: (initialData as any)?.cover_image || '',
        author_id: (initialData as any)?.author_id || 'ved-mehta',
      });
    } else {
      form.reset({
        title: '',
        category: '',
        excerpt: '',
        content: '',
        cover_image: '',
        author_id: 'ved-mehta',
      });
    }
  }, [initialData, form]);

  const handleSubmit = async (values: BlogPostFormValues) => {
    await onSubmit(values);
  };

  // Editor configuration
  const editorConfig = useMemo(() => ({
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
        ['clean'],
      ],
    },
    formats: [
      'header',
      'bold', 'italic', 'underline', 'strike', 'blockquote',
      'list', 'bullet',
      'link', 'image'
    ],
  }), []);

  // Translation fallback helper
  const tf = (key: string, fallback: string) => {
    if (!key) return fallback;
    const translation = t(key);
    return (translation && translation !== key) ? translation : fallback;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">
        {initialData ? t('admin.editPost') || 'Edit Post' : t('admin.createPost') || 'Create Post'}
      </h2>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FormField
              name="title"
              label={tf('admin.title', 'Title')}
              placeholder={tf('admin.titlePlaceholder', 'Enter post title')}
              component="input"
            />

            <FormField
              name="category"
              label={tf('admin.category', 'Category')}
              placeholder={tf('admin.categoryPlaceholder', 'Enter category')}
              component="input"
            />

            {/* Author Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {tf('admin.author', 'Author')}
              </label>
              <select
                {...form.register('author_id')}
                className="w-full border rounded-md px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {getAllAuthors().map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name} - {author.title}
                  </option>
                ))}
              </select>
              {form.formState.errors.author_id && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.author_id.message}
                </p>
              )}
            </div>

            <FormField
              name="excerpt"
              label={tf('admin.excerpt', 'Excerpt')}
              placeholder={tf('admin.excerptPlaceholder', 'Enter a brief excerpt')}
              component="textarea"
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <ImageUploader
              name="cover_image"
              label={tf('admin.coverImage', 'Cover Image')}
              placeholder={tf('admin.imageUrlPlaceholder', 'Paste image URL or upload')}
              onImageUploaded={(url) => form.setValue('cover_image', url, { shouldValidate: true })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <FormField
            name="content"
            label={tf('admin.content', 'Content')}
            placeholder={tf('admin.contentPlaceholder', 'Write your post content here...')}
            component="editor"
            editorRef={editorRef}
            editorConfig={editorConfig}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              {tf('common.cancel', 'Cancel')}
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {tf('common.saving', 'Saving...')}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {initialData ? tf('common.update', 'Update') : tf('common.create', 'Create')}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BlogPostForm;
