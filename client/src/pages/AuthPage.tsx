import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuthStore } from '@/lib/stores/useAuthStore';

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const { user, login } = useAuthStore();

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleAuthSuccess = (userData: any) => {
    // Update the auth store with the new user data
    login(userData);
    
    // Navigation will happen automatically via the Navigate component above
    // since user will no longer be null
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