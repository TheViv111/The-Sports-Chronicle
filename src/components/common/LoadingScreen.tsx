import React from 'react';
import { cn } from "@/lib/utils";

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Loading...",
  fullScreen = true,
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: {
      container: "w-16 h-16",
      logo: "w-10 h-10",
      progress: "w-24",
      text: "text-[10px]"
    },
    md: {
      container: "w-32 h-32 md:w-40 md:h-40",
      logo: "w-20 h-20 md:w-28 md:h-28",
      progress: "w-48",
      text: "text-sm"
    },
    lg: {
      container: "w-48 h-48 md:w-56 md:h-56",
      logo: "w-32 h-32 md:w-40 md:h-40",
      progress: "w-64",
      text: "text-base"
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={cn(
      "flex flex-col items-center justify-center bg-background transition-colors duration-300",
      fullScreen ? "fixed inset-0 z-50" : "w-full py-12 px-4",
      className
    )}>
      <div className="relative flex flex-col items-center">
        {/* Logo Container with Pulse Animation */}
        <div className={cn("relative mb-8 animate-pulse-slow flex items-center justify-center", currentSize.container)}>
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl transform scale-150 animate-pulse"></div>
          <div className="relative w-full h-full rounded-full overflow-hidden bg-background drop-shadow-lg flex items-center justify-center border border-border/50">
            <img
              src="/logo-160.png"
              alt="The Sports Chronicle"
              className={cn("object-contain", currentSize.logo)}
            />
          </div>
        </div>

        {/* Loading Bar */}
        <div className={cn("h-1 bg-muted rounded-full overflow-hidden", currentSize.progress)}>
          <div className="h-full bg-primary animate-progress-indeterminate origin-left"></div>
        </div>

        {/* Optional Message */}
        {message && (
          <p className={cn("mt-4 font-medium text-muted-foreground animate-pulse text-center", currentSize.text)}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;