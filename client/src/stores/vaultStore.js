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
          const { data, error } = await supabase
            .from('vault_items')
            .select('*')
            .order('created_at', { ascending: false });
          if (error) throw error;
          set({ vaultItems: data || [], isLoading: false, error: null });
        } catch (error) {
          set({ isLoading: false, error: error.message });
        }
      },

      addVaultItem: async (item) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase
            .from('vault_items')
            .insert([{
              name: item.name,
              category: item.category,
              details: item.details,
              file_path: item.file ? item.file.name : null,
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
              name: updates.name,
              category: updates.category,
              details: updates.details,
              file_path: updates.file ? updates.file.name : null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();
          if (error) throw error;
          set((state) => ({
            vaultItems: state.vaultItems.map((item) => (item.id === id ? data : item)),
            isLoading: false,
            error: null
          }));
          return data;
        } catch (error) {
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
            vaultItems: state.vaultItems.filter((item) => item.id !== id),
            isLoading: false,
            error: null
          }));
        } catch (error) {
          set({ isLoading: false, error: error.message });
        }
      },
    }),
    {
      name: 'vault-storage',
    }
  )
);

export default useVaultStore; 