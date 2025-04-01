
import { useAuthStore } from '../stores/useAuthStore';

export const authService = {
  async login(whopId: string) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ whopId }),
      });
      
      if (!response.ok) throw new Error('Login failed');
      
      const userData = await response.json();
      useAuthStore.getState().setUser(userData);
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async getCurrentUser() {
    try {
      const response = await fetch('/api/auth/user');
      if (!response.ok) throw new Error('Failed to get user');
      
      const userData = await response.json();
      if (userData.authenticated) {
        useAuthStore.getState().setUser(userData);
      }
      return userData;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  },
  
  async logout() {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) throw new Error('Logout failed');
      
      useAuthStore.getState().logout();
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
};
