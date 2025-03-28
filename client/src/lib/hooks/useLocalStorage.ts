import { useState, useEffect } from 'react';

export default function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Get stored value from localStorage or use initialValue
  const readValue = (): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        
        // Dispatch a custom event so other instances can update
        window.dispatchEvent(new Event('local-storage-change'));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Listen for changes to this localStorage key from other instances
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    
    // Handler for storage events
    const handleStorageChange = () => {
      setStoredValue(readValue());
    };

    // Listen for the custom event
    window.addEventListener('local-storage-change', handleStorageChange);
    
    // Clean up
    return () => {
      window.removeEventListener('local-storage-change', handleStorageChange);
    };
  }, []);

  return [storedValue, setValue];
}