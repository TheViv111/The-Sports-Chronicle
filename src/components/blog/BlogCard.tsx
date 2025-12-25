import { Tables } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { transformBlogPostForDisplay, BlogPostWithDisplay } from "@/lib/blog-utils";
import { useTranslation } from "@/contexts/TranslationContext";
import { useState, memo } from "react";
import { PlaceholderImage } from "@/components/common/PlaceholderImage";

interface BlogCardProps {
  post: Tables<'blog_posts'> | BlogPostWithDisplay;
  className?: string;
  style?: React.CSSProperties;
}

// Memoized BlogCard for better performance
const BlogCard = memo(function BlogCard({ post, className, style }: BlogCardProps) {
  const { currentLanguage } = useTranslation();

  const displayPost = (post as any).date ? (post as BlogPostWithDisplay) : transformBlogPostForDisplay(post as Tables<'blog_posts'>, currentLanguage);
  const badgeVariant = (displayPost.category || "").toLowerCase() as any;
  const badgeLabel = displayPost.displayCategory || displayPost.category;
  const imageSrc = displayPost.cover_image || (displayPost as any).image;
  const [imageError, setImageError] = useState(!imageSrc);

  return (
    <Link to={`/blog/${displayPost.slug}`} className="block group">
      <Card
        className={`overflow-hidden h-full flex flex-col transition-shadow duration-300 hover:shadow-xl ${className || ''}`}
        style={{
          ...style,
          contain: 'layout style',
        }}
      >
        {/* Fixed aspect ratio container to prevent CLS */}
        <div
          className="relative overflow-hidden bg-muted"
          style={{
            aspectRatio: '16/9',
            contain: 'strict',
          }}
        >
          {!imageError && imageSrc ? (
            <img
              src={imageSrc}
              alt={`${displayPost.title} - ${displayPost.category} article`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImageError(true)}
              width={400}
              height={225}
              loading="lazy"
              decoding="async"
              style={{
                aspectRatio: '16/9',
              }}
            />
          ) : (
            <PlaceholderImage
              category={displayPost.category}
              className="w-full h-full"
            />
          )}
          {/* Gradient overlay - CSS only, no JS state */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <CardHeader className="pb-2">
          <CardTitle className="line-clamp-2 text-lg sm:text-xl transition-colors duration-200 group-hover:text-primary">
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
          <Badge
            variant={badgeVariant}
            className="text-xs"
          >
            {badgeLabel}
          </Badge>
          <span className="text-xs text-muted-foreground transition-transform duration-200 group-hover:translate-x-1">
            →
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
});

export default BlogCard;