import React from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { MatrixBoard } from './matrix-board';
import { AffiliateService } from '@/lib/services/affiliate-service';
/**
 * New Improved 12-Slot Matrix System for Trade Hybrid
 * 
 * This component provides users with a visual representation of the 12-slot matrix
 * system where each slot costs twice as much as the previous one, starting at $25.
 * 
 * Features:
 * - 12 slots with progressive pricing ($25, $50, $100, ... up to $51,200)
 * - Multiple currency support (THC, SOL, USDC)
 * - Visual representation with bubbles showing filled positions
 * - Automatic payment distribution (50% to direct referrer, 30% to upline, 20% to company)
 * - Slot recycling capabilities for continuous earnings
 */
export function SpilloverMatrix() {
  const { publicKey } = useWallet();
  
  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Trade Hybrid Matrix System</h2>
      
      {!publicKey ? (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Trade Hybrid 12-Slot Matrix</CardTitle>
            <CardDescription>
              Connect your wallet to access the powerful 12-slot affiliate matrix
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-6">
              The Trade Hybrid Matrix is a revolutionary affiliate system with 12 tiered slots of increasing value. 
              Purchase slots to earn commissions across the entire Trade Hybrid ecosystem.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 p-4 rounded-lg flex flex-col items-center text-center">
                <h3 className="font-bold mb-2">Tiered Slot Structure</h3>
                <p className="text-sm text-slate-400">
                  12 slots with progressive pricing, starting at $25 for slot 1 and doubling for each subsequent slot.
                </p>
              </div>
              
              <div className="bg-slate-900 p-4 rounded-lg flex flex-col items-center text-center">
                <h3 className="font-bold mb-2">Automatic Spillover</h3>
                <p className="text-sm text-slate-400">
                  Benefit from your entire team's recruiting efforts as new members fill slots in your matrix.
                </p>
              </div>
              
              <div className="bg-slate-900 p-4 rounded-lg flex flex-col items-center text-center">
                <h3 className="font-bold mb-2">Multiple Currencies</h3>
                <p className="text-sm text-slate-400">
                  Choose your preferred currency (THC, SOL, USDC) for both purchasing slots and earning commissions.
                </p>
              </div>
              
              <div className="bg-slate-900 p-4 rounded-lg flex flex-col items-center text-center">
                <h3 className="font-bold mb-2">Slot Recycling</h3>
                <p className="text-sm text-slate-400">
                  Keep your earnings going by recycling filled slots, creating an infinite earnings potential.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Use our new MatrixBoard component for connected users
        <MatrixBoard />
      )}
    </div>
  );
}

export default SpilloverMatrix;