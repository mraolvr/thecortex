import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(true);

  const setUserState = useCallback((newUser) => {
    if (mounted) {
      console.log('Setting user state:', newUser ? 'user present' : 'null');
      setUser(newUser);
      if (!newUser) {
        setProfile(null);
      }
    }
  }, [mounted]);

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) return;
    
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          const { data: userData } = await supabase.auth.getUser();
          if (userData?.user) {
            console.log('Creating new profile for user:', userData.user.id);
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                email: userData.user.email,
                full_name: userData.user.user_metadata?.full_name || userData.user.user_metadata?.name,
                avatar_url: userData.user.user_metadata?.avatar_url
              });
            
            if (insertError) {
              console.error('Error creating profile:', insertError);
              return;
            }
            
            // Fetch the newly created profile
            const { data: newProfile, error: fetchError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single();
            
            if (fetchError) {
              console.error('Error fetching new profile:', fetchError);
              return;
            }
            
            if (mounted && newProfile) {
              console.log('New profile created and fetched:', newProfile);
              setProfile(newProfile);
            }
          }
        }
        return;
      }
      
      if (mounted) {
        console.log('Profile fetched successfully:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      if (mounted) {
        setIsLoading(false);
      }
    }
  }, [mounted]);

  const updateProfile = useCallback(async (updates) => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      console.log('Updating profile for user:', user.id, 'with updates:', updates);
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }
      
      if (mounted && data) {
        console.log('Profile updated successfully:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    } finally {
      if (mounted) {
        setIsLoading(false);
      }
    }
  }, [user?.id, mounted]);

  useEffect(() => {
    setMounted(true);
    
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          throw error;
        }
        
        if (session?.user) {
          console.log('Initial session found:', session.user.id);
          setUserState(session.user);
          await fetchProfile(session.user.id);
        } else {
          console.log('No initial session found');
          setUserState(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUserState(null);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          console.log('Setting user from auth state change');
          setUserState(session.user);
          await fetchProfile(session.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('Clearing user on sign out');
        setUserState(null);
      }
    });

    return () => {
      setMounted(false);
      subscription.unsubscribe();
    };
  }, [fetchProfile, setUserState, mounted]);

  const value = useMemo(() => ({
    user,
    profile,
    isLoading,
    updateProfile
  }), [user, profile, isLoading, updateProfile]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 