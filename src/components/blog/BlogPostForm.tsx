import React, { useMemo, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Plus, Save, Clock } from 'lucide-react';
import { Quill } from 'react-quill-new';
import CustomQuillEditor from './CustomQuillEditor';
import '../../styles/quill-custom.css';

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

  // Define system fonts that are available on most devices
  const fontFamilies = [
    {
      key: 'system',
      label: 'System Default',
      value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      class: 'ql-font-system'
    },
    {
      key: 'arial',
      label: 'Arial',
      value: 'Arial, Helvetica, sans-serif',
      class: 'ql-font-arial'
    },
    {
      key: 'times',
      label: 'Times New Roman',
      value: '"Times New Roman", Times, serif',
      class: 'ql-font-times'
    },
    {
      key: 'georgia',
      label: 'Georgia',
      value: 'Georgia, serif',
      class: 'ql-font-georgia'
    },
    {
      key: 'courier',
      label: 'Courier New',
      value: '"Courier New", Courier, monospace',
      class: 'ql-font-courier'
    },
    {
      key: 'verdana',
      label: 'Verdana',
      value: 'Verdana, Geneva, sans-serif',
      class: 'ql-font-verdana'
    },
    {
      key: 'tahoma',
      label: 'Tahoma',
      value: 'Tahoma, Geneva, sans-serif',
      class: 'ql-font-tahoma'
    },
    {
      key: 'trebuchet',
      label: 'Trebuchet MS',
      value: '"Trebuchet MS", Helvetica, sans-serif',
      class: 'ql-font-trebuchet'
    },
    {
      key: 'impact',
      label: 'Impact',
      value: 'Impact, Charcoal, sans-serif',
      class: 'ql-font-impact'
    }
  ];

  // Define font sizes for the dropdown
  const fontSizeOptions = [
    '10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '40px', '48px'
  ];

  // System fonts are used - no external font loading needed

  // Custom toolbar with font family and size dropdowns
  const modules = useMemo(() => {
    // Register font format
    const Font = Quill.import('formats/font') as any;
    const fonts = fontFamilies.map(f => f.class.replace('ql-font-', ''));
    Font.whitelist = fonts;
    Quill.register(Font, true);

    // Register font size format
    const Size = Quill.import('attributors/style/size') as any;
    Size.whitelist = fontSizeOptions;
    Quill.register(Size, true);

    // Register custom font class
    const FontAttributor = Quill.import('attributors/class/font') as any;
    FontAttributor.whitelist = fonts;
    Quill.register(FontAttributor, true);

    // Register formats for toggleable styles
    const Bold = Quill.import('formats/bold') as any;
    const Italic = Quill.import('formats/italic') as any;
    const Underline = Quill.import('formats/underline') as any;
    Quill.register(Bold, true);
    Quill.register(Italic, true);
    Quill.register(Underline, true);

    // Custom font handler: apply to selection, or whole content if none
    const fontHandler = (value: string) => {
      const quill = quillRef.current?.getEditor();
      if (!quill) return;
      const range = quill.getSelection();
      const length = quill.getLength();
      const targetValue = value === 'sans-serif' ? false : value;
      if (!range || range.length === 0) {
        // No selection: apply to whole content for clearer UX
        quill.formatText(0, length, 'font', targetValue);
      } else {
        quill.format('font', targetValue);
      }
    };

    return {
      toolbar: {
        container: [
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
          [{ 'font': fontFamilies.map(f => f.class.replace('ql-font-', '')) }],
          [{ 'size': fontSizeOptions }],
          [{ 'color': [] }, { 'background': [] }],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          ['link', 'image'],
          ['clean']
        ],
        handlers: {
          font: fontHandler
        }
      },
      clipboard: {
        matchVisual: false, // Don't convert text styles automatically
      },
    };
  }, []);

  // Add font size styles to the document head
  React.useEffect(() => {
    // Create a style element for the font sizes
    const style = document.createElement('style');
    style.textContent = `
      .ql-snow .ql-picker.ql-size .ql-picker-label::before,
      .ql-snow .ql-picker.ql-size .ql-picker-label::before {
        content: attr(data-value) !important;
        font-size: 14px !important;
      }
      ${fontSizeOptions.map(size => `
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="${size}"]::before,
        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="${size}"]::before {
          content: '${size}' !important;
        }
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="${size}"] {
          font-size: ${size} !important;
        }
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="${size}"] {
          padding-left: 12px !important;
        }
        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="${size}"] {
          padding-left: 12px !important;
        }
      `).join('')}
      
      /* Style for the dropdown items */
      .ql-snow .ql-picker.ql-size .ql-picker-item {
        padding-left: 12px !important;
      }
      
      /* Style for the selected item */
      .ql-snow .ql-toolbar .ql-size .ql-picker-label {
        padding-left: 12px !important;
      }
      
      /* Ensure the dropdown has enough width */
      .ql-snow .ql-picker.ql-size {
        width: 90px !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Apply font styles to the editor
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Apply font families to the editor content */
      ${fontFamilies.map(font => `
        .${font.class} {
          font-family: ${font.value} !important;
        }
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="${font.class.replace('ql-font-', '')}"] {
          font-family: ${font.value} !important;
          padding-left: 12px !important;
        }
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="${font.class.replace('ql-font-', '')}"] {
          font-family: ${font.value} !important;
        }
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="${font.class.replace('ql-font-', '')}"]::before {
          content: "${font.label}" !important;
          font-family: ${font.value} !important;
        }
      `).join('')}
      
      /* Ensure the editor content can display different fonts */
      .ql-editor {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        font-size: 16px;
        line-height: 1.5;
      }

      /* Make sure the font dropdown is wide enough */
      .ql-snow .ql-picker.ql-font {
        width: 180px !important;
      }
      
      /* Improve font size dropdown */
      .ql-snow .ql-picker.ql-size {
        width: 100px !important;
      }
      
      /* Set default font size for the editor */
      .ql-editor p {
        font-size: 16px;
        margin-bottom: 1em;
      .ql-toolbar.ql-snow {
        border: 1px solid #e2e8f0;
        border-radius: 4px 4px 0 0;
        background-color: #f8fafc;
        padding: 8px;
      }
      
      .ql-container.ql-snow {
        border: 1px solid #e2e8f0;
        border-top: none;
        border-radius: 0 0 4px 4px;
        font-family: 'Arial', sans-serif;
      }
      
      /* Hover states */
      .ql-snow .ql-toolbar button:hover,
      .ql-snow .ql-toolbar button:focus {
        color: #1e40af;
      }
      
      /* Active state */
      .ql-snow .ql-toolbar button.ql-active {
        color: #1e40af;
        font-weight: bold;
      }
      
      /* Ensure formatting buttons work properly */
      .ql-snow .ql-editor {
        white-space: normal;
      }
      
      /* Make sure formatting is visible */
      .ql-snow .ql-editor b,
      .ql-snow .ql-editor strong {
        font-weight: bold !important;
      }
      
      .ql-snow .ql-editor i,
      .ql-snow .ql-editor em {
        font-style: italic !important;
      }
      
      .ql-snow .ql-editor u {
        text-decoration: underline !important;
      }
      
      /* Make dropdowns scrollable */
      .ql-snow .ql-picker.ql-font .ql-picker-options,
      .ql-snow .ql-picker.ql-size .ql-picker-options {
        max-height: 300px !important;
        overflow-y: auto !important;
      }
      /* Make font and size dropdowns scrollable and center text */
      .ql-snow .ql-picker.ql-font .ql-picker-options,
      .ql-snow .ql-picker.ql-size .ql-picker-options {
        max-height: 300px !important;
        overflow-y: auto !important;
        width: 120px !important;
        padding: 4px 0 !important;
        text-align: center !important;
      }
      
      /* Style font and size dropdown items */
      .ql-snow .ql-picker.ql-font .ql-picker-item,
      .ql-snow .ql-picker.ql-size .ql-picker-item {
        padding: 8px 16px !important;
        font-size: 14px !important;
        line-height: 1.5 !important;
        white-space: nowrap;
        text-align: center !important;
        display: block !important;
        margin: 0 auto !important;
      }
      
      /* Force consistent font and size for size dropdown */
      .ql-snow .ql-picker.ql-size .ql-picker-item,
      .ql-snow .ql-picker.ql-size .ql-picker-item span {
        font-family: Arial, sans-serif !important;
        font-size: 14px !important;
        line-height: 1.5 !important;
      }
      
      /* Override any inline styles on the size elements */
      .ql-snow .ql-picker.ql-size .ql-picker-item[data-value] {
        font-size: 14px !important;
      }
      
      /* Style the font and size picker labels */
      .ql-snow .ql-picker.ql-font .ql-picker-label,
      .ql-snow .ql-picker.ql-size .ql-picker-label {
        padding: 6px 12px !important;
        font-size: 14px !important;
        text-align: center !important;
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
      }
      
      /* Apply the actual fonts to the dropdown items and labels */
      ${fontFamilies.map(font => `
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="${font.key}"] {
          font-family: ${font.value} !important;
        }
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="${font.key}"] {
          font-family: ${font.value} !important;
        }
        /* Show human-friendly names in the dropdown */
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="${font.key}"]::before {
          content: "${font.label}" !important;
          font-family: ${font.value} !important;
        }
      `).join('')}
      
      /* Set default font for the editor */
      .ql-snow .ql-editor {
        font-family: 'Arial', sans-serif;
      }
      
      /* Apply the selected font to the content */
      ${fontFamilies.map(font => `
        .ql-font-${font.key} {
          font-family: ${font.value} !important;
        }
      `).join('')}
      
      /* Ensure the dropdown shows the font name */
      .ql-snow .ql-picker.ql-font .ql-picker-label::before {
        content: attr(data-value) !important;
      }
      
      /* Center align text */
      .ql-editor.ql-blank::before {
        text-align: center;
      }
      
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Theme handling is now managed by CustomQuillEditor


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
                  modules={modules}
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
        </div>
      </form>
    </Form>
  );
};

export default BlogPostForm;