import React, { lazy, ComponentType, LazyExoticComponent } from 'react';

interface LazyLoadOptions {
  fallback?: ComponentType;
  preload?: boolean;
  timeout?: number;
}

// Cache for preloaded components
const preloadCache = new Map<string, Promise<any>>();

export const createLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
) => {
  const LazyComponent = lazy(() => {
    const promise = importFn();
    
    // Add timeout handling
    if (options.timeout) {
      return Promise.race([
        promise,
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Component load timeout')), options.timeout)
        )
      ]);
    }
    
    return promise;
  });

  // Preload functionality
  if (options.preload) {
    const cacheKey = importFn.toString();
    if (!preloadCache.has(cacheKey)) {
      preloadCache.set(cacheKey, importFn());
    }
  }

  return LazyComponent;
};

// Preload a component
export const preloadComponent = (importFn: () => Promise<any>): void => {
  const cacheKey = importFn.toString();
  if (!preloadCache.has(cacheKey)) {
    preloadCache.set(cacheKey, importFn());
  }
};

// Image lazy loading utility
export class ImageLazyLoader {
  private observer: IntersectionObserver | null = null;
  private imageCache = new Map<string, HTMLImageElement>();

  constructor() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              this.loadImage(img);
              this.observer?.unobserve(img);
            }
          });
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.01
        }
      );
    }
  }

  observe(img: HTMLImageElement): void {
    if (this.observer) {
      this.observer.observe(img);
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadImage(img);
    }
  }

  private loadImage(img: HTMLImageElement): void {
    const src = img.dataset.src;
    if (!src) return;

    // Check cache first
    if (this.imageCache.has(src)) {
      const cachedImg = this.imageCache.get(src)!;
      img.src = cachedImg.src;
      img.classList.add('loaded');
      return;
    }

    // Create new image for loading
    const imageLoader = new Image();
    
    imageLoader.onload = () => {
      img.src = src;
      img.classList.add('loaded');
      this.imageCache.set(src, imageLoader);
    };

    imageLoader.onerror = () => {
      img.classList.add('error');
      // Fallback image
      const fallback = img.dataset.fallback;
      if (fallback) {
        img.src = fallback;
      }
    };

    imageLoader.src = src;
  }

  preloadImages(urls: string[]): Promise<void[]> {
    return Promise.all(
      urls.map(url => 
        new Promise<void>((resolve, reject) => {
          if (this.imageCache.has(url)) {
            resolve();
            return;
          }

          const img = new Image();
          img.onload = () => {
            this.imageCache.set(url, img);
            resolve();
          };
          img.onerror = reject;
          img.src = url;
        })
      )
    );
  }

  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

export const imageLazyLoader = new ImageLazyLoader();

// Performance monitoring utility
export class PerformanceMonitor {
  private metrics = new Map<string, number>();

  startTiming(name: string): void {
    this.metrics.set(name, performance.now());
  }

  endTiming(name: string): number {
    const startTime = this.metrics.get(name);
    if (!startTime) {
      console.warn(`No start time found for ${name}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.metrics.delete(name);
    
    console.log(`⚡ ${name}: ${duration.toFixed(2)}ms`);
    return duration;
  }

  measureComponent<T extends ComponentType<any>>(
    Component: T,
    name: string
  ): T {
    return ((props: any) => {
      this.startTiming(`${name}-render`);
      
      const result = React.createElement(Component, props);
      
      // Use setTimeout to measure after render
      setTimeout(() => {
        this.endTiming(`${name}-render`);
      }, 0);
      
      return result;
    }) as T;
  }

  measureAsync<T>(
    asyncFn: () => Promise<T>,
    name: string
  ): Promise<T> {
    this.startTiming(name);
    
    return asyncFn().finally(() => {
      this.endTiming(name);
    });
  }

  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  clearMetrics(): void {
    this.metrics.clear();
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Bundle splitting utility
export const createAsyncChunk = <T>(
  importFn: () => Promise<T>,
  chunkName?: string
): (() => Promise<T>) => {
  let promise: Promise<T> | null = null;
  
  return () => {
    if (!promise) {
      if (chunkName) {
        console.log(`Loading chunk: ${chunkName}`);
      }
      promise = importFn();
    }
    return promise;
  };
};