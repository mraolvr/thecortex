import { useState, useEffect } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BookFilters({ books, onFilterChange }) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    categories: [],
    authors: [],
    progress: 'all', // all, not-started, in-progress, completed
    search: ''
  });

  // Extract unique categories and authors from books
  const uniqueCategories = [...new Set(books.flatMap(book => book.categories || []))].sort();
  const uniqueAuthors = [...new Set(books.map(book => book.author))].sort();

  useEffect(() => {
    // Apply filters to books
    const filteredBooks = books.filter(book => {
      // Status filter
      if (filters.status !== 'all' && book.status !== filters.status) {
        return false;
      }

      // Categories filter
      if (filters.categories.length > 0) {
        const bookCategories = book.categories || [];
        if (!filters.categories.some(category => bookCategories.includes(category))) {
          return false;
        }
      }

      // Authors filter
      if (filters.authors.length > 0 && !filters.authors.includes(book.author)) {
        return false;
      }

      // Progress filter
      if (filters.progress !== 'all') {
        switch (filters.progress) {
          case 'not-started':
            if (book.progress !== 0) return false;
            break;
          case 'in-progress':
            if (book.progress === 0 || book.progress === 100) return false;
            break;
          case 'completed':
            if (book.progress !== 100) return false;
            break;
        }
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          book.title.toLowerCase().includes(searchLower) ||
          book.author.toLowerCase().includes(searchLower) ||
          (book.categories || []).some(category => 
            category.toLowerCase().includes(searchLower)
          )
        );
      }

      return true;
    });

    onFilterChange(filteredBooks);
  }, [filters, books]);

  const handleStatusChange = (status) => {
    setFilters(prev => ({ ...prev, status }));
  };

  const handleCategoryToggle = (category) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleAuthorToggle = (author) => {
    setFilters(prev => ({
      ...prev,
      authors: prev.authors.includes(author)
        ? prev.authors.filter(a => a !== author)
        : [...prev.authors, author]
    }));
  };

  const handleProgressChange = (progress) => {
    setFilters(prev => ({ ...prev, progress }));
  };

  const handleSearchChange = (search) => {
    setFilters(prev => ({ ...prev, search }));
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      categories: [],
      authors: [],
      progress: 'all',
      search: ''
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-3 py-1.5 bg-background rounded-lg hover:bg-background-lighter transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          
          {(filters.categories.length > 0 || filters.authors.length > 0 || filters.status !== 'all' || filters.progress !== 'all') && (
            <button
              onClick={clearFilters}
              className="text-sm text-neutral hover:text-white transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        <input
          type="text"
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search books..."
          className="px-3 py-1.5 bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary w-64"
        />
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-background rounded-lg p-4 space-y-6">
              {/* Status filters */}
              <div>
                <h3 className="text-sm font-medium mb-2">Status</h3>
                <div className="flex flex-wrap gap-2">
                  {['all', 'to-read', 'reading', 'completed'].map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        filters.status === status
                          ? 'bg-primary text-white'
                          : 'bg-background-light text-neutral hover:text-white'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress filters */}
              <div>
                <h3 className="text-sm font-medium mb-2">Progress</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'not-started', label: 'Not Started' },
                    { value: 'in-progress', label: 'In Progress' },
                    { value: 'completed', label: 'Completed' }
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => handleProgressChange(value)}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        filters.progress === value
                          ? 'bg-primary text-white'
                          : 'bg-background-light text-neutral hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories filter */}
              {uniqueCategories.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {uniqueCategories.map(category => (
                      <button
                        key={category}
                        onClick={() => handleCategoryToggle(category)}
                        className={`px-3 py-1 rounded-lg transition-colors ${
                          filters.categories.includes(category)
                            ? 'bg-primary text-white'
                            : 'bg-background-light text-neutral hover:text-white'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Authors filter */}
              {uniqueAuthors.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Authors</h3>
                  <div className="flex flex-wrap gap-2">
                    {uniqueAuthors.map(author => (
                      <button
                        key={author}
                        onClick={() => handleAuthorToggle(author)}
                        className={`px-3 py-1 rounded-lg transition-colors ${
                          filters.authors.includes(author)
                            ? 'bg-primary text-white'
                            : 'bg-background-light text-neutral hover:text-white'
                        }`}
                      >
                        {author}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 