import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Starting auth callback...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('Session data:', session);
        console.log('Error if any:', error);
        
        if (error) {
          console.error('Auth error:', error);
          throw error;
        }
        
        if (session) {
          console.log('Session found, redirecting to dashboard...');
          navigate('/dashboard');
        } else {
          console.log('No session found, redirecting to login...');
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
