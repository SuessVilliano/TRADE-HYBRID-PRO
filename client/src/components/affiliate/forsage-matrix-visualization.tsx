import React, { useState, useEffect, useRef } from 'react';
import { PublicKey } from '@solana/web3.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Award, CheckCircle, ArrowRight, ArrowUpRight, Wallet, Coins } from 'lucide-react';
import { ExplodingCoinAnimation } from './exploding-coin-animation';

/**
 * Forsage-style Matrix Entry
 * In Forsage, a key difference is that payments go directly to wallet addresses
 * and the spillover structure follows specific rules for which slots pass up
 */
interface MatrixEntry {
  position: number;
  filled: boolean;
  value: number;
  username?: string;
  walletAddress?: string;
  joinedDate?: Date;
  passesUpToSponsor: boolean; // Indicates if this position passes up to sponsor
}

/**
 * Matrix Level (similar to X3, X4 in Forsage)
 */
interface MatrixLevel {
  level: number;
  name: string;
  price: number;
  entries: MatrixEntry[];
  color: string;
  statusText: string;
  completed: boolean;
  totalEarnings: number; // Track direct earnings from this level
}

interface ForsageMatrixVisualizationProps {
  userWalletAddress?: string;
}

/**
 * Enhanced Forsage-style Matrix Visualization with direct crypto payments
 * Following the Forsage model where 100% of commissions go directly to affiliates
 * using smart contract based payments to wallet addresses
 */
export function ForsageMatrixVisualization({ userWalletAddress }: ForsageMatrixVisualizationProps) {
  const [activeTab, setActiveTab] = useState<string>('x3');
  const [matrixData, setMatrixData] = useState<{
    x3: MatrixLevel[];
    x4: MatrixLevel[];
  }>({
    x3: [],
    x4: []
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [showAnimationAt, setShowAnimationAt] = useState<{level: number, position: number} | null>(null);
  const [animationPosition, setAnimationPosition] = useState<{x: number, y: number}>({x: 0, y: 0});
  
  // Reference to hold matrix entries DOM elements for positioning animations
  const matrixEntriesRef = useRef<Map<string, HTMLDivElement>>(new Map());
  
  // Load matrix data on component mount
  useEffect(() => {
    // In production, this would fetch real data from blockchain
    generateMatrixData();
  }, []);
  
  /**
   * Generate matrix data with Forsage-style rules:
   * - First level: first slot goes to affiliate, second passes up
   * - Second level: slots 3 and 4 go to affiliate, 5 passes up
   * - On X4 matrix, 2 slots pass up on bottom levels
   */
  const generateMatrixData = () => {
    setLoading(true);
    
    // Generate X3 matrix levels (2x3 structure)
    const x3Levels: MatrixLevel[] = Array.from({ length: 12 }, (_, i) => {
      const level = i + 1;
      const price = 25 * Math.pow(2, i); // 25, 50, 100, 200, etc.
      let entryCount = 0;
      
      // First level has 2 positions
      if (level === 1) {
        entryCount = 2;
      } 
      // Second level has 3 positions
      else if (level === 2) {
        entryCount = 3;
      }
      // Default to 5 for higher levels
      else {
        entryCount = 5;
      }
      
      // Create entries for this level with Forsage rules
      const entries: MatrixEntry[] = Array.from({ length: entryCount }, (_, j) => {
        let passesUpToSponsor = false;
        
        // Apply Forsage rules for which positions pass up
        if (level === 1 && j === 1) {
          // On first level, second position passes up
          passesUpToSponsor = true;
        } else if (level === 2 && j === 2) {
          // On second level, the 5th position (index 2 in 0-based array) passes up
          passesUpToSponsor = true;
        } else if (level > 2 && (j === 2 || j === 4)) {
          // On higher levels, positions 3 and 5 pass up (indices 2 and 4)
          passesUpToSponsor = true;
        }
        
        // More likely to be filled in lower levels
        const entryFilled = j === 0 ? true : Math.random() > 0.4 + (i * 0.05);
        
        return {
          position: j + 1,
          filled: entryFilled,
          value: price,
          username: entryFilled ? `user${Math.floor(Math.random() * 1000)}` : undefined,
          walletAddress: entryFilled ? generateRandomWalletAddress() : undefined,
          joinedDate: entryFilled ? new Date(Date.now() - Math.random() * 10000000000) : undefined,
          passesUpToSponsor
        };
      });
      
      // Calculate total earnings for this level
      const filledNonPassingSlots = entries.filter(e => e.filled && !e.passesUpToSponsor);
      const totalEarnings = filledNonPassingSlots.length * price;
      
      // Determine if level is complete (all entries filled)
      const completed = entries.every(e => e.filled);
      
      // Status text based on progress
      let statusText = "Not started";
      if (completed) {
        statusText = "Completed";
      } else if (entries.some(e => e.filled)) {
        statusText = "In progress";
      }
      
      // Assign a color based on the level
      const colors = ['cyan', 'blue', 'indigo', 'purple', 'fuchsia', 'pink', 'rose', 'red', 'orange', 'amber', 'yellow', 'lime'];
      
      return {
        level,
        name: `Level ${level}`,
        price,
        entries,
        color: colors[i % colors.length],
        statusText,
        completed,
        totalEarnings
      };
    });
    
    // Generate X4 matrix levels (with different pass-up rules)
    const x4Levels: MatrixLevel[] = Array.from({ length: 12 }, (_, i) => {
      const level = i + 1;
      const price = 25 * Math.pow(2, i); // 25, 50, 100, 200, etc.
      let entryCount = 0;
      
      // Different structure for X4
      if (level === 1) {
        entryCount = 2;
      } else if (level === 2) {
        entryCount = 4;
      } else {
        entryCount = 6;
      }
      
      // Create entries for this level
      const entries: MatrixEntry[] = Array.from({ length: entryCount }, (_, j) => {
        let passesUpToSponsor = false;
        
        // X4 has different pass-up rules
        if (level === 1 && j === 1) {
          // First level, second position passes up
          passesUpToSponsor = true;
        } else if (level === 2 && (j === 1 || j === 3)) {
          // Second level, positions 2 and 4 pass up
          passesUpToSponsor = true;
        } else if (level > 2 && (j === 1 || j === 3 || j === 5)) {
          // Higher levels, positions 2, 4, and 6 pass up
          passesUpToSponsor = true;
        }
        
        // More likely to be filled in lower levels
        const entryFilled = j === 0 ? true : Math.random() > 0.5 + (i * 0.05);
        
        return {
          position: j + 1,
          filled: entryFilled,
          value: price,
          username: entryFilled ? `user${Math.floor(Math.random() * 1000)}` : undefined,
          walletAddress: entryFilled ? generateRandomWalletAddress() : undefined,
          joinedDate: entryFilled ? new Date(Date.now() - Math.random() * 10000000000) : undefined,
          passesUpToSponsor
        };
      });
      
      // Calculate total earnings for this level
      const filledNonPassingSlots = entries.filter(e => e.filled && !e.passesUpToSponsor);
      const totalEarnings = filledNonPassingSlots.length * price;
      
      // Determine if level is complete
      const completed = entries.every(e => e.filled);
      
      // Status text based on progress
      let statusText = "Not started";
      if (completed) {
        statusText = "Completed";
      } else if (entries.some(e => e.filled)) {
        statusText = "In progress";
      }
      
      // Colors for X4
      const colors = ['blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'red', 'orange', 'amber', 'yellow', 'gold', 'gold'];
      
      return {
        level,
        name: `Level ${level}`,
        price,
        entries,
        color: colors[i % colors.length],
        statusText,
        completed,
        totalEarnings
      };
    });
    
    setMatrixData({
      x3: x3Levels,
      x4: x4Levels
    });
    
    setLoading(false);
  };
  
  // Helper to generate a random Solana-style wallet address
  const generateRandomWalletAddress = () => {
    return `${Math.random().toString(16).substring(2, 14)}...${Math.random().toString(16).substring(2, 6)}`;
  };
  
  // Get CSS color class based on matrix color and filled status
  const getColorClass = (color: string, filled: boolean, passesUp: boolean): string => {
    if (!filled) return 'bg-gray-300 dark:bg-gray-700 opacity-30';
    
    // Add special styling for positions that pass up
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
      'cyan': 'bg-cyan-500',
      'gold': 'bg-yellow-500'
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
  
  // Save reference to matrix entry elements for animation positioning
  const setEntryRef = (el: HTMLDivElement | null, level: number, position: number) => {
    if (el) {
      matrixEntriesRef.current.set(`${level}-${position}`, el);
    }
  };
  
  // Render a single matrix level
  const renderMatrixLevel = (level: MatrixLevel, isX3: boolean) => {
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
              {level.entries.map((entry, idx) => (
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
                            {entry.walletAddress}
                          </p>
                          <p className="text-xs mt-1">
                            Joined: {entry.joinedDate?.toLocaleDateString()}
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
                  <div className="flex items-center text-gray-400">
                    <Info className="w-4 h-4 mr-1" />
                    <span className="text-sm">
                      {level.entries.filter(e => e.filled).length} of {level.entries.length} positions filled
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center text-green-500">
                <Coins className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">${level.totalEarnings} earned</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  // Render the current matrix (X3 or X4)
  const renderMatrix = () => {
    const currentMatrix = activeTab === 'x3' ? matrixData.x3 : matrixData.x4;
    
    if (loading) {
      return (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <p className="ml-4">Loading matrix data...</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentMatrix.map(level => renderMatrixLevel(level, activeTab === 'x3'))}
      </div>
    );
  };
  
  // Calculate matrix stats
  const getMatrixStats = () => {
    const currentMatrix = activeTab === 'x3' ? matrixData.x3 : matrixData.x4;
    
    const totalPositions = currentMatrix.reduce(
      (sum, level) => sum + level.entries.length, 
      0
    );
    
    const filledPositions = currentMatrix.reduce(
      (sum, level) => sum + level.entries.filter(e => e.filled).length, 
      0
    );
    
    const completedLevels = currentMatrix.filter(l => l.completed).length;
    
    const totalEarnings = currentMatrix.reduce(
      (sum, level) => sum + level.totalEarnings,
      0
    );
    
    return { totalPositions, filledPositions, completedLevels, totalEarnings };
  };
  
  const stats = getMatrixStats();
  
  return (
    <div className="container mx-auto p-4 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Matrix Visualization</h2>
          <p className="text-gray-400 mb-4">View your matrix structure and 100% direct crypto payments</p>
        </div>
        
        <div>
          <Button variant="outline" onClick={generateMatrixData} className="flex items-center">
            <ArrowRight className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>
      
      <Card className="mb-6 bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 p-4 rounded-lg flex flex-col items-center text-center">
              <div className="text-2xl font-bold text-blue-500">{stats.filledPositions}/{stats.totalPositions}</div>
              <div className="text-sm text-gray-400">Positions Filled</div>
            </div>
            
            <div className="bg-slate-900 p-4 rounded-lg flex flex-col items-center text-center">
              <div className="text-2xl font-bold text-green-500">{stats.completedLevels}/12</div>
              <div className="text-sm text-gray-400">Levels Completed</div>
            </div>
            
            <div className="bg-slate-900 p-4 rounded-lg flex flex-col items-center text-center">
              <div className="text-2xl font-bold text-purple-500">
                ${stats.totalEarnings}
              </div>
              <div className="text-sm text-gray-400">Total Earnings</div>
            </div>
            
            <div className="bg-slate-900 p-4 rounded-lg flex flex-col items-center text-center">
              <div className="text-2xl font-bold text-yellow-500">100%</div>
              <div className="text-sm text-gray-400">Direct Commission</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="mb-6">
        <Tabs defaultValue="x3" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full md:w-1/2 lg:w-1/3">
            <TabsTrigger value="x3" className="flex-1">X3 Matrix</TabsTrigger>
            <TabsTrigger value="x4" className="flex-1">X4 Matrix</TabsTrigger>
          </TabsList>
          
          <TabsContent value="x3">
            <div className="p-4 bg-slate-900 rounded-lg mb-4">
              <div className="flex items-start mb-4">
                <Award className="text-yellow-500 mr-3 h-5 w-5" />
                <div>
                  <h3 className="text-lg font-medium">X3 Matrix (2×3)</h3>
                  <p className="text-sm text-gray-400">
                    First level: 2 positions (first to you, second passes up)<br />
                    Second level: 3 positions (first two to you, third passes up)<br />
                    Higher levels: 5 positions (positions 1, 2, 4 to you, 3 and 5 pass up)
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  From $25 to $51,200
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  100% Direct Payments
                </Badge>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                  Smart Contract Distribution
                </Badge>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                  Automatic Recycling
                </Badge>
              </div>
            </div>
            {renderMatrix()}
          </TabsContent>
          
          <TabsContent value="x4">
            <div className="p-4 bg-slate-900 rounded-lg mb-4">
              <div className="flex items-start mb-4">
                <Award className="text-yellow-500 mr-3 h-5 w-5" />
                <div>
                  <h3 className="text-lg font-medium">X4 Matrix (Spillover)</h3>
                  <p className="text-sm text-gray-400">
                    First level: 2 positions (first to you, second passes up)<br />
                    Second level: 4 positions (positions 1, 3 to you, 2, 4 pass up)<br />
                    Higher levels: 6 positions (odd positions to you, even positions pass up)
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  From $25 to $51,200
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  100% Direct Payments
                </Badge>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                  Team-based Spillover
                </Badge>
              </div>
            </div>
            {renderMatrix()}
          </TabsContent>
        </Tabs>
      </div>
      
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
        <CardFooter>
          <Button className="w-full">Buy New Slot</Button>
        </CardFooter>
      </Card>
      
      {/* Exploding coin animation */}
      {showAnimationAt && (
        <ExplodingCoinAnimation 
          isVisible={true}
          position={animationPosition}
          coinType="sol"
          particleCount={30}
        />
      )}
    </div>
  );
}

export default ForsageMatrixVisualization;