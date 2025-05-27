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
        console.log('[Callback] Auth callback code:', code);
        console.log('[Callback] Current URL:', window.location.href);
        console.log('[Callback] Supabase URL:', import.meta.env.VITE_SUPABASE_URL);

        if (!code) {
          console.log('[Callback] No code found in URL, checking session...');
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('[Callback] Session error:', sessionError);
            navigate('/login');
            return;
          }

          if (session?.user) {
            console.log('[Callback] Session found, redirecting to home');
            navigate('/');
          } else {
            console.log('[Callback] No session found, redirecting to login');
            navigate('/login');
          }
          return;
        }

        // Exchange the code for a session
        console.log('[Callback] Exchanging code for session...');
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
          console.error('[Callback] Error exchanging code for session:', error);
          navigate('/login');
          return;
        }

        if (data?.session) {
          console.log('[Callback] Session established, redirecting to home');
          console.log('[Callback] Session data:', {
            user: data.session.user,
            expires_at: data.session.expires_at,
            access_token: data.session.access_token ? 'present' : 'missing'
          });
          navigate('/');
        } else {
          console.log('[Callback] No session established, redirecting to login');
          navigate('/login');
        }
      } catch (error) {
        console.error('[Callback] Error in auth callback:', error);
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-600 via-fuchsia-500 via-40% to-emerald-500">
      <div className="text-white text-center">
        <h1 className="text-2xl font-bold mb-4">Processing Login...</h1>
        <p>Please wait while we complete your authentication.</p>
      </div>
    </div>
  );
}

