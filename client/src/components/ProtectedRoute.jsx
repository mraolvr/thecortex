import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { memo } from 'react';

const ProtectedRoute = memo(function ProtectedRoute({ children }) {
  const { user, isLoading } = useUser();
  const location = useLocation();

  console.log('ProtectedRoute - Current state:', { user, isLoading, path: location.pathname });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    console.log('No user found, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
});

export default ProtectedRoute; 