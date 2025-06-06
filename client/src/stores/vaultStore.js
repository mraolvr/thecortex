import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

const useVaultStore = create(
  persist(
    (set, get) => ({
      vaultItems: [],
      isLoading: false,
      error: null,

      fetchVaultItems: async () => {
        set({ isLoading: true });
        try {
          // Get the current user
          const { data: { user }, error: authError } = await supabase.auth.getUser();
          
          if (authError) {
            console.error('Auth error:', authError);
            throw new Error('Authentication error');
          }
          
          if (!user) {
            console.error('No user found');
            throw new Error('User not authenticated');
          }

          console.log('Fetching vault items for user:', user.id);
          const { data, error } = await supabase
            .from('vault_items')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) throw error;
          set({ vaultItems: data || [], isLoading: false, error: null });
        } catch (error) {
          console.error('Error fetching vault items:', error);
          set({ isLoading: false, error: error.message });
        }
      },

      addVaultItem: async (item) => {
        set({ isLoading: true });
        try {
          // Get the current user
          const { data: { user }, error: authError } = await supabase.auth.getUser();
          
          if (authError) {
            console.error('Auth error:', authError);
            throw new Error('Authentication error');
          }
          
          if (!user) {
            console.error('No user found');
            throw new Error('User not authenticated');
          }

          const { data, error } = await supabase
            .from('vault_items')
            .insert([{
              ...item,
              user_id: user.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }])
            .select()
            .single();

          if (error) throw error;
          set((state) => ({
            vaultItems: [data, ...state.vaultItems],
            isLoading: false,
            error: null
          }));
          return data;
        } catch (error) {
          console.error('Error adding vault item:', error);
          set({ isLoading: false, error: error.message });
          return undefined;
        }
      },

      updateVaultItem: async (id, updates) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase
            .from('vault_items')
            .update({
              ...updates,
              updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;
          set((state) => ({
            vaultItems: state.vaultItems.map(item => 
              item.id === id ? { ...item, ...data } : item
            ),
            isLoading: false,
            error: null
          }));
          return data;
        } catch (error) {
          console.error('Error updating vault item:', error);
          set({ isLoading: false, error: error.message });
          return undefined;
        }
      },

      deleteVaultItem: async (id) => {
        set({ isLoading: true });
        try {
          const { error } = await supabase
            .from('vault_items')
            .delete()
            .eq('id', id);

          if (error) throw error;
          set((state) => ({
            vaultItems: state.vaultItems.filter(item => item.id !== id),
            isLoading: false,
            error: null
          }));
        } catch (error) {
          console.error('Error deleting vault item:', error);
          set({ isLoading: false, error: error.message });
        }
      }
    }),
    {
      name: 'vault-storage',
      partialize: (state) => ({
        vaultItems: state.vaultItems
      })
    }
  )
);

export default useVaultStore; 