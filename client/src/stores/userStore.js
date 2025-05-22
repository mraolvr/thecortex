import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      preferences: {
        theme: 'system',
        notifications: true,
        showMotivationalQuotes: true
      },
      setUser: (userData) => set({ user: userData }),
      updatePreferences: (updates) => set((state) => ({
        preferences: { ...state.preferences, ...updates }
      })),
      lastActivity: null,
      updateLastActivity: () => set({ lastActivity: new Date().toISOString() }),
      dailyGoals: {
        tasksCompleted: 0,
        pagesRead: 0,
        focusTime: 0
      },
      updateDailyGoals: (updates) => set((state) => ({
        dailyGoals: { ...state.dailyGoals, ...updates }
      })),
      resetDailyGoals: () => set((state) => ({
        dailyGoals: {
          tasksCompleted: 0,
          pagesRead: 0,
          focusTime: 0
        }
      }))
    }),
    {
      name: 'user-storage',
    }
  )
);

export default useUserStore; 