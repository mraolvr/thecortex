import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useEffect, memo, useCallback } from 'react';

const ProtectedRoute = memo(function ProtectedRoute({ children }) {
  const { user, isLoading } = useUser();

  const logState = useCallback(() => {
    console.log('ProtectedRoute state:', {
      user: user ? 'present' : 'null',
      isLoading
    });
  }, [user, isLoading]);

  useEffect(() => {
    logState();
  }, [logState]);

  // Show loading spinner only during initial load when there's no user
  if (isLoading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  // Redirect to login if not loading and no user found
  if (!isLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  // If we have a user or we're still loading with a user, show the protected content
  return children;
});

export default ProtectedRoute; 