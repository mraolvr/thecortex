import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Starting auth callback...');
        
        // Get the hash fragment from the URL
        const hash = window.location.hash;
        console.log('URL hash:', hash);

        // First try to get the session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('Initial session check:', session, sessionError);

        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }

        if (session) {
          console.log('Session found, redirecting to dashboard...');
          navigate('/dashboard');
          return;
        }

        // If no session, try to handle the OAuth callback
        const { data, error } = await supabase.auth.getUser();
        console.log('User data:', data, error);

        if (error) {
          console.error('User error:', error);
          throw error;
        }

        if (data?.user) {
          console.log('User found, redirecting to dashboard...');
          navigate('/dashboard');
        } else {
          console.log('No user found, redirecting to login...');
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error.message);
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
    </div>
  );
}

