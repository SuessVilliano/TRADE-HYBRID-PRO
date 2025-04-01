import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useSolanaAuth } from '../../lib/context/SolanaAuthProvider';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

/**
 * A protected route component that redirects unauthenticated users to the login page
 * Also supports demo mode authentication via localStorage
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isAuthenticating } = useSolanaAuth();
  const [isDemoUser, setIsDemoUser] = useState<boolean>(false);
  const [checkingDemo, setCheckingDemo] = useState<boolean>(true);
  
  // Check for demo user in localStorage
  useEffect(() => {
    const demoUser = localStorage.getItem('demoUser');
    if (demoUser) {
      try {
        const user = JSON.parse(demoUser);
        setIsDemoUser(user.isAuthenticated === true);
      } catch (error) {
        console.error('Error parsing demo user:', error);
      }
    }
    setCheckingDemo(false);
  }, []);
  
  // Show loading state while checking authentication
  if (isAuthenticating || checkingDemo) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-300">Verifying Authentication...</p>
        </div>
      </div>
    );
  }
  
  // Allow access if authenticated via Solana OR demo user
  const userIsAuthenticated = isAuthenticated || isDemoUser;
  
  // Redirect to login if not authenticated
  if (!userIsAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Render the protected content if authenticated
  return children;
};

export default ProtectedRoute;