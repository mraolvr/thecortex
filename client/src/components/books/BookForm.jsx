import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Search, Loader2, Plus, Tag, Star } from 'lucide-react';
import { getHighQualityCover } from '../../utils/bookCovers';

export default function BookForm({ book, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    total_pages: '',
    synopsis: '',
    cover_url: '',
    status: 'to-read',
    google_books_id: '',
    current_page: 0,
    progress: 0,
    categories: [],
    custom_categories: [],
    notes: '',
    rating: 0,
    start_date: '',
    last_read_date: '',
    completed_date: '',
    reading_sessions: []
  });
  const [searchResults, setSearchResults] = useState({
    title: [],
    author: []
  });
  const [isSearching, setIsSearching] = useState({
    title: false,
    author: false
  });
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    if (book) {
      setFormData({
        ...book,
        total_pages: book.total_pages || '',
        cover_url: book.cover_url || '',
        current_page: book.current_page || 0,
        progress: book.progress || 0,
        categories: book.categories || [],
        custom_categories: book.custom_categories || [],
        notes: book.notes || '',
        rating: book.rating || 0,
        start_date: book.start_date || '',
        last_read_date: book.last_read_date || '',
        completed_date: book.completed_date || '',
        reading_sessions: book.reading_sessions || []
      });
    }
  }, [book]);

  const searchGoogleBooks = async (query, type) => {
    setIsSearching(prev => ({ ...prev, [type]: true }));
    try {
      let searchQuery = query;
      if (type === 'author') {
        searchQuery = `inauthor:${query}`;
      }
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=4`);
      const data = await response.json();
      
      if (data.items) {
        const books = data.items.map(item => ({
          title: item.volumeInfo.title,
          author: item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Unknown',
          total_pages: item.volumeInfo.pageCount || 0,
          synopsis: item.volumeInfo.description || '',
          cover_url: item.volumeInfo.imageLinks?.thumbnail || '',
          google_books_id: item.id,
          categories: item.volumeInfo.categories || [],
          current_page: 0,
          progress: 0,
          status: 'to-read'
        }));
        setSearchResults(prev => ({ ...prev, [type]: books }));
      }
    } catch (error) {
      console.error('Error searching Google Books:', error);
    }
    setIsSearching(prev => ({ ...prev, [type]: false }));
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setFormData(prev => ({ ...prev, title: newTitle }));
    if (newTitle.length > 2) {
      searchGoogleBooks(newTitle, 'title');
    } else {
      setSearchResults(prev => ({ ...prev, title: [] }));
    }
  };

  const handleAuthorChange = (e) => {
    const newAuthor = e.target.value;
    setFormData(prev => ({ ...prev, author: newAuthor }));
    if (newAuthor.length > 2) {
      searchGoogleBooks(newAuthor, 'author');
    } else {
      setSearchResults(prev => ({ ...prev, author: [] }));
    }
  };

  const handleBookSelect = (book, type) => {
    setFormData(prev => ({
      ...prev,
      ...book,
      status: prev.status
    }));
    setSearchResults({ title: [], author: [] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const totalPages = parseInt(formData.total_pages);
    const currentPage = parseInt(formData.current_page) || 0;
    
    onSubmit({
      ...formData,
      total_pages: totalPages,
      current_page: Math.min(currentPage, totalPages), // Ensure current page doesn't exceed total
      progress: totalPages ? Math.round((currentPage / totalPages) * 100) : 0,
      categories: Array.isArray(formData.categories) ? formData.categories : [],
      custom_categories: Array.isArray(formData.custom_categories) ? formData.custom_categories : [],
      reading_sessions: Array.isArray(formData.reading_sessions) ? formData.reading_sessions : [],
      notes: Array.isArray(formData.notes) ? formData.notes : [],
      rating: Array.isArray(formData.rating) ? formData.rating : []
    });
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (newCategory.trim() && !formData.custom_categories.includes(newCategory.trim())) {
      setFormData(prev => ({
        ...prev,
        custom_categories: [...prev.custom_categories, newCategory.trim()]
      }));
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (category) => {
    setFormData(prev => ({
      ...prev,
      custom_categories: prev.custom_categories.filter(c => c !== category)
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-xl z-100 flex items-center justify-center p-2">
    
      <div className="bg-neutral-950 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-background sticky top-0 bg-surface z-10">
          <h2 className="text-xl font-semibold">
            {book ? 'Edit Book' : 'Add New Book'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2 relative">
            <label className="block text-sm font-medium">Title</label>
            <div className="relative">
              <input
                type="text"
                value={formData.title}
                onChange={handleTitleChange}
                className="w-full px-3 py-2 bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                required
              />
              {isSearching.title && (
                <Loader2 className="w-5 h-5 absolute right-3 top-2.5 animate-spin text-neutral" />
              )}
            </div>
            
            {searchResults.title.length > 0 && (
              <div className="absolute z-10 left-0 right-0 mt-1 bg-background rounded-lg shadow-lg border border-background-light max-h-60 overflow-y-auto">
                {searchResults.title.map((result, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleBookSelect(result, 'title')}
                    className="w-full p-3 text-left hover:bg-surface flex items-start space-x-3 border-b border-background-light last:border-0"
                  >
                    {result.cover_url && (
                      <img src={getHighQualityCover(result.cover_url)} alt={result.title} className="w-10 h-14 object-cover rounded" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium line-clamp-1">{result.title}</p>
                      <p className="text-sm text-neutral line-clamp-1">{result.author}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2 relative">
            <label className="block text-sm font-medium">Author</label>
            <div className="relative">
              <input
                type="text"
                value={formData.author}
                onChange={handleAuthorChange}
                className="w-full px-3 py-2 bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                required
              />
              {isSearching.author && (
                <Loader2 className="w-5 h-5 absolute right-3 top-2.5 animate-spin text-neutral" />
              )}
            </div>

            {searchResults.author.length > 0 && (
              <div className="absolute z-10 left-0 right-0 mt-1 bg-background rounded-lg shadow-lg border border-background-light max-h-60 overflow-y-auto">
                {searchResults.author.map((result, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleBookSelect(result, 'author')}
                    className="w-full p-3 text-left hover:bg-surface flex items-start space-x-3 border-b border-background-light last:border-0"
                  >
                    {result.cover_url && (
                      <img src={getHighQualityCover(result.cover_url)} alt={result.title} className="w-10 h-14 object-cover rounded" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium line-clamp-1">{result.title}</p>
                      <p className="text-sm text-neutral line-clamp-1">{result.author}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Total Pages</label>
            <input
              type="number"
              value={formData.total_pages}
              onChange={(e) => setFormData({ ...formData, total_pages: e.target.value })}
              className="w-full px-3 py-2 bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Current Page</label>
            <input
              type="number"
              min="0"
              max={formData.total_pages}
              value={formData.current_page}
              onChange={(e) => {
                const currentPage = parseInt(e.target.value) || 0;
                const progress = formData.total_pages ? Math.round((currentPage / formData.total_pages) * 100) : 0;
                setFormData(prev => ({
                  ...prev,
                  current_page: currentPage,
                  progress
                }));
              }}
              className="w-full px-3 py-2 bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Cover URL</label>
            <input
              type="url"
              value={formData.cover_url}
              onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
              className="w-full px-3 py-2 bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Synopsis</label>
            <textarea
              value={formData.synopsis}
              onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
              className="w-full px-3 py-2 bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-32 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="to-read">To Read</option>
              <option value="reading">Currently Reading</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Custom Categories</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.custom_categories.map((category, index) => (
                <div
                  key={index}
                  className="bg-background px-3 py-1.5 rounded-full flex items-center gap-2"
                >
                  <Tag className="w-3.5 h-3.5 text-primary" />
                  <span className="text-sm">{category}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(category)}
                    className="text-neutral hover:text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Add a category..."
                className="flex-1 px-3 py-2 bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="px-3 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add your thoughts, reflections, or key takeaways..."
              className="w-full px-3 py-2 bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-32 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, rating }))}
                  className={`p-1 hover:text-primary transition-colors ${
                    formData.rating >= rating ? 'text-primary' : 'text-neutral'
                  }`}
                >
                  <Star className="w-5 h-5" fill={formData.rating >= rating ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Start Date</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                className="w-full px-3 py-2 bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Last Read Date</label>
              <input
                type="date"
                value={formData.last_read_date}
                onChange={(e) => setFormData(prev => ({ ...prev, last_read_date: e.target.value }))}
                className="w-full px-3 py-2 bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {formData.status === 'completed' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium">Completion Date</label>
                <input
                  type="date"
                  value={formData.completed_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, completed_date: e.target.value }))}
                  className="w-full px-3 py-2 bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-neutral hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
            >
              {book ? 'Save Changes' : 'Add Book'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
} 