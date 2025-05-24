import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { memo, useEffect } from 'react';

const ProtectedRoute = memo(function ProtectedRoute({ children }) {
  const { user, isLoading } = useUser();
  const location = useLocation();

  useEffect(() => {
    console.log('ProtectedRoute - State updated:', { 
      user: user ? 'present' : 'null', 
      isLoading, 
      path: location.pathname 
    });
  }, [user, isLoading, location.pathname]);

  // Show loading spinner only during initial load
  if (isLoading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not loading and no user, redirect to login
  if (!isLoading && !user) {
    console.log('No user found, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If we have a user or we're still loading with a user, show the protected content
  return children;
});

export default ProtectedRoute; 