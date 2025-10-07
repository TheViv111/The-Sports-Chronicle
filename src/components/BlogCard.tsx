import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tables } from "@/integrations/supabase/types";

// Use the Supabase generated type for blog posts
interface BlogCardProps {
  post: Tables<'blog_posts'> & {
    date: string; // Add date for display, derived from created_at
    readTime: string; // Add readTime for display, derived from read_time
    image: string; // Add image for display, derived from cover_image with fallback
  };
  className?: string;
}

const BlogCard = ({ post, className = "" }: BlogCardProps) => {
  return (
    <Link to={`/blog/${post.slug}`} className="block"> {/* Wrap the entire card with Link */}
      <Card className={`blog-card group overflow-hidden h-full ${className}`}> {/* Ensure card takes full height */}
        <div className="aspect-[21/9] overflow-hidden">
          <img
            src={post.image || "https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg"} // Fallback image
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
        <CardContent className="p-6 blog-card-content flex flex-col justify-between h-full"> {/* Adjust content for flex layout */}
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
          
          {/* Replaced the Button with a styled span and icon for visual consistency, as the whole card is now clickable */}
          <span className="group flex items-center text-sm font-medium text-primary hover:text-primary/90 transition-colors self-start">
            Read article
            <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
};

export default BlogCard;