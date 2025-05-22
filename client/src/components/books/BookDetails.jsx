import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Book, User, Clock, Loader2, ChevronRight, Calendar, Plus, Check, Star, BookOpen, Tag, Edit as EditIcon, Timer, Trash2 } from 'lucide-react';
import useBookStore from '../../stores/bookStore';
import { format, differenceInDays, isValid } from 'date-fns';
import { getHighQualityCover } from '../../utils/bookCovers';
import BookForm from './BookForm';
import Card from '../../components/ui/Card';

// Average reading speed (words per minute)
const AVERAGE_READING_SPEED = 250;
// Average words per page
const AVERAGE_WORDS_PER_PAGE = 300;

export default function BookDetails({ onClose }) {
  const { selectedBook, isLoading, getActionableItems, updateBook } = useBookStore();
  const [showActionItems, setShowActionItems] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  // Calculate estimated reading time
  const getEstimatedReadingTime = (totalPages) => {
    const totalWords = totalPages * AVERAGE_WORDS_PER_PAGE;
    const minutesToRead = Math.ceil(totalWords / AVERAGE_READING_SPEED);
    
    if (minutesToRead < 60) {
      return `${minutesToRead} minutes`;
    }
    
    const hours = Math.floor(minutesToRead / 60);
    const minutes = minutesToRead % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours} hours`;
  };

  // Handle rating change
  const handleRatingChange = async (newRating) => {
    await updateBook(selectedBook.id, {
      ...selectedBook,
      rating: newRating
    });
  };

  const fetchActionableItems = async () => {
    if (!selectedBook) return;
    await getActionableItems(selectedBook);
  };

  useEffect(() => {
    fetchActionableItems();
  }, [selectedBook]);

  useEffect(() => {
    // Show actionable items if they exist
    if (selectedBook?.actionable_items_text) {
      setShowActionItems(true);
    } else {
      setShowActionItems(false);
    }
  }, [selectedBook]);

  const handleGetActionItems = async () => {
    await getActionableItems(selectedBook);
  };

  const handleEditClick = () => {
    setShowEditForm(true);
  };

  const handleUpdateBook = async (updatedBook) => {
    await updateBook(selectedBook.id, updatedBook);
    setShowEditForm(false);
  };

  if (!selectedBook) return null;

  return (
    <>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 100 }}
        exit={{ x: '100%' }}
        transition={{ type: 'fade', damping: 55, stiffness: 200 }}
        className="fixed right-0 top-0 h-screen w-[400px] bg-neutral-900 border-l border-blue-light overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Book Details</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleEditClick}
                className="p-2 hover:bg-blue rounded-lg transition-colors text-neutral hover:text-white"
              >
                <EditIcon className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-blue rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="aspect-[3/4] relative rounded-lg overflow-hidden">
              <img
                src={getHighQualityCover(selectedBook.cover_url)}
                alt={selectedBook.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.warn('Failed to load book cover:', selectedBook.cover_url);
                  e.target.src = 'https://via.placeholder.com/300x400?text=No+Cover';
                }}
              />
            </div>

            <div className="space-y-4">
              <Card accent="blue" icon={Book} title={selectedBook.title} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => handleRatingChange(rating)}
                        className={`p-1 hover:text-primary transition-colors ${
                          selectedBook.rating >= rating ? 'text-primary' : 'text-neutral'
                        }`}
                      >
                        <Star className="w-5 h-5" fill={selectedBook.rating >= rating ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-neutral">
                      <User className="w-4 h-4 mr-2" />
                      <span>{selectedBook.author}</span>
                    </div>
                    <div className="flex items-center text-neutral">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{selectedBook.total_pages} pages</span>
                    </div>
                    <div className="flex items-center text-neutral">
                      <Timer className="w-4 h-4 mr-2" />
                      <span>Est. {getEstimatedReadingTime(selectedBook.total_pages)} to read</span>
                    </div>
                    {selectedBook.last_ai_analysis && (
                      <div className="flex items-center text-neutral">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Analyzed {format(new Date(selectedBook.last_ai_analysis), 'MMM d, yyyy')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Categories Section */}
              {(selectedBook.categories?.length > 0 || selectedBook.custom_categories?.length > 0) && (
                <div className="space-y-2">
                  <h4 className="font-medium">Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedBook.categories?.map((category, index) => (
                      <div
                        key={`cat-${index}`}
                        className="bg-background px-3 py-1.5 rounded-full text-sm text-neutral"
                      >
                        {category}
                      </div>
                    ))}
                    {selectedBook.custom_categories?.map((category, index) => (
                      <div
                        key={`custom-${index}`}
                        className="bg-background px-3 py-1.5 rounded-full flex items-center gap-2"
                      >
                        <Tag className="w-3.5 h-3.5 text-primary" />
                        <span className="text-sm">{category}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reading Progress Section */}
              <div className="space-y-3 bg-background rounded-lg p-4">
                <h4 className="font-medium">Reading Progress</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-neutral">Progress</span>
                      <span className="text-primary">{selectedBook.progress}%</span>
                    </div>
                    <div className="w-full bg-background-light rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{ width: `${selectedBook.progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-background-light rounded-lg p-3">
                      <div className="text-neutral text-sm mb-1">Current Page</div>
                      <div className="font-medium">{selectedBook.current_page || 0}</div>
                    </div>
                    <div className="bg-background-light rounded-lg p-3">
                      <div className="text-neutral text-sm mb-1">Total Pages</div>
                      <div className="font-medium">{selectedBook.total_pages}</div>
                    </div>
                    <div className="bg-background-light rounded-lg p-3">
                      <div className="text-neutral text-sm mb-1">Pages Left</div>
                      <div className="font-medium">{selectedBook.total_pages - (selectedBook.current_page || 0)}</div>
                    </div>
                  </div>

                  {selectedBook.start_date && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral">Started Reading</span>
                      <span>{format(new Date(selectedBook.start_date), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                  
                  {selectedBook.last_read_date && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral">Last Read</span>
                      <span>{format(new Date(selectedBook.last_read_date), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Synopsis</h4>
                <p className="text-neutral">{selectedBook.synopsis}</p>
              </div>

              {/* Notes Section */}
              {selectedBook.notes && (
                <div className="space-y-2">
                  <h4 className="font-medium">Notes</h4>
                  <div className="bg-background rounded-lg p-4">
                    <p className="text-neutral whitespace-pre-wrap">{selectedBook.notes}</p>
                  </div>
                </div>
              )}

              {/* Actionable Items Section */}
              <div className="space-y-2">
                <h4 className="font-medium">Actionable Items</h4>
                <div className="bg-background rounded-lg p-4">
                  <p className="text-neutral whitespace-pre-wrap">{selectedBook.actionable_items_text || 'No actionable items available.'}</p>
                </div>
              </div>

              <button
                onClick={handleGetActionItems}
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
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showEditForm && (
          <BookForm
            book={selectedBook}
            onSubmit={handleUpdateBook}
            onClose={() => setShowEditForm(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
} 