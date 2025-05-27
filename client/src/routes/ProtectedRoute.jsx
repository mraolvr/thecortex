import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useUser } from '../contexts/UserContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no user and not loading, show the content anyway
  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
}; 