import React, { useState } from 'react';

const ResponsiveImage = ({ 
  src, 
  alt, 
  className = '', 
  fallbackSrc = '/assets/placeholder.jpg',
  aspectRatio = 'auto',
  objectFit = 'cover',
  loading = 'lazy',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  ...props 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleLoad = () => {
    setImageLoading(false);
  };

  const aspectRatioClasses = {
    'auto': '',
    'square': 'aspect-square',
    'video': 'aspect-video',
    '4/3': 'aspect-4/3',
    '3/2': 'aspect-3/2',
    '16/9': 'aspect-16/9',
    '9/16': 'aspect-9/16'
  };

  const objectFitClasses = {
    'cover': 'object-cover',
    'contain': 'object-contain',
    'fill': 'object-fill',
    'none': 'object-none',
    'scale-down': 'object-scale-down'
  };

  const containerClasses = `
    relative w-full overflow-hidden
    ${aspectRatioClasses[aspectRatio] || ''}
    ${className}
  `.trim();

  const imageClasses = `
    w-full h-full transition-opacity duration-300
    ${objectFitClasses[objectFit] || 'object-cover'}
    ${imageLoading ? 'opacity-0' : 'opacity-100'}
  `.trim();

  return (
    <div className={containerClasses}>
      {/* Loading skeleton */}
      {imageLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Error fallback */}
      {imageError ? (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs">Image not available</p>
          </div>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={imageClasses}
          loading={loading}
          sizes={sizes}
          onError={handleError}
          onLoad={handleLoad}
          {...props}
        />
      )}
    </div>
  );
};

export default ResponsiveImage;
