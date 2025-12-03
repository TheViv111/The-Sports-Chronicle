import React from 'react';

interface LoadingScreenProps {
  message?: string;
  minDisplayTime?: number; // Minimum time to show the loader in ms
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Loading...",
  // minDisplayTime is kept in props for future implementation but unused for now
}) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-colors duration-300">
      <div className="relative flex flex-col items-center">
        {/* Logo Container with Pulse Animation */}
        <div className="relative mb-8 animate-pulse-slow">
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl transform scale-150 animate-pulse"></div>
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-background drop-shadow-lg">
            <img
              src="/logo-160.png"
              alt="The Sports Chronicle"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Loading Bar */}
        <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary animate-progress-indeterminate origin-left"></div>
        </div>

        {/* Optional Message */}
        {message && (
          <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;