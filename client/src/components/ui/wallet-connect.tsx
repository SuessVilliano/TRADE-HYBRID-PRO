import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { toast } from 'sonner';
import { ContextualTooltip } from './contextual-tooltip';

// Simplified wallet connect component for demo purposes
export function WalletConnect() {
  const [connected, setConnected] = useState(false);
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<string>("0.05");
  const [walletNetwork, setWalletNetwork] = useState<string>("Ethereum");

  // Initialize first-time tooltip
  useEffect(() => {
    const hasSeenWalletTooltip = localStorage.getItem('hasSeenWalletTooltip');
    if (!hasSeenWalletTooltip && !connected) {
      setShowTooltip(true);
    }
  }, [connected]);

  // Handle tooltip acknowledgment
  const handleTooltipAcknowledge = () => {
    setShowTooltip(false);
    localStorage.setItem('hasSeenWalletTooltip', 'true');
  };
  
  // Connect to wallet - mock implementation
  const connectWallet = (walletType: string) => {
    try {
      setConnecting(true);
      setTimeout(() => {
        // Generate random wallet address
        const address = '0x' + Array.from({length: 40}, () => 
          Math.floor(Math.random() * 16).toString(16)).join('');
        setWalletAddress(address);
        setConnected(true);
        setShowWalletOptions(false);
        toast.success(`${walletType} wallet connected successfully!`);
        setConnecting(false);
      }, 1500);
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      toast.error(`Connection failed: ${error.message || 'Unknown error'}`);
      setConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    try {
      setConnected(false);
      setWalletAddress(null);
      setShowDisconnectConfirm(false);
      toast.success('Wallet disconnected');
    } catch (error: any) {
      console.error('Failed to disconnect wallet:', error);
      toast.error(`Disconnection failed: ${error.message || 'Unknown error'}`);
    }
  };
  
  // Truncate ethereum address
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="relative">
      {connected && walletAddress ? (
        // Connected state
        <ContextualTooltip
          id="wallet-connected-tooltip"
          title="Your Wallet"
          content={
            <div className="space-y-1">
              <p>Click to view your wallet details or disconnect</p>
            </div>
          }
          position="bottom"
        >
          <div 
            className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted cursor-pointer border border-border"
            onClick={() => setShowDisconnectConfirm(!showDisconnectConfirm)}
          >
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1 truncate">
              <div className="font-medium">{truncateAddress(walletAddress)}</div>
              <div className="text-xs text-muted-foreground">{walletBalance} ETH • {walletNetwork}</div>
            </div>
          </div>
        </ContextualTooltip>
      ) : (
        // Not connected state
        <ContextualTooltip
          id="wallet-tooltip"
          title="Connect Your Wallet"
          content={
            <div className="space-y-2">
              <p>Link your crypto wallet to access the trading platform and track your performance</p>
              <ul className="text-xs space-y-1 list-disc pl-4">
                <li>Store trading profits directly in your wallet</li>
                <li>Earn rewards through the affiliate program</li>
                <li>Access exclusive trading features</li>
              </ul>
            </div>
          }
          position="bottom"
          highlight={true}
          showArrow={true}
          autoShow={showTooltip}
          onAcknowledge={handleTooltipAcknowledge}
        >
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowWalletOptions(true)}
            disabled={connecting}
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
        </ContextualTooltip>
      )}

      {/* Wallet options dialog */}
      {showWalletOptions && !connected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md animate-in fade-in-50 zoom-in-95 duration-300 bg-background/95">
            <CardHeader className="bg-background">
              <CardTitle className="text-lg">Connect Wallet</CardTitle>
              <CardDescription>
                Connect your wallet to interact with the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="bg-background/95">
              <Tabs defaultValue="popular" className="w-full">
                <TabsList className="w-full bg-muted/90">
                  <TabsTrigger value="popular" className="flex-1 font-medium text-foreground data-[state=active]:bg-background/90">Popular</TabsTrigger>
                  <TabsTrigger value="more" className="flex-1 font-medium text-foreground data-[state=active]:bg-background/90">More Options</TabsTrigger>
                </TabsList>
                <TabsContent value="popular" className="mt-4 space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto py-3 px-4"
                    onClick={() => connectWallet("MetaMask")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                        <svg className="h-5 w-5 text-orange-500" viewBox="0 0 404 420" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M382.044 198.822L222.208 7.844C214.64 0.178841 204.28 0.178841 196.712 7.844L144.978 64.304V64.408C136.366 72.902 134.526 79.73 136.158 90.682L159.588 64.93C162.954 61.252 167.574 59.308 172.558 59.308H246.362C251.346 59.308 255.862 61.252 259.228 64.93L346.534 161.252C349.9 164.93 351.844 169.652 351.844 174.844C351.844 180.036 349.9 184.654 346.534 188.332L259.228 284.758C255.862 288.436 251.346 290.38 246.362 290.38H172.558C167.574 290.38 162.954 288.436 159.588 284.758L158.06 283.02C146.4 293.868 146.4 311.76 158.06 322.608L196.816 364.898C204.384 372.564 214.744 372.564 222.312 364.898L382.148 173.92C389.716 166.254 389.716 155.272 382.044 198.822Z" fill="currentColor" />
                          <path d="M116.268 130.782L76.4064 173.814C72.8324 177.68 71.0944 182.508 71.0944 187.44C71.0944 192.372 72.8324 197.096 76.4064 200.962L116.268 243.994C119.842 247.86 124.046 249.7 128.448 249.7H189.638V218.662H145.198C141.83 218.662 138.464 217.238 135.826 214.594L108.492 185.214C106.028 182.388 106.028 178.18 108.492 175.458L135.826 146.078C138.464 143.33 141.83 142.01 145.198 142.01H189.638V110.972H128.448C124.046 110.972 119.842 112.916 116.268 130.782Z" fill="currentColor" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">MetaMask</p>
                        <p className="text-xs text-muted-foreground">Connect using browser wallet</p>
                      </div>
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto py-3 px-4"
                    onClick={() => connectWallet("WalletConnect")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg className="h-5 w-5 text-blue-500" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M169.209 151.951C215.806 106.542 290.193 106.542 336.791 151.951L345.866 160.795C348.712 163.57 348.712 168.049 345.866 170.824L324.297 191.803C322.874 193.19 320.521 193.19 319.098 191.803L306.494 179.538C275.299 149.295 230.7 149.295 199.506 179.538L186.115 192.52C184.692 193.907 182.339 193.907 180.915 192.52L159.347 171.54C156.5 168.765 156.5 164.287 159.347 161.512L169.209 151.951ZM377.251 191.173L396.423 209.909C399.27 212.684 399.27 217.162 396.423 219.937L303.647 309.694C301.224 312.081 297.147 312.081 294.724 309.694L230.392 247.033C229.68 246.339 228.53 246.339 227.819 247.033L163.487 309.694C161.063 312.081 156.987 312.081 154.563 309.694L61.7874 219.937C58.9406 217.162 58.9406 212.684 61.7874 209.909L80.9603 191.173C83.8071 188.398 88.2837 188.398 91.1305 191.173L155.463 253.834C156.174 254.528 157.324 254.528 158.036 253.834L222.368 191.173C224.792 188.786 228.868 188.786 231.291 191.173L295.624 253.834C296.335 254.528 297.485 254.528 298.196 253.834L362.528 191.173C365.505 188.398 369.982 188.398 372.829 191.173H377.251Z" fill="currentColor"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">WalletConnect</p>
                        <p className="text-xs text-muted-foreground">Use mobile wallet via QR code</p>
                      </div>
                    </div>
                  </Button>
                </TabsContent>
                
                <TabsContent value="more" className="mt-4 space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto py-3 px-4"
                    onClick={() => connectWallet("Coinbase Wallet")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg className="h-5 w-5 text-blue-500" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" clipRule="evenodd" d="M512 1024C794.77 1024 1024 794.77 1024 512C1024 229.23 794.77 0 512 0C229.23 0 0 229.23 0 512C0 794.77 229.23 1024 512 1024ZM516.9 188.42C674.26 188.42 802.1 316.26 802.1 473.62C802.1 631 674.26 758.83 516.9 758.83C359.54 758.83 231.7 631 231.7 473.62C231.7 316.26 359.54 188.42 516.9 188.42ZM517.04 295.15C420.12 295.15 341.41 373.85 341.41 470.77C341.41 567.7 420.12 646.41 517.04 646.41C613.96 646.41 692.67 567.7 692.67 470.77C692.67 373.85 613.96 295.15 517.04 295.15Z" fill="currentColor" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Coinbase Wallet</p>
                        <p className="text-xs text-muted-foreground">Connect using Coinbase Wallet</p>
                      </div>
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto py-3 px-4"
                    onClick={() => connectWallet("Trust Wallet")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20.33 3.66996C20.1408 3.48213 19.9157 3.33641 19.6679 3.2407C19.4201 3.145 19.1546 3.10114 18.887 3.10996C18.3521 3.10996 17.8391 3.32329 17.462 3.70038C17.0849 4.07746 16.8716 4.59051 16.8716 5.12537C16.8716 5.66024 17.0849 6.17329 17.462 6.55038C17.8391 6.92746 18.3521 7.14079 18.887 7.14079C19.1542 7.14509 19.4188 7.09765 19.6658 6.9988C19.9128 6.89994 20.1369 6.75165 20.325 6.56184C20.5131 6.37204 20.6594 6.14656 20.7561 5.89862C20.8528 5.65067 20.8982 5.3856 20.887 5.11826C20.8982 4.85091 20.8528 4.58584 20.7561 4.3379C20.6594 4.08996 20.5131 3.86448 20.325 3.67467L20.33 3.66996Z" fill="currentColor"/>
                          <path d="M12.175 9.81998C11.9858 9.63235 11.7609 9.48679 11.5133 9.39118C11.2656 9.29556 11.0004 9.25174 10.733 9.25998C10.1981 9.25998 9.68509 9.47331 9.308 9.8504C8.93092 10.2275 8.71759 10.7405 8.71759 11.2754C8.71759 11.8103 8.93092 12.3233 9.308 12.7004C9.68509 13.0775 10.1981 13.2908 10.733 13.2908C11.0008 13.2945 11.2658 13.2463 11.5132 13.1464C11.7605 13.0465 11.9849 12.8969 12.173 12.706C12.361 12.515 12.5086 12.2885 12.6064 12.0397C12.704 11.7909 12.7499 11.525 12.744 11.2572C12.7506 10.9895 12.7051 10.7234 12.6078 10.4745C12.5104 10.2256 12.3628 9.9989 12.175 9.80798V9.81998Z" fill="currentColor"/>
                          <path d="M5.537 17.093C5.34795 16.9055 5.12314 16.7602 4.87556 16.6648C4.62799 16.5694 4.36334 16.5258 4.097 16.536C3.56214 16.536 3.04909 16.7493 2.672 17.1264C2.29492 17.5035 2.08159 18.0165 2.08159 18.5514C2.08159 19.0863 2.29492 19.5993 2.672 19.9764C3.04909 20.3535 3.56214 20.5668 4.097 20.5668C4.36397 20.5756 4.62872 20.5326 4.87629 20.437C5.12386 20.3414 5.34853 20.1958 5.5365 20.0083C5.72448 19.8207 5.87038 19.5944 5.96634 19.3468C6.06231 19.0992 6.10599 18.8345 6.097 18.5685C6.10685 18.3022 6.06381 18.0372 5.96819 17.7894C5.87258 17.5417 5.72672 17.3153 5.538 17.128L5.537 17.093Z" fill="currentColor"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Trust Wallet</p>
                        <p className="text-xs text-muted-foreground">Connect using Trust Wallet</p>
                      </div>
                    </div>
                  </Button>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end mt-4 gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setShowWalletOptions(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Disconnect confirmation */}
      {showDisconnectConfirm && connected && (
        <div className="absolute top-full right-0 mt-2 z-50 w-60 bg-background border border-border rounded-md shadow-lg p-4 animate-in fade-in-50 slide-in-from-top-2">
          <h3 className="font-medium mb-2">Disconnect Wallet</h3>
          <p className="text-sm text-muted-foreground mb-3">Are you sure you want to disconnect your wallet?</p>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDisconnectConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={disconnectWallet}
            >
              Disconnect
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}