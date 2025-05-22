import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

const useGoalsStore = create(
  persist(
    (set, get) => ({
      goals: [],
      templates: [],
      categories: ['Personal', 'Work', 'Health', 'Learning', 'Financial'],
      isLoading: false,
      error: null,

      fetchGoals: async () => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase
            .from('goals')
            .select('*')
   
            .order('created_at', { ascending: false });
          if (error) throw error;
          set({ goals: data || [], isLoading: false, error: null });
        } catch (error) {
          set({ isLoading: false, error: error.message });
        }
      },

      addGoal: async (goal) => {
        set({ isLoading: true });
        try {
          console.log('Attempting to add goal:', goal);
          const { data, error } = await supabase
            .from('goals')
            .insert([{
              title: goal.title,
              description: goal.description,
              priority: goal.priority,
              due_date: goal.dueDate,
                  progress: 0,
              status: goal.status || 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              dependencies: goal.dependencies || [],
              category: goal.category || 'Personal',
              tags: goal.tags || [],
              analytics: {
                startDate: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                timeSpent: 0,
                milestonesCompleted: 0,
                totalMilestones: goal.milestones?.length || 0
              }
            }])
            .select()
            .single();
          console.log('Supabase response:', { data, error });
          if (error) {
            console.error('Supabase error details:', {
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code
            });
            throw error;
          }
          set((state) => ({
            goals: [data, ...state.goals],
            isLoading: false,
            error: null
          }));
          return data;
        } catch (error) {
          console.error('Error adding goal:', {
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

      updateGoal: async (id, updates) => {
        set({ isLoading: true });
        try {
          console.log('Sending update request to Supabase:', { id, updates });
          const { data, error } = await supabase
            .from('goals')
            .update({
              title: updates.title,
              description: updates.description,
              priority: updates.priority,
              due_date: updates.dueDate,
              status: updates.status || 'active',
              updated_at: new Date().toISOString(),
              milestones: updates.milestones,
              dependencies: updates.dependencies,
              category: updates.category,
              tags: updates.tags,
              analytics: updates.analytics
                ? { ...updates.analytics, lastUpdated: new Date().toISOString() }
                : undefined
            })
            .eq('id', id)
            .select()
            .single();
          console.log('Supabase update response:', { data, error });
          if (error) throw error;
          set((state) => ({
            goals: state.goals.map((g) => (g.id === id ? data : g)),
            isLoading: false,
            error: null
          }));
          return data;
        } catch (error) {
          console.error('Error updating goal:', error);
          set({ isLoading: false, error: error.message });
          return undefined;
        }
      },

      deleteGoal: async (id) => {
        set({ isLoading: true });
        try {
          const { error } = await supabase
            .from('goals')
            .delete()
            .eq('id', id);
          if (error) throw error;
          set((state) => ({
            goals: state.goals.filter((g) => g.id !== id),
            isLoading: false,
            error: null
          }));
        } catch (error) {
          set({ isLoading: false, error: error.message });
        }
      },

      updateProgress: async (id, progress) => {
        const goal = get().goals.find(g => g.id === id);
        if (!goal) return;

        const completedMilestones = goal.milestones?.filter(m => m.completed).length || 0;
        const totalMilestones = goal.milestones?.length || 0;

        await get().updateGoal(id, {
          ...goal,
          progress: Math.min(100, Math.max(0, progress)),
          analytics: {
            ...goal.analytics,
            milestonesCompleted: completedMilestones,
            totalMilestones,
            lastUpdated: new Date().toISOString()
          }
        });
      },

      addDependency: async (goalId, dependencyId) => {
        const goal = get().goals.find(g => g.id === goalId);
        if (!goal) return;

        const dependencies = [...(goal.dependencies || []), dependencyId];
        await get().updateGoal(goalId, { dependencies });
      },

      removeDependency: async (goalId, dependencyId) => {
        const goal = get().goals.find(g => g.id === goalId);
        if (!goal) return;

        const dependencies = (goal.dependencies || []).filter(id => id !== dependencyId);
        await get().updateGoal(goalId, { dependencies });
      },

      addCategory: (category) => set((state) => ({
        categories: [...new Set([...state.categories, category])]
      })),

      saveAsTemplate: async (goalId) => {
        const goal = get().goals.find(g => g.id === goalId);
        if (!goal) return;

        const template = {
          ...goal,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          isTemplate: true
        };

        set((state) => ({
          templates: [template, ...state.templates]
        }));
      },

      createFromTemplate: async (templateId) => {
        const template = get().templates.find(t => t.id === templateId);
        if (!template) return;

        const newGoal = {
          ...template,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          isTemplate: false,
          progress: 0,
          status: 'active',
          analytics: {
            startDate: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            timeSpent: 0,
            milestonesCompleted: 0,
            totalMilestones: template.milestones?.length || 0
          }
        };

        await get().addGoal(newGoal);
      },

      getGoalsByCategory: (category) => {
        return get().goals.filter(g => g.category === category);
      },

      getGoalsByTag: (tag) => {
        return get().goals.filter(g => g.tags?.includes(tag));
      },

      getDependentGoals: (goalId) => {
        return get().goals.filter(g => g.dependencies?.includes(goalId));
      },

      getGoalAnalytics: (goalId) => {
        const goal = get().goals.find(g => g.id === goalId);
        if (!goal) return null;

        const startDate = new Date(goal.analytics.startDate);
        const now = new Date();
        const daysActive = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
        const progressPerDay = daysActive > 0 ? goal.progress / daysActive : 0;
        const estimatedCompletion = progressPerDay > 0 
          ? new Date(now.getTime() + ((100 - goal.progress) / progressPerDay) * 24 * 60 * 60 * 1000)
          : null;

        return {
          ...goal.analytics,
          daysActive,
          progressPerDay,
          estimatedCompletion,
          milestoneCompletionRate: goal.analytics.totalMilestones > 0
            ? (goal.analytics.milestonesCompleted / goal.analytics.totalMilestones) * 100
            : 0
        };
      },

      clearError: () => set({ error: null }),

      handleSaveEdit: async (goalId) => {
        console.log('handleSaveEdit called for goalId:', goalId, editForm);
        if (!editForm.title.trim()) return;
        // ...rest of the code
      }
    }),
    {
      name: 'goals-storage',
      partialize: (state) => ({
        goals: state.goals,
        templates: state.templates,
        categories: state.categories
      })
    }
  )
);

export default useGoalsStore; 