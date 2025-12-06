import { useEffect } from 'react';

const PerformanceOptimizer = () => {
  useEffect(() => {
    // Preload critical resources
    const preloadCriticalResources = () => {
      // Preload font files
      const fontPreload = document.createElement('link');
      fontPreload.rel = 'preload';
      fontPreload.href = '/fonts/inter-var.woff2';
      fontPreload.as = 'font';
      fontPreload.type = 'font/woff2';
      fontPreload.crossOrigin = 'anonymous';
      document.head.appendChild(fontPreload);

      // Preload critical CSS
      const cssPreload = document.createElement('link');
      cssPreload.rel = 'preload';
      cssPreload.href = '/css/critical.css';
      cssPreload.as = 'style';
      document.head.appendChild(cssPreload);

      // DNS prefetch for external domains
      const domains = [
        'https://images.pexels.com',
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
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
      // Monitor Core Web Vitals
      if ('PerformanceObserver' in window) {
        // Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          console.log('LCP:', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            console.log('FID:', entry.processingStart - entry.startTime);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          console.log('CLS:', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      }
    };

    // Optimize images loading
    const optimizeImageLoading = () => {
      const images = document.querySelectorAll('img[data-src]');
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

    // Add structured data for performance
    const addPerformanceStructuredData = () => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'The Sports Chronicle',
        url: 'https://the-sports-chronicle.vercel.app',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://the-sports-chronicle.vercel.app/blog?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        },
        performanceMetrics: {
          loadTime: 'fast',
          mobileFriendly: true,
          sslEnabled: true
        }
      });
      document.head.appendChild(script);
    };

    // Initialize all optimizations
    preloadCriticalResources();
    addPerformanceMonitoring();
    optimizeImageLoading();
    addPerformanceStructuredData();

    // Add service worker for caching (if available)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Service worker registration failed, but that's okay
      });
    }

    // Cleanup
    return () => {
      // Remove any dynamically added elements if needed
    };
  }, []);

  return null; // This component doesn't render anything
};

export default PerformanceOptimizer;
