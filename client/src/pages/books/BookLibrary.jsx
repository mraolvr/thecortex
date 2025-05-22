import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Star, Clock, BarChart, Plus, Edit, Trash2, Loader2, AlertCircle, X, BookOpenCheck } from 'lucide-react';
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
          <button 
            onClick={clearError}
            className="ml-2 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
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

            <div className="flex space-x-1 border-b border-surface-light/20">
              <button
                onClick={() => {
                  setEditingBook(null);
                  setShowForm(true);
                }}
                className="flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>Add Book</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-12 gap-1">
              {/* ... your grid content ... */}
            </div>
          </div>
      
      </GlowingEffect>

      {/* Stats Section */}
      <div className="col-span-12">
        <GlowingEffect className="bg-neutral-1200 p-6 rounded-xl shadow-xl">
          <h2 className="text-xl font-semibold mb-4">Reading Stats</h2>
          <div className="grid grid-cols-4 gap-4">
            <Card accent="blue" icon={Book} title="Books Read" className="p-4">
              <p className="text-2xl font-semibold">{readingStats.booksRead}</p>
            </Card>
            <Card accent="purple" icon={BarChart} title="Pages Read" className="p-4">
              <p className="text-2xl font-semibold">{readingStats.pagesRead}</p>
            </Card>
            <Card accent="red" icon={Star} title="Reading Streak" className="p-4">
              <p className="text-2xl font-semibold">{readingStats.readingStreak} days</p>
            </Card>
            <Card accent="green" icon={Clock} title="Average Pages" className="p-4">
              <p className="text-2xl font-semibold">{readingStats.averagePages}</p>
            </Card>
          </div>
        </GlowingEffect>
      </div>

      {/* Books Grid */}
      <div className="col-span-12">
        <GlowingEffect className="bg-neutral-950  p-10 rounded-xl shadow-xl">
          <div className="mb-6">
            {/* Removed BookFilters to avoid duplicate search/filter UI */}
          </div>
          <BookGrid
            books={books}
            onBookSelect={handleBookSelect}
            onEditBook={handleEditBook}
            onDeleteBook={handleDeleteBook}
            onCompleteBook={handleCompleteBook}
            isLoading={isLoading}
          />
        </GlowingEffect>
      </div>

      {/* Recommended Books Section */}
      <div className="col-span-12 mt-12">
        <h2 className="text-2xl font-bold mb-8">A Few Recommendations</h2>
        <BookRecommendations books={books} />
      </div>

      <AnimatePresence>
        {showForm && (
          <BookForm
            book={editingBook}
            onSubmit={editingBook ? handleUpdateBook : handleAddBook}
            onClose={() => {
              setShowForm(false);
              setEditingBook(null);
            }}
          />
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