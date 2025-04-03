import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useOnboarding } from '@/lib/context/OnboardingProvider';
import { toast } from 'sonner';
import { AlertCircle, AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, HelpCircle, Info, Link, Wallet } from 'lucide-react';

export default function WalletConnectOnboarding() {
  const navigate = useNavigate();
  const { currentFlow, currentStepIndex, nextStep, prevStep, skipOnboarding } = useOnboarding();
  const [step, setStep] = useState<number>(0);
  const [connecting, setConnecting] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  // Set up the steps for the onboarding process
  const steps = [
    {
      title: "Connect Your Crypto Wallet",
      description: "Let's connect your cryptocurrency wallet to enable trading, staking, and other blockchain features on Trade Hybrid.",
      content: (
        <div className="space-y-6">
          <div className="bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 p-4 rounded-lg flex items-start gap-3">
            <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">What is a crypto wallet?</p>
              <p className="text-sm">A cryptocurrency wallet is a secure digital tool that allows you to store, send, and receive digital assets. It's your personal interface to the blockchain ecosystem.</p>
            </div>
          </div>
          
          <div className="grid gap-4">
            <h3 className="font-medium text-base">Benefits of connecting your wallet:</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span>Trade directly from your wallet without deposits</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span>Access exclusive blockchain features & airdrops</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span>Participate in governance and staking</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span>Enhanced account security</span>
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Choose Your Wallet",
      description: "Select from our supported wallet options to continue.",
      content: (
        <div className="space-y-6">
          <Tabs defaultValue="popular" className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="popular">Popular Wallets</TabsTrigger>
              <TabsTrigger value="other">Other Options</TabsTrigger>
            </TabsList>
            
            <TabsContent value="popular" className="space-y-4 pt-4">
              <Button
                variant="outline"
                className={`w-full justify-start h-auto py-3 px-4 ${selectedWallet === 'MetaMask' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedWallet('MetaMask')}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <svg className="h-5 w-5 text-orange-500" viewBox="0 0 404 420" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M382.044 198.822L222.208 7.844C214.64 0.178841 204.28 0.178841 196.712 7.844L144.978 64.304V64.408C136.366 72.902 134.526 79.73 136.158 90.682L159.588 64.93C162.954 61.252 167.574 59.308 172.558 59.308H246.362C251.346 59.308 255.862 61.252 259.228 64.93L346.534 161.252C349.9 164.93 351.844 169.652 351.844 174.844C351.844 180.036 349.9 184.654 346.534 188.332L259.228 284.758C255.862 288.436 251.346 290.38 246.362 290.38H172.558C167.574 290.38 162.954 288.436 159.588 284.758L158.06 283.02C146.4 293.868 146.4 311.76 158.06 322.608L196.816 364.898C204.384 372.564 214.744 372.564 222.312 364.898L382.148 173.92C389.716 166.254 389.716 155.272 382.044 198.822Z" fill="currentColor" />
                      <path d="M116.268 130.782L76.4064 173.814C72.8324 177.68 71.0944 182.508 71.0944 187.44C71.0944 192.372 72.8324 197.096 76.4064 200.962L116.268 243.994C119.842 247.86 124.046 249.7 128.448 249.7H189.638V218.662H145.198C141.83 218.662 138.464 217.238 135.826 214.594L108.492 185.214C106.028 182.388 106.028 178.18 108.492 175.458L135.826 146.078C138.464 143.33 141.83 142.01 145.198 142.01H189.638V110.972H128.448C124.046 110.972 119.842 112.916 116.268 130.782Z" fill="currentColor" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">MetaMask</p>
                    <p className="text-xs text-muted-foreground">Most popular browser wallet</p>
                  </div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className={`w-full justify-start h-auto py-3 px-4 ${selectedWallet === 'Phantom' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedWallet('Phantom')}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <svg className="h-5 w-5 text-purple-600" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M113.5935 17.8054C113.5935 14.2143 110.6899 11.3107 107.0988 11.3107H20.4252C16.834 11.3107 13.9304 14.2143 13.9304 17.8054V76.5167C13.9304 80.1079 16.834 83.0114 20.4252 83.0114H35.4147V98.0009C35.4147 99.3965 36.8103 100.792 38.2059 100.792C38.9037 100.792 39.6015 100.443 40.2993 99.7456L55.9866 83.0114H66.9273V90.9039C66.9273 94.495 69.8309 97.3986 73.422 97.3986H90.5041L106.192 113.085C106.89 113.784 107.588 114.133 108.286 114.133C109.681 114.133 111.077 112.736 111.077 111.341V97.3986H113.5933C117.1844 97.3986 120.088 94.495 120.088 90.9039V24.3002C120.088 20.709 117.1844 17.8054 113.5933 17.8054" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Phantom</p>
                    <p className="text-xs text-muted-foreground">Solana's most popular wallet</p>
                  </div>
                </div>
              </Button>
            </TabsContent>
            
            <TabsContent value="other" className="space-y-4 pt-4">
              <Button
                variant="outline" 
                className={`w-full justify-start h-auto py-3 px-4 ${selectedWallet === 'WalletConnect' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedWallet('WalletConnect')}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <svg className="h-5 w-5 text-blue-500" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M169.209 151.951C215.806 106.542 290.193 106.542 336.791 151.951L345.866 160.795C348.712 163.57 348.712 168.049 345.866 170.824L324.297 191.803C322.874 193.19 320.521 193.19 319.098 191.803L306.494 179.538C275.299 149.295 230.7 149.295 199.506 179.538L186.115 192.52C184.692 193.907 182.339 193.907 180.915 192.52L159.347 171.54C156.5 168.765 156.5 164.287 159.347 161.512L169.209 151.951ZM377.251 191.173L396.423 209.909C399.27 212.684 399.27 217.162 396.423 219.937L303.647 309.694C301.224 312.081 297.147 312.081 294.724 309.694L230.392 247.033C229.68 246.339 228.53 246.339 227.819 247.033L163.487 309.694C161.063 312.081 156.987 312.081 154.563 309.694L61.7874 219.937C58.9406 217.162 58.9406 212.684 61.7874 209.909L80.9603 191.173C83.8071 188.398 88.2837 188.398 91.1305 191.173L155.463 253.834C156.174 254.528 157.324 254.528 158.036 253.834L222.368 191.173C224.792 188.786 228.868 188.786 231.291 191.173L295.624 253.834C296.335 254.528 297.485 254.528 298.196 253.834L362.528 191.173C365.505 188.398 369.982 188.398 372.829 191.173H377.251Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">WalletConnect</p>
                    <p className="text-xs text-muted-foreground">Connect with mobile wallet</p>
                  </div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className={`w-full justify-start h-auto py-3 px-4 ${selectedWallet === 'Coinbase' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedWallet('Coinbase')}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
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
            </TabsContent>
          </Tabs>
          
          <div className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 p-4 rounded-lg flex items-start gap-3 mt-4">
            <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Don't have a wallet?</p>
              <p className="text-sm">You'll need to install a wallet first. Visit <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="underline">MetaMask.io</a> or <a href="https://phantom.app" target="_blank" rel="noopener noreferrer" className="underline">Phantom.app</a> to get started.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Connect Your Wallet",
      description: "Follow these steps to connect your selected wallet.",
      content: (
        <div className="space-y-6">
          <div className="grid gap-6">
            {!walletConnected ? (
              <>
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-medium text-base mb-2">Connection Instructions:</h3>
                  <ol className="list-decimal space-y-2 pl-4">
                    <li>Make sure your {selectedWallet} wallet is installed</li>
                    <li>Click the "Connect {selectedWallet}" button below</li>
                    <li>Approve the connection request in your wallet</li>
                  </ol>
                </div>
                
                <Button
                  onClick={() => {
                    setConnecting(true);
                    // Simulate wallet connection
                    setTimeout(() => {
                      setConnecting(false);
                      setWalletConnected(true);
                      toast.success("Wallet connected successfully!");
                    }, 2000);
                  }}
                  disabled={connecting || !selectedWallet}
                  className="w-full"
                >
                  {connecting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                      <span>Connecting...</span>
                    </div>
                  ) : (
                    <>
                      <Link className="mr-2 h-4 w-4" />
                      <span>Connect {selectedWallet}</span>
                    </>
                  )}
                </Button>
                
                <div className="bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200 p-4 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Security Tips:</p>
                    <ul className="text-sm space-y-1">
                      <li>• Always verify you're on tradehybrid.com</li>
                      <li>• Never share your recovery phrase</li>
                      <li>• We will never ask for your private keys</li>
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <div className="bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-200 p-4 rounded-lg flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Wallet Successfully Connected!</p>
                    <p className="text-sm">Your {selectedWallet} wallet is now connected to Trade Hybrid.</p>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-muted-foreground">Wallet Type</div>
                    <div className="font-medium">{selectedWallet}</div>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-muted-foreground">Address</div>
                    <div className="font-medium font-mono text-sm">0x1a2...3b4c</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Status</div>
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <div className="h-2 w-2 bg-green-600 dark:bg-green-400 rounded-full"></div>
                      <span className="text-sm font-medium">Connected</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 p-4 rounded-lg flex items-start gap-3">
                  <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">What's Next?</p>
                    <p className="text-sm">You can now access all blockchain features of the Trade Hybrid platform, including staking, trading with crypto, and more.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      title: "Wallet Connection Complete",
      description: "You've successfully connected your wallet to Trade Hybrid.",
      content: (
        <div className="space-y-6">
          <div className="bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-200 p-6 rounded-lg flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 bg-green-200 dark:bg-green-900 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Wallet Successfully Connected!</h3>
              <p className="text-sm mt-1">Your wallet is now linked to your Trade Hybrid account.</p>
            </div>
          </div>
          
          <div className="grid gap-4">
            <h3 className="font-medium text-base">You can now:</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span>Access blockchain-based trading features</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span>Participate in staking and earning programs</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span>Send and receive crypto directly from the platform</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span>Access exclusive blockchain features</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 p-4 rounded-lg flex items-start gap-3">
            <HelpCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Need Help?</p>
              <p className="text-sm">If you have any questions about using your wallet with Trade Hybrid, visit our Help Center or contact support.</p>
            </div>
          </div>
        </div>
      )
    }
  ];
  
  // If currentFlow is set and it's the wallet-connection flow, use its step index
  useEffect(() => {
    if (currentFlow?.id === 'wallet-connection' && currentStepIndex >= 0) {
      setStep(currentStepIndex);
    }
  }, [currentFlow, currentStepIndex]);
  
  // Handle moving to next step
  const handleNext = () => {
    if (step === 1 && !selectedWallet) {
      toast.error("Please select a wallet to continue");
      return;
    }
    
    if (step === 2 && !walletConnected) {
      toast.error("Please connect your wallet to continue");
      return;
    }
    
    if (step < steps.length - 1) {
      setStep(step + 1);
      if (currentFlow?.id === 'wallet-connection') {
        nextStep();
      }
    } else {
      // Finish onboarding
      if (currentFlow?.id === 'wallet-connection') {
        skipOnboarding();
      }
      navigate('/dashboard');
    }
  };
  
  // Handle moving to previous step
  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
      if (currentFlow?.id === 'wallet-connection') {
        prevStep();
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{steps[step].title}</CardTitle>
            <div className="text-sm text-muted-foreground">
              Step {step + 1} of {steps.length}
            </div>
          </div>
          <CardDescription>
            {steps[step].description}
          </CardDescription>
          <div className="w-full bg-muted h-1 mt-2 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-300 ease-in-out" 
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </CardHeader>
        <CardContent>
          {steps[step].content}
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t p-4">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={step === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          
          <Button
            onClick={handleNext}
          >
            {step === steps.length - 1 ? (
              <>
                Finish
                <CheckCircle2 className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}