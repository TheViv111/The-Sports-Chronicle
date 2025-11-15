import { useState, useEffect } from 'react';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';
import { useAdvancedCacheManager } from '@/hooks/useAdvancedCacheManager';

interface CacheMetrics {
  totalRequests: number;
  cachedRequests: number;
  cacheHitRate: number;
  totalSize: number;
  cachedSize: number;
  bandwidthSaved: number;
}

interface AdvancedMetrics {
  averageLoadTime: number;
  cacheEfficiency: number;
  resourceOptimization: number;
  networkSavings: number;
}

export const CachePerformanceMonitor = () => {
  const [cacheMetrics, setCacheMetrics] = useState<CacheMetrics>({
    totalRequests: 0,
    cachedRequests: 0,
    cacheHitRate: 0,
    totalSize: 0,
    cachedSize: 0,
    bandwidthSaved: 0,
  });
  
  const [advancedMetrics, setAdvancedMetrics] = useState<AdvancedMetrics>({
    averageLoadTime: 0,
    cacheEfficiency: 0,
    resourceOptimization: 0,
    networkSavings: 0,
  });
  
  const performanceMetrics = usePerformanceMonitoring();
  const { cacheStats, isPreloading, clearCacheByType, optimizeCache } = useAdvancedCacheManager();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const monitorCachePerformance = () => {
      const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      let totalRequests = 0;
      let cachedRequests = 0;
      let totalSize = 0;
      let cachedSize = 0;
      let totalLoadTime = 0;

      entries.forEach((entry) => {
        totalRequests++;
        totalLoadTime += entry.responseEnd - entry.requestStart;
        
        // Check if resource was served from cache
        const transferSize = entry.transferSize || 0;
        const encodedBodySize = entry.encodedBodySize || 0;
        
        totalSize += encodedBodySize;
        
        // If transferSize is much smaller than encodedBodySize, it was likely cached
        if (transferSize < encodedBodySize * 0.1) {
          cachedRequests++;
          cachedSize += encodedBodySize - transferSize;
        }
      });

      const cacheHitRate = totalRequests > 0 ? (cachedRequests / totalRequests) * 100 : 0;
      const bandwidthSaved = totalSize > 0 ? (cachedSize / totalSize) * 100 : 0;
      const averageLoadTime = totalRequests > 0 ? totalLoadTime / totalRequests : 0;

      setCacheMetrics({
        totalRequests,
        cachedRequests,
        cacheHitRate,
        totalSize,
        cachedSize,
        bandwidthSaved,
      });

      // Calculate advanced metrics
      const cacheEfficiency = cacheHitRate > 70 ? 100 : (cacheHitRate / 70) * 100;
      const resourceOptimization = bandwidthSaved > 60 ? 100 : (bandwidthSaved / 60) * 100;
      const networkSavings = cachedSize > 0 ? Math.min(100, (cachedSize / (1024 * 1024)) * 10) : 0; // MB saved
      
      setAdvancedMetrics({
        averageLoadTime,
        cacheEfficiency,
        resourceOptimization,
        networkSavings,
      });
    };

    // Monitor cache performance after page load
    if (document.readyState === 'complete') {
      monitorCachePerformance();
    } else {
      window.addEventListener('load', monitorCachePerformance);
      return () => window.removeEventListener('load', monitorCachePerformance);
    }
  }, []);

  // Format bytes to human readable format
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format time to human readable format
  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // Get performance score color
  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-slate-900 text-white p-4 rounded-lg shadow-lg text-xs max-w-md z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-sm">Advanced Cache Monitor</h3>
        <div className="flex gap-2">
          {isPreloading && (
            <span className="text-yellow-400 animate-pulse">Preloading...</span>
          )}
        </div>
      </div>
      
      {/* Performance Score */}
      <div className="mb-3 p-2 bg-slate-800 rounded">
        <div className="flex justify-between items-center">
          <span className="font-semibold">Performance Score:</span>
          <span className={getScoreColor((cacheMetrics.cacheHitRate + advancedMetrics.cacheEfficiency) / 2)}>
            {((cacheMetrics.cacheHitRate + advancedMetrics.cacheEfficiency) / 2).toFixed(0)}%
          </span>
        </div>
      </div>
      
      {/* Cache Metrics */}
      <div className="space-y-2 mb-3">
        <h4 className="font-semibold text-xs text-slate-400">CACHE METRICS</h4>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="flex justify-between">
            <span>Hit Rate:</span>
            <span className={cacheMetrics.cacheHitRate > 70 ? 'text-green-400' : 'text-yellow-400'}>
              {cacheMetrics.cacheHitRate.toFixed(1)}%
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Bandwidth Saved:</span>
            <span className={cacheMetrics.bandwidthSaved > 50 ? 'text-green-400' : 'text-yellow-400'}>
              {cacheMetrics.bandwidthSaved.toFixed(1)}%
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Total Requests:</span>
            <span>{cacheMetrics.totalRequests}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Cached Requests:</span>
            <span>{cacheMetrics.cachedRequests}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Total Size:</span>
            <span>{formatBytes(cacheMetrics.totalSize)}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Saved Bandwidth:</span>
            <span className="text-green-400">{formatBytes(cacheMetrics.cachedSize)}</span>
          </div>
        </div>
      </div>
      
      {/* Advanced Metrics */}
      <div className="space-y-2 mb-3">
        <h4 className="font-semibold text-xs text-slate-400">ADVANCED METRICS</h4>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="flex justify-between">
            <span>Cache Efficiency:</span>
            <span className={getScoreColor(advancedMetrics.cacheEfficiency)}>
              {advancedMetrics.cacheEfficiency.toFixed(0)}%
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Resource Opt:</span>
            <span className={getScoreColor(advancedMetrics.resourceOptimization)}>
              {advancedMetrics.resourceOptimization.toFixed(0)}%
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Avg Load Time:</span>
            <span className={advancedMetrics.averageLoadTime < 100 ? 'text-green-400' : 'text-yellow-400'}>
              {formatTime(advancedMetrics.averageLoadTime)}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Network Savings:</span>
            <span className="text-green-400">{advancedMetrics.networkSavings.toFixed(0)}%</span>
          </div>
        </div>
      </div>
      
      {/* Core Web Vitals */}
      <div className="space-y-2 mb-3">
        <h4 className="font-semibold text-xs text-slate-400">CORE WEB VITALS</h4>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="flex justify-between">
            <span>FCP:</span>
            <span className={performanceMetrics.fcp && performanceMetrics.fcp < 1800 ? 'text-green-400' : 'text-yellow-400'}>
              {performanceMetrics.fcp ? `${performanceMetrics.fcp.toFixed(0)}ms` : 'N/A'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>LCP:</span>
            <span className={performanceMetrics.lcp && performanceMetrics.lcp < 2500 ? 'text-green-400' : 'text-yellow-400'}>
              {performanceMetrics.lcp ? `${performanceMetrics.lcp.toFixed(0)}ms` : 'N/A'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>CLS:</span>
            <span className={performanceMetrics.cls && performanceMetrics.cls < 0.1 ? 'text-green-400' : 'text-yellow-400'}>
              {performanceMetrics.cls ? performanceMetrics.cls.toFixed(3) : 'N/A'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>TTFB:</span>
            <span className={performanceMetrics.ttfb && performanceMetrics.ttfb < 800 ? 'text-green-400' : 'text-yellow-400'}>
              {performanceMetrics.ttfb ? `${performanceMetrics.ttfb.toFixed(0)}ms` : 'N/A'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Cache Management */}
      <div className="space-y-2">
        <h4 className="font-semibold text-xs text-slate-400">CACHE MANAGEMENT</h4>
        
        <div className="flex gap-2">
          <button
            onClick={() => clearCacheByType('images')}
            className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs transition-colors"
          >
            Clear Images
          </button>
          
          <button
            onClick={() => clearCacheByType('static')}
            className="px-2 py-1 bg-orange-600 hover:bg-orange-700 rounded text-xs transition-colors"
          >
            Clear Static
          </button>
          
          <button
            onClick={() => optimizeCache()}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors"
          >
            Optimize
          </button>
        </div>
        
        <div className="text-xs text-slate-500">
          Cache Entries: {cacheStats.totalEntries} | Size: {formatBytes(cacheStats.totalSize)}
        </div>
      </div>
    </div>
  );
};
