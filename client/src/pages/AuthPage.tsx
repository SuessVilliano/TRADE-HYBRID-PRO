import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { useAuth } from '@/lib/context/AuthContext';

export function AuthPage() {
  // Check URL to determine initial mode
  const [mode, setMode] = useState<'login' | 'register'>(() => {
    return ['/register', '/signup'].includes(window.location.pathname) ? 'register' : 'login';
  });
  const { user, login } = useAuthStore();
  const auth = useAuth();

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleAuthSuccess = async (userData: any) => {
    // The API has already created the server session at this point.
    // Refresh AuthContext before triggering the dashboard redirect so
    // ProtectedRoute sees the authenticated session immediately.
    await auth.getCurrentUser();

    // Keep the persisted Zustand store in sync for components that use it.
    login(userData);
  };

  const handleSwitchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {mode === 'login' ? (
          <LoginForm
            onSuccess={handleAuthSuccess}
            onSwitchToRegister={handleSwitchMode}
          />
        ) : (
          <RegisterForm
            onSuccess={handleAuthSuccess}
            onSwitchToLogin={handleSwitchMode}
          />
        )}
      </div>
    </div>
  );
}