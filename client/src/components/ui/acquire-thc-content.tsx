import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { Badge } from './badge';
import { ThcTokenPurchase } from './thc-token-purchase';
import {
  Rocket,
  Copy,
  ArrowDownUp,
  ShieldCheck,
  Network,
  ExternalLink,
  Info as InfoIcon,
} from 'lucide-react';
import { THC_TOKEN } from '@/lib/contracts/thc-token-info';
import { useToast } from './use-toast';

export function AcquireThcContent() {
  const { toast } = useToast();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* THC Purchase Component */}
        <ThcTokenPurchase className="h-full" />
        
        {/* Token Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Rocket className="mr-2 h-5 w-5 text-blue-500" />
              THC Token Information
            </CardTitle>
            <CardDescription className="text-gray-300">
              Learn about THC token benefits and features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-white/5 border border-slate-700 p-4 rounded-md">
              <div className="text-sm text-slate-400">Contract Address</div>
              <div className="flex items-center gap-1 mt-1 text-sm">
                <code className="font-mono bg-slate-800 px-2 py-1 rounded text-xs">
                  {THC_TOKEN.contractAddress || THC_TOKEN.tokenAddress}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => {
                    navigator.clipboard.writeText(THC_TOKEN.contractAddress || THC_TOKEN.tokenAddress);
                    toast({
                      title: "Copied!",
                      description: "Contract address copied to clipboard",
                    });
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <Alert className="bg-slate-800 border-blue-700">
              <InfoIcon className="h-4 w-4 text-blue-400" />
              <AlertTitle>Multiple Ways to Acquire THC</AlertTitle>
              <AlertDescription className="text-sm">
                <p className="mb-2">You can now purchase THC tokens directly through our platform or use external services:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Purchase directly within the TradeHybrid platform (recommended)</li>
                  <li>Use a Solana DEX like Jupiter or Raydium</li>
                  <li>Earn THC through our affiliate matrix program</li>
                  <li>Earn THC by participating in community events</li>
                </ul>
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-md flex flex-col items-center text-center">
                <div className="bg-blue-900/50 p-3 rounded-full mb-3">
                  <ArrowDownUp className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="font-bold mb-1">Reduced Trading Fees</h3>
                <p className="text-sm text-slate-400">
                  Hold THC tokens to reduce trading fees across our platforms
                </p>
              </div>
              
              <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-md flex flex-col items-center text-center">
                <div className="bg-blue-900/50 p-3 rounded-full mb-3">
                  <ShieldCheck className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="font-bold mb-1">Premium Features</h3>
                <p className="text-sm text-slate-400">
                  Unlock exclusive trading features and AI analysis
                </p>
              </div>
              
              <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-md flex flex-col items-center text-center">
                <div className="bg-blue-900/50 p-3 rounded-full mb-3">
                  <Network className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="font-bold mb-1">Affiliate Income</h3>
                <p className="text-sm text-slate-400">
                  Participate in our affiliate matrix program to earn passive income
                </p>
              </div>
            </div>
            
            <div className="mt-4 flex justify-center">
              <Button 
                variant="outline" 
                className="border-blue-700 hover:bg-blue-900/50"
                onClick={() => window.open(`https://explorer.solana.com/address/${THC_TOKEN.tokenAddress}`, '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View on Explorer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AcquireThcContent;