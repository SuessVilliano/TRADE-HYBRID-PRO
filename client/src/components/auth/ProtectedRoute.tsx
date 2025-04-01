import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSolanaAuth } from '../../lib/context/SolanaAuthProvider';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

/**
 * A protected route component that redirects unauthenticated users to the login page
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isAuthenticating } = useSolanaAuth();
  
  // Show loading state while checking authentication
  if (isAuthenticating) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-300">Verifying Authentication...</p>
        </div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Render the protected content if authenticated
  return children;
};

export default ProtectedRoute;