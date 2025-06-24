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
          // Get the current user
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (userError || !user) {
            console.error('No authenticated user found:', userError);
            set({ isLoading: false, error: 'Not signed in' });
            return undefined;
          }

          const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
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
          return data;
        } catch (error) {
          console.error('Error fetching tasks:', error);
          set({ isLoading: false, error: error.message });
          return undefined;
        }
      },
      // Placeholder for Google Tasks fetch
      fetchGoogleTasks: async () => {
        // TODO: Implement Google Tasks integration
        // set((state) => ({ allTasks: [...state.allTasks, ...googleTasks] }));
      },
      // Add a manual task
      addTask: async (task) => {
        console.log('Starting addTask in taskStore with:', task);
        set({ isLoading: true });
        try {
          // Get the current user
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          console.log('Auth check result:', { user, userError });
          
          if (userError || !user) {
            console.error('No authenticated user found:', userError);
            set({ isLoading: false, error: 'Not signed in' });
            return undefined;
          }
          
          // Validate required fields
          if (!task.title) {
            console.error('Title is missing from task data');
            throw new Error('Title is required');
          }

          // Validate status and priority values
          const validStatuses = ['todo', 'in_progress', 'done'];
          const validPriorities = ['low', 'medium', 'high'];
          
          if (task.status && !validStatuses.includes(task.status)) {
            console.error('Invalid status:', task.status);
            throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
          }
          
          if (task.priority && !validPriorities.includes(task.priority)) {
            console.error('Invalid priority:', task.priority);
            throw new Error(`Invalid priority. Must be one of: ${validPriorities.join(', ')}`);
          }
          
          const taskData = {
            title: task.title,
            description: task.description || null,
            status: task.status || 'todo',
            priority: task.priority || 'medium',
            category: task.category || 'Other',
            due_date: task.due_date || null,
            project_id: task.project_id || null,
            user_id: user.id,
            source: 'supabase',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          console.log('Attempting to insert task with data:', taskData);
          
          const { data, error } = await supabase
            .from('tasks')
            .insert([taskData])
            .select()
            .single();
            
          if (error) {
            console.error('Supabase insert error:', {
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
          // Get the current user
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (userError || !user) {
            console.error('No authenticated user found:', userError);
            set({ isLoading: false, error: 'Not signed in' });
            return undefined;
          }

          // First verify the task belongs to the user
          const { data: existingTask, error: fetchError } = await supabase
            .from('tasks')
            .select('*')
            .eq('id', id)
            .single();

          if (fetchError) throw fetchError;
          if (!existingTask) throw new Error('Task not found');
          if (existingTask.user_id !== user.id) throw new Error('Unauthorized to update this task');

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
          return data;
        } catch (error) {
          console.error('Error updating task:', error);
          set({ isLoading: false, error: error.message });
          return undefined;
        }
      },
      // Delete a task
      deleteTask: async (id) => {
        set({ isLoading: true });
        try {
          // Get the current user
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (userError || !user) {
            console.error('No authenticated user found:', userError);
            set({ isLoading: false, error: 'Not signed in' });
            return undefined;
          }

          // First verify the task belongs to the user
          const { data: existingTask, error: fetchError } = await supabase
            .from('tasks')
            .select('*')
            .eq('id', id)
            .single();

          if (fetchError) throw fetchError;
          if (!existingTask) throw new Error('Task not found');
          if (existingTask.user_id !== user.id) throw new Error('Unauthorized to delete this task');

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
          return true;
        } catch (error) {
          console.error('Error deleting task:', error);
          set({ isLoading: false, error: error.message });
          return undefined;
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