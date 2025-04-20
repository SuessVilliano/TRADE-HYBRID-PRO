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
  const { isAuthenticated: contextAuthenticated, getCurrentUser } = useAuth();
  
  const [isDemoUser, setIsDemoUser] = useState<boolean>(false);
  const [checkingDemo, setCheckingDemo] = useState<boolean>(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Check for both server-side auth and demo user
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        setIsCheckingAuth(true);
        
        // Check for demo user in localStorage
        const demoUser = localStorage.getItem('demoUser');
        if (demoUser) {
          try {
            const user = JSON.parse(demoUser);
            // Only count as authenticated if the isAuthenticated flag is true
            if (user.isAuthenticated === true) {
              setIsDemoUser(true);
              setCheckingDemo(false);
              setIsCheckingAuth(false);
              return; // Exit early since we're authenticated as demo user
            }
          } catch (error) {
            console.error('Error parsing demo user:', error);
          }
        }
        
        // If not a demo user, check with the server
        try {
          // Try to refresh the user data from server
          await getCurrentUser();
        } catch (error) {
          console.error('Error fetching current user:', error);
          setAuthError('Failed to verify authentication status');
        }
        
        setCheckingDemo(false);
        setIsCheckingAuth(false);
      } catch (error) {
        console.error('Authentication check failed:', error);
        setAuthError('Failed to verify authentication status');
        setIsCheckingAuth(false);
        setCheckingDemo(false);
      }
    };
    
    checkAuthentication();
  }, [getCurrentUser]);
  
  // Log authentication information for debugging
  useEffect(() => {
    console.log('Protected Route Authentication Status:', {
      path: location.pathname,
      solanaAuthenticated,
      contextAuthenticated,
      isDemoUser,
      isChecking: isAuthenticating || checkingDemo || isCheckingAuth,
      authError
    });
  }, [
    location, 
    solanaAuthenticated, 
    contextAuthenticated, 
    isDemoUser, 
    isAuthenticating, 
    checkingDemo, 
    isCheckingAuth,
    authError
  ]);
  
  // Show loading state while checking authentication
  if (isAuthenticating || checkingDemo || isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-300">Verifying Authentication...</p>
        </div>
      </div>
    );
  }
  
  // Show error state if auth check failed
  if (authError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-white mb-2">Authentication Error</h2>
          <p className="text-gray-300 mb-4">{authError}</p>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            onClick={() => {
              setAuthError(null);
              window.location.href = '/login';
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  
  // Allow access if authenticated via any method
  const userIsAuthenticated = solanaAuthenticated || contextAuthenticated || isDemoUser;
  
  // Redirect to login if not authenticated
  if (!userIsAuthenticated) {
    console.log('User not authenticated, redirecting to login');
    // Preserve the current location so we can redirect back after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // Render the protected content if authenticated
  console.log('User authenticated, rendering protected content');
  return children;
};

export default ProtectedRoute;