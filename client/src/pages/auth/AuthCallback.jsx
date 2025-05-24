import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { supabase } from '../../lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { user, isLoading } = useUser();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the code from the URL
        const code = new URLSearchParams(window.location.search).get('code');
        console.log('Auth callback code:', code);

        if (!code) {
          console.log('No code found in URL, checking session...');
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('Session error:', sessionError);
            navigate('/login');
            return;
          }

          if (session?.user) {
            console.log('Session found, redirecting to home');
            navigate('/');
          } else {
            console.log('No session found, redirecting to login');
            navigate('/login');
          }
          return;
        }

        // Exchange the code for a session
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
          console.error('Error exchanging code for session:', error);
          navigate('/login');
          return;
        }

        if (data?.session) {
          console.log('Session established, redirecting to home');
          navigate('/');
        } else {
          console.log('No session established, redirecting to login');
          navigate('/login');
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
    </div>
  );
}

