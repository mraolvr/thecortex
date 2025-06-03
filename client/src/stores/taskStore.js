import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

const useTaskStore = create(
  persist(
    (set, get) => ({
      allTasks: [],
      isLoading: false,
      error: null,
      groupBy: 'project',
      filterBy: 'all',
      // Fetch tasks from Supabase
      fetchSupabaseTasks: async () => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('due_date', { ascending: true });
          if (error) throw error;
          set((state) => ({
            allTasks: [
              ...state.allTasks.filter(t => t.source !== 'supabase'),
              ...(data || []).map(task => ({ ...task, source: 'supabase' }))
            ],
            isLoading: false,
            error: null
          }));
        } catch (error) {
          set({ isLoading: false, error: error.message });
        }
      },
      // Placeholder for Google Tasks fetch
      fetchGoogleTasks: async () => {
        // TODO: Implement Google Tasks integration
        // set((state) => ({ allTasks: [...state.allTasks, ...googleTasks] }));
      },
      // Add a manual task
      addTask: async (task) => {
        set({ isLoading: true });
        try {
          // Get the current user
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (userError || !user) {
            console.error('No authenticated user found:', userError);
            set({ isLoading: false, error: 'Not signed in' });
            return undefined;
          }
          console.log('User authenticated:', user.id);
          
          // Log the incoming task data
          console.log('Incoming task data:', task);
          
          const taskData = {
            ...task,
            user_id: user.id,
            source: 'supabase',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          // Log the formatted task data
          console.log('Formatted task data being sent to Supabase:', taskData);
          
          const { data, error } = await supabase
            .from('tasks')
            .insert([taskData])
            .select()
            .single();
            
          if (error) {
            console.error('Supabase error details:', {
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code
            });
            throw error;
          }
          
          console.log('Task successfully created:', data);
          
          set((state) => ({
            allTasks: [...state.allTasks, { ...data, source: 'supabase' }],
            isLoading: false,
            error: null
          }));
          return data;
        } catch (error) {
          console.error('Error in addTask:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
            stack: error.stack
          });
          set({ isLoading: false, error: error.message });
          return undefined;
        }
      },
      // Update a task
      updateTask: async (id, updates) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase
            .from('tasks')
            .update({
              ...updates,
              updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();
          if (error) throw error;
          set((state) => ({
            allTasks: state.allTasks.map(t => t.id === id ? { ...t, ...data } : t),
            isLoading: false,
            error: null
          }));
        } catch (error) {
          set({ isLoading: false, error: error.message });
        }
      },
      // Delete a task
      deleteTask: async (id) => {
        set({ isLoading: true });
        try {
          const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id);
          if (error) throw error;
          set((state) => ({
            allTasks: state.allTasks.filter(t => t.id !== id),
            isLoading: false,
            error: null
          }));
        } catch (error) {
          set({ isLoading: false, error: error.message });
        }
      },
      // Group and filter logic
      setGroupBy: (groupBy) => set({ groupBy }),
      setFilterBy: (filterBy) => set({ filterBy }),
      // Task relationship helpers
      getTasksByProject: (projectId) => {
        return get().allTasks.filter(t => t.projectId === projectId);
      },
      getTasksByGoal: (goalId) => {
        return get().allTasks.filter(t => t.goalId === goalId);
      },
      getUnlinkedTasks: () => {
        return get().allTasks.filter(t => !t.projectId);
      },
      linkTaskToProject: async (taskId, projectId) => {
        const task = get().allTasks.find(t => t.id === taskId);
        if (!task) return;

        await get().updateTask(taskId, {
          ...task,
          projectId,
          goalId: task.goalId // Preserve goal relationship if it exists
        });
      },
      unlinkTaskFromProject: async (taskId) => {
        const task = get().allTasks.find(t => t.id === taskId);
        if (!task) return;

        await get().updateTask(taskId, {
          ...task,
          projectId: null
        });
      },
      clearError: () => set({ error: null })
    }),
    {
      name: 'task-storage',
      partialize: (state) => ({ allTasks: state.allTasks })
    }
  )
);

export default useTaskStore; 