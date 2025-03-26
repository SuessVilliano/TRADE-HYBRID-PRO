import React, { useState } from 'react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

// A simplified wallet connect button that doesn't use web3-react
// This avoids the context provider issues that cause crashes
export function SimpleWalletButton() {
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // Mock connection function
  const connectWallet = async (walletType: string) => {
    try {
      setConnecting(true);
      console.log(`Connecting to ${walletType}...`);
      
      // In a real implementation, this would do the actual connection
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Close the modal
      setShowWalletOptions(false);
      
      // Here you would typically dispatch to state management
      console.log(`${walletType} connected successfully!`);
      
      // Show toast
      if (typeof window !== 'undefined') {
        const toast = (window as any).toast;
        if (toast && toast.success) {
          toast.success('Wallet connected successfully!');
        }
      }
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      
      // Show error toast
      if (typeof window !== 'undefined') {
        const toast = (window as any).toast;
        if (toast && toast.error) {
          toast.error(`Connection failed: ${error.message || 'Unknown error'}`);
        }
      }
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="default"
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

      {/* Wallet options dialog */}
      {showWalletOptions && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md animate-in fade-in-50 zoom-in-95 duration-300">
            <CardHeader>
              <CardTitle className="text-lg">Connect Wallet</CardTitle>
              <CardDescription>
                Connect your wallet to interact with the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="popular" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="popular" className="flex-1">Popular</TabsTrigger>
                  <TabsTrigger value="more" className="flex-1">More Options</TabsTrigger>
                </TabsList>
                <TabsContent value="popular" className="mt-4 space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto py-3 px-4"
                    onClick={() => connectWallet('MetaMask')}
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
                    onClick={() => connectWallet('WalletConnect')}
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
                    onClick={() => connectWallet('Coinbase')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 10H21M7 15H9M12 15H14M6.2 19H17.8C18.9201 19 19.4802 19 19.908 18.782C20.2843 18.5903 20.5903 18.2843 20.782 17.908C21 17.4802 21 16.9201 21 15.8V8.2C21 7.0799 21 6.51984 20.782 6.09202C20.5903 5.7157 20.2843 5.40974 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.07989 5 4.51984 5 4.09202 5.21799C3.7157 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V15.8C3 16.9201 3 17.4802 3.21799 17.908C3.40973 18.2843 3.7157 18.5903 4.09202 18.782C4.51984 19 5.07989 19 6.2 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Coinbase Wallet</p>
                        <p className="text-xs text-muted-foreground">Connect using Coinbase Wallet</p>
                      </div>
                    </div>
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setShowWalletOptions(false)}>
                Cancel
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}