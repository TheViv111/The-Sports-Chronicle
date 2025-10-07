import React, { useRef, useEffect, useState } from 'react';
import BlogCard from './BlogCard';
import { Tables } from "@/integrations/supabase/types";

type BlogPostType = Tables<'blog_posts'>;

interface ContinuousCarouselProps {
  posts: BlogPostType[];
}

const ContinuousCarousel: React.FC<ContinuousCarouselProps> = ({ posts }) => {
  const carouselInnerRef = useRef<HTMLDivElement>(null);
  const [singleSetWidth, setSingleSetWidth] = useState(0);

  // Duplicate posts to create a seamless loop effect
  // We need at least two sets of posts for the animation to loop smoothly
  const contentToScroll = [...posts, ...posts]; 

  useEffect(() => {
    if (!carouselInnerRef.current || posts.length === 0) return;

    const measureWidth = () => {
      // Temporarily remove animation to get accurate width
      const currentElement = carouselInnerRef.current!;
      const originalAnimation = currentElement.style.animation;
      const originalTransform = currentElement.style.transform;
      currentElement.style.animation = 'none';
      currentElement.style.transform = 'translateX(0)';

      // Calculate the width of one set of posts (the first 'posts.length' children)
      let width = 0;
      // Iterate only over the first set of duplicated posts
      for (let i = 0; i < posts.length; i++) {
        const child = currentElement.children[i] as HTMLElement;
        if (child) {
          width += child.offsetWidth; // Includes padding and border
          // Add gap-8 (2rem = 32px) if not the last item in the set
          if (i < posts.length - 1) {
            width += 32; 
          }
        }
      }
      setSingleSetWidth(width);

      // Restore animation
      currentElement.style.animation = originalAnimation;
      currentElement.style.transform = originalTransform;
    };

    // Initial measurement
    measureWidth();

    // Observe for resize changes to re-measure width and adjust animation
    const observer = new ResizeObserver(() => {
      measureWidth();
    });
    observer.observe(carouselInnerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [posts]);

  // Calculate a dynamic duration for the animation based on the content width
  // Adjust the divisor (e.g., 50) to control the speed. Smaller value = faster.
  const animationSpeedFactor = 50; // Pixels per second, adjust for desired speed
  const animationDuration = singleSetWidth > 0 ? Math.max(20, singleSetWidth / animationSpeedFactor) : 30; // Minimum 20 seconds

  // "Clockwise" for a horizontal marquee means items move from left to right.
  // The animation starts with the duplicated content (second set) visible,
  // and moves right until the first set is fully visible.
  const marqueeStartOffset = `-${singleSetWidth}px`;
  const marqueeEndOffset = '0px';

  return (
    <div className="overflow-hidden relative py-4">
      {/* Dynamically inject keyframes with calculated values */}
      <style>{`
        @keyframes marquee-ltr {
          0% {
            transform: translateX(${marqueeStartOffset});
          }
          100% {
            transform: translateX(${marqueeEndOffset});
          }
        }
        .animate-marquee-ltr {
          animation: marquee-ltr ${animationDuration}s linear infinite;
          white-space: nowrap;
          width: max-content; /* Allow content to define its width */
        }
      `}</style>
      <div 
        ref={carouselInnerRef} 
        className="flex gap-8 animate-marquee-ltr" 
      >
        {contentToScroll.map((blogPost, index) => (
          <div 
            key={`${blogPost.id}-${index}`} 
            // These widths ensure responsive display of cards within the continuous flow.
            // `flex-shrink-0` prevents items from shrinking.
            className="flex-shrink-0 w-[calc(100%-2rem)] sm:w-[calc(50%-2rem)] md:w-[calc(33.33%-2rem)] lg:w-[calc(25%-2rem)] xl:w-[calc(20%-2rem)] 2xl:w-[calc(16.66%-2rem)]"
          >
            <BlogCard
              post={{
                ...blogPost,
                date: new Date(blogPost.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric"
                }),
                readTime: blogPost.read_time || "5 min read",
                image: blogPost.cover_image || "https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg"
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContinuousCarousel;