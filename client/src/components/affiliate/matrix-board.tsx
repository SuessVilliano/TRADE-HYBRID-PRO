import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowUpRight, Award, Check, Clock, DollarSign, Info, RefreshCw, Star, Users } from 'lucide-react';
import { getMatrixContract, MATRIX_CONFIG, MatrixSlot, Participant } from './matrix-contract';
import { PublicKey } from '@solana/web3.js';
import { formatDistance } from 'date-fns';

export function MatrixBoard() {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'slots' | 'earnings' | 'network'>('slots');
  const [selectedCurrency, setSelectedCurrency] = useState<'THC' | 'SOL' | 'USDC'>('THC');
  const [purchasingSlot, setPurchasingSlot] = useState<number | null>(null);
  const [recyclingSlot, setRecyclingSlot] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Get the matrix contract singleton
  const matrixContract = getMatrixContract(connection);
  
  // Load user's matrix data
  useEffect(() => {
    if (publicKey) {
      fetchMatrixData();
    } else {
      setParticipant(null);
      setLoading(false);
    }
  }, [publicKey, connection]);
  
  const fetchMatrixData = async () => {
    if (!publicKey) return;
    
    setLoading(true);
    try {
      const data = await matrixContract.getUserMatrix(publicKey);
      setParticipant(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching matrix data:', err);
      setError('Failed to load matrix data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePurchaseSlot = async (slotNumber: number) => {
    if (!publicKey || !signTransaction) {
      setError('Please connect your wallet');
      return;
    }
    
    setPurchasingSlot(slotNumber);
    setError(null);
    
    try {
      const wallet = { publicKey, signTransaction };
      const signature = await matrixContract.purchaseSlot(wallet, slotNumber, selectedCurrency);
      console.log(`Slot ${slotNumber} purchased! Tx: ${signature}`);
      setSuccess(`Successfully purchased slot ${slotNumber}!`);
      
      // Refresh the matrix data
      await fetchMatrixData();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error('Error purchasing slot:', err);
      setError(`Failed to purchase slot: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setPurchasingSlot(null);
    }
  };
  
  const handleRecycleSlot = async (slotNumber: number) => {
    if (!publicKey || !signTransaction) {
      setError('Please connect your wallet');
      return;
    }
    
    setRecyclingSlot(slotNumber);
    setError(null);
    
    try {
      const wallet = { publicKey, signTransaction };
      const signature = await matrixContract.recycleSlot(wallet, slotNumber);
      console.log(`Slot ${slotNumber} recycled! Tx: ${signature}`);
      setSuccess(`Successfully recycled slot ${slotNumber}!`);
      
      // Refresh the matrix data
      await fetchMatrixData();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error('Error recycling slot:', err);
      setError(`Failed to recycle slot: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setRecyclingSlot(null);
    }
  };
  
  const formatCurrency = (amount: number, currency: string = selectedCurrency) => {
    return `${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${currency}`;
  };
  
  const renderSlotsSummary = () => {
    if (!participant) return null;
    
    const totalSlots = participant.activeSlots.length;
    const totalValue = participant.totalSlotsValue;
    const totalEarnings = participant.totalEarnings;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="mr-4 rounded-full bg-slate-700 p-2">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Investments</p>
                <h3 className="text-2xl font-bold">{formatCurrency(totalValue)}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="mr-4 rounded-full bg-slate-700 p-2">
                <Award className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Earnings</p>
                <h3 className="text-2xl font-bold">{formatCurrency(totalEarnings)}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="mr-4 rounded-full bg-slate-700 p-2">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Active Slots</p>
                <h3 className="text-2xl font-bold">{totalSlots} <span className="text-sm text-slate-400">of 12</span></h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  const renderSlotBubbles = (slot: MatrixSlot) => {
    // Calculate how many bubbles should be filled
    const totalBubbles = 3; // Each slot has 3 positions in our design
    const filledBubbles = slot.referrals.length;
    
    return (
      <div className="flex justify-center space-x-2 mt-3">
        {Array.from({ length: totalBubbles }).map((_, i) => (
          <div 
            key={i}
            className={`rounded-full w-4 h-4 ${
              i < filledBubbles 
                ? 'bg-green-500 animate-pulse' 
                : 'bg-slate-600'
            }`}
            title={i < filledBubbles ? `Filled by ${slot.referrals[i].address.toString().substring(0, 8)}...` : 'Empty position'}
          />
        ))}
      </div>
    );
  };
  
  const renderMatrixSlots = () => {
    if (!participant) return null;
    
    // Group slots into rows of 3 for display
    // First row: slots 1-3
    // Second row: slots 4-6
    // Third row: slots 7-9
    // Fourth row: slots 10-12
    
    const slotGroups = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      [10, 11, 12]
    ];
    
    return (
      <div className="space-y-4">
        {slotGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {group.map(slotNumber => {
              const slotData = participant.activeSlots.find(s => s.slotNumber === slotNumber);
              const price = MATRIX_CONFIG.slotPrices[slotNumber - 1];
              const isActive = !!slotData;
              
              return (
                <Card 
                  key={slotNumber} 
                  className={`border ${isActive ? 'border-green-600 bg-slate-800' : 'border-slate-700 bg-slate-900'}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Slot {slotNumber}</CardTitle>
                      <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-green-600 hover:bg-green-700" : ""}>
                        {isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <CardDescription>
                      {formatCurrency(price)}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    {isActive ? (
                      <>
                        <div className="text-sm mb-2">
                          <span className="text-slate-400">Earnings: </span>
                          <span className="font-bold text-green-500">{formatCurrency(slotData.earningsFromSlot)}</span>
                        </div>
                        
                        <div className="text-sm mb-3">
                          <span className="text-slate-400">Purchased: </span>
                          <span className="font-semibold">
                            {formatDistance(new Date(slotData.purchaseDate), new Date(), { addSuffix: true })}
                          </span>
                        </div>
                        
                        {/* Slot Bubbles - visual representation of filled positions */}
                        {renderSlotBubbles(slotData)}
                      </>
                    ) : (
                      <div className="py-2 text-center text-slate-400 text-sm">
                        <p>This slot is not activated yet.</p>
                        <p>Buy this slot to start earning!</p>
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter>
                    {isActive ? (
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => handleRecycleSlot(slotNumber)}
                        disabled={recyclingSlot === slotNumber}
                      >
                        {recyclingSlot === slotNumber ? (
                          <><Clock className="h-4 w-4 mr-2 animate-spin" /> Recycling...</>
                        ) : (
                          <><RefreshCw className="h-4 w-4 mr-2" /> Recycle</>
                        )}
                      </Button>
                    ) : (
                      <Button 
                        variant="default" 
                        className="w-full bg-green-600 hover:bg-green-700" 
                        onClick={() => handlePurchaseSlot(slotNumber)}
                        disabled={purchasingSlot === slotNumber}
                      >
                        {purchasingSlot === slotNumber ? (
                          <><Clock className="h-4 w-4 mr-2 animate-spin" /> Purchasing...</>
                        ) : (
                          <><DollarSign className="h-4 w-4 mr-2" /> Buy Slot</>
                        )}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ))}
      </div>
    );
  };
  
  const renderEarningsTab = () => {
    if (!participant) return null;
    
    const totalEarned = participant.totalEarnings;
    const referralEarnings = participant.activeSlots.reduce((sum, slot) => 
      sum + slot.earningsFromSlot, 0);
    
    return (
      <div className="space-y-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Earnings Breakdown</CardTitle>
            <CardDescription>
              Your total earnings across all matrix slots
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Direct Referrals</span>
                  <span className="text-sm">{formatCurrency(referralEarnings * 0.6)}</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Spillover Earnings</span>
                  <span className="text-sm">{formatCurrency(referralEarnings * 0.3)}</span>
                </div>
                <Progress value={30} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Recycling Bonuses</span>
                  <span className="text-sm">{formatCurrency(referralEarnings * 0.1)}</span>
                </div>
                <Progress value={10} className="h-2" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => {
                if (publicKey && signTransaction) {
                  matrixContract.claimCommissions({ publicKey, signTransaction });
                }
              }}
              disabled={!publicKey || !signTransaction}
            >
              <DollarSign className="h-4 w-4 mr-2" /> Claim Earnings
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Earnings History</CardTitle>
            <CardDescription>
              Your recent earnings from the matrix
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {participant.activeSlots.flatMap(slot => 
                slot.referrals.map((ref, i) => (
                  <div key={`${slot.id}-${i}`} className="flex justify-between items-center p-3 bg-slate-900 rounded-lg">
                    <div>
                      <div className="font-medium">{ref.address.toString().substring(0, 8)}...</div>
                      <div className="text-sm text-slate-400">
                        {formatDistance(new Date(ref.date), new Date(), { addSuffix: true })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-500 font-bold">
                        +{formatCurrency(ref.earnings)}
                      </div>
                      <div className="text-xs text-slate-400">
                        Slot {slot.slotNumber} Referral
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {participant.activeSlots.flatMap(slot => 
                slot.referrals
              ).length === 0 && (
                <div className="text-center text-slate-400 py-6">
                  No earnings history yet. Share your referral link to start earning!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  const renderNetworkTab = () => {
    if (!participant) return null;
    
    return (
      <div className="space-y-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Your Network</CardTitle>
            <CardDescription>
              Overview of your direct and indirect referrals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 p-4 rounded-lg">
                  <div className="text-sm text-slate-400">Direct Referrals</div>
                  <div className="text-2xl font-bold">{participant.directReferrals.length}</div>
                </div>
                
                <div className="bg-slate-900 p-4 rounded-lg">
                  <div className="text-sm text-slate-400">Total Network</div>
                  <div className="text-2xl font-bold">
                    {participant.activeSlots.reduce((sum, slot) => sum + slot.referrals.length, 0)}
                  </div>
                </div>
                
                <div className="bg-slate-900 p-4 rounded-lg">
                  <div className="text-sm text-slate-400">Spillover Received</div>
                  <div className="text-2xl font-bold">
                    {participant.activeSlots.reduce((sum, slot) => sum + slot.referrals.length, 0) - participant.directReferrals.length}
                  </div>
                </div>
                
                <div className="bg-slate-900 p-4 rounded-lg">
                  <div className="text-sm text-slate-400">Active Slots</div>
                  <div className="text-2xl font-bold">{participant.activeSlots.length}</div>
                </div>
              </div>
              
              <div className="border-t border-slate-700 pt-4">
                <h4 className="text-sm font-medium mb-3">Your Direct Referrals</h4>
                <div className="space-y-2">
                  {participant.directReferrals.map((address, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-slate-900 rounded-lg">
                      <div className="font-medium">{address.toString().substring(0, 8)}...</div>
                      <div>
                        <Badge variant="outline" className="text-xs">
                          Level 1
                        </Badge>
                      </div>
                    </div>
                  ))}
                  
                  {participant.directReferrals.length === 0 && (
                    <div className="text-center text-slate-400 py-4">
                      No direct referrals yet. Share your referral link to grow your network!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Referral Tools</CardTitle>
            <CardDescription>
              Resources to help you grow your network
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-slate-900 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Your Referral Link</h4>
                <div className="flex">
                  <input 
                    type="text" 
                    value={`https://pro.tradehybrid.club/?ref=${publicKey?.toString()}`}
                    readOnly
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-l px-3 py-2 text-sm"
                  />
                  <button 
                    className="bg-blue-600 px-3 py-2 rounded-r"
                    onClick={() => {
                      navigator.clipboard.writeText(`https://pro.tradehybrid.club/?ref=${publicKey?.toString()}`);
                      setSuccess('Referral link copied to clipboard!');
                      setTimeout(() => setSuccess(null), 3000);
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>
              
              <Alert className="bg-slate-900 border-slate-700">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Share your referral link on social media, with friends, or in trading communities to earn commissions when they join the matrix.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  if (!publicKey) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="text-center">
          <CardTitle>Trade Hybrid Matrix</CardTitle>
          <CardDescription>
            Connect your wallet to view and interact with the affiliate matrix
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6">The Trade Hybrid Matrix is a powerful affiliate system that allows you to earn commissions across all Trade Hybrid products and services.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-900 p-4 rounded-lg flex items-center">
              <div className="mr-4 rounded-full bg-blue-900/50 p-2">
                <Star className="h-5 w-5 text-blue-400" />
              </div>
              <div className="text-left">
                <h3 className="font-medium">12 Tiered Slots</h3>
                <p className="text-sm text-slate-400">Purchase slots to participate in the matrix</p>
              </div>
            </div>
            <div className="bg-slate-900 p-4 rounded-lg flex items-center">
              <div className="mr-4 rounded-full bg-green-900/50 p-2">
                <DollarSign className="h-5 w-5 text-green-400" />
              </div>
              <div className="text-left">
                <h3 className="font-medium">Automatic Commissions</h3>
                <p className="text-sm text-slate-400">Earn when people join through your link</p>
              </div>
            </div>
            <div className="bg-slate-900 p-4 rounded-lg flex items-center">
              <div className="mr-4 rounded-full bg-purple-900/50 p-2">
                <ArrowUpRight className="h-5 w-5 text-purple-400" />
              </div>
              <div className="text-left">
                <h3 className="font-medium">Infinite Spillover</h3>
                <p className="text-sm text-slate-400">Benefit from your entire network's activity</p>
              </div>
            </div>
            <div className="bg-slate-900 p-4 rounded-lg flex items-center">
              <div className="mr-4 rounded-full bg-yellow-900/50 p-2">
                <RefreshCw className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="text-left">
                <h3 className="font-medium">Automatic Recycling</h3>
                <p className="text-sm text-slate-400">Keep earning with slot recycling</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (loading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="flex flex-col items-center justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <p>Loading your matrix data...</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Trade Hybrid Matrix</h2>
        
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={fetchMatrixData}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh matrix data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Select value={selectedCurrency} onValueChange={(value) => setSelectedCurrency(value as any)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="THC">THC</SelectItem>
              <SelectItem value="SOL">SOL</SelectItem>
              <SelectItem value="USDC">USDC</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive" className="bg-red-900/20 border-red-800">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="bg-green-900/20 border-green-800">
          <Check className="h-4 w-4 text-green-500" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      
      {renderSlotsSummary()}
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="slots">Matrix Slots</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
        </TabsList>
        
        <TabsContent value="slots">
          {renderMatrixSlots()}
        </TabsContent>
        
        <TabsContent value="earnings">
          {renderEarningsTab()}
        </TabsContent>
        
        <TabsContent value="network">
          {renderNetworkTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default MatrixBoard;