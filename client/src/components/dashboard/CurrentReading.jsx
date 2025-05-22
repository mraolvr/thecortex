import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Plus, Check, X, Star, Clock, Calendar, BookOpen } from 'lucide-react';
import useBookStore from '../../stores/bookStore';
import BookForm from '../../components/books/BookForm';
import { fadeIn, scaleIn, listItem, staggerContainer } from '../../utils/animations';
import { format, differenceInDays, isValid } from 'date-fns';

export default function CurrentReading() {
  const { books, addBook, updateBook } = useBookStore();
  const [showForm, setShowForm] = useState(false);
  const currentBook = books.find(book => book.status === 'reading');

  const handleAddBook = async (book) => {
    await addBook({
      ...book,
      status: 'reading',
      created_at: new Date().toISOString()
    });
    setShowForm(false);
  };

  const handleProgressUpdate = (e) => {
    const progress = parseInt(e.target.value);
    if (currentBook) {
      updateBook(currentBook.id, {
        ...currentBook,
        current_page: progress,
        progress: Math.round((progress / currentBook.total_pages) * 100)
      });
    }
  };

  const handleCompleteBook = () => {
    if (currentBook) {
      updateBook(currentBook.id, {
        ...currentBook,
        status: 'completed',
        current_page: currentBook.total_pages,
        progress: 100,
        completed_date: new Date().toISOString()
      });
    }
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return format(date, 'MMM d');
  };

  const getReadingStats = () => {
    if (!currentBook || !currentBook.created_at) return null;
    const startDate = new Date(currentBook.created_at);
    if (!isValid(startDate)) return null;
    
    const daysReading = differenceInDays(new Date(), startDate);
    const pagesPerDay = daysReading ? Math.round(currentBook.current_page / daysReading) : currentBook.current_page;
    const estimatedDaysToComplete = Math.ceil((currentBook.total_pages - currentBook.current_page) / (pagesPerDay || 1));
    return { pagesPerDay, estimatedDaysToComplete };
  };

  const stats = getReadingStats();

  return (
    <motion.div 
      className="p-8 rounded-2xl shadow-xl bg-gradient-to-br from-white/80 via-purple-50/80 to-emerald-100/80 dark:from-gray-900/80 dark:via-gray-800/80 dark:to-emerald-900/80 border-l-8 border-purple-400 dark:border-emerald-500 backdrop-blur-md"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeIn}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-extrabold text-gray-800 dark:text-white flex items-center gap-2 drop-shadow">
          <BookOpen className="w-7 h-7 text-purple-500" /> Current Reading
        </h2>
      </div>

      <AnimatePresence mode="wait">
        {!currentBook && !showForm && (
          <motion.button
            onClick={() => setShowForm(true)}
            className="w-full p-3 border-2 border-dashed border-neutral/30 rounded-lg text-neutral hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
            variants={scaleIn}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Plus className="w-4 h-4" />
            <span>Add Current Book</span>
          </motion.button>
        )}

        {showForm && (
          <BookForm
            onSubmit={handleAddBook}
            onClose={() => setShowForm(false)}
          />
        )}

        {currentBook && (
          <motion.div 
            className="space-y-3"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <motion.div variants={listItem} className="space-y-1">
              <h3 className="text-lg font-medium line-clamp-1">{currentBook.title}</h3>
              <div className="flex items-center gap-2 text-sm text-neutral">
                <span className="line-clamp-1">{currentBook.author}</span>
                <span>•</span>
                <span className="line-clamp-1">{currentBook.categories?.[0] || 'Fiction'}</span>
              </div>
            </motion.div>

            <motion.div className="space-y-2" variants={listItem}>
              <div className="flex justify-between text-sm text-neutral">
                <span>Progress</span>
                <span>{currentBook.current_page} / {currentBook.total_pages} pages</span>
              </div>
              <div className="relative">
                <div className="w-full h-1 bg-background rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    style={{ width: `${(currentBook.current_page / currentBook.total_pages) * 100}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentBook.current_page / currentBook.total_pages) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max={currentBook.total_pages}
                  value={currentBook.current_page}
                  onChange={handleProgressUpdate}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </motion.div>

            <motion.div className="flex justify-between items-center" variants={listItem}>
              <div className="flex gap-2 text-sm text-neutral">
                <span>{stats?.pagesPerDay || currentBook.current_page} pages/day</span>
                <span>•</span>
                <span>{stats?.estimatedDaysToComplete || 1} days left</span>
              </div>
              <button
                onClick={handleCompleteBook}
                className="text-sm text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                <span>Complete</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 