import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Single effect to handle both initial session and auth state changes
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('Initial session:', session);
        
        if (sessionError) throw sessionError;
        
        if (mounted && session?.user) {
          console.log('Setting user from session:', session.user);
          setUser(session.user);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setError(error.message);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      
      if (!mounted) return;

      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') {
        if (session?.user) {
          console.log('Setting user from auth state change:', session.user);
          setUser(session.user);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('Clearing user on sign out');
        setUser(null);
        setProfile(null);
      }
    });

    // Initialize auth
    initializeAuth();

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []); // Empty dependency array since we only want to set up the subscription once

  // Separate effect for profile fetching
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          console.error('Error fetching profile:', profileError);
          // If profile doesn't exist, create it
          if (profileError.code === 'PGRST116') {
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || user.user_metadata?.name,
                avatar_url: user.user_metadata?.avatar_url
              });
            
            if (insertError) {
              console.error('Error creating profile:', insertError);
            } else {
              // Fetch the newly created profile
              const { data: newProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
              
              if (newProfile) {
                setProfile(newProfile);
              }
            }
          }
        } else {
          setProfile(profile);
        }
      } catch (error) {
        console.error('Error in fetchProfile:', error);
        setError(error.message);
      }
    };

    fetchProfile();
  }, [user]); // Only run when user changes

  const updateProfile = async (updates) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Refresh profile data
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (updatedProfile) {
        setProfile(updatedProfile);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message);
      throw error;
    }
  };

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    profile,
    isLoading,
    error,
    updateProfile
  }), [user, profile, isLoading, error]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 