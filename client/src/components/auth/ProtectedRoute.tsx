import React, { useEffect, useState, useRef } from 'react';
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
  
  // Use refs to prevent infinite render loops
  const hasRun = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Set a timeout to reset auth state if it takes too long
  useEffect(() => {
    // Set a timeout to avoid getting stuck on auth check
    timeoutRef.current = setTimeout(() => {
      if (isCheckingAuth || checkingDemo) {
        console.log('Auth check timed out - forcing completion');
        setCheckingDemo(false);
        setIsCheckingAuth(false);
        
        // If we're in demo mode, try to proceed anyway
        const demoUser = localStorage.getItem('demoUser');
        if (demoUser) {
          try {
            setIsDemoUser(true);
          } catch (e) {
            console.error('Failed to enable demo mode after timeout:', e);
          }
        }
      }
    }, 5000); // 5 second timeout
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Check for both server-side auth and demo user - only run once
  useEffect(() => {
    // Prevent multiple runs
    if (hasRun.current) return;
    hasRun.current = true;
    
    const checkAuthentication = async () => {
      try {
        // Check for demo user in localStorage first - fastest path
        const demoUser = localStorage.getItem('demoUser');
        if (demoUser) {
          try {
            const user = JSON.parse(demoUser);
            if (user.authenticated === true || user.isAuthenticated === true) {
              console.log('Demo user found in localStorage, skipping server check');
              setIsDemoUser(true);
              setCheckingDemo(false);
              setIsCheckingAuth(false);
              return; // Exit early since we're authenticated as demo user
            }
          } catch (error) {
            console.error('Error parsing demo user:', error);
          }
        }
        
        // If we're already authenticated in context, skip the server check
        if (contextAuthenticated) {
          console.log('Already authenticated in context, skipping server check');
          setCheckingDemo(false);
          setIsCheckingAuth(false);
          return;
        }
        
        // IMPORTANT: We no longer automatically try to log in to fix the auto-login issue
        // Instead, we just check if we're already authenticated and then finish the check
        
        // The user must explicitly log in now - we don't auto-redirect to login page
        // This prevents the infinite authentication loop
        setCheckingDemo(false);
        setIsCheckingAuth(false);
      } catch (error) {
        console.error('Authentication check failed:', error);
        setCheckingDemo(false);
        setIsCheckingAuth(false);
      }
    };
    
    checkAuthentication();
  }, []); // Empty dependency array - only run once
  
  // Log authentication information for debugging (with throttling)
  useEffect(() => {
    console.log('Protected Route Authentication Status:', {
      path: location.pathname,
      solanaAuthenticated,
      contextAuthenticated,
      isDemoUser,
      isChecking: isAuthenticating || checkingDemo || isCheckingAuth,
      authError
    });
  }, [location.pathname, authError]); // Reduced dependencies to prevent loops
  
  // Determine if still checking (with 5 sec max wait time)
  const stillChecking = (isAuthenticating || checkingDemo || isCheckingAuth);
  
  // Show loading state while checking authentication (5 sec max)
  if (stillChecking) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-300">Verifying Authentication...</p>
          <button 
            onClick={() => {
              setIsCheckingAuth(false);
              setCheckingDemo(false);
              window.location.href = '/login';
            }}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Skip to Login
          </button>
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