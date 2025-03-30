import React, { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Award, CheckCircle, ArrowRight } from 'lucide-react';

interface MatrixEntry {
  position: number;
  filled: boolean;
  value: number;
  username?: string;
  address?: string;
  joinedDate?: Date;
}

interface MatrixLevel {
  level: number;
  name: string;
  entries: MatrixEntry[];
  color: string;
  statusText: string;
  completed: boolean;
}

/**
 * Trade Hybrid Matrix Visualization component
 * - Displays matrix slots in a visual format similar to the reference images
 * - Shows multiple matrix levels with colorful bubbles
 * - Displays status and progress information
 */
export function MatrixVisualization() {
  const [activeTab, setActiveTab] = useState<string>('x3');
  const [matrixData, setMatrixData] = useState<{
    x3: MatrixLevel[];
    x4: MatrixLevel[];
  }>({
    x3: [],
    x4: []
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Fetch matrix data or generate sample data
    generateSampleMatrixData();
  }, []);

  const generateSampleMatrixData = () => {
    setLoading(true);
    
    // This simulates fetching data from API or blockchain
    // In production, this would be real data from your backend/blockchain
    
    // Generate X3 matrix levels (using reference image as guide)
    const x3Levels: MatrixLevel[] = Array.from({ length: 12 }, (_, i) => {
      const level = i + 1;
      const filled = Math.random() > 0.5;
      const entryCount = 3; // X3 has 3 spots per level
      
      // Create entries for this level
      const entries: MatrixEntry[] = Array.from({ length: entryCount }, (_, j) => {
        // More likely to be filled in lower levels
        const entryFilled = j === 0 ? true : Math.random() > 0.4 + (i * 0.05);
        const value = 25 * Math.pow(2, i); // 25, 50, 100, 200, etc.
        
        return {
          position: j + 1,
          filled: entryFilled,
          value: value,
          username: entryFilled ? `user${Math.floor(Math.random() * 1000)}` : undefined,
          address: entryFilled ? `0x${Math.random().toString(16).substring(2, 10)}` : undefined,
          joinedDate: entryFilled ? new Date(Date.now() - Math.random() * 10000000000) : undefined
        };
      });
      
      // Determine if level is complete (all entries filled)
      const completed = entries.every(e => e.filled);
      
      // Status text based on progress
      let statusText = "Not started";
      if (completed) {
        statusText = "Completed";
      } else if (entries.some(e => e.filled)) {
        statusText = "In progress";
      }
      
      // Assign a color based on the level (matching the reference image)
      const colors = ['cyan', 'blue', 'indigo', 'purple', 'fuchsia', 'pink', 'rose', 'red', 'orange', 'amber', 'yellow', 'lime'];
      
      return {
        level,
        name: `Level ${level}`,
        entries,
        color: colors[i % colors.length],
        statusText,
        completed
      };
    });
    
    // Generate X4 matrix levels (4 spots per level)
    const x4Levels: MatrixLevel[] = Array.from({ length: 12 }, (_, i) => {
      const level = i + 1;
      const entryCount = 4; // X4 has 4 spots per level
      
      // Create entries for this level
      const entries: MatrixEntry[] = Array.from({ length: entryCount }, (_, j) => {
        // More likely to be filled in lower levels
        const entryFilled = j === 0 ? true : Math.random() > 0.5 + (i * 0.05);
        const value = 25 * Math.pow(2, i); // 25, 50, 100, 200, etc.
        
        return {
          position: j + 1,
          filled: entryFilled,
          value: value,
          username: entryFilled ? `user${Math.floor(Math.random() * 1000)}` : undefined,
          address: entryFilled ? `0x${Math.random().toString(16).substring(2, 10)}` : undefined,
          joinedDate: entryFilled ? new Date(Date.now() - Math.random() * 10000000000) : undefined
        };
      });
      
      // Determine if level is complete (all entries filled)
      const completed = entries.every(e => e.filled);
      
      // Status text based on progress
      let statusText = "Not started";
      if (completed) {
        statusText = "Completed";
      } else if (entries.some(e => e.filled)) {
        statusText = "In progress";
      }
      
      // Gold color for later levels
      const colors = ['blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'red', 'orange', 'amber', 'yellow', 'gold', 'gold'];
      
      return {
        level,
        name: `Level ${level}`,
        entries,
        color: colors[i % colors.length],
        statusText,
        completed
      };
    });
    
    setMatrixData({
      x3: x3Levels,
      x4: x4Levels
    });
    
    setLoading(false);
  };

  const getColorClass = (color: string, filled: boolean): string => {
    if (!filled) return 'bg-gray-300 dark:bg-gray-700 opacity-30';
    
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
    
    return colorMap[color] || 'bg-blue-500';
  };

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

  const renderMatrixLevel = (level: MatrixLevel, isX3: boolean) => {
    const entrySize = isX3 ? 'w-12 h-12 md:w-16 md:h-16' : 'w-10 h-10 md:w-14 md:h-14';
    const fontSize = isX3 ? 'text-sm md:text-base' : 'text-xs md:text-sm';
    
    return (
      <Card key={level.level} className="mb-4 bg-slate-800 border-slate-700">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">{level.name}</CardTitle>
            <CardDescription>${level.entries[0].value}</CardDescription>
          </div>
          <Badge className={getStatusClass(level.statusText)}>
            {level.statusText}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            {/* Matrix visualization */}
            <div className={`grid ${isX3 ? 'grid-cols-3' : 'grid-cols-4'} gap-2 md:gap-4 mb-4`}>
              {level.entries.map((entry, idx) => (
                <TooltipProvider key={idx}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className={`${entrySize} rounded-full flex items-center justify-center ${getColorClass(level.color, entry.filled)}`}
                      >
                        <span className={`${fontSize} font-bold text-white`}>
                          {entry.filled ? (entry.position) : ''}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {entry.filled ? (
                        <div className="text-sm">
                          <p className="font-bold">{entry.username}</p>
                          <p className="text-xs">{entry.address?.substring(0, 8)}</p>
                          <p className="text-xs mt-1">
                            Joined: {entry.joinedDate?.toLocaleDateString()}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm">Empty position</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            
            {/* Status indicator */}
            <div className="flex items-center mt-2">
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
          </div>
        </CardContent>
      </Card>
    );
  };

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
    
    return { totalPositions, filledPositions, completedLevels };
  };

  const stats = getMatrixStats();

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Matrix Visualization</h2>
          <p className="text-gray-400 mb-4">View your matrix structure and progress</p>
        </div>
        
        <div>
          <Button variant="outline" onClick={generateSampleMatrixData} className="flex items-center">
            <ArrowRight className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>
      
      <Card className="mb-6 bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                ${activeTab === 'x3' 
                  ? matrixData.x3.reduce((sum, level) => 
                      sum + (level.entries.filter(e => e.filled).length * level.entries[0].value), 0)
                  : matrixData.x4.reduce((sum, level) => 
                      sum + (level.entries.filter(e => e.filled).length * level.entries[0].value), 0)
                }
              </div>
              <div className="text-sm text-gray-400">Total Value</div>
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
                  <h3 className="text-lg font-medium">X3 Matrix (3×3)</h3>
                  <p className="text-sm text-gray-400">
                    Each level has 3 positions. Earn 100% commission from direct referrals.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  From $25 to $51,200
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  2.5% on direct referral trades
                </Badge>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                  Automatic spillover
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
                  <h3 className="text-lg font-medium">X4 Matrix (4×4)</h3>
                  <p className="text-sm text-gray-400">
                    Each level has 4 positions. Earn from team spillover and deeper levels.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  From $25 to $51,200
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  1.25% on level 2 referral trades
                </Badge>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                  Team-based spillover
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
            The Trade Hybrid matrix system offers these amazing benefits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start">
              <CheckCircle className="text-green-500 mr-2 h-5 w-5 mt-0.5" />
              <span>2.5% commission on all direct referral trades</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="text-green-500 mr-2 h-5 w-5 mt-0.5" />
              <span>1.25% commission on all level 2 referral trades</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="text-green-500 mr-2 h-5 w-5 mt-0.5" />
              <span>Automatic matrix filling from team spillover</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="text-green-500 mr-2 h-5 w-5 mt-0.5" />
              <span>Earn from multiple matrices simultaneously</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="text-green-500 mr-2 h-5 w-5 mt-0.5" />
              <span>Payments directly to your cryptocurrency wallet</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default MatrixVisualization;