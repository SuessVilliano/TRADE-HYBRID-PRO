import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, Wallet, Key, RefreshCw, UserCheck, Clock, AlertTriangle, 
  DollarSign, CoinsIcon, Copy, ExternalLink, Settings, Shield, 
  CheckCircle, Bitcoin, Gem, BarChart, Link as LinkIcon, LogOut
} from 'lucide-react';
import { useUserData } from '@/lib/contexts/UserDataContext';
import { useToast } from '@/components/ui/use-toast';
import { WhopAuth } from '@/components/ui/whop-auth';
import { ConnectWalletButton } from '@/components/wallet/ConnectWalletButton';
// Import directly needed icons instead of using tokenSymbolToIcon
import { tokenSymbolToIcon } from '@/lib/utils/formatters.tsx';

const truncateAddress = (address: string, length = 4) => {
  if (!address) return '';
  return `${address.slice(0, length)}...${address.slice(-length)}`;
};

export const UnifiedUserProfile: React.FC = () => {
  const { user, loading, error, refreshUser, refreshWallet, logout } = useUserData();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refreshUser();
      await refreshWallet();
      toast({
        title: 'Profile Updated',
        description: 'Your profile data has been refreshed.',
      });
    } catch (err) {
      toast({
        title: 'Refresh Failed',
        description: 'Could not refresh your profile data.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Copied to clipboard',
    });
  };

  const handleLogout = async () => {
    await logout();
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
  };

  const viewOnExplorer = (address: string) => {
    window.open(`https://solscan.io/account/${address}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Card className="mb-8 border-t-4 border-t-blue-500">
        <CardHeader className="relative pb-2">
          <div className="absolute right-4 top-4 flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              title="Refresh profile data"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            {user.authenticated && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                title="Log out"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            )}
          </div>
          
          <div className="flex items-center">
            <Avatar className="h-20 w-20 mr-4 border-2 border-blue-500">
              <AvatarImage src={user.profileImage} />
              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-600 text-white text-xl">
                {user.username ? user.username.charAt(0).toUpperCase() : '?'}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <CardTitle className="text-2xl flex items-center">
                {user.username || 'Guest User'}
                {user.authenticated && (
                  <Badge variant="outline" className="ml-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 flex items-center">
                    <UserCheck className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </CardTitle>
              
              <CardDescription className="flex items-center mt-1">
                {user.email && (
                  <span className="flex items-center mr-4">
                    <User className="h-3 w-3 mr-1 opacity-70" />
                    {user.email}
                  </span>
                )}
                
                {user.membershipLevel && (
                  <Badge className="ml-auto bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 flex items-center">
                    <Shield className="h-3 w-3 mr-1" />
                    {user.membershipLevel.charAt(0).toUpperCase() + user.membershipLevel.slice(1)} Member
                  </Badge>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="wallet">Wallet</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="space-y-6">
                {!user.authenticated && !user.wallet.walletConnected && (
                  <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    <AlertTitle>Account Not Connected</AlertTitle>
                    <AlertDescription>
                      Connect your wallet and verify your Trade Hybrid membership to unlock all platform features.
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Authentication Status */}
                  <Card className="bg-muted/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <Key className="h-4 w-4 mr-2 text-blue-500" />
                        Authentication Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {user.authenticated ? (
                        <div className="flex items-center text-green-600 dark:text-green-400">
                          <CheckCircle className="h-5 w-5 mr-2" />
                          <span className="font-medium">Authenticated</span>
                          {user.whopId && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              Whop ID: {user.whopId}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center text-yellow-600 dark:text-yellow-400 mb-4">
                            <AlertTriangle className="h-5 w-5 mr-2" />
                            <span className="font-medium">Not Authenticated</span>
                          </div>
                          <WhopAuth onStatusChange={() => refreshUser()} />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Wallet Status */}
                  <Card className="bg-muted/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <Wallet className="h-4 w-4 mr-2 text-blue-500" />
                        Wallet Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {user.wallet.walletConnected ? (
                        <div className="space-y-2">
                          <div className="flex items-center text-green-600 dark:text-green-400">
                            <CheckCircle className="h-5 w-5 mr-2" />
                            <span className="font-medium">Connected via {user.wallet.provider}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Address:</span>
                            <span className="font-mono text-sm flex items-center">
                              {truncateAddress(user.wallet.address || '', 6)}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0 ml-1"
                                onClick={() => copyToClipboard(user.wallet.address || '')}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0 ml-1"
                                onClick={() => viewOnExplorer(user.wallet.address || '')}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </span>
                          </div>
                          {user.wallet.lastRefreshed && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Last updated:</span>
                              <span className="text-sm flex items-center">
                                <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                                {new Date(user.wallet.lastRefreshed).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center text-yellow-600 dark:text-yellow-400 mb-4">
                            <AlertTriangle className="h-5 w-5 mr-2" />
                            <span className="font-medium">No Wallet Connected</span>
                          </div>
                          <ConnectWalletButton
                            variant="outline"
                            text="Connect Wallet"
                            onSuccess={() => refreshWallet()}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                {/* If wallet is connected, show balances */}
                {user.wallet.walletConnected && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <DollarSign className="h-4 w-4 mr-2 text-blue-500" />
                        Current Balances
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-muted/30 rounded-lg p-4">
                          <div className="flex items-center text-sm text-muted-foreground mb-1">
                            <Bitcoin className="h-4 w-4 mr-1" />
                            SOL Balance
                          </div>
                          <div className="text-xl font-bold">{user.wallet.solBalance?.toFixed(4) || '0.00'} SOL</div>
                          {user.wallet.balanceUsd && (
                            <div className="text-sm text-muted-foreground">
                              ${(user.wallet.solBalance || 0).toFixed(2)} USD
                            </div>
                          )}
                        </div>
                        
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                          <div className="flex items-center text-sm text-muted-foreground mb-1">
                            <Gem className="h-4 w-4 mr-1 text-purple-500" />
                            THC Balance
                          </div>
                          <div className="text-xl font-bold">{user.wallet.thcBalance?.toFixed(2) || '0.00'} THC</div>
                          {user.wallet.isStaking && (
                            <div className="text-sm text-purple-600 dark:text-purple-400 flex items-center mt-1">
                              <BarChart className="h-3 w-3 mr-1" />
                              Staking {user.wallet.stakedAmount?.toFixed(2) || '0'} THC
                            </div>
                          )}
                        </div>
                        
                        <div className="bg-muted/30 rounded-lg p-4">
                          <div className="flex items-center text-sm text-muted-foreground mb-1">
                            <DollarSign className="h-4 w-4 mr-1" />
                            Total Value
                          </div>
                          <div className="text-xl font-bold">${user.wallet.balanceUsd?.toFixed(2) || '0.00'}</div>
                          <div className="text-sm text-muted-foreground">
                            {user.wallet.tokens?.length || 0} tokens
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            {/* Wallet Tab */}
            <TabsContent value="wallet">
              {!user.wallet.walletConnected ? (
                <div className="text-center py-12">
                  <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Wallet Connected</h3>
                  <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                    Connect your Solana wallet to view your tokens, NFTs, and manage your THC staking.
                  </p>
                  <ConnectWalletButton 
                    onSuccess={() => refreshWallet()}
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Tokens */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <CoinsIcon className="h-4 w-4 mr-2 text-blue-500" />
                        Tokens ({user.wallet.tokens?.length || 0})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {!user.wallet.tokens?.length ? (
                        <div className="text-center py-6 text-muted-foreground">
                          No tokens found in this wallet
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {user.wallet.tokens.map((token, index) => (
                            <div 
                              key={index} 
                              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                            >
                              <div className="flex items-center">
                                {token.logoURI ? (
                                  <img 
                                    src={token.logoURI} 
                                    alt={token.symbol} 
                                    className="h-6 w-6 mr-2 rounded-full"
                                  />
                                ) : (
                                  tokenSymbolToIcon(token.symbol)
                                )}
                                <div>
                                  <div className="font-medium">{token.symbol}</div>
                                  <div className="text-xs text-muted-foreground">{token.name}</div>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className="font-medium">
                                  {parseFloat((token.amount / Math.pow(10, token.decimals)).toFixed(6))}
                                </div>
                                {token.usdValue && (
                                  <div className="text-xs text-muted-foreground">
                                    ${token.usdValue.toFixed(2)}
                                    {token.change24h && (
                                      <span className={token.change24h >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                        {' '}{token.change24h > 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* NFTs */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <LinkIcon className="h-4 w-4 mr-2 text-blue-500" />
                        NFTs ({user.wallet.nfts?.length || 0})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {!user.wallet.nfts?.length ? (
                        <div className="text-center py-6 text-muted-foreground">
                          No NFTs found in this wallet
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {user.wallet.nfts.map((nft, index) => (
                            <div key={index} className="rounded-lg overflow-hidden border bg-muted/30">
                              {nft.image ? (
                                <img 
                                  src={nft.image} 
                                  alt={nft.name} 
                                  className="w-full aspect-square object-cover"
                                />
                              ) : (
                                <div className="w-full aspect-square bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                                  <LinkIcon className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                              <div className="p-2">
                                <div className="font-medium truncate" title={nft.name}>
                                  {nft.name}
                                </div>
                                {nft.collection && (
                                  <div className="text-xs text-muted-foreground truncate">
                                    {nft.collection}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* THC Staking */}
                  <Card className="border-t-4 border-t-purple-600 dark:border-t-purple-400">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <Gem className="h-4 w-4 mr-2 text-purple-500" />
                        THC Staking
                      </CardTitle>
                      <CardDescription>
                        Stake your THC tokens to earn rewards and boost your membership benefits
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {user.wallet.isStaking ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                              <div className="text-sm text-muted-foreground mb-1">Amount Staked</div>
                              <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                                {user.wallet.stakedAmount?.toFixed(2) || '0'} THC
                              </div>
                            </div>
                            
                            <div className="bg-muted/30 rounded-lg p-4">
                              <div className="text-sm text-muted-foreground mb-1">Staking Since</div>
                              <div className="text-base font-medium">
                                {user.wallet.stakedSince ? new Date(user.wallet.stakedSince).toLocaleDateString() : 'N/A'}
                              </div>
                            </div>
                            
                            <div className="bg-muted/30 rounded-lg p-4">
                              <div className="text-sm text-muted-foreground mb-1">Rewards Earned</div>
                              <div className="text-base font-medium">
                                {user.wallet.stakingRewards?.toFixed(2) || '0'} THC
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-end">
                            <Button variant="outline" className="mr-2">
                              Claim Rewards
                            </Button>
                            <Button variant="secondary">
                              Manage Staking
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <Gem className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                          <h3 className="text-lg font-medium mb-2">No Active Stakes</h3>
                          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                            Stake your THC tokens to earn rewards and get additional platform benefits.
                          </p>
                          <Button className="bg-purple-600 hover:bg-purple-700">
                            <Gem className="mr-2 h-4 w-4" />
                            Start Staking
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
            
            {/* Account Tab */}
            <TabsContent value="account">
              <div className="space-y-6">
                {!user.authenticated ? (
                  <div className="text-center py-12">
                    <UserCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">Account Not Verified</h3>
                    <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                      To access your Trade Hybrid account settings and preferences, please authenticate your membership.
                    </p>
                    <WhopAuth onStatusChange={() => refreshUser()} />
                  </div>
                ) : (
                  <>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <User className="h-4 w-4 mr-2 text-blue-500" />
                          Account Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Username</div>
                            <div className="font-medium">{user.username || 'Not set'}</div>
                          </div>
                          
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Email</div>
                            <div className="font-medium">{user.email || 'Not set'}</div>
                          </div>
                          
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Membership Level</div>
                            <div className="font-medium flex items-center">
                              {user.membershipLevel ? (
                                <>
                                  <Shield className="h-4 w-4 mr-1 text-purple-500" />
                                  {user.membershipLevel.charAt(0).toUpperCase() + user.membershipLevel.slice(1)}
                                </>
                              ) : 'Basic'}
                            </div>
                          </div>
                          
                          {user.whopId && (
                            <div>
                              <div className="text-sm text-muted-foreground mb-1">Whop ID</div>
                              <div className="font-medium font-mono">{user.whopId}</div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <Settings className="h-4 w-4 mr-2 text-blue-500" />
                          Account Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <Button variant="outline" className="w-full justify-start">
                            <Settings className="mr-2 h-4 w-4" />
                            Edit Profile Settings
                          </Button>
                          
                          <Button variant="outline" className="w-full justify-start">
                            <Key className="mr-2 h-4 w-4" />
                            Security Settings
                          </Button>
                          
                          <Button variant="outline" className="w-full justify-start">
                            <LinkIcon className="mr-2 h-4 w-4" />
                            Connected Services
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            className="w-full justify-start"
                            onClick={() => window.location.href = '/affiliate-dashboard'}
                          >
                            <DollarSign className="mr-2 h-4 w-4 text-green-500" />
                            Affiliate Matrix Dashboard
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {user.favoriteSymbols && user.favoriteSymbols.length > 0 && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center">
                            <Bitcoin className="h-4 w-4 mr-2 text-blue-500" />
                            Favorite Symbols
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {user.favoriteSymbols.map((symbol, index) => (
                              <Badge key={index} variant="secondary">
                                {symbol}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="text-xs text-muted-foreground flex items-center border-t pt-4">
          <Clock className="h-3 w-3 mr-2" />
          {user.lastSynced ? (
            <span>Last updated: {user.lastSynced.toLocaleString()}</span>
          ) : (
            <span>Profile data not synchronized</span>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default UnifiedUserProfile;