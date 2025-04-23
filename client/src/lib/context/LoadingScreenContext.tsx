import React, { createContext, useContext, useState, useCallback } from 'react';
import { LoadingScreen } from '../../components/ui/loading-screen';

interface LoadingScreenContextType {
  showLoading: (options?: { message?: string; imageType?: 'thTower' | 'thDefault'; duration?: number }) => void;
  hideLoading: () => void;
}

const LoadingScreenContext = createContext<LoadingScreenContextType | undefined>(undefined);

export const useLoadingScreen = () => {
  const context = useContext(LoadingScreenContext);
  if (!context) {
    throw new Error('useLoadingScreen must be used within a LoadingScreenProvider');
  }
  return context;
};

export const LoadingScreenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('Loading...');
  const [imageType, setImageType] = useState<'thTower' | 'thDefault'>('thDefault');
  
  // Show loading screen with options
  const showLoading = useCallback((options?: { 
    message?: string; 
    imageType?: 'thTower' | 'thDefault';
    duration?: number;
  }) => {
    // Set message and image type
    setMessage(options?.message || 'Loading...');
    setImageType(options?.imageType || 'thDefault');
    setIsLoading(true);
    
    // If duration is provided, automatically hide after that time
    if (options?.duration && options.duration > 0) {
      setTimeout(() => {
        setIsLoading(false);
      }, options.duration);
    }
  }, []);
  
  // Hide loading screen
  const hideLoading = useCallback(() => {
    setIsLoading(false);
  }, []);
  
  return (
    <LoadingScreenContext.Provider value={{ showLoading, hideLoading }}>
      <LoadingScreen isLoading={isLoading} imageType={imageType} message={message}>
        {children}
      </LoadingScreen>
    </LoadingScreenContext.Provider>
  );
};

export default LoadingScreenProvider;