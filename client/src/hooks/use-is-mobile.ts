import { useState, useEffect } from 'react';

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if window is available (for SSR)
    if (typeof window !== 'undefined') {
      // Initial check
      const checkIsMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      
      // Set initial value
      checkIsMobile();
      
      // Add event listener for window resize
      window.addEventListener('resize', checkIsMobile);
      
      // Clean up event listener
      return () => {
        window.removeEventListener('resize', checkIsMobile);
      };
    }
  }, []);

  return isMobile;
}