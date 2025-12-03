import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BlogCard from "@/components/blog/BlogCard";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Tables } from "@/integrations/supabase/types";
import LoadingScreen from "@/components/common/LoadingScreen";
import DOMPurify from "dompurify";
import { useTranslation } from "@/contexts/TranslationContext";
import { formatBlogPostDate, transformBlogPostForDisplay } from "@/lib/blog-utils";
import useScrollReveal from "@/hooks/useScrollReveal";
import { SEO } from "@/components/common/SEO";
import CommentsSection from "@/components/comments/CommentsSection";

type BlogPostType = Tables<'blog_posts'>;

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, currentLanguage } = useTranslation();

  useScrollReveal('.reveal-on-scroll');
  useScrollReveal('.staggered-grid > .reveal-on-scroll', { threshold: 0.1 });

  if (!slug) {
    return <Navigate to="/blog" replace />;
  }

  const { data: post, isLoading: isPostLoading, error: postError } = useQuery<BlogPostType | null, Error>({
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
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const { data: relatedPosts, isLoading: isRelatedPostsLoading } = useQuery({
    queryKey: ['relatedPosts', post?.category, post?.id, currentLanguage],
    queryFn: async () => {
      if (!post) return [];
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('category', post.category)
        .neq('id', post.id)
        .limit(3);
      if (error) throw error;
      return data ? data.map((p) => transformBlogPostForDisplay(p, currentLanguage)) : [];
    },
    enabled: !!post,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  if (isPostLoading) {
    return <LoadingScreen message={t("latestPosts.loading")} />;
  }

  if (postError) {
    console.error('Error loading post:', postError);
    return <Navigate to="/blog" replace />;
  }

  if (!post) {
    return <Navigate to="/blog" replace />;
  }
  const displayPost = transformBlogPostForDisplay(post, currentLanguage);



  return (
    <>
      <SEO
        title={`${displayPost.title} - The Sports Chronicle`}
        description={displayPost.excerpt || `Read ${displayPost.title} on The Sports Chronicle. Latest sports news and analysis with expert insights on ${displayPost.category}.`}
        canonicalUrl={`https://the-sports-chronicle.vercel.app/blog/${displayPost.slug}`}
        schemaType="Article"
        imageUrl={displayPost.cover_image || "https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg"}
        articleData={{
          headline: displayPost.title,
          datePublished: displayPost.created_at,
          dateModified: displayPost.updated_at || displayPost.created_at,
          author: {
            "@type": "Person",
            name: displayPost.author || "The Sports Chronicle"
          },
          image: displayPost.cover_image || "https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg",
          category: displayPost.category,
          keywords: `${displayPost.category}, sports news, ${displayPost.title}, the sports chronicle, sports analysis`,
          articleSection: displayPost.category
        }}
        additionalSchema={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://the-sports-chronicle.vercel.app"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Blog",
              "item": "https://the-sports-chronicle.vercel.app/blog"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": displayPost.title,
              "item": `https://the-sports-chronicle.vercel.app/blog/${displayPost.slug}`
            }
          ]
        }}
      />
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-6">
          <Link to="/blog">
            <Button variant="ghost" className="group btn-hover-lift">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              {t("blog.backToBlog")}
            </Button>
          </Link>
        </div>

        <article className="container mx-auto px-4 pb-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-heading text-3xl md:text-5xl font-bold mb-4 leading-tight reveal-on-scroll">
              {displayPost.title}
            </h1>

            <Badge variant="outline" className="uppercase text-xs mb-6 reveal-on-scroll">
              {displayPost.displayCategory || post.category}
            </Badge>

            <div className="aspect-[21/9] mb-8 overflow-hidden rounded-lg reveal-on-scroll scale-in">
              <img
                src={displayPost.cover_image || "https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg"}
                alt={displayPost.title}
                className="w-full h-full object-cover"
                width={1260}
                height={540}
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-8 reveal-on-scroll">
              <div className="flex items-center text-muted-foreground text-sm">
                <Calendar className="mr-2 h-4 w-4" />
                {formatBlogPostDate(displayPost.created_at)}
              </div>
              <div className="flex items-center text-muted-foreground text-sm">
                <Clock className="mr-2 h-4 w-4" />
                {displayPost.read_time || "5 min read"}
              </div>
              <div className="flex items-center text-muted-foreground text-sm">
                <User className="mr-2 h-4 w-4" />
                {displayPost.author}
              </div>
            </div>

            <div className="reveal-on-scroll">
              <div
                className="prose prose-lg max-w-none dark:prose-invert"
                style={{
                  '--tw-prose-bullets': '#000',
                  '--tw-prose-links': '#2563eb',
                  '--tw-prose-links-hover': '#1d4ed8',
                  '--tw-prose-headings': '#111827',
                  '--tw-prose-body': '#374151',
                  '--tw-prose-pre-bg': 'rgba(0, 0, 0, 0.05)'
                } as React.CSSProperties}

                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(displayPost.content || "", {
                    ADD_TAGS: ["iframe"],
                    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling"],
                    USE_PROFILES: { html: true }
                  })
                }}
              />
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <CommentsSection postId={post.id} />

        {isRelatedPostsLoading ? (
          <div className="py-16 bg-secondary/20 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground mt-2">{t("blog.loadingRelatedPosts")}</p>
          </div>
        ) : relatedPosts && relatedPosts.length > 0 && (
          <section className="py-16 bg-secondary/20">
            <div className="container mx-auto px-4">
              <h2 className="font-heading text-2xl font-bold mb-8 text-center reveal-on-scroll">
                {t("blog.relatedArticles")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto staggered-grid">
                {relatedPosts.map((relatedPost: any, index: number) => (
                  <div key={relatedPost.id} className="reveal-on-scroll" style={{ ['--stagger-delay' as any]: `${index * 100}ms` }}>
                    <BlogCard post={relatedPost} />
                  </div>
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
