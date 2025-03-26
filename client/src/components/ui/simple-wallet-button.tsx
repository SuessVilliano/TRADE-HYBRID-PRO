import { useState } from 'react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { Input } from './input';
import { Label } from './label';
import { useGuest } from '@/lib/stores/useGuest';

// A simplified wallet button that doesn't use web3 providers directly
export function SimpleWalletButton() {
  const [showDialog, setShowDialog] = useState(false);
  const { login, isLoggedIn, guestUsername } = useGuest();
  const [address, setAddress] = useState('');
  const [connecting, setConnecting] = useState(false);
  
  const handleConnect = () => {
    setConnecting(true);
    // Simulate connection delay
    setTimeout(() => {
      login();
      setShowDialog(false);
      setConnecting(false);
    }, 1000);
  };
  
  const handleDemo = () => {
    login();
    setShowDialog(false);
  };

  // Generate a random address-like string
  const getRandomAddress = () => {
    const chars = '0123456789abcdef';
    let result = '0x';
    for (let i = 0; i < 40; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  };

  // Helper to truncate wallet address
  const truncateAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="w-full">
      {isLoggedIn ? (
        <div className="flex items-center justify-between bg-accent/50 rounded-md p-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium">Connected</span>
              <span className="text-xs text-muted-foreground">{truncateAddress(getRandomAddress())}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDialog(true)}
          >
            Change
          </Button>
        </div>
      ) : (
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => setShowDialog(true)}
        >
          Connect Wallet
        </Button>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Wallet</DialogTitle>
            <DialogDescription>
              Connect your wallet to access the full trading experience.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="wallet-address">Wallet Address</Label>
              <Input
                id="wallet-address"
                placeholder="0x..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter your wallet address or connect using the buttons below.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => setAddress(getRandomAddress())}>
                Generate Demo Address
              </Button>
              <Button variant="outline" disabled>Scan QR Code</Button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or connect with
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" className="flex flex-col items-center justify-center h-20 p-2">
                <svg className="h-8 w-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-xs">MetaMask</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center justify-center h-20 p-2">
                <svg className="h-8 w-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth={2} strokeLinecap="round" />
                  <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth={2} strokeLinecap="round" />
                </svg>
                <span className="text-xs">WalletConnect</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center justify-center h-20 p-2">
                <svg className="h-8 w-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth={1.5} />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h8" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v8" />
                </svg>
                <span className="text-xs">Coinbase</span>
              </Button>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button variant="ghost" onClick={handleDemo}>
              Continue as Guest
            </Button>
            <Button type="submit" onClick={handleConnect} disabled={connecting}>
              {connecting ? "Connecting..." : "Connect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}