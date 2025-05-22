import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash2, BookOpen, LayoutGrid, List, Star, Keyboard, X, Book, Search, Filter, ChevronDown } from 'lucide-react';
import BookRecommendations from './BookRecommendations';
import { useState, useEffect, useMemo } from 'react';
import Card from '../../components/ui/Card';
import BookCover from './BookCover';

export default function BookGrid({ books, onBookSelect, onEditBook, onDeleteBook, onCompleteBook, isLoading }) {
  const [viewMode, setViewMode] = useState('grid');
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    rating: 'all',
    progress: 'all'
  });

  // Filter and sort books
  const filteredAndSortedBooks = useMemo(() => {
    let result = [...books];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(book => 
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filters.status !== 'all') {
      result = result.filter(book => book.status === filters.status);
    }

    // Apply rating filter
    if (filters.rating !== 'all') {
      result = result.filter(book => book.rating === parseInt(filters.rating));
    }

    // Apply progress filter
    if (filters.progress !== 'all') {
      const progressRanges = {
        'not-started': [0, 0],
        'in-progress': [1, 99],
        'completed': [100, 100]
      };
      const [min, max] = progressRanges[filters.progress];
      result = result.filter(book => book.progress >= min && book.progress <= max);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'author':
          comparison = a.author.localeCompare(b.author);
          break;
        case 'rating':
          comparison = b.rating - a.rating;
          break;
        case 'progress':
          comparison = b.progress - a.progress;
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [books, searchQuery, sortBy, sortOrder, filters]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Only handle shortcuts if no input is focused
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.key.toLowerCase()) {
        case 'v':
          setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
          break;
        case 'n':
          if (typeof onBookSelect === 'function') {
            onBookSelect(null);
          }
          break;
        case 'f':
          const searchInput = document.querySelector('[data-search-input]');
          if (searchInput) searchInput.focus();
          break;
        case '?':
          setShowKeyboardShortcuts(prev => !prev);
          break;
        case 'escape':
          setShowFilters(false);
          setShowKeyboardShortcuts(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onBookSelect]);

  const renderRating = (rating) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${rating >= star ? 'text-primary' : 'text-neutral'}`}
          fill={rating >= star ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  );

  return (
    <>
      <div className="space-y-10">
        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-black" />
            <input
              type="text"
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              data-search-input
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-background-light rounded-lg hover:bg-neutral transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="title">Sort by Title</option>
              <option value="author">Sort by Author</option>
              <option value="rating">Sort by Rating</option>
              <option value="progress">Sort by Progress</option>
            </select>

            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2 bg-neutral-light rounded-lg hover:bg-neutral transition-colors"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-neutral-light rounded-lg">
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 bg-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All</option>
                    <option value="reading">Reading</option>
                    <option value="completed">Completed</option>
                    <option value="to-read">To Read</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <select
                    value={filters.rating}
                    onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
                    className="w-full px-3 py-2 bg-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Progress</label>
                  <select
                    value={filters.progress}
                    onChange={(e) => setFilters(prev => ({ ...prev, progress: e.target.value }))}
                    className="w-full px-3 py-2 bg-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Progress</option>
                    <option value="not-started">Not Started</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Count */}
        <div className="text-sm text-neutral">
          Showing {filteredAndSortedBooks.length} of {books.length} books
        </div>

        {/* No Results Message */}
        {filteredAndSortedBooks.length === 0 && (
          <div className="text-center py-12">
            <Book className="w-12 h-12 text-neutral mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No books found</h3>
            <p className="text-neutral">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && filteredAndSortedBooks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {filteredAndSortedBooks.map((book) => (
              <Card
                key={book.id}
                accent="blue"
                icon={Book}
                title={book.title}
                className="p-4 cursor-pointer hover:scale-[1.02] transition-transform"
                onClick={() => onBookSelect(book)}
              >
                <div className="aspect-[3/4] relative">
                  <BookCover url={book.cover_url} alt={book.title} title={book.title} author={book.author} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-sm text-white/80 line-clamp-1">{book.author}</p>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {renderRating(book.rating)}
                    </div>
                    <span className="text-sm text-neutral">
                      {book.progress}% Complete
                    </span>
                  </div>
                  <div className="w-full bg-neutral-light rounded-full h-1.5">
                    <div
                      className="bg-primary rounded-full h-1.5 transition-all"
                      style={{ width: `${book.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditBook(book);
                      }}
                      className="p-2 hover:bg-neutral rounded-lg transition-colors"
                      disabled={isLoading}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteBook(book.id);
                      }}
                      className="p-2 hover:bg-neutral rounded-lg transition-colors text-red-500"
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onCompleteBook) onCompleteBook(book);
                      }}
                      className={`p-2 rounded-lg transition-colors ${book.status === 'completed' ? 'bg-green-500/20 text-green-700 cursor-default' : 'hover:bg-green-500/10 text-green-700'}`}
                      disabled={isLoading || book.status === 'completed'}
                      title={book.status === 'completed' ? 'Completed' : 'Mark as Complete'}
                    >
                      {book.status === 'completed' ? '✓' : 'Complete'}
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && filteredAndSortedBooks.length > 0 && (
          <div className="space-y-4">
            {filteredAndSortedBooks.map((book) => (
              <Card
                key={book.id}
                accent="blue"
                icon={Book}
                title={book.title}
                className="p-4 cursor-pointer hover:scale-[1.01] transition-transform"
                onClick={() => onBookSelect(book)}
              >
                <div className="flex gap-4">
                  <div className="w-24 aspect-[3/4] relative rounded-lg overflow-hidden">
                    <BookCover url={book.cover_url} alt={book.title} title={book.title} author={book.author} />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-lg font-medium">{book.title}</h3>
                      <p className="text-neutral">{book.author}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {renderRating(book.rating)}
                      </div>
                      <span className="text-sm text-neutral">
                        {book.progress}% Complete
                      </span>
                    </div>
                    <div className="w-full bg-neutral-light rounded-full h-1.5">
                      <div
                        className="bg-primary rounded-full h-1.5 transition-all"
                        style={{ width: `${book.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditBook(book);
                        }}
                        className="p-2 hover:bg-neutral rounded-lg transition-colors"
                        disabled={isLoading}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteBook(book.id);
                        }}
                        className="p-2 hover:bg-neutral rounded-lg transition-colors text-red-500"
                        disabled={isLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onCompleteBook) onCompleteBook(book);
                        }}
                        className={`p-2 rounded-lg transition-colors ${book.status === 'completed' ? 'bg-green-500/20 text-green-700 cursor-default' : 'hover:bg-green-500/10 text-green-700'}`}
                        disabled={isLoading || book.status === 'completed'}
                        title={book.status === 'completed' ? 'Completed' : 'Mark as Complete'}
                      >
                        {book.status === 'completed' ? '✓' : 'Complete'}
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Modal */}
      <AnimatePresence>
        {showKeyboardShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface rounded-xl w-full max-w-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Keyboard Shortcuts</h2>
                <button
                  onClick={() => setShowKeyboardShortcuts(false)}
                  className="p-2 hover:bg-neutral rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Toggle View Mode</span>
                  <kbd className="px-2 py-1 bg-neutral rounded text-sm">V</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span>Add New Book</span>
                  <kbd className="px-2 py-1 bg-neutral rounded text-sm">N</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span>Focus Search</span>
                  <kbd className="px-2 py-1 bg-neutral rounded text-sm">F</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span>Show/Hide Shortcuts</span>
                  <kbd className="px-2 py-1 bg-neutral rounded text-sm">?</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span>Close Modal</span>
                  <kbd className="px-2 py-1 bg-neutral rounded text-sm">Esc</kbd>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 