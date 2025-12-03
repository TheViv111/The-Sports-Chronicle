import { Tables } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { transformBlogPostForDisplay, BlogPostWithDisplay } from "@/lib/blog-utils";
import { useTranslation } from "@/contexts/TranslationContext";
import { useState, lazy, Suspense, useRef } from "react";
import { PlaceholderImage } from "@/components/common/PlaceholderImage";

const OptimizedImage = lazy(() => import("@/components/common/OptimizedImage"));

// 3D tilt effect hook
const use3DTilt = () => {
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0, scale: 1 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = event.clientX - centerX;
    const mouseY = event.clientY - centerY;

    const rotateX = (mouseY / (rect.height / 2)) * -15;
    const rotateY = (mouseX / (rect.width / 2)) * 15;
    const scale = 1.05;

    setTransform({ rotateX, rotateY, scale });
  };

  const handleMouseLeave = () => {
    setTransform({ rotateX: 0, rotateY: 0, scale: 1 });
  };

  return { transform, handleMouseMove, handleMouseLeave, cardRef };
};

interface BlogCardProps {
  post: Tables<'blog_posts'> | BlogPostWithDisplay;
  className?: string;
  style?: React.CSSProperties;
}

export default function BlogCard({ post, className, style }: BlogCardProps) {
  const { currentLanguage } = useTranslation();
  const { transform, handleMouseMove, handleMouseLeave, cardRef } = use3DTilt();

  const displayPost = (post as any).date ? (post as BlogPostWithDisplay) : transformBlogPostForDisplay(post as Tables<'blog_posts'>, currentLanguage);
  const badgeVariant = (displayPost.category || "").toLowerCase() as any;
  const badgeLabel = displayPost.displayCategory || displayPost.category;
  const imageSrc = displayPost.cover_image || (displayPost as any).image;
  const [imageError, setImageError] = useState(!imageSrc);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link to={`/blog/${displayPost.slug}`} className="block group">
      <Card 
        className={`overflow-hidden transition-all duration-500 hover:shadow-2xl h-full flex flex-col preserve-3d ${className || ''}`} 
        style={{
          ...style,
          transform: `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) scale(${transform.scale})`,
          transformStyle: 'preserve-3d',
        }}
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={() => setIsHovered(true)}
        onMouseOut={() => setIsHovered(false)}
      >
        <div className="aspect-[16/9] mb-4 overflow-hidden bg-muted relative">
          {!imageError && imageSrc ? (
            <Suspense fallback={<PlaceholderImage category={displayPost.category} className="w-full h-full" />}>
              <OptimizedImage
                src={imageSrc}
                alt={displayPost.title}
                className={`w-full h-full object-contain transition-all duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
                onError={() => setImageError(true)}
                width={800}
                height={450}
                loading="eager"
                fetchPriority="high"
              />
            </Suspense>
          ) : (
            <PlaceholderImage
              category={displayPost.category}
              className="w-full h-full"
            />
          )}
          {/* Gradient overlay on hover */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/20 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
        </div>
        
        <CardHeader className="pb-2" style={{ transform: 'translateZ(30px)' }}>
          <CardTitle className={`line-clamp-2 text-lg sm:text-xl transition-all duration-300 ${isHovered ? 'text-primary' : ''}`}>
            {displayPost.title}
          </CardTitle>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <span>{displayPost.date}</span>
            <span>•</span>
            <span>{displayPost.readTime}</span>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 pb-2" style={{ transform: 'translateZ(20px)' }}>
          <p className="line-clamp-3 text-sm sm:text-base leading-relaxed">
            {displayPost.excerpt}
          </p>
        </CardContent>
        
        <CardFooter className="flex items-center justify-between pt-2" style={{ transform: 'translateZ(10px)' }}>
          <Badge 
            variant={badgeVariant} 
            className={`text-xs transition-all duration-300 ${isHovered ? 'scale-110 shadow-md' : ''}`}
          >
            {badgeLabel}
          </Badge>
          <div className={`text-xs text-muted-foreground transition-all duration-300 ${isHovered ? 'translate-x-1 opacity-100' : 'translate-x-0 opacity-70'}`}>
            →
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}