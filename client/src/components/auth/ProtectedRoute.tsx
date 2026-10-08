import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSolanaAuth } from '../../lib/context/SolanaAuthProvider';
import { useAuth } from '../../lib/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

/**
 * Protected route for Trade Hybrid.
 *
 * Supabase/AuthContext is the authoritative Club session.
 * Solana auth can still satisfy legacy wallet-first routes, but a stale
 * secondary store or old demo value is never allowed to create a redirect loop.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated: solanaAuthenticated, isAuthenticating } = useSolanaAuth();
  const { isAuthenticated: contextAuthenticated, isPaidUser, getCurrentUser } = useAuth();
  const [sessionCheckComplete, setSessionCheckComplete] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const verifySession = async () => {
      // If either supported auth provider is already confirmed, there is
      // nothing else to wait for.
      if (contextAuthenticated || solanaAuthenticated) {
        if (!cancelled) setSessionCheckComplete(true);
        return;
      }

      try {
        await getCurrentUser();
      } catch (error) {
        console.error('Protected route session verification failed:', error);
      } finally {
        if (!cancelled) setSessionCheckComplete(true);
      }
    };

    verifySession();

    return () => {
      cancelled = true;
    };
  }, [contextAuthenticated, solanaAuthenticated]);

  const authenticated = contextAuthenticated || solanaAuthenticated;
  const checking = isAuthenticating || (!authenticated && !sessionCheckComplete);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070b14] text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-cyan-300" />
          <p className="mt-4 text-sm text-slate-400">Opening Trade Hybrid Club…</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} state={{ from: location.pathname }} replace />;
  }

  if (!isPaidUser) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/access-required?next=${next}`} replace />;
  }

  return children;
};

export default ProtectedRoute;
