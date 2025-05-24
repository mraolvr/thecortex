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
      setUser(newUser);
      if (!newUser) {
        setProfile(null);
      }
    }
  }, [mounted]);

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      if (mounted) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
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
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      if (mounted) {
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
        
        if (error) throw error;
        
        if (session?.user) {
          setUserState(session.user);
          await fetchProfile(session.user.id);
        } else {
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
          setUserState(session.user);
          await fetchProfile(session.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
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