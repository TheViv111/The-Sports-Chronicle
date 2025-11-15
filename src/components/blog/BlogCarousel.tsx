import React, { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import BlogCard from "@/components/blog/BlogCard";
import { Button } from '@/components/ui/button';
import { Tables } from '@/integrations/supabase/types';
import { useTranslation } from '@/contexts/TranslationContext';
import useScrollReveal from '@/hooks/useScrollReveal';

// Define the type for a blog post with display-specific fields
type BlogPostWithDisplay = Tables<'blog_posts'> & {
  date: string;
  readTime: string;
  image: string;
};

interface BlogCarouselProps {
  posts: BlogPostWithDisplay[];
}

const BlogCarousel: React.FC<BlogCarouselProps> = ({ posts }) => {
  const { t } = useTranslation();
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: 'start',
    skipSnaps: false
  }, [
    Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true }),
  ]);

  useScrollReveal('.carousel-item-reveal', { threshold: 0.1 });

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  if (!posts || posts.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        {t("latestPosts.noPosts")}
      </p>
    );
  }

  return (
    <div className="relative">
      <div className="embla" ref={emblaRef}>
        <div className="embla__container flex -mx-2 sm:-mx-3 lg:-mx-4">
          {posts.map((post, index) => (
            <div key={post.id} className="embla__slide flex-[0_0_85%] sm:flex-[0_0_45%] lg:flex-[0_0_30%] px-2 sm:px-3 lg:px-4">
              <div className="carousel-item-reveal h-full" style={{ '--stagger-delay': `${index * 100}ms` } as React.CSSProperties}>
                <BlogCard post={post} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={scrollPrev}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 hidden sm:flex btn-hover-lift bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background"
        aria-label="Previous slide"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={scrollNext}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 hidden sm:flex btn-hover-lift bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background"
        aria-label="Next slide"
      >
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default BlogCarousel;
