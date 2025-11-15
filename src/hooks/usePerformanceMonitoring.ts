import { useState, useEffect } from 'react';

interface PerformanceMetrics {
  fcp: number | null; // First Contentful Paint
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  ttfb: number | null; // Time to First Byte
  loadTime: number | null; // Page load time
}

export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    loadTime: null,
  });

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    const measurePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      // Time to First Byte
      const ttfb = navigation ? navigation.responseStart - navigation.requestStart : null;
      
      // First Contentful Paint
      const fcpEntry = paint.find(entry => entry.name === 'first-contentful-paint');
      const fcp = fcpEntry ? fcpEntry.startTime : null;
      
      // Page Load Time
      const loadTime = navigation ? navigation.loadEventEnd - navigation.fetchStart : null;

      setMetrics({
        fcp,
        lcp: null, // LCP needs special observer
        fid: null, // FID needs special observer
        cls: null, // CLS needs special observer
        ttfb,
        loadTime,
      });
    };

    // Measure after page load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
      return () => window.removeEventListener('load', measurePerformance);
    }
  }, []);

  // Monitor Core Web Vitals
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let lcpValue: number | null = null;
    let fidValue: number | null = null;
    let clsValue: number | null = null;

    // Largest Contentful Paint
    const observeLCP = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        lcpValue = lastEntry.startTime;
        setMetrics(prev => ({ ...prev, lcp: lcpValue }));
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      return observer;
    };

    // First Input Delay
    const observeFID = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          fidValue = entry.processingStart - entry.startTime;
          setMetrics(prev => ({ ...prev, fid: fidValue }));
        });
      });
      observer.observe({ entryTypes: ['first-input'] });
      return observer;
    };

    // Cumulative Layout Shift
    const observeCLS = () => {
      let clsScore = 0;
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsScore += entry.value;
            clsValue = clsScore;
            setMetrics(prev => ({ ...prev, cls: clsValue }));
          }
        });
      });
      observer.observe({ entryTypes: ['layout-shift'] });
      return observer;
    };

    const lcpObserver = observeLCP();
    const fidObserver = observeFID();
    const clsObserver = observeCLS();

    return () => {
      lcpObserver?.disconnect();
      fidObserver?.disconnect();
      clsObserver?.disconnect();
    };
  }, []);

  return metrics;
};
