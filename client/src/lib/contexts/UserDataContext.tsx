import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserContext, initialUserContext } from '../../../shared/models/UserContext';
import { fetchUserData, updateUserData } from '../services/unified-user-service';

interface UserDataContextType {
  userData: UserContext;
  isLoading: boolean;
  error: string | null;
  updateUserData: (partialData: Partial<UserContext>) => Promise<void>;
  refreshData: () => Promise<void>;
}

export const UserDataContext = createContext<UserDataContextType>({
  userData: initialUserContext,
  isLoading: false,
  error: null,
  updateUserData: async () => {},
  refreshData: async () => {}
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

  return (
    <UserDataContext.Provider
      value={{
        userData,
        isLoading,
        error,
        updateUserData: handleUpdateUserData,
        refreshData: loadUserData
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};