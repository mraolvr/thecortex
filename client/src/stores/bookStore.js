import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

const isDevelopment = import.meta.env.MODE === 'development';

// Mock user for development
const mockUser = {
  id: '8235a0fd-a232-40f1-a9ed-b420895804a8',
  email: 'austinblakeoliver@gmail.com',
  name: 'Austin Oliver',
  role: 'admin'
};

// Set the mock user in Supabase auth if in development mode
if (isDevelopment) {
  // Override the getUser method in development
  const originalGetUser = supabase.auth.getUser;
  supabase.auth.getUser = async () => {
    return {
      data: {
        user: mockUser
      },
      error: null
    };
  };
}

const useBookStore = create(
  persist(
    (set, get) => ({
      books: [],
      selectedBook: null,
      actionableItems: null,
      isLoading: false,
      error: null,

      // Initialize books from Supabase
      initializeBooks: async () => {
        try {
          const { data, error } = await supabase
            .from('books')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;
          set({ books: data || [] });
        } catch (error) {
          console.error('Error loading books:', error);
          set({ error: error.message });
        }
      },

      setSelectedBook: (book) => {
        console.log('Setting selected book:', book);
        set({ selectedBook: book });
      },

      addBook: async (book) => {
        set({ isLoading: true });
        try {
          let userId;
          
          // Get the actual user from Supabase
          const { data: { user }, error: authError } = await supabase.auth.getUser();
          
          if (authError) {
            console.error('Auth error:', authError);
            throw new Error('Authentication error');
          }
          
          if (!user) {
            console.error('No user found');
            throw new Error('User not authenticated');
          }
          
          console.log('Adding book with user ID:', user.id);
          userId = user.id;

          // Clean up any empty strings in date fields
          const cleanBook = {
            ...book,
            start_date: book.start_date || null,
            last_read_date: book.last_read_date || null,
            completed_date: book.completed_date || null,
            last_ai_analysis: null
          };

          const newBook = {
            ...cleanBook,
            user_id: userId,
            current_page: cleanBook.current_page || 0,
            progress: cleanBook.progress || 0,
            categories: Array.isArray(cleanBook.categories)
              ? cleanBook.categories
              : (typeof cleanBook.categories === 'string' && cleanBook.categories.trim() === '')
                ? []
                : (cleanBook.categories ? [cleanBook.categories] : []),
            custom_categories: Array.isArray(cleanBook.custom_categories)
              ? cleanBook.custom_categories
              : (typeof cleanBook.custom_categories === 'string' && cleanBook.custom_categories.trim() === '')
                ? []
                : (cleanBook.custom_categories ? [cleanBook.custom_categories] : []),
            reading_sessions: Array.isArray(cleanBook.reading_sessions)
              ? cleanBook.reading_sessions
              : (typeof cleanBook.reading_sessions === 'string' && cleanBook.reading_sessions.trim() === '')
                ? []
                : (cleanBook.reading_sessions ? [cleanBook.reading_sessions] : []),
            notes: Array.isArray(cleanBook.notes)
              ? cleanBook.notes
              : (typeof cleanBook.notes === 'string' && cleanBook.notes.trim() === '')
                ? []
                : (cleanBook.notes ? [cleanBook.notes] : []),
            rating: Array.isArray(cleanBook.rating)
              ? cleanBook.rating
              : (typeof cleanBook.rating === 'string' && cleanBook.rating.trim() === '')
                ? []
                : (cleanBook.rating ? [cleanBook.rating] : []),
            actionable_items_text: cleanBook.actionable_items_text || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          console.log('Attempting to insert book:', newBook);

          // Try the insert with a simpler query
          const { data, error } = await supabase
            .from('books')
            .insert(newBook)
            .select();

          console.log('Supabase insert response:', { data, error });

          if (error) {
            console.error('Supabase error details:', {
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code
            });
            throw error;
          }

          if (!data || data.length === 0) {
            console.error('No data returned from insert');
            throw new Error('Failed to insert book: No data returned');
          }

          console.log('Successfully added book:', data[0]);

          set((state) => ({
            books: [data[0], ...state.books],
            isLoading: false,
            error: null
          }));
        } catch (error) {
          console.error('Error adding book:', error);
          set({ isLoading: false, error: error.message });
        }
      },

      updateBook: async (id, updatedBook) => {
        set({ isLoading: true });
        try {
          const bookUpdate = {
            ...updatedBook,
            start_date: updatedBook.start_date || null,
            last_read_date: updatedBook.last_read_date || null,
            completed_date: updatedBook.completed_date || null,
            categories: Array.isArray(updatedBook.categories)
              ? updatedBook.categories
              : (typeof updatedBook.categories === 'string' && updatedBook.categories.trim() === '')
                ? []
                : (updatedBook.categories ? [updatedBook.categories] : []),
            custom_categories: Array.isArray(updatedBook.custom_categories)
              ? updatedBook.custom_categories
              : (typeof updatedBook.custom_categories === 'string' && updatedBook.custom_categories.trim() === '')
                ? []
                : (updatedBook.custom_categories ? [updatedBook.custom_categories] : []),
            reading_sessions: Array.isArray(updatedBook.reading_sessions)
              ? updatedBook.reading_sessions
              : (typeof updatedBook.reading_sessions === 'string' && updatedBook.reading_sessions.trim() === '')
                ? []
                : (updatedBook.reading_sessions ? [updatedBook.reading_sessions] : []),
            notes: Array.isArray(updatedBook.notes)
              ? updatedBook.notes
              : (typeof updatedBook.notes === 'string' && updatedBook.notes.trim() === '')
                ? []
                : (updatedBook.notes ? [updatedBook.notes] : []),
            rating: Array.isArray(updatedBook.rating)
              ? updatedBook.rating
              : (typeof updatedBook.rating === 'string' && updatedBook.rating.trim() === '')
                ? []
                : (updatedBook.rating ? [updatedBook.rating] : []),
            actionable_items_text: typeof updatedBook.actionable_items_text === 'string' ? updatedBook.actionable_items_text : ''
          };

          const { data, error } = await supabase
            .from('books')
            .update(bookUpdate)
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;

          set((state) => ({
            books: state.books.map((book) => 
              book.id === id ? { ...book, ...data } : book
            ),
            selectedBook: state.selectedBook?.id === id ? { ...state.selectedBook, ...data } : state.selectedBook,
            isLoading: false,
            error: null
          }));
        } catch (error) {
          console.error('Error updating book:', error);
          set({ isLoading: false, error: error.message });
        }
      },

      deleteBook: async (id) => {
        set({ isLoading: true });
        try {
          const { error } = await supabase
            .from('books')
            .delete()
            .eq('id', id);

          if (error) throw error;

          set((state) => ({
            books: state.books.filter((book) => book.id !== id),
            selectedBook: state.selectedBook?.id === id ? null : state.selectedBook,
            isLoading: false,
            error: null
          }));
        } catch (error) {
          console.error('Error deleting book:', error);
          set({ isLoading: false, error: error.message });
        }
      },

      getActionableItems: async (book) => {
        set({ isLoading: true });
        try {
          console.log('Getting actionable items for book:', book);

          // Call the webhook to get actionable items
          const response = await fetch('https://n8n.srv758866.hstgr.cloud/webhook/0c6fdf35-fd4b-408b-9b73-b225950031ae', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              message: {
                content: {
                  title: book.title,
                  author: book.author,
                  synopsis: book.synopsis,
                  notes: book.notes
                }
              },
              timestamp: new Date().toISOString()
            }),
            mode: 'cors',
            credentials: 'omit'
          });

          console.log('Response status:', response.status);
          console.log('Response headers:', Object.fromEntries(response.headers.entries()));

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`Failed to get actionable items: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          console.log('Webhook response:', data);
          console.log('Response data type:', typeof data);
          console.log('Response data keys:', Object.keys(data));

          let actionableItemsText = '';
          try {
            console.log('Checking data.myField:', data.myField);
            if (data.myField) {
              actionableItemsText = data.myField;
            } else if (data.content) {
              actionableItemsText = data.content;
            } else if (typeof data === 'string') {
              actionableItemsText = data;
            } else {
              console.log('No expected field found in response, using raw data:', data);
              actionableItemsText = JSON.stringify(data);
            }
          } catch (parseError) {
            console.error('Error parsing actionable items text:', parseError);
            actionableItemsText = 'No actionable items found';
          }

          if (!actionableItemsText) {
            actionableItemsText = 'No actionable items were generated. Please try again.';
          }

          console.log('Processed actionable items text:', actionableItemsText);

          // Update the book in Supabase with the new actionable items text
          const updatePayload = { 
            actionable_items_text: actionableItemsText,
            last_ai_analysis: new Date().toISOString()
          };
          console.log('Book ID being used for update:', book.id);
          console.log('Updating book in Supabase:', {
            bookId: book.id,
            payload: updatePayload
          });

          // First verify the book exists
          const { data: existingBook, error: fetchError } = await supabase
            .from('books')
            .select('*')
            .eq('id', book.id)
            .single();

          console.log('Existing book data:', existingBook);
          if (fetchError) {
            console.error('Error fetching existing book:', fetchError);
            throw fetchError;
          }

          const { data: updateData, error: updateError } = await supabase
            .from('books')
            .update(updatePayload)
            .eq('id', book.id)
            .select()
            .single();

          console.log('Supabase update response:', { updateData, updateError });

          if (updateError) {
            console.error('Error saving actionable items to Supabase:', updateError);
            set({ isLoading: false, error: 'Failed to save actionable items: ' + updateError.message });
            throw updateError;
          }

          console.log('Successfully saved actionable items to Supabase');

          // Find the updated book object
          const updatedBook = {
            ...book,
            ...updateData // Use the data returned from Supabase
          };

          console.log('Final updated book object:', updatedBook);

          set((state) => {
            const updatedBooks = state.books.map((b) => 
              b.id === book.id 
                ? updatedBook
                : b
            );
            return {
              books: updatedBooks,
              selectedBook: updatedBook,
              isLoading: false,
              error: null
            };
          });
        } catch (error) {
          console.error('Error getting actionable items:', error);
          set({ isLoading: false, error: error.message });
        }
      },

      updateActionableItem: async (bookId, itemId, updates) => {
        set({ isLoading: true });
        try {
          const book = get().books.find(b => b.id === bookId);
          if (!book) throw new Error('Book not found');

          const updatedItems = (book.actionable_items || []).map(item => 
            item.id === itemId 
              ? { 
                  ...item, 
                  ...updates,
                  completedAt: updates.completed ? new Date().toISOString() : null
                }
              : item
          );

          const { error: updateError } = await supabase
            .from('books')
            .update({ actionable_items: updatedItems })
            .eq('id', bookId);

          if (updateError) throw updateError;

          set((state) => ({
            books: state.books.map((b) => 
              b.id === bookId 
                ? { ...b, actionable_items: updatedItems }
                : b
            ),
            selectedBook: state.selectedBook?.id === bookId
              ? { ...state.selectedBook, actionable_items: updatedItems }
              : state.selectedBook,
            isLoading: false,
            error: null
          }));
        } catch (error) {
          console.error('Error updating actionable item:', error);
          set({ isLoading: false, error: error.message });
        }
      },

      deleteActionableItem: async (bookId, itemId) => {
        set({ isLoading: true });
        try {
          const book = get().books.find(b => b.id === bookId);
          if (!book) throw new Error('Book not found');

          const updatedItems = (book.actionable_items || []).filter(item => item.id !== itemId);

          const { error: updateError } = await supabase
            .from('books')
            .update({ actionable_items: updatedItems })
            .eq('id', bookId);

          if (updateError) throw updateError;

          set((state) => ({
            books: state.books.map((b) => 
              b.id === bookId 
                ? { ...b, actionable_items: updatedItems }
                : b
            ),
            selectedBook: state.selectedBook?.id === bookId
              ? { ...state.selectedBook, actionable_items: updatedItems }
              : state.selectedBook,
            isLoading: false,
            error: null
          }));
        } catch (error) {
          console.error('Error deleting actionable item:', error);
          set({ isLoading: false, error: error.message });
        }
      },

      clearActionableItems: () => set({ actionableItems: null }),
      
      clearError: () => set({ error: null })
    }),
    {
      name: 'book-storage',
      partialize: (state) => ({
        books: state.books,
        selectedBook: state.selectedBook
      })
    }
  )
);

export default useBookStore; 