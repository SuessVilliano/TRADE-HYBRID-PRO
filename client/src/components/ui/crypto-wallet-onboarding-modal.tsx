import React, { useState } from 'react';
import { X, Wallet, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

interface CryptoWalletOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep?: number;
  totalSteps?: number;
}

export function CryptoWalletOnboardingModal({
  isOpen,
  onClose,
  currentStep = 1,
  totalSteps = 3
}: CryptoWalletOnboardingModalProps) {
  const [activeStep, setActiveStep] = useState(currentStep);
  const [connecting, setConnecting] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  const handleConnect = (walletName: string) => {
    setSelectedWallet(walletName);
    setConnecting(true);
    
    // Simulate connection
    setTimeout(() => {
      setConnecting(false);
      if (activeStep < totalSteps) {
        setActiveStep(prev => prev + 1);
      } else {
        onClose();
      }
    }, 1500);
  };

  const handleBack = () => {
    if (activeStep > 1) {
      setActiveStep(prev => prev - 1);
    } else {
      onClose();
    }
  };
  
  const handleClose = () => {
    setActiveStep(1);
    setConnecting(false);
    setSelectedWallet(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md bg-background rounded-lg shadow-lg overflow-hidden">
        <div className="relative">
          {/* Header with step indicator and close button */}
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h3 className="text-lg font-semibold">Connect Your Crypto Wallet</h3>
              <p className="text-sm text-muted-foreground">
                Step {activeStep} of {totalSteps}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-3 right-3" 
              onClick={handleClose}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          {activeStep === 1 && (
            <div className="p-6">
              <p className="mb-4">
                Let's connect your cryptocurrency wallet to enable trading, staking, and other blockchain features on Trade Hybrid.
              </p>
              
              <div className="space-y-4">
                <div className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 p-4 rounded-lg">
                  <p className="font-medium mb-1">What is a crypto wallet?</p>
                  <p className="text-sm">
                    A cryptocurrency wallet is a secure digital tool that allows you to store, send, and receive digital assets. 
                    It's your personal interface to the blockchain ecosystem.
                  </p>
                </div>
                
                <h4 className="font-medium">Benefits of connecting your wallet:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <svg
                      className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Trade directly from your wallet without deposits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Access exclusive blockchain features & airdrops</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Enhanced account security</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
          
          {activeStep === 2 && (
            <div className="p-6">
              <h4 className="font-medium mb-4">Choose your wallet:</h4>
              
              <Tabs defaultValue="popular" className="w-full">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="popular" className="flex-1">Popular</TabsTrigger>
                  <TabsTrigger value="more" className="flex-1">More Options</TabsTrigger>
                </TabsList>
                
                <TabsContent value="popular" className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto py-3 px-4"
                    onClick={() => handleConnect("MetaMask")}
                    disabled={connecting}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <svg width="28" height="28" viewBox="0 0 35 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M32.9583 1L19.8242 10.7183L22.2666 4.99099L32.9583 1Z" fill="#E17726" stroke="#E17726" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2.66602 1L15.6735 10.8331L13.3527 4.99099L2.66602 1Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">MetaMask</p>
                        <p className="text-xs text-muted-foreground">Connect using browser wallet</p>
                      </div>
                      <ArrowRight size={16} className="flex-shrink-0 text-muted-foreground" />
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto py-3 px-4"
                    onClick={() => handleConnect("WalletConnect")}
                    disabled={connecting}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <svg width="28" height="28" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M25.4995 33.8003C41.3334 18.6003 67.4667 18.6003 83.2996 33.8003L85.8311 36.2661C86.7 37.0998 86.7 38.4661 85.8311 39.2998L78.7999 46.0661C78.3667 46.4661 77.6667 46.4661 77.2334 46.0661L73.6346 42.6003C62.5667 32.0003 46.2334 32.0003 35.1646 42.6003L31.2995 46.3336C30.8673 46.7336 30.1673 46.7336 29.7341 46.3336L22.7029 39.5661C21.834 38.7324 21.834 37.3661 22.7029 36.5324L25.4995 33.8003Z" fill="#3B99FC"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">WalletConnect</p>
                        <p className="text-xs text-muted-foreground">Connect with mobile wallet</p>
                      </div>
                      <ArrowRight size={16} className="flex-shrink-0 text-muted-foreground" />
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto py-3 px-4"
                    onClick={() => handleConnect("Coinbase Wallet")}
                    disabled={connecting}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40Z" fill="#1652F0"/>
                          <path d="M20.0001 6.75C22.0712 6.75 23.7567 8.43437 23.7567 10.5C23.7567 12.5656 22.0712 14.25 20.0001 14.25C17.9289 14.25 16.2435 12.5656 16.2435 10.5C16.2435 8.43437 17.929 6.75 20.0001 6.75ZM23.7568 25.7884V33.2491H16.2436V25.7884H23.7568Z" fill="white"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Coinbase Wallet</p>
                        <p className="text-xs text-muted-foreground">Connect with Coinbase Wallet</p>
                      </div>
                      <ArrowRight size={16} className="flex-shrink-0 text-muted-foreground" />
                    </div>
                  </Button>
                </TabsContent>
                
                <TabsContent value="more" className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto py-3 px-4"
                    onClick={() => handleConnect("Phantom")}
                    disabled={connecting}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <svg width="28" height="28" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="128" height="128" rx="64" fill="#AB9FF2"/>
                          <path d="M110.584 64.9142H99.142C99.142 41.7651 80.173 23 56.7724 23C33.7716 23 15 41.564 15 64.7133C15 87.8622 33.7716 106.627 56.7724 106.627C68.6298 106.627 80.1734 101.812 88.1685 93.8549C90.9649 91.0987 95.536 91.0987 98.3326 93.8549C101.129 96.6108 101.129 101.208 98.3326 103.964C87.5635 114.722 72.193 121 56.7724 121C25.4389 121 0 96.0069 0 64.7133C0 33.4971 25.4389 8.30325 56.7724 8.30325C88.1055 8.50447 113.343 33.4971 113.343 64.9142H110.584Z" fill="white"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Phantom</p>
                        <p className="text-xs text-muted-foreground">Connect with Solana wallet</p>
                      </div>
                      <ArrowRight size={16} className="flex-shrink-0 text-muted-foreground" />
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto py-3 px-4"
                    onClick={() => handleConnect("Trust Wallet")}
                    disabled={connecting}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M29.3363 10.4427L16.6512 4.10938C16.2861 3.9144 15.7139 3.9144 15.3488 4.10938L2.6637 10.4427C2.0916 10.7376 2.0916 11.2325 2.6637 11.5274L15.3488 17.8607C15.7139 18.0557 16.2861 18.0557 16.6512 17.8607L26.0025 13.0477V17.7632C26.0025 18.0582 25.928 18.1557 25.6374 18.3506C25.028 18.7431 24.1442 19.0381 24.1442 20.0279V21.9928C24.1442 22.3878 24.4959 22.6828 24.9593 22.6828C25.4226 22.6828 25.7743 22.3878 25.7743 21.9928V20.3229C25.7743 20.028 25.849 19.9304 26.1394 19.7355C26.7488 19.343 27.6328 19.048 27.6328 18.0582V12.0224C27.6328 11.53 27.0607 11.0351 26.6347 10.8401L16.6512 5.48704C16.2861 5.29206 15.7139 5.29206 15.3488 5.48704L5.36529 10.8401C4.93929 11.0351 4.3672 11.53 4.3672 12.0224V18.0582C4.3672 19.048 5.25115 19.343 5.86053 19.7355C6.15096 19.9304 6.22572 20.028 6.22572 20.3229V24.6476C6.22572 25.2401 6.72672 25.735 7.30341 25.735H11.5609C12.1376 25.735 12.6386 25.2401 12.6386 24.6476V20.905C12.6386 20.6101 12.7134 20.5126 13.0038 20.3176C13.6132 19.9251 14.4972 19.6302 14.4972 18.6403V15.3011C14.4972 14.8062 14.8489 14.5112 15.3123 14.5112C15.7756 14.5112 16.1273 14.8062 16.1273 15.3011V18.6403C16.1273 19.6302 17.0112 19.9251 17.6207 20.3176C17.911 20.5126 17.9858 20.6101 17.9858 20.905V24.6476C17.9858 25.2401 18.4868 25.735 19.0635 25.735H23.321C23.8977 25.735 24.3987 25.2401 24.3987 24.6476V21.9928C24.3987 21.2054 24.9581 20.6251 25.764 20.6251C26.5699 20.6251 27.1294 21.2054 27.1294 21.9928V24.6476C27.1294 26.14 25.8679 27.2273 24.3987 27.2273H19.0635C17.5942 27.2273 16.3327 26.14 16.3327 24.6476V21.5954C16.3327 21.3005 16.258 21.203 15.9675 21.008C15.358 20.6155 14.4741 20.3205 14.4741 19.3307V15.3011C14.4741 14.5136 13.9148 13.9333 13.1089 13.9333C12.303 13.9333 11.7436 14.5136 11.7436 15.3011V19.3307C11.7436 20.3205 10.8597 20.6155 10.2502 21.008C9.95976 21.203 9.88501 21.3005 9.88501 21.5954V24.6476C9.88501 26.14 8.62346 27.2273 7.15425 27.2273H5.98739C4.51819 27.2273 3.25663 26.14 3.25663 24.6476V20.0279C3.25663 19.0381 2.37267 18.7431 1.7633 18.3506C1.47287 18.1557 1.39811 18.0582 1.39811 17.7632V11.7275C1.39811 10.6426 2.25925 9.7503 3.2554 9.2553L15.3488 3.2271C15.7139 3.03213 16.2861 3.03213 16.6512 3.2271L28.7446 9.2553C29.7407 9.7503 30.6019 10.6426 30.6019 11.7275V17.7632C30.6019 18.0582 30.5271 18.1557 30.2367 18.3506C29.6273 18.7431 28.7433 19.0381 28.7433 20.0279V24.6476C28.7433 25.2401 29.2443 25.735 29.821 25.735H30.8263C31.403 25.735 31.904 25.2401 31.904 24.6476V20.3229C31.904 20.028 31.9787 19.9304 32.2692 19.7355C32.8786 19.343 33.7626 19.048 33.7626 18.0582V11.2325C33.7647 10.7376 33.1086 10.1475 29.3363 10.4427Z" fill="#3375BB"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Trust Wallet</p>
                        <p className="text-xs text-muted-foreground">Connect with mobile wallet</p>
                      </div>
                      <ArrowRight size={16} className="flex-shrink-0 text-muted-foreground" />
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto py-3 px-4"
                    onClick={() => handleConnect("Ledger")}
                    disabled={connecting}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <svg width="28" height="28" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" clipRule="evenodd" d="M4.83334 2.5H2.5V13.5H4.83334V2.5ZM13.5 2.5H6.5V13.5H13.5V2.5ZM8.16667 4.16667H11.8333V11.8333H8.16667V4.16667Z" fill="black"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Ledger</p>
                        <p className="text-xs text-muted-foreground">Connect with Ledger hardware wallet</p>
                      </div>
                      <ArrowRight size={16} className="flex-shrink-0 text-muted-foreground" />
                    </div>
                  </Button>
                </TabsContent>
              </Tabs>
            </div>
          )}
          
          {activeStep === 3 && (
            <div className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                {connecting ? (
                  <>
                    <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                      <div className="animate-spin h-10 w-10 border-3 border-blue-600 border-t-transparent rounded-full"></div>
                    </div>
                    <h3 className="text-xl font-semibold">Connecting to {selectedWallet}</h3>
                    <p className="text-muted-foreground">
                      Please approve the connection request in your wallet...
                    </p>
                  </>
                ) : (
                  <>
                    <div className="h-16 w-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-4">
                      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold">Wallet Connected!</h3>
                    <p className="text-muted-foreground">
                      Your {selectedWallet} wallet has been successfully connected to TradeHybrid.
                    </p>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md w-full mt-2">
                      <p className="font-mono text-sm truncate">0x7F5e...4C93</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t">
            <Button 
              variant="outline" 
              onClick={handleBack}
              disabled={connecting}
            >
              {activeStep === 1 ? "Cancel" : "Back"}
            </Button>
            
            {activeStep === 1 && (
              <Button onClick={() => setActiveStep(2)}>
                Choose Wallet
              </Button>
            )}
            
            {activeStep === 3 && !connecting && (
              <Button onClick={handleClose}>
                Done
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}