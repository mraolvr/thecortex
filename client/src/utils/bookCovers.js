// Placeholder image for books without covers
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/300x400?text=No+Cover';

// Low quality placeholder for progressive loading
const LOW_QUALITY_PLACEHOLDER = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkLzYvLi4vLjY9PTw8PT1AQEBAQEA8QEBAQEBAQEBAQEBAQEBAQEz/2wBDAR4eHh4eHiQeHiRALS0tQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQED/wAARCAAIAAYDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

/**
 * Get a high quality cover image URL from Google Books
 * @param {string} url - The original cover URL from Google Books API
 * @returns {string} The high quality cover URL or a placeholder
 */
export function getHighQualityCover(url) {
  if (!url) return PLACEHOLDER_IMAGE;
  
  try {
    // Handle Google Books API URLs
    if (url.includes('books.google.com') || url.includes('googleusercontent.com')) {
      // Remove any existing zoom parameter
      const baseUrl = url.replace(/&zoom=\d+/, '');
      // Add zoom=3 for highest quality
      return `${baseUrl}&zoom=3`;
    }
    
    // Handle other URLs (direct image URLs)
    if (url.startsWith('http')) {
      return url;
    }
    
    // If URL is invalid or not recognized, return placeholder
    console.warn('Invalid or unrecognized cover URL:', url);
    return PLACEHOLDER_IMAGE;
  } catch (error) {
    console.error('Error processing cover URL:', error);
    return PLACEHOLDER_IMAGE;
  }
}

/**
 * Get a low quality placeholder image for progressive loading
 * @returns {string} Base64 encoded low quality placeholder image
 */
export function getLowQualityPlaceholder() {
  return LOW_QUALITY_PLACEHOLDER;
}

/**
 * Preload an image
 * @param {string} src - The image URL to preload
 * @returns {Promise} A promise that resolves when the image is loaded
 */
export function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.error('Failed to load image:', src);
      reject(new Error('Failed to load image'));
    };
    img.src = src;
  });
}

/**
 * Load a book cover image progressively
 * @param {string} url - The original cover URL
 * @param {function} onLoad - Callback when the high quality image is loaded
 * @returns {string} Initial image URL to display
 */
export function useProgressiveImg(url) {
  if (!url) return PLACEHOLDER_IMAGE;
  
  const lowQuality = LOW_QUALITY_PLACEHOLDER;
  const highQuality = getHighQualityCover(url);
  
  // Start loading the high quality image
  preloadImage(highQuality)
    .then(() => {
      // The high quality image is now cached
      return highQuality;
    })
    .catch(() => {
      // Fall back to placeholder on error
      console.warn('Failed to load high quality image, using placeholder');
      return PLACEHOLDER_IMAGE;
    });
  
  // Return the low quality placeholder initially
  return lowQuality;
} 