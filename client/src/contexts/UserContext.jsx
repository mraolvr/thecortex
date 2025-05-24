import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initial session check
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('Initial session:', session);
        
        if (sessionError) throw sessionError;
        
        if (session?.user) {
          console.log('Setting user from session:', session.user);
          setUser(session.user);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (session?.user) {
          console.log('Setting user from auth state change:', session.user);
          setUser(session.user);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('Clearing user on sign out');
        setUser(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const getUser = async (userData) => {
    try {
      setUser(userData);
      
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        // If profile doesn't exist, create it
        if (profileError.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userData.id,
              email: userData.email,
              full_name: userData.user_metadata?.full_name || userData.user_metadata?.name,
              avatar_url: userData.user_metadata?.avatar_url
            });
          
          if (insertError) {
            console.error('Error creating profile:', insertError);
          } else {
            // Fetch the newly created profile
            const { data: newProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userData.id)
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
      console.error('Error in getUser:', error);
      setError(error.message);
    }
  };

  const updateProfile = async (updates) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Refresh profile data
      await getUser(user);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message);
      throw error;
    }
  };

  const value = {
    user,
    profile,
    loading,
    error,
    updateProfile,
    refreshUser: () => user && getUser(user)
  };

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