import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Star, Clock, BarChart, Plus, Edit, Trash2, Loader2, AlertCircle, X, BookOpenCheck, ChevronDown, ChevronUp, List, Grid } from 'lucide-react';
import GlowingEffect from '../../components/ui/GlowingEffect';
import useBookStore from '../../stores/bookStore';
import BookDetails from '../../components/books/BookDetails';
import BookForm from '../../components/books/BookForm';
import BookGrid from '../../components/books/BookGrid';
import BookFilters from '../../components/books/BookFilters';
import { supabase } from '../../services/supabase';
import Card from '../../components/ui/Card';
import BookDetailsModal from '../../components/books/BookDetailsModal';
import BookRecommendations from '../../components/books/BookRecommendations';
import SectionHeader from '../../components/ui/SectionHeader';
import Button from '../../components/ui/Button';

export default function BookLibrary() {
  const { 
    books, 
    addBook, 
    updateBook, 
    deleteBook, 
    setSelectedBook, 
    selectedBook,
    initializeBooks,
    isLoading,
    error,
    clearError
  } = useBookStore();
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [showRecommendations, setShowRecommendations] = useState(false);

  useEffect(() => {
    initializeBooks();
  }, [initializeBooks]);

  useEffect(() => {
    setFilteredBooks(books);
  }, [books]);

  const readingStats = {
    booksRead: books.filter(book => book.status === 'completed').length,
    pagesRead: books.reduce((total, book) => total + (book.current_page || 0), 0),
    readingStreak: 15, // This could be calculated based on reading history
    averagePages: Math.round(books.reduce((total, book) => total + (book.current_page || 0), 0) / 30), // Average over last 30 days
  };

  const handleAddBook = async (book) => {
    // Log the current user before adding a book
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user when adding book:', user);
    
    await addBook(book);
    if (!error) {
      setShowForm(false);
    }
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setShowForm(true);
    setSelectedBook(null);
  };

  const handleUpdateBook = async (updatedBook) => {
    await updateBook(editingBook.id, updatedBook);
    setShowForm(false);
    setEditingBook(null);
  };

  const handleDeleteBook = async (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      await deleteBook(id);
    }
  };

  const handleBookSelect = (book) => {
    setSelectedBook(book);
  };

  const handleCompleteBook = async (book) => {
    if (book.status !== 'completed' || book.progress !== 100) {
      await updateBook(book.id, { ...book, status: 'completed', progress: 100 });
    }
  };

  // Quick filter handlers
  const handleFilter = (filter) => {
    if (filter === 'all') setFilteredBooks(books);
    else if (filter === 'reading') setFilteredBooks(books.filter(b => b.status === 'reading'));
    else if (filter === 'completed') setFilteredBooks(books.filter(b => b.status === 'completed'));
  };

  if (isLoading && books.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-950  flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-neutral">Loading your library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-1200 p-8">
      {error && (
        <div className="fixed top-4 right-4 bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg flex items-center space-x-1">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
          <Button
            onClick={clearError}
            className="ml-2 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      <GlowingEffect>
        <div className="max-w-[1600px] mx-auto">
          <SectionHeader 
            title="Personal Library"
            subtitle="Your personal library of books"
            center
            icon={BookOpenCheck}
            divider
          />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-8">
            {/* Sidebar */}
            <aside className="col-span-1 bg-neutral-1100 rounded-xl p-4 flex flex-col gap-6 min-w-[220px]">
              <div className="flex flex-col gap-2">
                <Button variant="secondary" className="w-full" onClick={() => { setEditingBook(null); setShowForm(true); }}>
                  <Plus className="w-4 h-4 mr-1" /> Add Book
                </Button>
                <div className="mt-4 flex flex-col gap-2">
                  <button onClick={() => handleFilter('all')} className="text-left px-2 py-1 rounded hover:bg-primary/10 text-white">All Books</button>
                  <button onClick={() => handleFilter('reading')} className="text-left px-2 py-1 rounded hover:bg-primary/10 text-white">Currently Reading</button>
                  <button onClick={() => handleFilter('completed')} className="text-left px-2 py-1 rounded hover:bg-primary/10 text-white">Completed</button>
                </div>
              </div>
             
             
            </aside>
            {/* Main Content */}
            <main className="col-span-1 md:col-span-3 flex flex-col gap-8">
              {/* Recommendations Collapsible at the top */}
              {showRecommendations && (
                <GlowingEffect className="bg-neutral-950 p-6 rounded-xl shadow-xl">
                  <h2 className="text-xl font-bold mb-4">A Few Recommendations</h2>
                  <BookRecommendations books={books} />
                </GlowingEffect>
              )}
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'primary' : 'secondary'}
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? '' : 'bg-neutral-1100'}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'primary' : 'secondary'}
                    onClick={() => setViewMode('list')}
                    className={viewMode === 'list' ? '' : 'bg-neutral-1100'}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  onClick={() => setShowRecommendations(s => !s)}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {showRecommendations ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  Recommendations
                </Button>
              </div>
              {/* Book Grid/List */}
              <GlowingEffect className="bg-neutral-950 p-6 rounded-xl shadow-xl">
                {viewMode === 'grid' ? (
                  <BookGrid
                    books={filteredBooks}
                    onBookSelect={handleBookSelect}
                    onEditBook={handleEditBook}
                    onDeleteBook={handleDeleteBook}
                    onCompleteBook={handleCompleteBook}
                    isLoading={isLoading}
                  />
                ) : (
                  <div className="space-y-2">
                    {filteredBooks.map(book => (
                      <div key={book.id} className="flex items-center gap-4 bg-background-light rounded-lg p-4 hover:bg-background-lighter transition-colors">
                        <div className="w-12 h-16 bg-background rounded-lg flex items-center justify-center">
                          <Book className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-lg">{book.title}</div>
                          <div className="text-neutral-400 text-sm">{book.author}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="secondary" onClick={() => handleEditBook(book)}><Edit className="w-4 h-4" /></Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteBook(book.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </GlowingEffect>
            </main>
          </div>
        </div>
      </GlowingEffect>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl p-2">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <BookForm
                book={editingBook}
                onSubmit={editingBook ? handleUpdateBook : handleAddBook}
                onClose={() => {
                  setShowForm(false);
                  setEditingBook(null);
                }}
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedBook && (
          <BookDetailsModal
            book={selectedBook}
            onClose={() => setSelectedBook(null)}
            onEdit={handleEditBook}
            onDelete={handleDeleteBook}
          />
        )}
      </AnimatePresence>
    </div>
  );
} 