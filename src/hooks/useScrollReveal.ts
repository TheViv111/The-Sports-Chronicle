import { useEffect, useRef } from 'react';

interface ScrollRevealOptions extends IntersectionObserverInit {
  staggerDelay?: number;
  animationType?: 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'fadeInDown' | 'scaleIn' | 'slideInUp' | 'slideInDown' | 'rotateIn' | 'bounceIn';
  resetOnExit?: boolean;
  once?: boolean;
}

const useScrollReveal = (
  selector: string, 
  options: ScrollRevealOptions = { 
    threshold: 0.1,
    staggerDelay: 100,
    animationType: 'fadeInUp',
    resetOnExit: false,
    once: true
  }
) => {
  const elementsRef = useRef<NodeListOf<HTMLElement> | null>(null);
  const revealedElements = useRef<Set<HTMLElement>>(new Set());

  useEffect(() => {
    elementsRef.current = document.querySelectorAll(selector);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        const element = entry.target as HTMLElement;
        
        if (entry.isIntersecting) {
          // Add stagger delay
          const delay = options.staggerDelay ? index * options.staggerDelay : 0;
          element.style.setProperty('--stagger-delay', `${delay}ms`);
          
          // Add animation type class
          const animationClass = options.animationType || 'fadeInUp';
          element.classList.add(animationClass === 'fadeInUp' ? 'fade-in-up' : 
                              animationClass === 'fadeInLeft' ? 'fade-in-left' :
                              animationClass === 'fadeInRight' ? 'fade-in-right' :
                              animationClass === 'fadeInDown' ? 'fade-in-down' :
                              animationClass === 'scaleIn' ? 'scale-in' :
                              animationClass === 'slideInUp' ? 'slide-in-up' :
                              animationClass === 'slideInDown' ? 'slide-in-down' :
                              animationClass === 'rotateIn' ? 'rotate-in' :
                              animationClass === 'bounceIn' ? 'bounce-in' : 'fade-in-up');
          
          element.classList.add('visible');
          revealedElements.current.add(element);
          
          // Remove animation classes after animation completes
          setTimeout(() => {
            element.style.removeProperty('--stagger-delay');
          }, delay + 800);
        } else if (options.resetOnExit && !options.once) {
          // Reset when element exits viewport
          element.classList.remove('visible');
          revealedElements.current.delete(element);
        }
      });
    }, {
      threshold: options.threshold,
      rootMargin: options.rootMargin,
      root: options.root
    });

    elementsRef.current.forEach((el) => {
      // Skip already revealed elements if once is true
      if (!options.once || !revealedElements.current.has(el)) {
        observer.observe(el);
      }
    });

    return () => {
      if (elementsRef.current) {
        elementsRef.current.forEach((el) => {
          observer.unobserve(el);
        });
      }
    };
  }, [selector, options.threshold, options.rootMargin, options.root, options.staggerDelay, options.animationType, options.resetOnExit, options.once]);

  // Expose a method to manually trigger animations
  const revealAll = () => {
    if (elementsRef.current) {
      elementsRef.current.forEach((element, index) => {
        const delay = options.staggerDelay ? index * options.staggerDelay : 0;
        element.style.setProperty('--stagger-delay', `${delay}ms`);
        
        const animationClass = options.animationType || 'fadeInUp';
        element.classList.add(animationClass === 'fadeInUp' ? 'fade-in-up' : 
                            animationClass === 'fadeInLeft' ? 'fade-in-left' :
                            animationClass === 'fadeInRight' ? 'fade-in-right' :
                            animationClass === 'fadeInDown' ? 'fade-in-down' :
                            animationClass === 'scaleIn' ? 'scale-in' :
                            animationClass === 'slideInUp' ? 'slide-in-up' :
                            animationClass === 'slideInDown' ? 'slide-in-down' :
                            animationClass === 'rotateIn' ? 'rotate-in' :
                            animationClass === 'bounceIn' ? 'bounce-in' : 'fade-in-up');
        
        element.classList.add('visible');
        
        setTimeout(() => {
          element.style.removeProperty('--stagger-delay');
        }, delay + 800);
      });
    }
  };

  return { revealAll };
};

export default useScrollReveal;