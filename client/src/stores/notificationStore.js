import { create } from 'zustand';
import useCalendarStore from './calendarStore';
import useTaskStore from './taskStore';
import useBookStore from './bookStore';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  loading: false,
  error: null,

  setNotifications: (notifications) => set({ notifications }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Fetch notifications from all sources
  fetchNotifications: async () => {
    set({ loading: true, error: null });
    try {
      const allNotifications = [];

      // Get calendar notifications
      const calendarEvents = await getCalendarNotifications();
      allNotifications.push(...calendarEvents);

      // Get task notifications
      const taskNotifications = await getTaskNotifications();
      allNotifications.push(...taskNotifications);

      // Get reading notifications
      const readingNotifications = await getReadingNotifications();
      allNotifications.push(...readingNotifications);

      // Sort notifications by time
      allNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      set({ notifications: allNotifications, loading: false });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      set({ error: error.message, loading: false });
    }
  },

  // Mark notification as read
  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    }));
  },

  // Mark all notifications as read
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map(notification => ({
        ...notification,
        read: true
      }))
    }));
  },

  // Delete a notification
  deleteNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter(notification => notification.id !== id)
    }));
  },

  // Clear all notifications
  clearAll: () => {
    set({ notifications: [] });
  }
}));

// Helper function to get calendar notifications
const getCalendarNotifications = async () => {
  const calendarStore = useCalendarStore.getState();
  const events = calendarStore.events;
  
  return events
    .filter(event => {
      const eventDate = new Date(event.start);
      const now = new Date();
      const diffHours = (eventDate - now) / (1000 * 60 * 60);
      return diffHours > 0 && diffHours <= 24; // Events in next 24 hours
    })
    .map(event => ({
      id: `calendar-${event.id}`,
      type: 'calendar',
      priority: 'high',
      title: 'Upcoming Event',
      message: `${event.title} is scheduled for ${new Date(event.start).toLocaleTimeString()}`,
      timestamp: new Date(event.start),
      read: false,
      data: event
    }));
};

// Helper function to get task notifications
const getTaskNotifications = async () => {
  const taskStore = useTaskStore.getState();
  const tasks = taskStore.allTasks;
  
  return tasks
    .filter(task => {
      if (task.status === 'done') return false;
      const dueDate = new Date(task.due_date);
      const now = new Date();
      const diffHours = (dueDate - now) / (1000 * 60 * 60);
      return diffHours > 0 && diffHours <= 24; // Tasks due in next 24 hours
    })
    .map(task => ({
      id: `task-${task.id}`,
      type: 'task',
      priority: task.priority || 'medium',
      title: 'Task Due Soon',
      message: `${task.title} is due ${new Date(task.due_date).toLocaleTimeString()}`,
      timestamp: new Date(task.due_date),
      read: false,
      data: task
    }));
};

// Helper function to get reading notifications
const getReadingNotifications = async () => {
  const bookStore = useBookStore.getState();
  const currentBook = bookStore.currentBook;
  
  if (!currentBook) return [];

  const notifications = [];
  
  // Add reading goal notification if behind
  if (currentBook.readingGoal && currentBook.pagesRead < currentBook.readingGoal) {
    const pagesBehind = currentBook.readingGoal - currentBook.pagesRead;
    if (pagesBehind > 0) {
      notifications.push({
        id: `reading-${currentBook.id}`,
        type: 'reading',
        priority: 'medium',
        title: 'Reading Goal',
        message: `You're ${pagesBehind} pages behind your daily reading goal`,
        timestamp: new Date(),
        read: false,
        data: currentBook
      });
    }
  }

  return notifications;
};

export default useNotificationStore; 