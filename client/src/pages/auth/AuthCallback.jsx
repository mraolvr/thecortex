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

        // Handle the OAuth callback
        const { data, error } = await supabase.auth.getSession();
        console.log('Initial session check:', data, error);

        if (error) {
          console.error('Auth error:', error);
          throw error;
        }

        // If we have a session, redirect to dashboard
        if (data?.session) {
          console.log('Session found, redirecting to dashboard...');
          navigate('/dashboard');
        } else {
          // Try to exchange the code for a session
          const { data: { session }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(hash);
          console.log('Exchange result:', session, exchangeError);

          if (exchangeError) {
            console.error('Exchange error:', exchangeError);
            throw exchangeError;
          }

          if (session) {
            console.log('Session created, redirecting to dashboard...');
            navigate('/dashboard');
          } else {
            console.log('No session created, redirecting to login...');
            navigate('/login');
          }
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

