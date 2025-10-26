import React from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import BlogCard from "@/components/blog/BlogCard";
import { Button } from '@/components/ui/button';
import { Tables } from '@/integrations/supabase/types';
import { useTranslation } from '@/contexts/TranslationContext';
import useScrollReveal from '@/hooks/useScrollReveal'; // Import useScrollReveal

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
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 2000, stopOnInteraction: false, stopOnMouseEnter: true }),
  ]);

  useScrollReveal('.carousel-item-reveal', { threshold: 0.1 }); // Apply scroll reveal to carousel items

  const scrollPrev = React.useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
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
        <div className="embla__container flex">
          {posts.map((post, index) => (
            <div key={post.id} className="embla__slide flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] px-4">
              <BlogCard post={post} className="carousel-item-reveal" style={{ '--stagger-delay': `${index * 100}ms` } as React.CSSProperties} />
            </div>
          ))}
        </div>
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={scrollPrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex btn-hover-lift"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={scrollNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex btn-hover-lift"
      >
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default BlogCarousel;
