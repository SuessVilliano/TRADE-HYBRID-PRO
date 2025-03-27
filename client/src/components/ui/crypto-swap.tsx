import React, { useState } from 'react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Coins } from 'lucide-react';

interface CryptoSwapProps {
  className?: string;
}

export function CryptoSwap({ className }: CryptoSwapProps) {
  const [showSwapPopup, setShowSwapPopup] = useState(false);

  const openSwapPopup = () => {
    setShowSwapPopup(true);
  };

  const closeSwapPopup = () => {
    setShowSwapPopup(false);
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className={`flex items-center gap-2 ${className}`}
        onClick={openSwapPopup}
      >
        <Coins className="h-4 w-4" />
        <span>Trade $THY</span>
      </Button>

      {showSwapPopup && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <Card className="w-full max-w-4xl animate-in fade-in-50 zoom-in-95 duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Trade Hybrid Token</CardTitle>
                <CardDescription>
                  Trade our native token on Raydium DEX
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={closeSwapPopup}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="h-5 w-5"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-hidden rounded-md h-[600px]">
                <iframe 
                  src="https://raydium.io/swap/?inputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&outputMint=5GedhKVXeyEM7Tun4rTu8mF56PSF9brdbD3t2LEUQxTL" 
                  style={{ width: '100%', height: '100%', border: 'none' }} 
                  title="Raydium Swap"
                ></iframe>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold">$THY</span> - The official token of Trade Hybrid platform
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.open('https://raydium.io/swap/?inputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&outputMint=5GedhKVXeyEM7Tun4rTu8mF56PSF9brdbD3t2LEUQxTL', '_blank')}
              >
                Open in New Tab
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
}