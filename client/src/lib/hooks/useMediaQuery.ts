import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    // For SSR, we need to check if window is available
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query);
      
      // Initial check
      setMatches(media.matches);
      
      // Set up listener to update state
      const listener = () => setMatches(media.matches);
      
      // Listen for changes
      media.addEventListener('change', listener);
      
      // Clean up
      return () => media.removeEventListener('change', listener);
    }
    
    return undefined;
  }, [query]);
  
  return matches;
}