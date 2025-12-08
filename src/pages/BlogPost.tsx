import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import RelatedPosts from "@/components/blog/RelatedPosts";
import KeywordOptimizer from "@/components/blog/KeywordOptimizer";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Tables } from "@/integrations/supabase/types";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useTranslation } from "@/contexts/TranslationContext";
import { SEO } from "@/components/common/SEO";
import { AuthorBio } from "@/components/blog/AuthorBio";
import { getAuthorById } from "@/data/authors";
import SocialShare from "@/components/blog/SocialShare";
import { getTranslationWithEnglishFallback } from "@/utils/translations";
import CommentsSection from "@/components/comments/CommentsSection";

type BlogPostType = Tables<'blog_posts'>;

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, currentLanguage } = useTranslation();

  if (!slug) {
    return <Navigate to="/blog" replace />;
  }

  const { data: post, isLoading, error } = useQuery<BlogPostType | null, Error>({
    queryKey: ['blogPost', slug, currentLanguage],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();
      if (error) throw error;
      
      // Ensure translations are properly parsed if they come as string
      if (data?.translations && typeof data.translations === 'string') {
        try {
          data.translations = JSON.parse(data.translations);
        } catch (e) {
          console.error('Error parsing translations:', e);
        }
      }
      
      return data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return <LoadingScreen message="Loading post..." />;
  }

  if (error || !post) {
    return <Navigate to="/blog" replace />;
  }

  // Debug logging for translations
  console.log('Post translations:', JSON.stringify(post?.translations, null, 2));
  console.log('Current language:', currentLanguage);
  console.log('Post object keys:', post ? Object.keys(post) : 'No post');
  console.log('Translations type:', typeof post?.translations);
  console.log('Translations is null:', post?.translations === null);

  // Get translated content using the new utility function
  const translatedPost = {
    ...post,
    title: getTranslationWithEnglishFallback(post?.translations, 'title', currentLanguage, post?.title || ''),
    content: getTranslationWithEnglishFallback(post?.translations, 'content', currentLanguage, post?.content || ''),
    excerpt: getTranslationWithEnglishFallback(post?.translations, 'excerpt', currentLanguage, post?.excerpt || ''),
    category: getTranslationWithEnglishFallback(post?.translations, 'category', currentLanguage, post?.category || ''),
  } as BlogPostType;

  console.log('Translated post title:', translatedPost.title);
  console.log('Original post title:', post?.title);

  // Simple date formatting
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  // Get author bio if available
  const author = (post as any).author_id ? getAuthorById((post as any).author_id) : null;

  return (
    <>
      <SEO
        title={`${translatedPost.title || 'Blog Post'} | The Sports Chronicle`}
        description={translatedPost.excerpt || `Read ${translatedPost.title || 'this article'} on The Sports Chronicle. Latest sports news and expert analysis.`}
        canonicalUrl={`https://the-sports-chronicle.vercel.app/blog/${post.slug}`}
        schemaType="Article"
        imageUrl={post.cover_image || "https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg"}
        articleData={{
          headline: translatedPost.title || 'Blog Post',
          datePublished: post.created_at,
          dateModified: post.updated_at || post.created_at,
          author: {
            "@type": "Person",
            name: post.author || "The Sports Chronicle"
          },
          image: post.cover_image || "https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg",
          category: translatedPost.category || undefined,
          keywords: `${translatedPost.category}, sports news, ${translatedPost.title}, the sports chronicle, sports analysis`,
          articleSection: translatedPost.category || undefined
        }}
      />

      {/* SEO Keyword Optimizer */}
      <KeywordOptimizer post={translatedPost} />

      <div className="min-h-screen bg-background">
        {/* Back button */}
        <div className="container mx-auto px-4 py-6">
          <Link to="/blog">
            <Button variant="ghost" className="group">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              {t("blog.backToBlog")}
            </Button>
          </Link>
        </div>

        {/* Article content */}
        <article className="container mx-auto px-4 pb-12 max-w-4xl">
          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            {translatedPost.title || "Untitled Post"}
          </h1>

          {/* Category badge */}
          <Badge variant="outline" className="mb-6 uppercase text-xs">
            {translatedPost.category || "Uncategorized"}
          </Badge>

          {/* Excerpt */}
          {translatedPost.excerpt && (
            <p className="text-lg text-muted-foreground mb-6 italic border-l-4 border-primary pl-4">
              {translatedPost.excerpt}
            </p>
          )}

          {/* Cover image */}
          {post.cover_image && (
            <div className="aspect-[21/9] mb-8 rounded-lg overflow-hidden">
              <img
                src={post.cover_image}
                alt={`${translatedPost.title} - ${translatedPost.category} article cover image on The Sports Chronicle`}
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap gap-4 mb-8 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              {formatDate(post.created_at)}
            </div>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              {post.read_time || "5 min read"}
            </div>
            {author && (
              <div className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                {author.name}
              </div>
            )}
          </div>

          {/* Social Share */}
          <div className="mb-8">
            <SocialShare
              title={translatedPost.title || "Untitled Post"}
              url={`https://the-sports-chronicle.vercel.app/blog/${post.slug}`}
              description={translatedPost.excerpt || undefined}
            />
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-heading prose-a:text-primary hover:prose-a:text-primary/80">
            <div 
              className="space-y-6"
              dangerouslySetInnerHTML={{ 
                __html: translatedPost.content || "No content available." 
              }} 
            />
          </div>
        </article>

        
        {/* Author Bio */}
        {author && (
          <div className="container mx-auto px-4 max-w-4xl mb-12">
            <AuthorBio author={author} />
          </div>
        )}

        {/* Comments Section */}
        <div className="container mx-auto px-4 max-w-4xl mb-12">
          <CommentsSection postId={post.id} />
        </div>

        {/* Related Posts */}
        <div className="container mx-auto px-4 max-w-4xl">
          <RelatedPosts
            currentPost={post}
            category={post.category}
            limit={3}
          />
        </div>

              </div>
    </>
  );
};

export default BlogPost;
