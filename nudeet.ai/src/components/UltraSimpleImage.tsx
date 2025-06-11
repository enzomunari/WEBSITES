// components/UltraSimpleImage.tsx - Fixed image loading for Nudeet
"use client"

import { useState, useEffect, useRef } from 'react'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'

interface ImageDisplayProps {
  src: string;
  alt: string;
  className: string;
  onClick?: () => void;
  onLoadComplete?: () => void;
  onError?: () => void;
}

export const UltraSimpleImage: React.FC<ImageDisplayProps> = ({
  src,
  alt,
  className,
  onClick,
  onLoadComplete,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [proxyUrl, setProxyUrl] = useState<string | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const MAX_RETRIES = 3;
  const RETRY_DELAYS = [1000, 2000, 3000];

  // Generate proxy URL for ComfyUI images
  const generateProxyUrl = (originalSrc: string): string => {
    if (originalSrc.includes('localhost:8188') || originalSrc.includes('127.0.0.1:8188')) {
      // Extract the filename and parameters from ComfyUI URL
      const urlParts = originalSrc.split('?');
      if (urlParts.length > 1) {
        const params = new URLSearchParams(urlParts[1]);
        const filename = params.get('filename');
        const subfolder = params.get('subfolder');
        const type = params.get('type');
        
        if (filename) {
          // Use our API proxy instead of direct ComfyUI access
          return `/api/image-proxy?filename=${encodeURIComponent(filename)}&subfolder=${encodeURIComponent(subfolder || '')}&type=${encodeURIComponent(type || 'output')}`;
        }
      }
    }
    return originalSrc;
  };

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setRetryCount(0);
    setIsRetrying(false);
    
    // Generate proxy URL if needed
    const processedUrl = generateProxyUrl(src);
    setProxyUrl(processedUrl);
    
    console.log('🖼️ Loading image:', {
      original: src,
      processed: processedUrl,
      isProxy: processedUrl !== src
    });
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
  }, [src]);

  const handleLoad = () => {
    console.log('✅ Image loaded successfully');
    setIsLoaded(true);
    setHasError(false);
    setIsRetrying(false);
    onLoadComplete?.();
  };

  const handleError = () => {
    console.error('❌ Image load error:', proxyUrl);
    setHasError(true);
    setIsLoaded(false);
    onError?.();
    
    if (retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAYS[retryCount] || 3000;
      console.log(`🔄 Auto-retry scheduled in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      
      setIsRetrying(true);
      retryTimeoutRef.current = setTimeout(() => {
        handleRetry();
      }, delay);
    } else {
      console.error('❌ Max retries reached');
      setIsRetrying(false);
    }
  };

  const handleRetry = () => {
    if (retryCount >= MAX_RETRIES) {
      console.error('❌ Max retries reached');
      setHasError(true);
      setIsRetrying(false);
      return;
    }

    console.log(`🔄 Retrying image load (${retryCount + 1}/${MAX_RETRIES})`);
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    
    setHasError(false);
    setIsLoaded(false);
    setIsRetrying(false);
    setRetryCount(prev => prev + 1);
    
    // Force reload the image
    if (imgRef.current) {
      const newUrl = proxyUrl + `&retry=${Date.now()}`;
      imgRef.current.src = newUrl;
    }
  };

  const handleManualRetry = () => {
    console.log('🔄 Manual retry triggered');
    setRetryCount(0);
    handleRetry();
  };

  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  if (!src || !proxyUrl) {
    console.warn('⚠️ No image source provided');
    return null;
  }
  
  const finalUrl = proxyUrl + (proxyUrl.includes('?') ? '&' : '?') + `cache=${Date.now()}`;
  
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {(!isLoaded && !hasError) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800/50 z-10">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400 mb-2" />
          <span className="text-xs text-slate-300">
            {isRetrying ? 'Retrying...' : 'Loading...'}
          </span>
          {retryCount > 0 && (
            <span className="text-xs text-slate-400 mt-1">
              Attempt {retryCount + 1}
            </span>
          )}
        </div>
      )}
      
      {hasError && !isRetrying && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/20 text-red-400 z-10">
          <AlertCircle className="w-8 h-8 mb-2" />
          <span className="text-sm mb-3 text-center px-2">
            {retryCount >= MAX_RETRIES ? 'Image failed to load' : 'Load error'}
          </span>
          <button
            onClick={handleManualRetry}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs transition-colors flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Try Again
          </button>
          {retryCount >= MAX_RETRIES && (
            <div className="text-xs text-red-500 mt-2 text-center px-2">
              <div>Max retries reached</div>
              <div className="text-xs opacity-75">Check network connection</div>
            </div>
          )}
        </div>
      )}
      
      {isRetrying && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-yellow-900/20 text-yellow-400 z-10">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <span className="text-sm mb-1">Retrying...</span>
          <span className="text-xs opacity-75">
            Attempt {retryCount + 1}/{MAX_RETRIES}
          </span>
        </div>
      )}
      
      <img
        ref={imgRef}
        src={finalUrl}
        alt={alt}
        className={`${className} ${
          !isLoaded ? 'opacity-0' : 'opacity-100'
        } transition-opacity duration-300`}
        onClick={onClick}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          imageRendering: 'auto'
        }}
        loading="eager"
        draggable={false}
      />
    </div>
  );
};