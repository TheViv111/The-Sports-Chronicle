import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { cn } from '@/lib/utils';

interface ContinuousCarouselProps {
  children: React.ReactNode;
  options?: Parameters<typeof useEmblaCarousel>[0];
  className?: string;
  slideClassName?: string;
}

const ContinuousCarousel: React.FC<ContinuousCarouselProps> = ({
  children,
  options,
  className,
  slideClassName,
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      dragFree: true, // Allows for more fluid dragging
      ...options,
    },
    [
      Autoplay({
        delay: 0, // No delay between slides for continuous effect
        stopOnInteraction: false,
        stopOnMouseEnter: true, // Pause on hover
        speed: 2, // Increased speed value to make the animation slower
      }),
    ]
  );

  const [slides, setSlides] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    // Duplicate children to ensure seamless looping for dragFree + loop
    if (React.Children.count(children) > 0) {
      const childrenArray = React.Children.toArray(children);
      // Duplicate enough times to fill the viewport and allow seamless loop
      const duplicatedChildren = [...childrenArray, ...childrenArray, ...childrenArray];
      setSlides(duplicatedChildren);
    }
  }, [children]);

  return (
    <div className={cn("embla overflow-hidden", className)}>
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container flex">
          {slides.map((child, index) => (
            <div
              className={cn("embla__slide flex-shrink-0 min-w-0", slideClassName)}
              key={index} // Use index as key for duplicated items
            >
              {child}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContinuousCarousel;