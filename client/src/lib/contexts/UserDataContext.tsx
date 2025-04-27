import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserContext, initialUserContext } from '@shared/models/UserContext';
import { fetchUserData, updateUserData } from '../services/unified-user-service';

export interface UserDataContextType {
  user: UserContext;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  refreshWallet: () => Promise<void>;
  updateUserData: (partialData: Partial<UserContext>) => Promise<void>;
  logout: () => Promise<void>;
}

export const UserDataContext = createContext<UserDataContextType>({
  user: initialUserContext,
  loading: false,
  error: null,
  refreshUser: async () => {},
  refreshWallet: async () => {},
  updateUserData: async () => {},
  logout: async () => {}
});

export const useUserData = () => useContext(UserDataContext);

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<UserContext>(initialUserContext);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await fetchUserData();
      setUserData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user data');
      console.error('Error loading user data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUserData = async (partialData: Partial<UserContext>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Merge the current userData with the partial update
      const updatedData = { ...userData, ...partialData };
      
      // Update backend data
      await updateUserData(updatedData);
      
      // Update local state
      setUserData(updatedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user data');
      console.error('Error updating user data:', err);
      throw err; // Re-throw to allow callers to handle the error
    } finally {
      setIsLoading(false);
    }
  };

  // Load user data on mount
  useEffect(() => {
    loadUserData();
  }, []);

  // Define wallet refresh function
  const refreshWallet = async () => {
    try {
      setIsLoading(true);
      // Get wallet data and update it
      const walletData = userData.walletData || {
        walletConnected: userData.walletConnected || false,
        address: '',
        provider: userData.walletProvider || '',
        tokens: [],
        nfts: []
      };
      
      // In a real implementation, this would fetch actual wallet data
      // For now just update the refresh timestamp
      const updatedWalletData = {
        ...walletData,
        walletConnected: userData.walletConnected,
        lastRefreshed: new Date().toISOString()
      };
      
      await handleUpdateUserData({
        walletData: updatedWalletData
      });
    } catch (error) {
      console.error('Error refreshing wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Define logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      // Clear user data
      setUserData({
        ...initialUserContext,
        lastSynced: new Date()
      });
      // In a real implementation, this would call the backend to logout
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserDataContext.Provider
      value={{
        user: userData,
        loading: isLoading,
        error,
        refreshUser: loadUserData,
        refreshWallet,
        updateUserData: handleUpdateUserData,
        logout
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};