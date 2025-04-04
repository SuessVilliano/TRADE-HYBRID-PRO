import React, { useState } from 'react';
import { Button } from './button';
import { X } from 'lucide-react';

interface CryptoWalletConnectModalProps {
  onClose: () => void;
  onNext?: () => void;
  currentStep?: number;
  totalSteps?: number;
}

export function CryptoWalletConnectModal({ 
  onClose, 
  onNext, 
  currentStep = 1, 
  totalSteps = 8 
}: CryptoWalletConnectModalProps) {
  const [connecting, setConnecting] = useState(false);

  const handleConnect = () => {
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      if (onNext) onNext();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-background rounded-lg shadow-lg overflow-hidden">
        <div className="relative">
          {/* Header with close button */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex flex-col">
              <h3 className="text-lg font-medium flex items-center">
                <span>Connect Your Crypto Wallet</span>
                <span className="ml-2 text-sm text-muted-foreground">
                  Step {currentStep} of {totalSteps}
                </span>
              </h3>
              <p className="text-sm text-muted-foreground">
                Let's connect your cryptocurrency wallet to enable trading, staking, and other blockchain features on Trade Hybrid.
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-3 right-3" 
              onClick={onClose}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-6">
              <div className="bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 p-4 rounded-lg">
                <p className="text-sm font-medium">What is a crypto wallet?</p>
                <p className="text-sm mt-1">
                  A cryptocurrency wallet is a secure digital tool that allows you to store, send, and receive 
                  digital assets. It's your personal interface to the blockchain ecosystem.
                </p>
              </div>

              <div className="space-y-4">
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                    <span>Enhanced account security</span>
                  </li>
                </ul>
              </div>

              <div className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 p-4 rounded-lg">
                <p className="text-sm font-medium">Don't have a wallet?</p>
                <p className="text-sm mt-1">
                  You'll need to install a wallet first. Visit <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="underline">MetaMask.io</a> or <a href="https://phantom.app" target="_blank" rel="noopener noreferrer" className="underline">Phantom.app</a> to get started.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-4 border-t">
            <Button variant="ghost" onClick={onClose}>
              Previous
            </Button>
            <Button onClick={handleConnect} disabled={connecting}>
              {connecting ? "Connecting..." : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}