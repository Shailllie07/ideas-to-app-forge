import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { imageLazyLoader } from '@/utils/LazyLoader';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallback?: string;
  placeholder?: string;
  lazy?: boolean;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const LazyImage = React.forwardRef<HTMLImageElement, LazyImageProps>(
  ({ 
    src, 
    fallback = '/placeholder.svg', 
    placeholder = '/placeholder.svg',
    lazy = true,
    className,
    onLoad,
    onError,
    alt = '',
    ...props 
  }, ref) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [currentSrc, setCurrentSrc] = useState(lazy ? placeholder : src);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
      const imgElement = imgRef.current;
      if (!imgElement || !lazy) return;

      // Set up lazy loading
      imgElement.dataset.src = src;
      imgElement.dataset.fallback = fallback;
      
      imageLazyLoader.observe(imgElement);

      return () => {
        imageLazyLoader.disconnect();
      };
    }, [src, fallback, lazy]);

    const handleLoad = () => {
      setIsLoaded(true);
      setHasError(false);
      onLoad?.();
    };

    const handleError = () => {
      setHasError(true);
      if (currentSrc !== fallback) {
        setCurrentSrc(fallback);
      }
      onError?.();
    };

    // For non-lazy images, update src immediately
    useEffect(() => {
      if (!lazy) {
        setCurrentSrc(src);
      }
    }, [src, lazy]);

    return (
      <img
        ref={(node) => {
          imgRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        src={currentSrc}
        alt={alt}
        className={cn(
          'transition-all duration-300',
          {
            'opacity-0': lazy && !isLoaded && !hasError,
            'opacity-100': !lazy || isLoaded || hasError,
            'blur-sm': lazy && !isLoaded && !hasError,
            'blur-none': !lazy || isLoaded || hasError,
          },
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        loading={lazy ? 'lazy' : 'eager'}
        decoding="async"
        {...props}
      />
    );
  }
);

LazyImage.displayName = 'LazyImage';

export default LazyImage;