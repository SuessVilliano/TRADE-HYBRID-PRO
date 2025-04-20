
import { useAuthStore } from '../stores/useAuthStore';

export const authService = {
  async login(whopId: string) {
    try {
      console.log('Logging in with Whop ID:', whopId);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ whopId }),
        credentials: 'include', // Important for sending/receiving cookies
      });
      
      if (!response.ok) {
        console.error('Login failed with status:', response.status);
        throw new Error('Login failed');
      }
      
      const userData = await response.json();
      console.log('Login succeeded, user data:', userData);
      
      // Store user data in zustand store
      useAuthStore.getState().setUser(userData);
      
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async getCurrentUser() {
    try {
      console.log('Checking current user authentication status');
      const response = await fetch('/api/auth/user', {
        credentials: 'include', // Important for sending/receiving cookies
      });
      
      if (!response.ok) {
        console.error('Failed to get user with status:', response.status);
        throw new Error('Failed to get user');
      }
      
      const userData = await response.json();
      console.log('Current user data:', userData);
      
      if (userData.authenticated) {
        // Update zustand store with authenticated user data
        useAuthStore.getState().setUser(userData);
      } else {
        // Clear user data in store if not authenticated
        useAuthStore.getState().logout();
      }
      
      return userData;
    } catch (error) {
      console.error('Get user error:', error);
      // Don't update the store on error to prevent clearing valid user data
      throw error;
    }
  },
  
  async logout() {
    try {
      console.log('Logging out user');
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for sending/receiving cookies
      });
      
      if (!response.ok) {
        console.error('Logout failed with status:', response.status);
        throw new Error('Logout failed');
      }
      
      // Clear user data in zustand store
      useAuthStore.getState().logout();
      
      // Also remove demo user if present
      localStorage.removeItem('demoUser');
      
      console.log('Logout successful');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
  
  // Helper method to determine if user is currently authenticated
  isAuthenticated() {
    const store = useAuthStore.getState();
    return store.isAuthenticated && store.user !== null;
  }
};
