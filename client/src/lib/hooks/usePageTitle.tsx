import { useEffect } from "react";

/**
 * Hook to set the document title with an optional suffix
 * @param title The title to set
 * @param suffix Optional suffix for the title (e.g., "| TradeHybrid")
 */
export function usePageTitle(title: string, suffix: string = '| TradeHybrid') {
  useEffect(() => {
    // Save the original title
    const originalTitle = document.title;
    
    // Set the new title
    document.title = suffix ? `${title} ${suffix}` : title;
    
    // Cleanup - restore original title when component unmounts
    return () => {
      document.title = originalTitle;
    };
  }, [title, suffix]);
}