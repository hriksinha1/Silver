import React, { useState } from 'react';

export interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  priority?: boolean;
  type?: 'ring' | 'necklace' | 'bracelet' | 'earring' | 'portrait' | 'box' | 'craft';
  className?: string;
  containerClassName?: string;
}

export function SafeImage({
  src,
  alt,
  width,
  height,
  priority = false,
  type = 'ring',
  className = '',
  containerClassName = '',
  ...props
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#F5F2F7] via-[#EFEFEF] to-[#E3DCE7] ${containerClassName}`}
        style={{
          width: width ? (typeof width === 'number' ? `${width}px` : width) : '100%',
          height: height ? (typeof height === 'number' ? `${height}px` : height) : '100%',
          aspectRatio: width && height ? `${width}/${height}` : undefined,
        }}
        role={alt ? 'img' : 'presentation'}
        aria-label={alt || undefined}
      >
        <div className="flex flex-col items-center justify-center p-4 text-[#C9A45B] opacity-80" aria-hidden="true">
          {type === 'ring' && (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="14" r="7" />
              <polygon points="12,3 15,6 12,9 9,6" />
            </svg>
          )}
          {type === 'necklace' && (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4c4 10 12 10 16 0" />
              <circle cx="12" cy="15" r="3" />
            </svg>
          )}
          {type === 'bracelet' && (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <ellipse cx="12" cy="12" rx="9" ry="5" />
              <ellipse cx="12" cy="12" rx="7" ry="3.5" strokeDasharray="3 3" />
            </svg>
          )}
          {type === 'earring' && (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="14" r="5" />
              <circle cx="16" cy="14" r="5" />
              <line x1="8" y1="5" x2="8" y2="9" />
              <line x1="16" y1="5" x2="16" y2="9" />
            </svg>
          )}
          {type === 'craft' && (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="8" />
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
            </svg>
          )}
          {type === 'box' && (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" />
              <path d="M12 22V12" />
            </svg>
          )}
          {type === 'portrait' && (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="8" r="5" />
              <path d="M20 21a8 8 0 1 0-16 0" />
            </svg>
          )}
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      onError={() => setHasError(true)}
      className={className}
      {...props}
    />
  );
}

export default SafeImage;
