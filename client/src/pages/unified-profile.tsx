import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { UserDataProvider } from '@/lib/contexts/UserDataContext';
import { UnifiedUserProfile } from '@/components/profile/UnifiedUserProfile';
import { EnhancedWalletConnect } from '@/components/wallet/EnhancedWalletConnect';
import { EnhancedStakingPanel } from '@/components/staking/EnhancedStakingPanel';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, Wallet, Gem, User, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function UnifiedProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();
  
  return (
    <UserDataProvider>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="mb-2">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold">User Profile & Wallet</h1>
            <p className="text-muted-foreground mt-1">
              Manage your Trade Hybrid account, wallet connections, and THC staking
            </p>
          </div>
        </div>
        
        <Alert className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <InfoIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle>Profile Integration</AlertTitle>
          <AlertDescription>
            Your Trade Hybrid profile now integrates membership verification, wallet connections, and THC staking in one place.
          </AlertDescription>
        </Alert>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
            <TabsTrigger value="profile" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center">
              <Wallet className="mr-2 h-4 w-4" />
              Wallet
            </TabsTrigger>
            <TabsTrigger value="staking" className="flex items-center">
              <Gem className="mr-2 h-4 w-4" />
              Staking
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <UnifiedUserProfile />
          </TabsContent>
          
          <TabsContent value="wallet">
            <div className="max-w-lg mx-auto">
              <EnhancedWalletConnect />
            </div>
          </TabsContent>
          
          <TabsContent value="staking">
            <div className="max-w-2xl mx-auto">
              <EnhancedStakingPanel />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </UserDataProvider>
  );
}

export default UnifiedProfilePage;