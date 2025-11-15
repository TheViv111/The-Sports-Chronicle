import { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  onError?: () => void;
  loading?: 'lazy' | 'eager';
}

const OptimizedImage = ({ src, alt, className, onError, loading = 'lazy' }: OptimizedImageProps) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Create a new image object to preload
    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };
    
    img.onerror = () => {
      if (onError) onError();
    };
    
    // Start loading the image
    img.src = src;
    
    // If src is empty or invalid, call onError immediately
    if (!src) {
      if (onError) onError();
      return;
    }
  }, [src, onError]);

  return (
    <img
      src={imageSrc || src}
      alt={alt}
      className={`${className || ''} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      loading={loading}
      decoding="async"
    />
  );
};

export default OptimizedImage;
