/**
 * Optimized Image Component
 * Wraps Next.js Image with additional optimizations
 */

import NextImage, { ImageProps } from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  alt: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape';
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  priority?: boolean;
  quality?: number;
}

const aspectRatios = {
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[4/3]',
};

export function OptimizedImage({
  src,
  alt,
  aspectRatio,
  objectFit = 'cover',
  className,
  priority = false,
  quality = 85,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Use Cloudinary if available
  const optimizedSrc = src.startsWith('http')
    ? src
    : `/images/${src}`;

  return (
    <div className={cn('relative overflow-hidden', aspectRatio && aspectRatios[aspectRatio], className)}>
      {!error ? (
        <NextImage
          src={optimizedSrc}
          alt={alt}
          fill
          quality={quality}
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
          className={cn(
            'duration-300 ease-in-out',
            isLoading && 'scale-105 blur-sm',
            !isLoading && 'scale-100 blur-0',
            objectFit === 'cover' && 'object-cover',
            objectFit === 'contain' && 'object-contain'
          )}
          onLoadingComplete={() => setIsLoading(false)}
          onError={() => {
            setError(true);
            setIsLoading(false);
          }}
          {...props}
        />
      ) : (
        <div className="flex items-center justify-center bg-gray-100 h-full w-full">
          <span className="text-gray-400 text-sm">Image not available</span>
        </div>
      )}
      
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
}
