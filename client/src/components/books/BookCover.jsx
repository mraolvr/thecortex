import { useState, useEffect } from 'react';
import { Book } from 'lucide-react';
import { getGoogleBooksUrl } from '../../config/api';

export default function BookCover({ url, alt, title, author }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [src, setSrc] = useState(null);
  const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/300x400?text=No+Cover';

  useEffect(() => {
    const fetchGoogleBooksCover = async () => {
      try {
        // First try to get cover from Google Books API
        const query = `${title} ${author}`;
        const response = await fetch(getGoogleBooksUrl(query));
        const data = await response.json();
        
        if (data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail) {
          // Get the high quality version by removing the zoom parameter
          const googleCover = data.items[0].volumeInfo.imageLinks.thumbnail
            .replace('&zoom=1', '')
            .replace('&edge=curl', '');
          setSrc(googleCover);
          return;
        }
        
        // If no Google Books cover, try the original URL
        if (url) {
          const img = new window.Image();
          img.onload = () => {
            setSrc(url);
            setLoaded(true);
          };
          img.onerror = () => {
            setSrc(PLACEHOLDER_IMAGE);
            setError(true);
          };
          img.src = url;
        } else {
          setSrc(PLACEHOLDER_IMAGE);
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching book cover:', err);
        // Fallback to original URL or placeholder
        if (url) {
          setSrc(url);
        } else {
          setSrc(PLACEHOLDER_IMAGE);
          setError(true);
        }
      }
    };

    fetchGoogleBooksCover();
  }, [url, title, author]);

  if (error || !src) {
    return (
      <div className="w-full h-full bg-background-light flex items-center justify-center">
        <Book className="w-12 h-12 text-neutral" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
        style={{ opacity: loaded ? 1 : 0 }}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
      {!loaded && (
        <div className="absolute inset-0 w-full h-full bg-background-light flex items-center justify-center">
          <Book className="w-12 h-12 text-neutral animate-pulse" />
        </div>
      )}
    </div>
  );
} 