import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useBookNotesStore = create(
  persist(
    (set, get) => ({
      notes: {},
      setNote: (bookId, note) =>
        set((state) => ({
          notes: {
            ...state.notes,
            [bookId]: note,
          },
        })),
      getNote: (bookId) => get().notes[bookId] || '',
      deleteNote: (bookId) =>
        set((state) => {
          const newNotes = { ...state.notes };
          delete newNotes[bookId];
          return { notes: newNotes };
        }),
    }),
    {
      name: 'book-notes-storage',
    }
  )
);

export default useBookNotesStore; 