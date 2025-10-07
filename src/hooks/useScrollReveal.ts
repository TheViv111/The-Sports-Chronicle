import { useEffect, useRef } from 'react';

const useScrollReveal = (selector: string, options: IntersectionObserverInit = { threshold: 0.1 }) => {
  const elementsRef = useRef<NodeListOf<HTMLElement> | null>(null);

  useEffect(() => {
    elementsRef.current = document.querySelectorAll(selector);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Optionally, stop observing once visible if it's a one-time animation
          // observer.unobserve(entry.target);
        } else {
          // Optionally, remove 'is-visible' if you want the animation to replay on scroll back
          // entry.target.classList.remove('is-visible');
        }
      });
    }, options);

    elementsRef.current.forEach((el) => {
      observer.observe(el);
    });

    return () => {
      if (elementsRef.current) {
        elementsRef.current.forEach((el) => {
          observer.unobserve(el);
        });
      }
    };
  }, [selector, options]);
};

export default useScrollReveal;