import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

const useProjectStore = create(
  persist(
    (set, get) => ({
      projects: [],
      isLoading: false,
      error: null,
      // Fetch projects from Supabase
      fetchProjects: async () => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });
          if (error) throw error;
          set({ projects: data || [], isLoading: false, error: null });
        } catch (error) {
          set({ isLoading: false, error: error.message });
        }
      },
      // Add a new project
      addProject: async (project) => {
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
            .from('projects')
            .insert([{
              ...project,
              user_id: user.id,
              progress: 0,
              status: project.status || 'planning',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }])
            .select()
            .single();
          if (error) throw error;
          set((state) => ({
            projects: [data, ...state.projects],
            isLoading: false,
            error: null
          }));
          return data;
        } catch (error) {
          set({ isLoading: false, error: error.message });
          return undefined;
        }
      },
      // Update a project
      updateProject: async (id, updates) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase
            .from('projects')
            .update({
              ...updates,
              updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();
          if (error) throw error;
          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === id ? data : p
            ),
            isLoading: false,
            error: null
          }));
        } catch (error) {
          set({ isLoading: false, error: error.message });
        }
      },
      // Delete a project
      deleteProject: async (id) => {
        set({ isLoading: true });
        try {
          const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);
          if (error) throw error;
          set((state) => ({
            projects: state.projects.filter((p) => p.id !== id),
            isLoading: false,
            error: null
          }));
        } catch (error) {
          set({ isLoading: false, error: error.message });
        }
      },
      updateProjectProgress: async (id, progress) => {
        const project = get().projects.find(p => p.id === id);
        if (!project) return;

        await get().updateProject(id, {
          ...project,
          progress: Math.min(100, Math.max(0, progress))
        });
      },
      getProjectsByGoal: (goalId) => {
        return get().projects.filter(p => p.goalId === goalId);
      },
      getUnlinkedProjects: () => {
        return get().projects.filter(p => !p.goalId);
      },
      clearError: () => set({ error: null })
    }),
    {
      name: 'project-storage',
      partialize: (state) => ({ projects: state.projects })
    }
  )
);

export default useProjectStore; 