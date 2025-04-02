/**
 * Whop Authentication Component
 * Provides UI and functionality for authenticating with Whop
 */

import React, { useState, useEffect } from 'react';
import { useFeatureDisclosure, UserExperienceLevel } from '@/lib/context/FeatureDisclosureProvider';
import { Button } from './button';
import { Input } from './input';
import { Alert, AlertTitle, AlertDescription } from './alert';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { whopService } from '@/lib/services/whop-service';

interface WhopAuthProps {
  onStatusChange?: (isAuthenticated: boolean) => void;
}

export function WhopAuth({ onStatusChange }: WhopAuthProps) {
  const [whopId, setWhopId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { setUserLevel } = useFeatureDisclosure();
  
  // Check for saved Whop ID in localStorage
  useEffect(() => {
    const savedWhopId = localStorage.getItem('whopUserId');
    if (savedWhopId) {
      setWhopId(savedWhopId);
      verifyWhopMembership(savedWhopId);
    }
  }, []);
  
  // Verify membership and set user level accordingly
  const verifyWhopMembership = async (userId: string) => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      // Get appropriate user level from Whop service
      const userLevel = await whopService.getUserExperienceLevel(userId);
      
      // If user is at least a BEGINNER, they're authenticated
      const authenticated = userLevel !== undefined;
      
      // Set the new user level
      setUserLevel(userLevel);
      
      // Update authentication state
      setIsAuthenticated(authenticated);
      
      // Save user ID to localStorage if authenticated
      if (authenticated) {
        localStorage.setItem('whopUserId', userId);
      }
      
      // Notify parent component of status change
      if (onStatusChange) {
        onStatusChange(authenticated);
      }
      
      // Show appropriate messaging
      if (userLevel === UserExperienceLevel.EXPERT) {
        console.log('Whop premium member authenticated. Full access granted.');
      }
    } catch (error) {
      console.error('Error verifying Whop membership:', error);
      setAuthError('Failed to verify membership. Please try again.');
      setIsAuthenticated(false);
      
      if (onStatusChange) {
        onStatusChange(false);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (whopId.trim()) {
      verifyWhopMembership(whopId.trim());
    }
  };
  
  // Special demo code for testing - sets user to expert level
  const enableDemoAccess = () => {
    setUserLevel(UserExperienceLevel.EXPERT);
    setIsAuthenticated(true);
    localStorage.setItem('userExperienceLevel', UserExperienceLevel.EXPERT);
    
    if (onStatusChange) {
      onStatusChange(true);
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-1">Membership Verification</h2>
        <p className="text-slate-300 mb-4">
          Verify your Trade Hybrid membership to unlock full platform access
        </p>
      </div>
      
      {isAuthenticated ? (
        <Alert className="bg-green-900/20 border-green-800">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle>Membership Verified</AlertTitle>
          <AlertDescription>
            You have full access to all platform features.
          </AlertDescription>
        </Alert>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="whopId" className="block text-sm font-medium mb-1">
              User ID or Email
            </label>
            <Input
              id="whopId"
              type="text"
              value={whopId}
              onChange={(e) => setWhopId(e.target.value)}
              placeholder="Enter your Trade Hybrid ID or email"
              className="w-full"
              disabled={isLoading}
            />
          </div>
          
          {authError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}
          
          <Button
            type="submit"
            className="w-full"
            variant="default"
            disabled={isLoading || !whopId.trim()}
          >
            {isLoading ? 'Verifying...' : 'Verify Membership'}
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-2 text-slate-400">Or</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="secondary"
              className="w-full bg-[#FF640A] hover:bg-[#FF640A]/90 text-white"
              onClick={() => window.location.href = '/api/whop/login'}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="white"/>
                <path d="M18.8486 12.104C18.8486 9.31191 16.5895 7.05273 13.7974 7.05273H7.05273V17.155H13.7974C16.5895 17.155 18.8486 14.8958 18.8486 12.104Z" fill="#FF640A"/>
                <path d="M13.7974 8.45264C15.8189 8.45264 17.4487 10.0825 17.4487 12.104C17.4487 14.1255 15.8189 15.7553 13.7974 15.7553H8.45264V8.45264H13.7974Z" fill="white"/>
                <path d="M13.7973 9.85254C15.0444 9.85254 16.0488 10.8569 16.0488 12.104C16.0488 13.3511 15.0444 14.3555 13.7973 14.3555H9.85254V9.85254H13.7973Z" fill="#FF640A"/>
              </svg>
              Connect with Whop
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={enableDemoAccess}
            >
              Enable Demo Access
            </Button>
          </div>
          
          <Alert className="bg-blue-900/20 border-blue-800">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertTitle>Don't have a membership?</AlertTitle>
            <AlertDescription>
              <a 
                href="https://www.tradehybrid.club" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Sign up on TradeHybrid.club
              </a>
            </AlertDescription>
          </Alert>
        </form>
      )}
    </div>
  );
}