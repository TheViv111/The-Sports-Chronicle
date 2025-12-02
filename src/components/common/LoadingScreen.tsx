import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      <div className="relative">
        <img
          src="/android-chrome-192x192.png"
          alt="The Sports Chronicle Logo"
          className="h-20 w-20 sm:h-24 sm:w-24 object-contain p-1.5 rounded-full border-4 border-primary/20"
          width={96}
          height={96}
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary/30 animate-spin-slow" />
      </div>
      <div className="flex items-center mt-6">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-3 text-lg font-medium text-muted-foreground">{message}</span>
      </div>
    </div>
  );
};

export default LoadingScreen;