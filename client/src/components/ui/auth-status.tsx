
import React, { useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { authService } from '@/lib/services/auth-service';
import { Button } from './button';

export default function AuthStatus() {
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Check for existing session
    authService.getCurrentUser().catch(console.error);
  }, []);

  if (!isAuthenticated) {
    return <Button onClick={() => authService.login()}>Login</Button>;
  }

  return (
    <div className="flex items-center gap-2">
      <img 
        src={user?.avatar} 
        alt={user?.username} 
        className="w-8 h-8 rounded-full"
      />
      <span>{user?.username}</span>
      <span className="text-green-500">${user?.balance.toFixed(2)}</span>
    </div>
  );
}
