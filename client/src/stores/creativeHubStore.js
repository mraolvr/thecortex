import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

const useCreativeHubStore = create(
  persist(
    (set, get) => ({
      // Songs
      songs: [],
      songIdeas: [],
      selectedSong: null,
      isLoadingSongs: false,
      songError: null,

      // Writing
      writingProjects: [],
      characters: [],
      worldBuilding: [],
      selectedProject: null,
      isLoadingWriting: false,
      writingError: null,

      // Initialize songs
      initializeSongs: async () => {
        set({ isLoadingSongs: true });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('User not authenticated');

          const { data: songs, error: songsError } = await supabase
            .from('creative_songs')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (songsError) throw songsError;

          const { data: ideas, error: ideasError } = await supabase
            .from('creative_song_ideas')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (ideasError) throw ideasError;

          set({ 
            songs: songs || [], 
            songIdeas: ideas || [],
            isLoadingSongs: false,
            songError: null
          });
        } catch (error) {
          console.error('Error loading songs:', error);
          set({ 
            isLoadingSongs: false, 
            songError: error.message 
          });
        }
      },

      // Initialize writing projects
      initializeWriting: async () => {
        set({ isLoadingWriting: true });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('User not authenticated');

          const { data: projects, error: projectsError } = await supabase
            .from('creative_writing')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (projectsError) throw projectsError;

          set({ 
            writingProjects: projects || [],
            isLoadingWriting: false,
            writingError: null
          });
        } catch (error) {
          console.error('Error loading writing projects:', error);
          set({ 
            isLoadingWriting: false, 
            writingError: error.message 
          });
        }
      },

      // Song actions
      addSong: async (song) => {
        set({ isLoadingSongs: true });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('User not authenticated');

          const newSong = {
            ...song,
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const { data, error } = await supabase
            .from('creative_songs')
            .insert(newSong)
            .select()
            .single();

          if (error) throw error;

          set((state) => ({
            songs: [data, ...state.songs],
            isLoadingSongs: false,
            songError: null
          }));
        } catch (error) {
          console.error('Error adding song:', error);
          set({ 
            isLoadingSongs: false, 
            songError: error.message 
          });
        }
      },

      updateSong: async (id, updatedSong) => {
        set({ isLoadingSongs: true });
        try {
          const { data, error } = await supabase
            .from('creative_songs')
            .update({
              ...updatedSong,
              updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;

          set((state) => ({
            songs: state.songs.map((song) => 
              song.id === id ? { ...song, ...data } : song
            ),
            selectedSong: state.selectedSong?.id === id ? { ...state.selectedSong, ...data } : state.selectedSong,
            isLoadingSongs: false,
            songError: null
          }));
        } catch (error) {
          console.error('Error updating song:', error);
          set({ 
            isLoadingSongs: false, 
            songError: error.message 
          });
        }
      },

      deleteSong: async (id) => {
        set({ isLoadingSongs: true });
        try {
          const { error } = await supabase
            .from('creative_songs')
            .delete()
            .eq('id', id);

          if (error) throw error;

          set((state) => ({
            songs: state.songs.filter((song) => song.id !== id),
            selectedSong: state.selectedSong?.id === id ? null : state.selectedSong,
            isLoadingSongs: false,
            songError: null
          }));
        } catch (error) {
          console.error('Error deleting song:', error);
          set({ 
            isLoadingSongs: false, 
            songError: error.message 
          });
        }
      },

      // Song idea actions
      addSongIdea: async (idea) => {
        set({ isLoadingSongs: true });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('User not authenticated');

          const newIdea = {
            ...idea,
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const { data, error } = await supabase
            .from('creative_song_ideas')
            .insert(newIdea)
            .select()
            .single();

          if (error) throw error;

          set((state) => ({
            songIdeas: [data, ...state.songIdeas],
            isLoadingSongs: false,
            songError: null
          }));
        } catch (error) {
          console.error('Error adding song idea:', error);
          set({ 
            isLoadingSongs: false, 
            songError: error.message 
          });
        }
      },

      // Writing project actions
      addWritingProject: async (project) => {
        set({ isLoadingWriting: true });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('User not authenticated');

          const newProject = {
            ...project,
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const { data, error } = await supabase
            .from('creative_writing')
            .insert(newProject)
            .select()
            .single();

          if (error) throw error;

          set((state) => ({
            writingProjects: [data, ...state.writingProjects],
            isLoadingWriting: false,
            writingError: null
          }));
        } catch (error) {
          console.error('Error adding writing project:', error);
          set({ 
            isLoadingWriting: false, 
            writingError: error.message 
          });
        }
      },

      updateWritingProject: async (id, updatedProject) => {
        set({ isLoadingWriting: true });
        try {
          const { data, error } = await supabase
            .from('creative_writing')
            .update({
              ...updatedProject,
              updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;

          set((state) => ({
            writingProjects: state.writingProjects.map((project) => 
              project.id === id ? { ...project, ...data } : project
            ),
            selectedProject: state.selectedProject?.id === id ? { ...state.selectedProject, ...data } : state.selectedProject,
            isLoadingWriting: false,
            writingError: null
          }));
        } catch (error) {
          console.error('Error updating writing project:', error);
          set({ 
            isLoadingWriting: false, 
            writingError: error.message 
          });
        }
      },

      deleteWritingProject: async (id) => {
        set({ isLoadingWriting: true });
        try {
          const { error } = await supabase
            .from('creative_writing')
            .delete()
            .eq('id', id);

          if (error) throw error;

          set((state) => ({
            writingProjects: state.writingProjects.filter((project) => project.id !== id),
            selectedProject: state.selectedProject?.id === id ? null : state.selectedProject,
            isLoadingWriting: false,
            writingError: null
          }));
        } catch (error) {
          console.error('Error deleting writing project:', error);
          set({ 
            isLoadingWriting: false, 
            writingError: error.message 
          });
        }
      },

      // Character actions
      addCharacter: async (character) => {
        set({ isLoadingWriting: true });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('User not authenticated');

          const newCharacter = {
            ...character,
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const { data, error } = await supabase
            .from('creative_characters')
            .insert(newCharacter)
            .select()
            .single();

          if (error) throw error;

          set((state) => ({
            characters: [data, ...state.characters],
            isLoadingWriting: false,
            writingError: null
          }));
        } catch (error) {
          console.error('Error adding character:', error);
          set({ 
            isLoadingWriting: false, 
            writingError: error.message 
          });
        }
      },

      updateCharacter: async (id, updatedCharacter) => {
        set({ isLoadingWriting: true });
        try {
          const { data, error } = await supabase
            .from('creative_characters')
            .update({
              ...updatedCharacter,
              updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;

          set((state) => ({
            characters: state.characters.map((character) => 
              character.id === id ? { ...character, ...data } : character
            ),
            isLoadingWriting: false,
            writingError: null
          }));
        } catch (error) {
          console.error('Error updating character:', error);
          set({ 
            isLoadingWriting: false, 
            writingError: error.message 
          });
        }
      },

      deleteCharacter: async (id) => {
        set({ isLoadingWriting: true });
        try {
          const { error } = await supabase
            .from('creative_characters')
            .delete()
            .eq('id', id);

          if (error) throw error;

          set((state) => ({
            characters: state.characters.filter((character) => character.id !== id),
            isLoadingWriting: false,
            writingError: null
          }));
        } catch (error) {
          console.error('Error deleting character:', error);
          set({ 
            isLoadingWriting: false, 
            writingError: error.message 
          });
        }
      },

      // World building actions
      addWorldBuilding: async (worldBuilding) => {
        set({ isLoadingWriting: true });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('User not authenticated');

          const newWorldBuilding = {
            ...worldBuilding,
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const { data, error } = await supabase
            .from('creative_world_building')
            .insert(newWorldBuilding)
            .select()
            .single();

          if (error) throw error;

          set((state) => ({
            worldBuilding: [data, ...state.worldBuilding],
            isLoadingWriting: false,
            writingError: null
          }));
        } catch (error) {
          console.error('Error adding world building:', error);
          set({ 
            isLoadingWriting: false, 
            writingError: error.message 
          });
        }
      },

      updateWorldBuilding: async (id, updatedWorldBuilding) => {
        set({ isLoadingWriting: true });
        try {
          const { data, error } = await supabase
            .from('creative_world_building')
            .update({
              ...updatedWorldBuilding,
              updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;

          set((state) => ({
            worldBuilding: state.worldBuilding.map((element) => 
              element.id === id ? { ...element, ...data } : element
            ),
            isLoadingWriting: false,
            writingError: null
          }));
        } catch (error) {
          console.error('Error updating world building:', error);
          set({ 
            isLoadingWriting: false, 
            writingError: error.message 
          });
        }
      },

      deleteWorldBuilding: async (id) => {
        set({ isLoadingWriting: true });
        try {
          const { error } = await supabase
            .from('creative_world_building')
            .delete()
            .eq('id', id);

          if (error) throw error;

          set((state) => ({
            worldBuilding: state.worldBuilding.filter((element) => element.id !== id),
            isLoadingWriting: false,
            writingError: null
          }));
        } catch (error) {
          console.error('Error deleting world building:', error);
          set({ 
            isLoadingWriting: false, 
            writingError: error.message 
          });
        }
      },

      // Utility actions
      setSelectedSong: (song) => {
        set({ selectedSong: song });
      },

      setSelectedProject: (project) => {
        set({ selectedProject: project });
      },

      clearErrors: () => {
        set({ 
          songError: null, 
          writingError: null 
        });
      }
    }),
    {
      name: 'creative-hub-storage',
      partialize: (state) => ({
        selectedSong: state.selectedSong,
        selectedProject: state.selectedProject
      })
    }
  )
);

export default useCreativeHubStore; 