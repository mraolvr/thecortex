import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useTasksStore = create(
  persist(
    (set) => ({
      tasks: [],
      categories: ['Personal', 'Work', 'Study', 'Health', 'Other'],
      addCategory: (category) => set((state) => ({
        categories: [...new Set([...state.categories, category])]
      })),
      addTask: (task) => set((state) => ({ 
        tasks: [...state.tasks, { 
          ...task, 
          id: crypto.randomUUID(),
          completed: false,
          createdAt: new Date().toISOString(),
          category: task.category || 'Other',
          priority: task.priority || 'medium',
          dueDate: task.dueDate || null
        }] 
      })),
      toggleTask: (taskId) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === taskId ? { 
            ...task, 
            completed: !task.completed,
            completedAt: !task.completed ? new Date().toISOString() : null
          } : task
        ),
      })),
      deleteTask: (taskId) => set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== taskId),
      })),
      editTask: (taskId, updates) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === taskId ? { ...task, ...updates } : task
        ),
      })),
      getTasksByCategory: (state) => (category) => {
        return state.tasks.filter(task => task.category === category);
      },
      getTasksByPriority: (state) => (priority) => {
        return state.tasks.filter(task => task.priority === priority);
      },
      getOverdueTasks: (state) => () => {
        const now = new Date();
        return state.tasks.filter(task => 
          task.dueDate && new Date(task.dueDate) < now && !task.completed
        );
      },
      getDueTodayTasks: (state) => () => {
        const today = new Date().toISOString().split('T')[0];
        return state.tasks.filter(task => 
          task.dueDate && task.dueDate.startsWith(today) && !task.completed
        );
      }
    }),
    {
      name: 'tasks-storage',
    }
  )
);

export default useTasksStore; 