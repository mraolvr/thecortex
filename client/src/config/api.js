export const GOOGLE_BOOKS_API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
export const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

export const getGoogleBooksUrl = (query) => {
  const encodedQuery = encodeURIComponent(query);
  return `${GOOGLE_BOOKS_API_URL}?q=${encodedQuery}&maxResults=1&key=${GOOGLE_BOOKS_API_KEY}`;
}; 