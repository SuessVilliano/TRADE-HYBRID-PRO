import { useCallback, useEffect } from 'react';

// Key used to store the referral ID in localStorage
const REFERRAL_KEY = 'thc_referral_id';
const REFERRAL_PARAM = 'ref';
const REFERRAL_EXPIRY_DAYS = 30;
// Default domain for affiliate links - use current domain to ensure it works in any environment
const DEFAULT_DOMAIN = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : '';

/**
 * Utility for tracking and managing affiliate referrals
 */
export const AffiliateService = {
  /**
   * Check URL for referral code and store it in localStorage if found
   * @returns The referral code if found in URL path or params
   */
  trackReferralFromUrl: (): string | null => {
    if (typeof window === 'undefined') return null;
    
    // First check if referral code is in the URL path format (pro.tradehybrid.club/THC29CH8AF)
    const pathParts = window.location.pathname.split('/');
    let referralCode = pathParts[1]?.length === 10 ? pathParts[1] : null;
    
    // If not found in path, check query parameters as fallback
    if (!referralCode) {
      const urlParams = new URLSearchParams(window.location.search);
      referralCode = urlParams.get(REFERRAL_PARAM);
    }
    
    if (referralCode) {
      // Store the referral code with an expiration date
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + REFERRAL_EXPIRY_DAYS);
      
      const referralData = {
        code: referralCode,
        expires: expiry.toISOString(),
        firstSeen: new Date().toISOString()
      };
      
      localStorage.setItem(REFERRAL_KEY, JSON.stringify(referralData));
      console.log(`Affiliate referral tracked: ${referralCode}`);
      
      // Clean up URL if it was using the query parameter format
      if (window.history && window.history.replaceState && window.location.search.includes(REFERRAL_PARAM)) {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete(REFERRAL_PARAM);
        window.history.replaceState({}, document.title, newUrl.toString());
      }
      
      return referralCode;
    }
    
    return null;
  },
  
  /**
   * Get the stored referral code if it exists and hasn't expired
   * @returns The stored referral code or null if not found or expired
   */
  getStoredReferralCode: (): string | null => {
    if (typeof window === 'undefined') return null;
    
    const storedData = localStorage.getItem(REFERRAL_KEY);
    if (!storedData) return null;
    
    try {
      const referralData = JSON.parse(storedData);
      const expiryDate = new Date(referralData.expires);
      
      // Check if the referral has expired
      if (expiryDate > new Date()) {
        return referralData.code;
      } else {
        // Clear expired referral data
        localStorage.removeItem(REFERRAL_KEY);
      }
    } catch (error) {
      console.error('Error parsing referral data:', error);
      localStorage.removeItem(REFERRAL_KEY);
    }
    
    return null;
  },
  
  /**
   * Generate a referral link with the given code
   * @param referralCode The referral code to include in the link
   * @returns A full referral link using path format (pro.tradehybrid.club/THC29CH8AF)
   */
  generateReferralLink: (referralCode: string): string => {
    // Use the path format for referral links as shown in the screenshots
    // This format is cleaner and more user-friendly
    return `${DEFAULT_DOMAIN}/${encodeURIComponent(referralCode)}`;
  },
  
  /**
   * Track successful actions that should trigger affiliate payments
   * (e.g., registrations, deposits, trades)
   * @param action The action type that was completed
   * @param amount Optional amount associated with the action
   */
  trackAffiliateAction: (action: 'registration' | 'deposit' | 'trade' | 'stake', amount?: number): void => {
    const referralCode = AffiliateService.getStoredReferralCode();
    if (!referralCode) return;
    
    // In a real implementation, this would make an API call to record the action for commission tracking
    console.log(`Affiliate action: ${action}, Amount: ${amount || 'N/A'}, Referrer: ${referralCode}`);
    
    // Example API call (commented out)
    /*
    fetch('/api/affiliate/track-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        referralCode,
        action,
        amount,
        timestamp: new Date().toISOString()
      })
    }).catch(err => console.error('Error tracking affiliate action:', err));
    */
  }
};

/**
 * Hook to automatically track referrals from URL parameters
 * @returns Object with tracking function and current referral code
 */
export const useAffiliateTracking = () => {
  const trackReferral = useCallback(AffiliateService.trackReferralFromUrl, []);
  const currentReferralCode = AffiliateService.getStoredReferralCode();
  
  // Check for referral code on initial load
  useEffect(() => {
    trackReferral();
  }, [trackReferral]);
  
  return { 
    trackReferral, 
    currentReferralCode,
    generateReferralLink: AffiliateService.generateReferralLink,
    trackAction: AffiliateService.trackAffiliateAction
  };
};