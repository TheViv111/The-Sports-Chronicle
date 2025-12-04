import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BlogCard from "@/components/blog/BlogCard";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Tables } from "@/integrations/supabase/types";
import LoadingScreen from "@/components/common/LoadingScreen";
import DOMPurify from "dompurify";
import { useTranslation } from "@/contexts/TranslationContext";
import { SEO } from "@/components/common/SEO";
import CommentsSection from "@/components/comments/CommentsSection";
import { AuthorBio } from "@/components/blog/AuthorBio";
import { getAuthorById } from "@/data/authors";

type BlogPostType = Tables<'blog_posts'>;

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();

  if (!slug) {
    return <Navigate to="/blog" replace />;
  }

  const { data: post, isLoading, error } = useQuery<BlogPostType | null, Error>({
    queryKey: ['blogPost', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Fetch related posts
  const { data: relatedPosts } = useQuery({
    queryKey: ['relatedPosts', post?.category, post?.id],
    queryFn: async () => {
      if (!post) return [];
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('category', post.category)
        .neq('id', post.id)
        .limit(3);
      if (error) throw error;
      return data || [];
    },
    enabled: !!post,
  });

  if (isLoading) {
    return <LoadingScreen message="Loading post..." />;
  }

  if (error || !post) {
    return <Navigate to="/blog" replace />;
  }

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
        title={`${post.title || 'Blog Post'} - The Sports Chronicle`}
        description={post.excerpt || `Read ${post.title || 'this article'} on The Sports Chronicle. Latest sports news and analysis.`}
        canonicalUrl={`https://the-sports-chronicle.vercel.app/blog/${post.slug}`}
        schemaType="Article"
        imageUrl={post.cover_image || "https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg"}
        articleData={{
          headline: post.title || 'Blog Post',
          datePublished: post.created_at,
          dateModified: post.updated_at || post.created_at,
          author: {
            "@type": "Person",
            name: post.author || "The Sports Chronicle"
          },
          image: post.cover_image || "https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg",
          category: post.category,
          keywords: `${post.category}, sports news, ${post.title}, the sports chronicle, sports analysis`,
          articleSection: post.category
        }}
      />

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
            {post.title || "Untitled Post"}
          </h1>

          {/* Category badge */}
          <Badge variant="outline" className="mb-6 uppercase text-xs">
            {post.category || "Uncategorized"}
          </Badge>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-lg text-muted-foreground mb-6 italic border-l-4 border-primary pl-4">
              {post.excerpt}
            </p>
          )}

          {/* Cover image */}
          {post.cover_image && (
            <div className="aspect-[21/9] mb-8 rounded-lg overflow-hidden">
              <img
                src={post.cover_image}
                alt={post.title || "Blog post cover"}
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
            {post.author && (
              <div className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                {post.author}
              </div>
            )}
          </div>

          {/* Content */}
          <div
            className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-heading prose-a:text-primary hover:prose-a:text-primary/80"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(post.content || "<p>No content available.</p>", {
                ADD_TAGS: ["iframe"],
                ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling"],
              })
            }}
          />
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
        {relatedPosts && relatedPosts.length > 0 && (
          <section className="py-16 bg-secondary/20">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold mb-8 text-center">
                {t("blog.relatedArticles")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {relatedPosts.map((relatedPost) => (
                  <BlogCard key={relatedPost.id} post={relatedPost} />
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default BlogPost;
