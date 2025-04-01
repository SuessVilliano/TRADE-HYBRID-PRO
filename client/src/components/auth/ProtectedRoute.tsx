import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSolanaAuth } from '../../lib/context/SolanaAuthProvider';
import { useAuth } from '../../lib/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

/**
 * A protected route component that redirects unauthenticated users to the login page
 * Also supports demo mode authentication via localStorage
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated: solanaAuthenticated, isAuthenticating } = useSolanaAuth();
  const { isAuthenticated: contextAuthenticated } = useAuth();
  
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
  
  // Log authentication information
  useEffect(() => {
    console.log('Protected Route Authentication Status:', {
      path: location.pathname,
      solanaAuthenticated,
      contextAuthenticated,
      isDemoUser,
      isChecking: isAuthenticating || checkingDemo
    });
  }, [location, solanaAuthenticated, contextAuthenticated, isDemoUser, isAuthenticating, checkingDemo]);
  
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
  
  // Allow access if authenticated via any method
  const userIsAuthenticated = solanaAuthenticated || contextAuthenticated || isDemoUser;
  
  // Redirect to login if not authenticated
  if (!userIsAuthenticated) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // Render the protected content if authenticated
  console.log('User authenticated, rendering protected content');
  return children;
};

export default ProtectedRoute;