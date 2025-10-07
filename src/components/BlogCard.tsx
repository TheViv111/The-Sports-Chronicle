import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/contexts/TranslationContext";
import { BlogPostWithDisplay } from "@/lib/blog-utils";
import { cn } from "@/lib/utils"; // Import cn utility

interface BlogCardProps {
  post: BlogPostWithDisplay;
  className?: string;
  style?: React.CSSProperties; // Add style prop for staggered animations
}

const BlogCard = ({ post, className = "", style }: BlogCardProps) => {
  const { t } = useTranslation();

  // Function to get category-specific badge variant
  const getCategoryBadgeVariant = (category: string) => {
    const lowerCaseCategory = category.toLowerCase();
    switch (lowerCaseCategory) {
      case 'basketball':
        return 'basketball'; // Custom variant for Tailwind
      case 'soccer':
        return 'soccer';
      case 'swimming':
        return 'swimming';
      case 'tennis':
        return 'tennis';
      case 'baseball':
        return 'baseball';
      case 'athletics':
        return 'athletics';
      case 'football':
        return 'football';
      default:
        return 'outline';
    }
  };

  return (
    <Link to={`/blog/${post.slug}`} className="block">
      <Card className={cn("blog-card group overflow-hidden h-full", className)} style={style}>
        <div className="aspect-[21/9] overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
        <CardContent className="p-6 blog-card-content flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>{post.date}</span>
                <span>•</span>
                <span>{post.readTime}</span>
              </div>
            </div>
            
            <Badge 
              variant={getCategoryBadgeVariant(post.category) as "default" | "secondary" | "destructive" | "outline" | "ghost" | null | undefined} 
              className={`uppercase text-xs mb-3 bg-${getCategoryBadgeVariant(post.category)} text-white`}
            >
              {post.category}
            </Badge>
            
            <h3 className="font-heading text-xl font-semibold mb-3 line-clamp-2">
              {post.title}
            </h3>
            
            <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
              {post.excerpt}
            </p>
          </div>
          
          <span className="group flex items-center text-sm font-medium text-primary hover:text-primary/90 transition-colors self-start">
            {t("blog.readArticle")}
            <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
};

export default BlogCard;