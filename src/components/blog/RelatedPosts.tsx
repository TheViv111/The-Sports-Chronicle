import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';

interface RelatedPostsProps {
  currentPost: Tables<'blog_posts'>;
  category?: string;
  limit?: number;
}

export default function RelatedPosts({ currentPost, category, limit = 3 }: RelatedPostsProps) {
  const [relatedPosts, setRelatedPosts] = useState<Tables<'blog_posts'>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedPosts = async () => {
      try {
        // Fetch posts from the same category, excluding current post
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('published', true)
          .eq('category', category || currentPost.category)
          .neq('id', currentPost.id)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;

        // If not enough posts in same category, fetch from other categories
        if (data && data.length < limit) {
          const { data: additionalPosts, error: additionalError } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('published', true)
            .neq('id', currentPost.id)
            .neq('category', category || currentPost.category)
            .order('created_at', { ascending: false })
            .limit(limit - (data?.length || 0));

          if (!additionalError && additionalPosts) {
            setRelatedPosts([...(data || []), ...additionalPosts]);
          } else {
            setRelatedPosts(data || []);
          }
        } else {
          setRelatedPosts(data || []);
        }
      } catch (error) {
        console.error('Error fetching related posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedPosts();
  }, [currentPost.id, currentPost.category, category, limit]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-muted rounded mb-4"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (relatedPosts.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold">Related Articles</h2>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {relatedPosts.map((post) => (
          <Card key={post.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={post.category?.toLowerCase() as any} className="text-xs">
                  {post.category}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>
              <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                <Link 
                  to={`/blog/${post.slug}`}
                  className="line-clamp-2"
                  title={post.title}
                >
                  {post.title}
                </Link>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                {post.excerpt}
              </p>
              
              <Link 
                to={`/blog/${post.slug}`}
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline group-hover:gap-2 transition-all"
              >
                Read more
                <ArrowRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* SEO: Internal linking section */}
      <div className="mt-8 p-4 bg-muted/30 rounded-lg">
        <p className="text-sm text-muted-foreground mb-2">
          <strong>Explore more sports content:</strong> Our sports blog covers everything from 
          <Link to={`/blog/category/${currentPost.category?.toLowerCase()}`} className="text-primary hover:underline mx-1">
            {currentPost.category}
          </Link>
          to the latest sports news and analysis. Stay updated with expert insights and comprehensive coverage.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          {['Basketball', 'Soccer', 'Swimming', 'Football', 'Tennis', 'Baseball'].map((sport) => (
            <Link
              key={sport}
              to={`/blog/category/${sport.toLowerCase()}`}
              className="text-xs px-2 py-1 bg-background rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {sport}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
