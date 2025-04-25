import React, { useState } from 'react';
import { Button } from './button';
import { useUserStore } from '../../lib/stores/useUserStore';

// Simplified wallet connect component for Web3Auth
export function WalletConnectWeb3Auth() {
  const { login } = useUserStore();
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // Initialize Web3Auth
  useEffect(() => {
    const initWeb3Auth = async () => {
      try {
        const web3authInstance = new Web3Auth({
          clientId: 'BK4X1_ir3KXG64ac2nEH2Z5Q7STr8lKVXBJO_6Ssm5BlPIdTcqqfHN9uyduMjY9eYaKIvpY1QOozD3bH0OVQ7Y4',
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.SOLANA,
            chainId: 'devnet',
            rpcTarget: 'https://api.devnet.solana.com',
          },
          uiConfig: {
            theme: { primary: '#0364ff' },
            loginMethodsOrder: ['google', 'facebook', 'twitter', 'email_passwordless'],
            appLogo: 'https://assets-global.website-files.com/641ba798c17bb180cf7a2da2/641ba8cd5181bb07a49aa7df_TradeHybrid-Alt.png',
          },
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
        });

        await web3authInstance.initModal();
        setWeb3auth(web3authInstance);

        if (web3authInstance.connected) {
          setConnected(true);
          const web3authProvider = web3authInstance.provider;
          setProvider(web3authProvider);
          await getUserData(web3authProvider);
        }
      } catch (error) {
        console.error('Failed to initialize Web3Auth:', error);
        toast.error('Failed to initialize wallet connection');
      }
    };

    initWeb3Auth();
  }, []);

  // Connect wallet
  const connectWallet = async () => {
    try {
      setConnecting(true);
      if (!web3auth) {
        throw new Error('Web3Auth not initialized');
      }

      const web3authProvider = await web3auth.connect();
      setProvider(web3authProvider);
      setConnected(true);

      await getUserData(web3authProvider);
      
      toast.success('Wallet connected successfully!');
      setConnecting(false);
      
      // Update user store to maintain login state
      login(`wallet_${Date.now()}@example.com`, 'password123');
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast.error(`Connection failed: ${error.message || 'Unknown error'}`);
      setConnecting(false);
    }
  };

  // Get user wallet data
  const getUserData = async (provider: any) => {
    if (!provider) return;
    
    try {
      // Get user info from Web3Auth
      const userInfo = await web3auth?.getUserInfo();
      console.log('User info:', userInfo);
      
      // Get Solana account details
      const solanaWallet = new SolanaWallet(provider);
      const accounts = await solanaWallet.requestAccounts();
      const address = accounts[0];
      setAddress(address);
      
      // Get SOL balance
      const connection = new Connection('https://api.devnet.solana.com');
      const publicKey = new PublicKey(address);
      const balance = await connection.getBalance(publicKey);
      const solBalanceFormatted = (balance / LAMPORTS_PER_SOL).toFixed(4);
      setSolBalance(solBalanceFormatted);
      
      // Get THC token and other details from Moralis
      await moralisService.initialize();
      
      // Fetch wallet data including THC balance
      const walletData = await moralisService.getWalletData(address);
      setWalletDetails(walletData);
      setThcBalance(walletData.thc.balance);
      setThcUsdValue(walletData.thc.usdValue);
      
      console.log('Wallet data fetched:', walletData);
    } catch (error) {
      console.error('Error getting user data:', error);
    }
  };

  // Disconnect wallet
  const disconnectWallet = async () => {
    try {
      if (!web3auth) {
        throw new Error('Web3Auth not initialized');
      }
      
      await web3auth.logout();
      setProvider(null);
      setConnected(false);
      setAddress('');
      setSolBalance('0');
      setThcBalance('0');
      setThcUsdValue(0);
      setWalletDetails(null);
      setShowWalletDetails(false);
      
      // Log out user
      logout();
      
      toast.success('Wallet disconnected');
    } catch (error: any) {
      console.error('Error disconnecting wallet:', error);
      toast.error(`Disconnection failed: ${error.message || 'Unknown error'}`);
    }
  };

  // Format wallet balance for display
  const formatBalance = (balance: string, symbol: string) => {
    const numBalance = parseFloat(balance);
    if (isNaN(numBalance)) return `0 ${symbol}`;
    
    if (numBalance < 0.001) {
      return `< 0.001 ${symbol}`;
    }
    
    return `${numBalance.toFixed(4)} ${symbol}`;
  };
  
  // Format USD value
  const formatUsd = (value: number) => {
    if (value < 0.01) return "< $0.01";
    return `$${value.toFixed(2)}`;
  };
  
  // Truncate address
  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  // Purchase THC tokens
  const handlePurchaseThc = async () => {
    try {
      const amount = parseFloat(purchaseAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }
      
      toast.info(`Purchasing ${amount} THC tokens...`);
      
      // Simulate purchase transaction (in a real app, this would call the blockchain)
      setTimeout(() => {
        setThcBalance((Number(thcBalance) + amount).toString());
        setThcUsdValue(thcUsdValue + (amount * 0.15)); // Assuming $0.15 per THC token
        setShowPurchaseDialog(false);
        toast.success(`Successfully purchased ${amount} THC tokens!`);
      }, 2000);
    } catch (error: any) {
      console.error('Error purchasing THC:', error);
      toast.error(`Purchase failed: ${error.message || 'Unknown error'}`);
    }
  };
  
  // Stake tokens
  const handleStakeTokens = async () => {
    try {
      const amount = parseFloat(stakeAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }
      
      toast.info(`Staking ${amount} ${stakeToken}...`);
      
      // Simulate staking transaction (in a real app, this would call the blockchain)
      setTimeout(() => {
        setShowStakeDialog(false);
        toast.success(`Successfully staked ${amount} ${stakeToken}!`);
      }, 2000);
    } catch (error: any) {
      console.error('Error staking tokens:', error);
      toast.error(`Staking failed: ${error.message || 'Unknown error'}`);
    }
  };

  // Render wallet connection button or connected state
  return (
    <div className="relative">
      {connected && address ? (
        // Connected state
        <div className="flex flex-col gap-2">
          <div 
            className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted cursor-pointer border border-border"
            onClick={() => setShowWalletDetails(true)}
          >
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1 truncate">
              <div className="font-medium">{truncateAddress(address)}</div>
              <div className="text-xs text-muted-foreground">
                {formatBalance(solBalance, 'SOL')} • {formatBalance(thcBalance, 'THC')}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Not connected state
        <Button
          variant="outline"
          className="w-full"
          onClick={connectWallet}
          disabled={connecting || !web3auth}
        >
          {connecting ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
              <span>Connecting...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span>Connect Wallet</span>
            </div>
          )}
        </Button>
      )}

      {/* Wallet Details Dialog */}
      {showWalletDetails && (
        <Dialog open={showWalletDetails} onOpenChange={setShowWalletDetails}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Wallet Details</DialogTitle>
              <DialogDescription>
                Your wallet assets and management options
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2 pb-4">
              <div className="space-y-2">
                <Label>Wallet Address</Label>
                <div className="flex items-center space-x-2 p-2 bg-muted rounded-md">
                  <p className="text-sm font-mono break-all">{address}</p>
                </div>
              </div>
              
              <Tabs defaultValue="balances">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="balances">Balances</TabsTrigger>
                  <TabsTrigger value="nfts">NFTs</TabsTrigger>
                  <TabsTrigger value="staking">Staking</TabsTrigger>
                </TabsList>
                
                <TabsContent value="balances" className="space-y-4 pt-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Token Balances</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowPurchaseDialog(true)}
                    >
                      Buy THC
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-xs text-purple-600 font-bold">S</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">SOL</p>
                          <p className="text-xs text-muted-foreground">Solana</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatBalance(solBalance, 'SOL')}</p>
                        <p className="text-xs text-muted-foreground">
                          {walletDetails?.sol?.usdValue ? formatUsd(walletDetails.sol.usdValue) : '$0.00'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-xs text-green-600 font-bold">T</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">THC</p>
                          <p className="text-xs text-muted-foreground">Trade Hybrid Coin</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatBalance(thcBalance, 'THC')}</p>
                        <p className="text-xs text-muted-foreground">{formatUsd(thcUsdValue)}</p>
                      </div>
                    </div>
                    
                    {walletDetails?.tokens && walletDetails.tokens.length > 0 && (
                      <ScrollArea className="h-[160px] rounded-md border p-2">
                        <div className="space-y-2">
                          {walletDetails.tokens.map((token: any, index: number) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-muted/30 rounded-md">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-xs text-blue-600 font-bold">{token.symbol.charAt(0)}</span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{token.symbol}</p>
                                  <p className="text-xs text-muted-foreground">{token.name}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">{formatBalance(token.balance, token.symbol)}</p>
                                <p className="text-xs text-muted-foreground">{formatUsd(token.usdValue || 0)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="nfts" className="space-y-4 pt-3">
                  {walletDetails?.nfts && walletDetails.nfts.length > 0 ? (
                    <ScrollArea className="h-[240px] rounded-md border p-2">
                      <div className="grid grid-cols-2 gap-2">
                        {walletDetails.nfts.map((nft: any, index: number) => (
                          <div key={index} className="p-2 bg-muted/30 rounded-md">
                            <div className="w-full aspect-square bg-muted rounded-md mb-2 flex items-center justify-center">
                              {nft.metadata?.image ? (
                                <img 
                                  src={nft.metadata.image} 
                                  alt={nft.name || 'NFT'} 
                                  className="rounded-md object-cover w-full h-full"
                                />
                              ) : (
                                <span className="text-xs text-muted-foreground">No Image</span>
                              )}
                            </div>
                            <p className="text-sm font-medium truncate">{nft.name || `NFT #${nft.token_id}`}</p>
                            <p className="text-xs text-muted-foreground truncate">{nft.symbol || 'Unknown'}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[240px] border rounded-md p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-2">No NFTs found in this wallet</p>
                      <p className="text-xs text-muted-foreground">NFTs you own will appear here</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="staking" className="space-y-4 pt-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Staking Options</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowStakeDialog(true)}
                    >
                      Stake Tokens
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-3 border rounded-md">
                      <div className="flex justify-between mb-2">
                        <h4 className="text-sm font-medium">SOL Staking</h4>
                        <Badge variant="outline" className="text-xs">8.2% APY</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Stake your SOL to earn passive income with competitive returns
                      </p>
                      <Separator className="my-2" />
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Minimum Stake</span>
                        <span>0.1 SOL</span>
                      </div>
                    </div>
                    
                    <div className="p-3 border rounded-md">
                      <div className="flex justify-between mb-2">
                        <h4 className="text-sm font-medium">THC Staking</h4>
                        <Badge variant="outline" className="text-xs">15.8% APY</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Earn higher returns by staking THC tokens and support platform development
                      </p>
                      <Separator className="my-2" />
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Minimum Stake</span>
                        <span>10 THC</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => setShowWalletDetails(false)}
              >
                Close
              </Button>
              <Button
                variant="destructive"
                className="w-full sm:w-auto"
                onClick={disconnectWallet}
              >
                Disconnect Wallet
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Purchase THC Dialog */}
      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Purchase THC Tokens</DialogTitle>
            <DialogDescription>
              Buy THC tokens to stake and access premium features
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="purchase-amount">Amount to Purchase</Label>
              <div className="flex items-center">
                <Input
                  id="purchase-amount"
                  type="number"
                  min="1"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value)}
                  className="flex-1"
                />
                <span className="ml-2 text-sm font-medium">THC</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Estimated cost: {formatUsd(parseFloat(purchaseAmount) * 0.15)}
              </p>
            </div>
            
            <div className="bg-muted p-3 rounded-md">
              <h4 className="text-sm font-medium mb-1">Benefits of THC tokens:</h4>
              <ul className="text-xs space-y-1 text-muted-foreground list-disc pl-4">
                <li>Access premium trading signals</li>
                <li>Reduced platform fees</li>
                <li>Stake for passive income (15.8% APY)</li>
                <li>Participate in platform governance</li>
              </ul>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPurchaseDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePurchaseThc}
            >
              Purchase THC
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Stake Tokens Dialog */}
      <Dialog open={showStakeDialog} onOpenChange={setShowStakeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Stake Tokens</DialogTitle>
            <DialogDescription>
              Stake your tokens to earn passive income
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="stake-token">Token to Stake</Label>
              <div className="flex gap-4">
                <Button
                  variant={stakeToken === 'SOL' ? 'default' : 'outline'}
                  onClick={() => setStakeToken('SOL')}
                  className="flex-1"
                >
                  SOL
                </Button>
                <Button
                  variant={stakeToken === 'THC' ? 'default' : 'outline'}
                  onClick={() => setStakeToken('THC')}
                  className="flex-1"
                >
                  THC
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="stake-amount">Amount to Stake</Label>
              <div className="flex items-center">
                <Input
                  id="stake-amount"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="flex-1"
                />
                <span className="ml-2 text-sm font-medium">{stakeToken}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Available: {stakeToken === 'SOL' ? formatBalance(solBalance, 'SOL') : formatBalance(thcBalance, 'THC')}
              </p>
            </div>
            
            <div className="bg-muted p-3 rounded-md">
              <h4 className="text-sm font-medium mb-1">Staking Information:</h4>
              <div className="text-xs space-y-2 text-muted-foreground">
                <div className="flex justify-between">
                  <span>APY:</span>
                  <span className="font-medium">{stakeToken === 'SOL' ? '8.2%' : '15.8%'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Lock period:</span>
                  <span className="font-medium">30 days</span>
                </div>
                <div className="flex justify-between">
                  <span>Early withdrawal fee:</span>
                  <span className="font-medium">5%</span>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowStakeDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStakeTokens}
              disabled={
                (stakeToken === 'SOL' && parseFloat(stakeAmount) > parseFloat(solBalance)) ||
                (stakeToken === 'THC' && parseFloat(stakeAmount) > parseFloat(thcBalance))
              }
            >
              Stake {stakeToken}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default WalletConnectWeb3Auth;