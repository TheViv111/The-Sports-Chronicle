import { Tables } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { transformBlogPostForDisplay, BlogPostWithDisplay } from "@/lib/blog-utils";
import { useTranslation } from "@/contexts/TranslationContext";
import { useState, lazy, Suspense } from "react";
import { PlaceholderImage } from "@/components/common/PlaceholderImage";

const OptimizedImage = lazy(() => import("@/components/common/OptimizedImage"));

interface BlogCardProps {
  post: Tables<'blog_posts'> | BlogPostWithDisplay;
  priority?: boolean; // For LCP optimization - first image should be priority
}

export default function BlogCard({ post, priority = false }: BlogCardProps) {
  const { currentLanguage } = useTranslation();

  const displayPost = (post as any).date ? (post as BlogPostWithDisplay) : transformBlogPostForDisplay(post as Tables<'blog_posts'>, currentLanguage);
  const badgeVariant = (displayPost.category || "").toLowerCase() as any;
  const badgeLabel = displayPost.displayCategory || displayPost.category;
  const imageSrc = displayPost.cover_image || (displayPost as any).image;
  const [imageError, setImageError] = useState(!imageSrc);

  return (
    <Link to={`/blog/${displayPost.slug}`} className="block group">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-muted/50 h-full flex flex-col">
        <div className="aspect-[16/9] mb-4 overflow-hidden bg-muted">
          {!imageError && imageSrc ? (
            <Suspense fallback={<PlaceholderImage category={displayPost.category} className="w-full h-full" />}>
              <OptimizedImage
                src={imageSrc}
                alt={displayPost.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={() => setImageError(true)}
                width={800}
                height={450}
                loading={priority ? "eager" : "lazy"}
                fetchPriority={priority ? "high" : "auto"}
              />
            </Suspense>
          ) : (
            <PlaceholderImage
              category={displayPost.category}
              className="w-full h-full"
            />
          )}
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="line-clamp-2 text-lg sm:text-xl group-hover:text-primary transition-colors">
            {displayPost.title}
          </CardTitle>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <span>{displayPost.date}</span>
            <span>•</span>
            <span>{displayPost.readTime}</span>
          </div>
        </CardHeader>
        <CardContent className="flex-1 pb-2">
          <p className="line-clamp-3 text-sm sm:text-base leading-relaxed">
            {displayPost.excerpt}
          </p>
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-2">
          <Badge variant={badgeVariant} className="text-xs">
            {badgeLabel}
          </Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}