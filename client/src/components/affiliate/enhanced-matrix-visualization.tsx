import React, { useState, useEffect, useRef } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Info, Award, CheckCircle, ArrowRight, ArrowUpRight, 
  Wallet, Coins, Loader2, AlertTriangle, DollarSign 
} from 'lucide-react';
import { ConnectWalletButton } from '@/components/wallet/ConnectWalletButton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { matrixContractService } from '@/lib/services/matrix-contract-service';
import { ExplodingCoinAnimation } from './exploding-coin-animation';
import { formatCurrency } from '@/lib/utils/formatters';
import { useToast } from '@/components/ui/use-toast';

// Matrix levels configuration 
const MATRIX_LEVELS = [
  { id: 1, name: 'Level 1', price: 25, color: 'cyan' },
  { id: 2, name: 'Level 2', price: 50, color: 'blue' },
  { id: 3, name: 'Level 3', price: 100, color: 'indigo' },
  { id: 4, name: 'Level 4', price: 200, color: 'purple' },
  { id: 5, name: 'Level 5', price: 400, color: 'fuchsia' },
  { id: 6, name: 'Level 6', price: 800, color: 'pink' },
  { id: 7, name: 'Level 7', price: 1600, color: 'rose' },
  { id: 8, name: 'Level 8', price: 3200, color: 'red' },
  { id: 9, name: 'Level 9', price: 6400, color: 'orange' },
  { id: 10, name: 'Level 10', price: 12800, color: 'amber' },
  { id: 11, name: 'Level 11', price: 25600, color: 'yellow' },
  { id: 12, name: 'Level 12', price: 51200, color: 'lime' }
];

interface EnhancedMatrixVisualizationProps {
  enablePurchase?: boolean;
}

/**
 * Enhanced Matrix Visualization with real blockchain connection
 * This component displays the matrix structure and allows for matrix position purchases
 */
export function EnhancedMatrixVisualization({ enablePurchase = false }: EnhancedMatrixVisualizationProps) {
  const { publicKey, connected, signTransaction } = useWallet();
  const { connection } = useConnection();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<string>('x3');
  const [matrixData, setMatrixData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingLevel, setLoadingLevel] = useState<number | null>(null);
  const [showAnimationAt, setShowAnimationAt] = useState<{level: number, position: number} | null>(null);
  const [animationPosition, setAnimationPosition] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [purchasing, setPurchasing] = useState<boolean>(false);
  const [selectedCurrency, setSelectedCurrency] = useState<'THC' | 'SOL' | 'USDC'>('THC');
  
  // Reference to matrix entries for animation positioning
  const matrixEntriesRef = useRef<Map<string, HTMLDivElement>>(new Map());
  
  // Initialize matrix contract service
  useEffect(() => {
    const initService = async () => {
      try {
        // Initialize service with the connection RPC URL
        if (connection) {
          await matrixContractService.initialize(connection.rpcEndpoint);
        }
      } catch (error) {
        console.error('Failed to initialize matrix contract service:', error);
      }
    };
    
    initService();
  }, [connection]);
  
  // Load matrix data when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      loadUserMatrixData();
    }
  }, [connected, publicKey]);
  
  // Load user's matrix data from the contract
  const loadUserMatrixData = async () => {
    if (!publicKey) return;
    
    setLoading(true);
    
    try {
      // Get participant data from contract service
      const participantData = await matrixContractService.getParticipantData(publicKey.toString());
      
      if (participantData) {
        // Create matrix visualization data
        const x3Levels = createMatrixLevelsFromParticipant(participantData, 'x3');
        const x4Levels = createMatrixLevelsFromParticipant(participantData, 'x4');
        
        setMatrixData({
          x3: x3Levels,
          x4: x4Levels,
          participant: participantData
        });
      } else {
        // If no participant data found, use empty matrix structure
        const x3Levels = MATRIX_LEVELS.map(level => createEmptyLevel(level, 'x3'));
        const x4Levels = MATRIX_LEVELS.map(level => createEmptyLevel(level, 'x4'));
        
        setMatrixData({
          x3: x3Levels,
          x4: x4Levels,
          participant: null
        });
      }
    } catch (error) {
      console.error('Error loading matrix data:', error);
      toast({
        title: "Error Loading Matrix",
        description: "Could not load your matrix data. Please try again.",
        variant: "destructive"
      });
      
      // Use empty matrix data as fallback
      const x3Levels = MATRIX_LEVELS.map(level => createEmptyLevel(level, 'x3'));
      const x4Levels = MATRIX_LEVELS.map(level => createEmptyLevel(level, 'x4'));
      
      setMatrixData({
        x3: x3Levels,
        x4: x4Levels,
        participant: null
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Create empty matrix level data
  const createEmptyLevel = (level: any, matrixType: 'x3' | 'x4') => {
    const slotCount = matrixType === 'x3' 
      ? (level.id === 1 ? 2 : level.id === 2 ? 3 : 5) 
      : (level.id === 1 ? 2 : level.id === 2 ? 4 : 6);
    
    return {
      id: level.id,
      level: level.id,
      name: level.name,
      price: level.price,
      color: level.color,
      entries: Array.from({ length: slotCount }, (_, i) => ({
        position: i + 1,
        filled: false,
        value: level.price,
        passesUpToSponsor: matrixType === 'x3'
          ? (level.id === 1 && i === 1) || (level.id === 2 && i === 2) || (level.id > 2 && (i === 2 || i === 4))
          : (level.id === 1 && i === 1) || (level.id === 2 && (i === 1 || i === 3)) || (level.id > 2 && (i === 1 || i === 3 || i === 5))
      })),
      statusText: 'Not started',
      completed: false,
      totalEarnings: 0
    };
  };
  
  // Create matrix levels data from participant data
  const createMatrixLevelsFromParticipant = (participant: any, matrixType: 'x3' | 'x4') => {
    return MATRIX_LEVELS.map(level => {
      // Find the slot for this level if it exists
      const slot = participant.activeSlots.find((s: any) => 
        s.slotNumber === level.id && 
        (matrixType === 'x3' ? [1,3,5,7,9,11].includes(s.slotNumber) : [2,4,6,8,10,12].includes(s.slotNumber))
      );
      
      const slotFilled = !!slot;
      
      // Determine positions filled based on structure
      const slotCount = matrixType === 'x3' 
        ? (level.id === 1 ? 2 : level.id === 2 ? 3 : 5) 
        : (level.id === 1 ? 2 : level.id === 2 ? 4 : 6);
      
      // Create entries based on filled status
      const entries = Array.from({ length: slotCount }, (_, i) => {
        // First position is always filled if the user has this level
        const positionFilled = i === 0 ? slotFilled : 
          slotFilled && slot.referrals.some((r: any) => r.slotFilled === i + 1);
        
        // Get referral info if this position is filled
        const referral = positionFilled && i > 0 ? 
          slot.referrals.find((r: any) => r.slotFilled === i + 1) : null;
        
        return {
          position: i + 1,
          filled: positionFilled,
          value: level.price,
          username: referral ? `User ${referral.address.toString().substring(0, 6)}` : undefined,
          walletAddress: referral ? referral.address.toString() : undefined,
          joinedDate: referral ? new Date(referral.date) : undefined,
          passesUpToSponsor: matrixType === 'x3'
            ? (level.id === 1 && i === 1) || (level.id === 2 && i === 2) || (level.id > 2 && (i === 2 || i === 4))
            : (level.id === 1 && i === 1) || (level.id === 2 && (i === 1 || i === 3)) || (level.id > 2 && (i === 1 || i === 3 || i === 5))
        };
      });
      
      // Calculate total earnings from this level
      const totalEarnings = slotFilled ? slot.earningsFromSlot : 0;
      
      // Determine if level is completed
      const completed = slotFilled && entries.every(e => e.filled);
      
      // Status text based on completion
      let statusText = 'Not started';
      if (completed) {
        statusText = 'Completed';
      } else if (slotFilled) {
        statusText = 'In progress';
      }
      
      return {
        id: level.id,
        level: level.id,
        name: level.name,
        price: level.price,
        color: level.color,
        entries,
        statusText,
        completed,
        totalEarnings
      };
    });
  };
  
  // Handle purchasing a matrix slot
  const handlePurchaseSlot = async (level: number) => {
    if (!connected || !publicKey || !signTransaction) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to purchase a matrix slot.",
        variant: "destructive"
      });
      return;
    }
    
    setPurchasing(true);
    setLoadingLevel(level);
    
    try {
      // Purchase slot using the matrix contract service
      const result = await matrixContractService.purchaseSlot(
        publicKey.toString(),
        level,
        selectedCurrency,
        signTransaction
      );
      
      if (result.success) {
        toast({
          title: "Purchase Successful",
          description: `You have successfully purchased Level ${level} for ${MATRIX_LEVELS[level-1].price} ${selectedCurrency}.`,
        });
        
        // Refresh matrix data
        await loadUserMatrixData();
        
        // Show animation
        const entryElement = matrixEntriesRef.current.get(`${level}-1`);
        if (entryElement) {
          const rect = entryElement.getBoundingClientRect();
          setAnimationPosition({ 
            x: rect.left + rect.width / 2, 
            y: rect.top + rect.height / 2 
          });
          setShowAnimationAt({ level, position: 1 });
          
          // Hide animation after delay
          setTimeout(() => {
            setShowAnimationAt(null);
          }, 2000);
        }
      } else {
        toast({
          title: "Purchase Failed",
          description: result.error || "Could not complete the purchase. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error purchasing slot:', error);
      toast({
        title: "Purchase Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setPurchasing(false);
      setLoadingLevel(null);
    }
  };
  
  // Save reference to matrix entry elements for animation positioning
  const setEntryRef = (el: HTMLDivElement | null, level: number, position: number) => {
    if (el) {
      matrixEntriesRef.current.set(`${level}-${position}`, el);
    }
  };
  
  // Get CSS color class based on matrix color and filled status
  const getColorClass = (color: string, filled: boolean, passesUp: boolean): string => {
    if (!filled) return 'bg-gray-300 dark:bg-gray-700 opacity-30';
    
    // Special styling for positions that pass up
    const baseClass = passesUp ? 'border-2 border-yellow-400 ' : '';
    
    const colorMap: Record<string, string> = {
      'blue': 'bg-blue-500',
      'indigo': 'bg-indigo-500',
      'violet': 'bg-violet-500',
      'purple': 'bg-purple-500',
      'fuchsia': 'bg-fuchsia-500',
      'pink': 'bg-pink-500',
      'rose': 'bg-rose-500',
      'red': 'bg-red-500',
      'orange': 'bg-orange-500',
      'amber': 'bg-amber-500',
      'yellow': 'bg-yellow-500',
      'lime': 'bg-lime-500',
      'green': 'bg-green-500',
      'emerald': 'bg-emerald-500',
      'teal': 'bg-teal-500',
      'cyan': 'bg-cyan-500'
    };
    
    return baseClass + (colorMap[color] || 'bg-blue-500');
  };
  
  // Get CSS class for status badge
  const getStatusClass = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'in progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'not started':
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  
  // Handle click on a matrix position to show animation
  const handleSlotClick = (level: number, position: number, element: HTMLDivElement | null) => {
    if (!element) return;
    
    // Get element position for animation
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    // Set animation position and trigger
    setAnimationPosition({ x, y });
    setShowAnimationAt({ level, position });
    
    // Hide animation after a delay
    setTimeout(() => {
      setShowAnimationAt(null);
    }, 2000);
  };
  
  // Render a single matrix level
  const renderMatrixLevel = (level: any, isX3: boolean) => {
    const entrySizeClass = isX3 
      ? level.level === 1 ? 'grid-cols-2' 
      : level.level === 2 ? 'grid-cols-3' : 'grid-cols-5'
      : level.level === 1 ? 'grid-cols-2'
      : level.level === 2 ? 'grid-cols-4' : 'grid-cols-6';
    
    const entrySize = 'w-12 h-12 md:w-16 md:h-16';
    const fontSize = 'text-sm md:text-base';
    
    return (
      <Card key={level.level} className="mb-4 bg-slate-800 border-slate-700">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">{level.name}</CardTitle>
            <CardDescription>${level.price}</CardDescription>
          </div>
          <Badge className={getStatusClass(level.statusText)}>
            {level.statusText}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            {/* Matrix visualization with Forsage structure */}
            <div className={`grid ${entrySizeClass} gap-2 md:gap-4 mb-4`}>
              {level.entries.map((entry: any, idx: number) => (
                <TooltipProvider key={idx}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        ref={(el) => setEntryRef(el, level.level, entry.position)}
                        onClick={() => handleSlotClick(level.level, entry.position, matrixEntriesRef.current.get(`${level.level}-${entry.position}`) || null)}
                        className={`${entrySize} rounded-full flex items-center justify-center ${getColorClass(level.color, entry.filled, entry.passesUpToSponsor)} cursor-pointer relative`}
                      >
                        <span className={`${fontSize} font-bold text-white`}>
                          {entry.filled ? (entry.position) : ''}
                        </span>
                        
                        {/* Arrow indicator for positions that pass up to sponsor */}
                        {entry.passesUpToSponsor && entry.filled && (
                          <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5">
                            <ArrowUpRight className="w-3 h-3 text-black" />
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {entry.filled ? (
                        <div className="text-sm">
                          <p className="font-bold">{entry.username}</p>
                          <p className="text-xs flex items-center">
                            <Wallet className="w-3 h-3 mr-1" />
                            {entry.walletAddress ? entry.walletAddress.substring(0, 6) + '...' + entry.walletAddress.substring(entry.walletAddress.length - 4) : 'Unknown'}
                          </p>
                          <p className="text-xs mt-1">
                            Joined: {entry.joinedDate?.toLocaleDateString() || 'Unknown'}
                          </p>
                          <div className="mt-1 pt-1 border-t border-gray-200 dark:border-gray-700">
                            {entry.passesUpToSponsor ? (
                              <p className="text-yellow-500 flex items-center">
                                <ArrowUpRight className="w-3 h-3 mr-1" />
                                100% passes to sponsor
                              </p>
                            ) : (
                              <p className="text-green-500 flex items-center">
                                <Coins className="w-3 h-3 mr-1" />
                                100% direct to you
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm">Empty position</p>
                          <p className="text-xs text-gray-500">
                            ${level.price} when filled
                            {entry.passesUpToSponsor && 
                              <span className="block text-yellow-500 mt-1">
                                Passes to sponsor
                              </span>
                            }
                          </p>
                        </div>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            
            {/* Level status and earnings */}
            <div className="flex items-center justify-between w-full mt-2">
              <div className="flex items-center">
                {level.completed ? (
                  <div className="flex items-center text-green-500">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span className="text-sm">Level complete!</span>
                  </div>
                ) : (
                  <div className="text-sm">
                    {level.entries.filter((e: any) => e.filled).length} of {level.entries.length} positions filled
                  </div>
                )}
              </div>
              
              <div className="text-sm flex items-center">
                <Coins className="w-4 h-4 mr-1 text-yellow-500" />
                <span>Earnings: {formatCurrency(level.totalEarnings || 0)}</span>
              </div>
            </div>
            
            {/* Purchase button for this level */}
            {enablePurchase && !level.entries[0].filled && !purchasing && (
              <Button 
                onClick={() => handlePurchaseSlot(level.level)}
                className="w-full mt-4"
                variant="outline"
                disabled={loadingLevel !== null || !connected}
              >
                {loadingLevel === level.level ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Purchase Level {level.level} (${level.price})
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };
  
  // Get matrix stats for display
  const getMatrixStats = () => {
    if (!matrixData) {
      return { totalPositions: 0, filledPositions: 0, completedLevels: 0, totalEarnings: 0 };
    }
    
    const currentMatrix = activeTab === 'x3' ? matrixData.x3 : matrixData.x4;
    
    const totalPositions = currentMatrix.reduce((sum: number, level: any) => sum + level.entries.length, 0);
    const filledPositions = currentMatrix.reduce((sum: number, level: any) => 
      sum + level.entries.filter((e: any) => e.filled).length, 0);
    const completedLevels = currentMatrix.filter((level: any) => level.completed).length;
    const totalEarnings = currentMatrix.reduce((sum: number, level: any) => sum + level.totalEarnings, 0);
    
    return { totalPositions, filledPositions, completedLevels, totalEarnings };
  };
  
  const stats = getMatrixStats();
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-10">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
        <p className="text-muted-foreground">Loading Matrix Data...</p>
      </div>
    );
  }
  
  if (!connected) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-xl">Matrix Visualization</CardTitle>
          <CardDescription>
            Connect your wallet to view your matrix structure
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-10">
          <Alert className="mb-4 bg-yellow-900/20 border-yellow-800">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <AlertTitle>Wallet Required</AlertTitle>
            <AlertDescription>
              You need to connect your wallet to view and interact with the matrix.
            </AlertDescription>
          </Alert>
          
          <ConnectWalletButton text="Connect Wallet" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="container mx-auto p-4 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Matrix Visualization</h2>
          <p className="text-gray-400 mb-4">View your matrix structure and 100% direct crypto payments</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          {enablePurchase && (
            <div className="flex items-center gap-2">
              <span className="text-sm">Currency:</span>
              <div className="flex border rounded-md overflow-hidden">
                {(['THC', 'SOL', 'USDC'] as const).map((currency) => (
                  <button
                    key={currency}
                    className={`px-3 py-1 text-sm font-medium ${
                      selectedCurrency === currency 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                    onClick={() => setSelectedCurrency(currency)}
                  >
                    {currency}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <Button variant="outline" size="sm" onClick={loadUserMatrixData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div className="p-2 rounded-full bg-blue-500/20">
                <Award className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div className="p-2 rounded-full bg-green-500/20">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Completed Levels</p>
                <p className="text-2xl font-bold">{stats.completedLevels}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div className="p-2 rounded-full bg-purple-500/20">
                <Users className="h-5 w-5 text-purple-500" />
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Filled Positions</p>
                <p className="text-2xl font-bold">{stats.filledPositions} / {stats.totalPositions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div className="p-2 rounded-full bg-yellow-500/20">
                <ArrowUpRight className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Active Matrix Type</p>
                <p className="text-2xl font-bold">{activeTab.toUpperCase()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="x3">X3 Matrix</TabsTrigger>
          <TabsTrigger value="x4">X4 Matrix</TabsTrigger>
        </TabsList>
        
        <TabsContent value="x3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matrixData?.x3.map((level: any) => renderMatrixLevel(level, true))}
          </div>
        </TabsContent>
        
        <TabsContent value="x4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matrixData?.x4.map((level: any) => renderMatrixLevel(level, false))}
          </div>
        </TabsContent>
      </Tabs>
      
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Matrix Benefits</CardTitle>
          <CardDescription>
            The Trade Hybrid matrix system with Forsage-style direct payments offers these advantages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 p-4 rounded-lg flex flex-col items-center text-center">
              <h3 className="font-bold mb-2">100% Direct Payments</h3>
              <p className="text-sm text-slate-400">
                All payments go directly to affiliate wallets in real-time via smart contracts
              </p>
            </div>
            
            <div className="bg-slate-900 p-4 rounded-lg flex flex-col items-center text-center">
              <h3 className="font-bold mb-2">Infinite Team Building</h3>
              <p className="text-sm text-slate-400">
                Benefit from your upline and downline with our innovative pass-up system
              </p>
            </div>
            
            <div className="bg-slate-900 p-4 rounded-lg flex flex-col items-center text-center">
              <h3 className="font-bold mb-2">Slot Recycling</h3>
              <p className="text-sm text-slate-400">
                When slots fill up, they automatically recycle creating infinite earning potential
              </p>
            </div>
          </div>
        </CardContent>
        {enablePurchase && (
          <CardFooter>
            <Button className="w-full">Purchase Your First Slot</Button>
          </CardFooter>
        )}
      </Card>
      
      {/* Exploding coin animation */}
      {showAnimationAt && (
        <ExplodingCoinAnimation 
          isVisible={true}
          position={animationPosition}
          coinType="thc"
          particleCount={30}
        />
      )}
    </div>
  );
}

export default EnhancedMatrixVisualization;