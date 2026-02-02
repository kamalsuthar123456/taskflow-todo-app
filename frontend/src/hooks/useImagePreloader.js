// src/hooks/useImagePreloader.js

import { useEffect, useState } from 'react';

/**
 * Custom hook to preload images for better performance
 * @param {Array<string>} imageUrls - Array of image URLs to preload
 * @returns {Object} - Loading state and progress
 */
export const useImagePreloader = (imageUrls = []) => {
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (imageUrls.length === 0) {
      setLoaded(true);
      return;
    }

    let loadedCount = 0;

    const preloadImage = (url) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          setProgress((loadedCount / imageUrls.length) * 100);
          resolve();
        };
        img.onerror = reject;
        img.src = url;
      });
    };

    Promise.all(imageUrls.map(url => preloadImage(url)))
      .then(() => setLoaded(true))
      .catch((err) => {
        console.warn('Some images failed to preload:', err);
        setLoaded(true); // Continue anyway
      });
  }, [imageUrls]);

  return { loaded, progress };
};
