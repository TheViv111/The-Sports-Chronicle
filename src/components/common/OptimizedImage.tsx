import { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  onError?: () => void;
  loading?: 'lazy' | 'eager';
  width?: number;
  height?: number;
  fetchPriority?: 'high' | 'low' | 'auto';
}

const OptimizedImage = ({
  src,
  alt,
  className,
  onError,
  loading = 'lazy',
  width,
  height,
  fetchPriority = 'auto'
}: OptimizedImageProps) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Reset states when src changes
    setIsLoaded(false);
    setHasError(false);

    // If src is empty or invalid, call onError immediately
    if (!src) {
      setHasError(true);
      if (onError) onError();
      return;
    }

    // Create a new image object to preload
    const img = new Image();

    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };

    img.onerror = () => {
      setHasError(true);
      if (onError) onError();
    };

    // Start loading the image
    img.src = src;
  }, [src, onError]);

  if (hasError) {
    return null;
  }

  return (
    <img
      src={imageSrc || src}
      alt={alt}
      className={`${className || ''} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      loading={loading}
      decoding="async"
      width={width}
      height={height}
      fetchPriority={fetchPriority}
        style={{ 
        aspectRatio: width && height ? `${width}/${height}` : undefined,
        contentVisibility: 'auto' // Improve rendering performance
      }}
    />
  );
};

export default OptimizedImage;
