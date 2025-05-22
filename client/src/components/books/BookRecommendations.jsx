import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import useBookStore from '../../stores/bookStore';
import { getHighQualityCover } from '../../utils/bookCovers';
import BookDetailsModal from './BookDetailsModal';

export default function BookRecommendations({ books, onClose }) {
  const [recommendations, setRecommendations] = useState([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { addBook } = useBookStore();
  const [selectedBook, setSelectedBook] = useState(null);
  
  const BOOKS_PER_PAGE = 4;

  // Debounce timer ref
  const debounceRef = useRef();

  // Find the most common genres and significant title words in the user's library
  const getTopGenresAndTitleWords = () => {
    const genreCount = {};
    const wordCount = {};
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'it', 'as', 'be', 'this', 'that', 'was', 'are', 'not', 'your', 'you', 'i', 'my', 'we', 'our', 'us', 'so', 'if', 'then', 'than', 'too', 'very', 'just', 'into', 'out', 'up', 'down', 'over', 'under', 'again', 'once', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'only', 'own', 'same', 'can', 'will', 'don', 'should', 'now']);
    books.forEach(book => {
      if (book.genres && Array.isArray(book.genres)) {
        book.genres.forEach(genre => {
          genreCount[genre] = (genreCount[genre] || 0) + 1;
        });
      }
      if (book.title) {
        book.title.toLowerCase().split(/\s+/).forEach(word => {
          if (!stopWords.has(word) && word.length > 2) {
            wordCount[word] = (wordCount[word] || 0) + 1;
          }
        });
      }
    });
    const topGenres = Object.entries(genreCount).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([g]) => g);
    const topTitleWords = Object.entries(wordCount).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([w]) => w);
    return { topGenres, topTitleWords };
  };

  // Fetch default recommendations on mount or when books change
  useEffect(() => {
    if (!searchQuery) {
      fetchRecommendations();
    }
    // eslint-disable-next-line
  }, [books]);

  // Fetch recommendations based on search query
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery) {
      // If search is cleared, show default recommendations
      fetchRecommendations();
      return;
    }
    debounceRef.current = setTimeout(() => {
      fetchRecommendations(searchQuery);
    }, 500);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line
  }, [searchQuery]);

  const fetchRecommendations = async (searchTerm) => {
    setIsLoading(true);
    try {
      let query = '';
      if (searchTerm) {
        query = encodeURIComponent(searchTerm);
      } else {
        const { topGenres, topTitleWords } = getTopGenresAndTitleWords();
        if (topGenres.length > 0 && topTitleWords.length > 0) {
          query = `${encodeURIComponent(topTitleWords[0])}+subject:${encodeURIComponent(topGenres[0])}`;
        } else if (topGenres.length > 0) {
          query = `subject:${encodeURIComponent(topGenres[0])}`;
        } else if (topTitleWords.length > 0) {
          query = encodeURIComponent(topTitleWords[0]);
        } else {
          query = 'bestseller';
        }
      }
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=40&printType=books&orderBy=relevance`
      );
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        const booksList = data.items
          .map(item => {
            const volumeInfo = item.volumeInfo || {};
            return {
              title: volumeInfo.title || 'Unknown Title',
              author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown Author',
              total_pages: volumeInfo.pageCount || 0,
              synopsis: volumeInfo.description || '',
              cover_url: volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/150',
              google_books_id: item.id,
              categories: volumeInfo.categories || [],
              current_page: 0,
              progress: 0,
              status: 'to-read'
            };
          })
          // Filter out books already in the user's library
          .filter(rec =>
            rec.title !== 'Unknown Title' &&
            !books.some(b => b.title === rec.title && b.author === rec.author)
          );
        setRecommendations(booksList);
        setFilteredRecommendations(booksList);
      } else {
        setRecommendations([]);
        setFilteredRecommendations([]);
      }
    } catch (error) {
      setRecommendations([]);
      setFilteredRecommendations([]);
    }
    setIsLoading(false);
  };

  const [addedIds, setAddedIds] = useState([]);
  const handleAddBook = async (book) => {
    await addBook({
      ...book,
      status: 'to-read',
      progress: 0,
    });
    setAddedIds((prev) => [...prev, book.google_books_id]);
  };

  const getPageBooks = () => {
    const startIdx = (currentPage - 1) * BOOKS_PER_PAGE;
    const endIdx = startIdx + BOOKS_PER_PAGE;
    return filteredRecommendations.slice(startIdx, endIdx);
  };

  const totalPages = Math.max(1, Math.ceil(filteredRecommendations.length / BOOKS_PER_PAGE));
  const displayedBooks = getPageBooks();

  return (
    <section className="bg-blue rounded-xl w-full max-w-5xl mx-auto my-12 shadow-xl flex flex-col">
      <div className="p-6 border-b border-background flex-shrink-0">
        <h2 className="text-xl font-semibold mb-4">Recommended for You</h2>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recommendations..."
            className="w-full px-4 py-2 pl-10 bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Search className="w-5 h-5 text-neutral absolute left-3 top-2.5" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-10">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filteredRecommendations.length > 0 ? (
          <div className="relative">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-neutral-950 shadow-lg ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/10'}`}
              style={{ marginLeft: '-2rem' }}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex gap-6 overflow-x-auto">
              {displayedBooks.map((book, index) => (
                <div
                  key={`${book.google_books_id}-${index}`}
                  className="bg-background-light rounded-lg overflow-hidden hover:bg-background-lighter transition-colors flex flex-col min-w-[200px] max-w-[220px] cursor-pointer"
                  onClick={() => setSelectedBook(book)}
                >
                  <div className="aspect-[3/4] relative flex-shrink-0">
                    <img
                      src={getHighQualityCover(book.cover_url)}
                      alt={book.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.warn('Failed to load book cover:', book.cover_url);
                        e.target.src = 'https://via.placeholder.com/300x400?text=No+Cover';
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background-light to-transparent" />
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-medium mb-1 line-clamp-2">{book.title}</h3>
                    <p className="text-sm text-neutral mb-3 line-clamp-1">{book.author}</p>
                    <div className="flex-grow" />
                    <button
                      onClick={e => { e.stopPropagation(); handleAddBook(book); }}
                      className={`w-full rounded-lg py-2 transition-colors mt-auto ${
                        addedIds.includes(book.google_books_id) || books.some(b => b.title === book.title && b.author === book.author)
                          ? 'bg-green-500 text-white cursor-default' : 'bg-primary hover:bg-primary-dark text-white'
                      }`}
                      disabled={addedIds.includes(book.google_books_id) || books.some(b => b.title === book.title && b.author === book.author)}
                    >
                      {addedIds.includes(book.google_books_id) || books.some(b => b.title === book.title && b.author === book.author)
                        ? 'Added to Library'
                        : 'Add to Library'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background shadow-lg ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/10'}`}
              style={{ marginRight: '-2rem' }}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        ) : (
          <div className="text-center py-12 text-neutral">
            No similar books found
          </div>
        )}
        {/* Book Details Modal for selected recommended book */}
        {selectedBook && (
          <BookDetailsModal
            book={selectedBook}
            onClose={() => setSelectedBook(null)}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        )}
      </div>

      {!isLoading && filteredRecommendations.length > 0 && (
        <div className="p-6 border-t border-background flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-neutral text-sm">
              Showing {displayedBooks.length} of {filteredRecommendations.length} books
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition-colors ${
                    currentPage === 1 ? 'text-neutral cursor-not-allowed' : 'hover:bg-blue text-white'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-neutral">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg transition-colors ${
                    currentPage === totalPages ? 'text-neutral cursor-not-allowed' : 'hover:bg-blue text-white'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
} 