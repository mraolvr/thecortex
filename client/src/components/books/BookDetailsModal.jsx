import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, BookOpen, Calendar, Hash, FileText, Edit, Trash2, Book, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import BookCover from './BookCover';
import useBookNotesStore from '../../stores/bookNotesStore';
import useBookStore from '../../stores/bookStore';

export default function BookDetailsModal({ book, onClose, onEdit, onDelete }) {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const { getNote, setNote } = useBookNotesStore();
  const { getActionableItems, isLoading, updateBook } = useBookStore();

  useEffect(() => {
    // Load notes when book changes
    setNotes(getNote(book.id));
  }, [book.id, getNote]);

  const fetchBookDetails = async () => {
    if (!book.title || !book.author) return;
    try {
      const query = `${book.title}+inauthor:${book.author}`;
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=1`);
      if (!response.ok) throw new Error('Failed to fetch book details');
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        const bookDetails = data.items[0].volumeInfo;
        const updatedBook = {
          ...book,
          isbn: bookDetails.industryIdentifiers?.[0]?.identifier || 'Not available',
          publication_date: bookDetails.publishedDate || 'Not available',
          genres: bookDetails.categories || [],
          pages: bookDetails.pageCount || 'Not available'
        };
        await updateBook(book.id, updatedBook);
      }
    } catch (error) {
      console.error('Error fetching book details:', error);
    }
  };

  useEffect(() => {
    fetchBookDetails();
  }, [book]);

  const handleSaveNotes = () => {
    setNote(book.id, notes);
    setIsEditingNotes(false);
  };

  const renderRating = (rating) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${rating >= star ? 'text-primary' : 'text-neutral'}`}
          fill={rating >= star ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-100 flex items-center justify-center p-2">
      <motion.div
        initial={{ opacity: 1, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 1, scale: 0}}
        className="bg-neutral-1200 rounded-xl shadow-xl border border-surface-light/20 max-w-5xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-2xl font-semibold">{book.title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-blue rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Book Cover */}
            <div className="aspect-[3/4] relative rounded-lg overflow-hidden">
              <BookCover url={book.cover_url} alt={book.title} title={book.title} author={book.author} />
            </div>

            {/* Book Details */}
            <div className="md:col-span-2 space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Author</h3>
                  <p className="text-neutral">{book.author}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Rating</h3>
                    {renderRating(book.rating)}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Progress</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-background-light rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2 transition-all"
                          style={{ width: `${book.progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-neutral">{book.progress}%</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">ISBN</h3>
                    <p className="text-neutral">{book.isbn || 'Not available'}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Pages</h3>
                    <p className="text-neutral">{book.pages || 'Not available'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Publication Date</h3>
                  <p className="text-neutral">{book.publication_date || 'Not available'}</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Genre</h3>
                  <div className="flex flex-wrap gap-2">
                    {book.genres?.map((genre) => (
                      <span
                        key={genre}
                        className="px-3 py-1 bg-background-light rounded-full text-sm"
                      >
                        {genre}
                      </span>
                    )) || 'Not available'}
                  </div>
                </div>
              </div>

              {/* Reading Notes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium">Reading Notes</h3>
                  {!isEditingNotes ? (
                    <button
                      onClick={() => setIsEditingNotes(true)}
                      className="p-2 hover:bg-background rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setNotes(getNote(book.id));
                          setIsEditingNotes(false);
                        }}
                        className="px-3 py-1 bg-background-light text-neutral rounded-lg hover:bg-background transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveNotes}
                        className="px-3 py-1 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>
                {isEditingNotes ? (
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full h-32 p-3 bg-background-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Add your reading notes here..."
                  />
                ) : (
                  <p className="text-neutral whitespace-pre-wrap">
                    {notes || 'No notes yet. Click the edit button to add some!'}
                  </p>
                )}
              </div>

              {/* Actionable Items Section */}
              <div className="space-y-2">
                <h4 className="font-medium">Actionable Items</h4>
                <div className="bg-background rounded-lg p-4">
                  <p className="text-neutral whitespace-pre-wrap">{book.actionable_items_text || 'No actionable items available.'}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 pt-4 border-t border-background-light">
                <button
                  onClick={() => onEdit(book)}
                  className="flex items-center gap-2 px-4 py-2 bg-background-light rounded-lg hover:bg-background transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit Book
                </button>
                <button
                  onClick={() => onDelete(book.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Book
                </button>
                <button
                  onClick={() => getActionableItems(book)}
                  className="w-full flex items-center justify-center space-x-2 bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Book className="w-5 h-5" />
                      <span>Get Actionable Items</span>
                    </>
                  )}
                </button>
                <button
                  onClick={fetchBookDetails}
                  className="w-full flex items-center justify-center space-x-2 bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Book className="w-5 h-5" />
                      <span>Fetch Book Details</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 