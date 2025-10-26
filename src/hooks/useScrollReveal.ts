import { useEffect, useRef } from 'react';

const useScrollReveal = (selector: string, options: IntersectionObserverInit = { threshold: 0.1 }) => {
  const elementsRef = useRef<NodeListOf<HTMLElement> | null>(null);

  useEffect(() => {
    elementsRef.current = document.querySelectorAll(selector);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        } else {
          // Remove 'visible' when the element is no longer intersecting
          entry.target.classList.remove('visible');
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