import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/contexts/TranslationContext";
import { BlogPostWithDisplay } from "@/lib/blog-utils"; // Import BlogPostWithDisplay type

interface BlogCardProps {
  post: BlogPostWithDisplay; // Use the transformed type
  className?: string;
}

const BlogCard = ({ post, className = "" }: BlogCardProps) => {
  const { t } = useTranslation();

  return (
    <Link to={`/blog/${post.slug}`} className="block">
      <Card className={`blog-card group overflow-hidden h-full ${className}`}>
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
            
            <Badge variant="outline" className="uppercase text-xs mb-3">
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