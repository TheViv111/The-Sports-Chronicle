import { useEffect } from 'react';

const PerformanceOptimizer = () => {
  useEffect(() => {
    // DNS prefetch for external domains - move to non-blocking
    const addResourceHints = () => {
      const domains = [
        'https://images.pexels.com',
        'https://www.google-analytics.com'
      ];

      domains.forEach(domain => {
        const dnsPrefetch = document.createElement('link');
        dnsPrefetch.rel = 'dns-prefetch';
        dnsPrefetch.href = domain;
        document.head.appendChild(dnsPrefetch);
      });
    };

    // Add performance monitoring
    const addPerformanceMonitoring = () => {
      if ('PerformanceObserver' in window) {
        // Use requestIdleCallback for monitoring to not block main thread
        const monitor = () => {
          // LCP
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            if (import.meta.env.DEV) console.log('LCP:', lastEntry.startTime);
          }).observe({ entryTypes: ['largest-contentful-paint'] });

          // FID
          new PerformanceObserver((list) => {
            list.getEntries().forEach(entry => {
              if (import.meta.env.DEV) console.log('FID:', (entry as any).processingStart - entry.startTime);
            });
          }).observe({ entryTypes: ['first-input'] });

          // CLS
          let clsValue = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value;
              }
            }
            if (import.meta.env.DEV) console.log('CLS:', clsValue);
          }).observe({ entryTypes: ['layout-shift'] });
        };

        if ('requestIdleCallback' in window) {
          (window as any).requestIdleCallback(monitor);
        } else {
          setTimeout(monitor, 3000);
        }
      }
    };

    // Optimize images loading for legacy data-src images
    const optimizeImageLoading = () => {
      const images = document.querySelectorAll('img[data-src]');
      if (images.length === 0) return;

      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src!;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
    };

    // Initialize optimizations
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        addResourceHints();
        addPerformanceMonitoring();
        optimizeImageLoading();
      });
    } else {
      setTimeout(() => {
        addResourceHints();
        addPerformanceMonitoring();
        optimizeImageLoading();
      }, 2000);
    }

  }, []);

  return null;
};

export default PerformanceOptimizer;
