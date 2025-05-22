import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useReadingStore = create(
  persist(
    (set) => ({
      currentBook: null,
      readingHistory: [],
      readingStats: {
        totalBooksRead: 0,
        totalPagesRead: 0,
        averagePagesPerDay: 0,
        readingStreak: 0,
        lastReadDate: null
      },
      setCurrentBook: (book) => set((state) => {
        // If there's a current book, add it to history
        const history = state.currentBook 
          ? [state.currentBook, ...state.readingHistory].slice(0, 10)
          : state.readingHistory;
          
        return {
          currentBook: { 
            ...book,
            id: crypto.randomUUID(),
            startDate: new Date().toISOString(),
            progress: 0,
            totalPages: book.totalPages || 0,
            notes: [],
            readingSessions: [],
            lastReadDate: new Date().toISOString()
          },
          readingHistory: history
        };
      }),
      updateProgress: (progress, totalPages, notes) => set((state) => {
        if (!state.currentBook) return state;

        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const lastReadDate = new Date(state.currentBook.lastReadDate);
        const isNewDay = today !== lastReadDate.toISOString().split('T')[0];
        
        // Update reading streak
        let { readingStreak } = state.readingStats;
        if (isNewDay) {
          const daysSinceLastRead = Math.floor((now - lastReadDate) / (1000 * 60 * 60 * 24));
          readingStreak = daysSinceLastRead === 1 ? readingStreak + 1 : 1;
        }

        // Calculate pages read in this update
        const pagesRead = progress - state.currentBook.progress;
        
        // Update reading sessions
        const sessions = [...(state.currentBook.readingSessions || [])];
        if (pagesRead > 0) {
          sessions.push({
            date: now.toISOString(),
            pagesRead,
            duration: 0 // Could be calculated if we track session start/end
          });
        }

        return {
          currentBook: { 
            ...state.currentBook,
            progress: Math.min(totalPages, Math.max(0, progress)),
            totalPages,
            notes: notes || state.currentBook.notes,
            readingSessions: sessions,
            lastReadDate: now.toISOString()
          },
          readingStats: {
            ...state.readingStats,
            totalPagesRead: state.readingStats.totalPagesRead + Math.max(0, pagesRead),
            readingStreak,
            lastReadDate: now.toISOString(),
            averagePagesPerDay: Math.round(
              (state.readingStats.totalPagesRead + Math.max(0, pagesRead)) / 
              (readingStreak || 1)
            )
          }
        };
      }),
      completeBook: () => set((state) => {
        if (!state.currentBook) return state;
        
        const completedBook = {
          ...state.currentBook,
          completed: true,
          completedDate: new Date().toISOString()
        };

        return {
          currentBook: null,
          readingHistory: [completedBook, ...state.readingHistory].slice(0, 10),
          readingStats: {
            ...state.readingStats,
            totalBooksRead: state.readingStats.totalBooksRead + 1
          }
        };
      }),
      getReadingStats: (state) => () => {
        const { readingStats } = state;
        const currentStreak = readingStats.readingStreak;
        const lastReadDate = new Date(readingStats.lastReadDate);
        const today = new Date();
        const daysSinceLastRead = Math.floor((today - lastReadDate) / (1000 * 60 * 60 * 24));
        
        // If more than a day has passed since last reading, reset streak
        if (daysSinceLastRead > 1) {
          set((state) => ({
            readingStats: {
              ...state.readingStats,
              readingStreak: 0
            }
          }));
          return { ...readingStats, readingStreak: 0 };
        }
        
        return readingStats;
      }
    }),
    {
      name: 'reading-storage',
    }
  )
);

export default useReadingStore; 