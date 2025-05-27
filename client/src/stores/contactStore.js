import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

const useContactStore = create(
  persist(
    (set, get) => ({
      contacts: [],
      isLoading: false,
      error: null,

      fetchContacts: async () => {
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

          console.log('Fetching contacts for user:', user.id);
          const { data, error } = await supabase
            .from('contacts')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) throw error;
          set({ contacts: data || [], isLoading: false, error: null });
        } catch (error) {
          console.error('Error fetching contacts:', error);
          set({ isLoading: false, error: error.message });
        }
      },

      addContact: async (contact) => {
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
            .from('contacts')
            .insert([{
              ...contact,
              user_id: user.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }])
            .select()
            .single();

          if (error) throw error;
          set((state) => ({
            contacts: [data, ...state.contacts],
            isLoading: false,
            error: null
          }));
          return data;
        } catch (error) {
          console.error('Error adding contact:', error);
          set({ isLoading: false, error: error.message });
          return undefined;
        }
      },

      updateContact: async (id, updates) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase
            .from('contacts')
            .update({
              ...updates,
              updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;
          set((state) => ({
            contacts: state.contacts.map(contact => 
              contact.id === id ? { ...contact, ...data } : contact
            ),
            isLoading: false,
            error: null
          }));
          return data;
        } catch (error) {
          console.error('Error updating contact:', error);
          set({ isLoading: false, error: error.message });
          return undefined;
        }
      },

      deleteContact: async (id) => {
        set({ isLoading: true });
        try {
          const { error } = await supabase
            .from('contacts')
            .delete()
            .eq('id', id);

          if (error) throw error;
          set((state) => ({
            contacts: state.contacts.filter(contact => contact.id !== id),
            isLoading: false,
            error: null
          }));
        } catch (error) {
          console.error('Error deleting contact:', error);
          set({ isLoading: false, error: error.message });
        }
      }
    }),
    {
      name: 'contact-storage',
      partialize: (state) => ({
        contacts: state.contacts
      })
    }
  )
);

export default useContactStore; 