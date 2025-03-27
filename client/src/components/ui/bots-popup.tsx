import React, { useState, useEffect } from 'react';
import { ScrollArea } from './scroll-area';
import { Button } from './button';
import { X, Play, Pause, Trash2, Plus, Save, Code, ChevronRight, ChevronDown } from 'lucide-react';
import { useBots } from '@/lib/stores/useBots';
import { Bot } from '@/lib/types';
import { Textarea } from './textarea';
import { Input } from './input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Switch } from './switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible';
import { TRADING_SYMBOLS, BOT_STRATEGY_TYPES } from '@/lib/constants';
import { cn } from '@/lib/utils';

/**
 * Trading Bots Popup Component
 * - Displays a list of configured bots
 * - Allows creating, editing, and deleting bots
 * - Provides bot activation controls
 */
export function BotsPopup({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { bots, fetchBots, createBot, updateBot, deleteBot, runBot, stopBot } = useBots();
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form state
  const [botName, setBotName] = useState('');
  const [botType, setBotType] = useState('');
  const [botSymbol, setBotSymbol] = useState('');
  const [botCode, setBotCode] = useState('');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  
  // Notification state
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  // Load bots on mount
  useEffect(() => {
    if (isOpen) {
      fetchBots();
    }
  }, [fetchBots, isOpen]);

  // Reset the form when changing modes
  useEffect(() => {
    if (!isEditing && !isCreating) {
      setBotName('');
      setBotType('');
      setBotSymbol('');
      setBotCode('');
    }
  }, [isEditing, isCreating]);

  // Set form values when selecting a bot to edit
  useEffect(() => {
    if (selectedBot && isEditing) {
      setBotName(selectedBot.name);
      setBotType(selectedBot.type);
      setBotSymbol(selectedBot.symbol);
      setBotCode(selectedBot.code);
    }
  }, [selectedBot, isEditing]);

  // Handle creating a new bot
  const handleCreateBot = async () => {
    // Validate form
    if (!botName || !botType || !botSymbol) {
      setMessage({
        text: 'Please fill in all required fields',
        type: 'error'
      });
      return;
    }

    try {
      await createBot({
        name: botName,
        type: botType,
        symbol: botSymbol,
        code: botCode || getDefaultCodeForStrategy(botType, botSymbol),
        active: false
      });
      
      setMessage({
        text: 'Bot created successfully',
        type: 'success'
      });
      
      // Reset form and exit create mode
      setBotName('');
      setBotType('');
      setBotSymbol('');
      setBotCode('');
      setIsCreating(false);
      fetchBots();
    } catch (error) {
      setMessage({
        text: 'Failed to create bot',
        type: 'error'
      });
    }
  };

  // Handle updating an existing bot
  const handleUpdateBot = async () => {
    if (!selectedBot) return;
    
    try {
      await updateBot(selectedBot.id, {
        name: botName,
        type: botType,
        symbol: botSymbol,
        code: botCode,
      });
      
      setMessage({
        text: 'Bot updated successfully',
        type: 'success'
      });
      
      // Exit edit mode
      setIsEditing(false);
      setSelectedBot(null);
      fetchBots();
    } catch (error) {
      setMessage({
        text: 'Failed to update bot',
        type: 'error'
      });
    }
  };

  // Handle deleting a bot
  const handleDeleteBot = async (botId: string) => {
    if (!confirm('Are you sure you want to delete this bot?')) return;
    
    try {
      await deleteBot(botId);
      if (selectedBot?.id === botId) {
        setSelectedBot(null);
        setIsEditing(false);
      }
      fetchBots();
    } catch (error) {
      setMessage({
        text: 'Failed to delete bot',
        type: 'error'
      });
    }
  };

  // Toggle bot running state
  const handleToggleBot = async (bot: Bot) => {
    try {
      if (bot.active) {
        await stopBot(bot.id);
      } else {
        await runBot(bot.id);
      }
      fetchBots();
    } catch (error) {
      setMessage({
        text: `Failed to ${bot.active ? 'stop' : 'run'} bot`,
        type: 'error'
      });
    }
  };

  // Generate default code based on strategy type
  const getDefaultCodeForStrategy = (strategyType: string, symbol: string): string => {
    switch (strategyType) {
      case 'Trend Following':
        return `// Trend Following Bot for ${symbol}
function analyze(data) {
  const prices = data.map(candle => candle.close);
  const sma20 = calculateSMA(prices, 20);
  const sma50 = calculateSMA(prices, 50);
  
  // Buy when short-term average crosses above long-term average
  if (sma20[sma20.length - 1] > sma50[sma50.length - 1] && 
      sma20[sma20.length - 2] <= sma50[sma50.length - 2]) {
    return { action: 'buy', reason: 'SMA 20 crossed above SMA 50' };
  }
  
  // Sell when short-term average crosses below long-term average
  if (sma20[sma20.length - 1] < sma50[sma50.length - 1] && 
      sma20[sma20.length - 2] >= sma50[sma50.length - 2]) {
    return { action: 'sell', reason: 'SMA 20 crossed below SMA 50' };
  }
  
  return { action: 'hold', reason: 'No signal' };
}

// Simple Moving Average calculation
function calculateSMA(data, period) {
  const result = [];
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    result.push(sum / period);
  }
  return result;
}`;

      case 'Mean Reversion':
        return `// Mean Reversion Bot for ${symbol}
function analyze(data) {
  const prices = data.map(candle => candle.close);
  const sma20 = calculateSMA(prices, 20);
  const stdDev = calculateStdDev(prices, 20);
  const lastPrice = prices[prices.length - 1];
  const lastSMA = sma20[sma20.length - 1];
  
  // Buy when price is 2 standard deviations below the mean
  if (lastPrice < lastSMA - 2 * stdDev) {
    return { action: 'buy', reason: 'Price is significantly below mean' };
  }
  
  // Sell when price is 2 standard deviations above the mean
  if (lastPrice > lastSMA + 2 * stdDev) {
    return { action: 'sell', reason: 'Price is significantly above mean' };
  }
  
  return { action: 'hold', reason: 'Price within normal range' };
}

// Simple Moving Average calculation
function calculateSMA(data, period) {
  const result = [];
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    result.push(sum / period);
  }
  return result;
}

// Standard Deviation calculation
function calculateStdDev(data, period) {
  const sma = calculateSMA(data, period);
  let squaredDiffs = 0;
  for (let i = data.length - period; i < data.length; i++) {
    squaredDiffs += Math.pow(data[i] - sma[sma.length - 1], 2);
  }
  return Math.sqrt(squaredDiffs / period);
}`;

      case 'Breakout':
        return `// Breakout Bot for ${symbol}
function analyze(data) {
  const prices = data.map(candle => candle.close);
  const volumes = data.map(candle => candle.volume);
  const lookbackPeriod = 20;
  
  // Calculate recent high and low
  let recentHigh = Math.max(...prices.slice(-lookbackPeriod));
  let recentLow = Math.min(...prices.slice(-lookbackPeriod));
  
  const lastPrice = prices[prices.length - 1];
  const lastVolume = volumes[volumes.length - 1];
  const avgVolume = calculateAverage(volumes.slice(-lookbackPeriod));
  
  // Buy on breakout above recent high with increased volume
  if (lastPrice > recentHigh * 1.02 && lastVolume > avgVolume * 1.5) {
    return { action: 'buy', reason: 'Breakout above recent high with high volume' };
  }
  
  // Sell on breakdown below recent low with increased volume
  if (lastPrice < recentLow * 0.98 && lastVolume > avgVolume * 1.5) {
    return { action: 'sell', reason: 'Breakdown below recent low with high volume' };
  }
  
  return { action: 'hold', reason: 'No breakout detected' };
}

// Calculate average of an array
function calculateAverage(data) {
  return data.reduce((a, b) => a + b, 0) / data.length;
}`;

      default:
        return `// Custom Bot for ${symbol}
function analyze(data) {
  // Your custom trading logic here
  // Data format: Array of { time, open, high, low, close, volume }
  
  // Example: Simple moving average crossover
  const prices = data.map(candle => candle.close);
  
  // Add your analysis logic here
  
  return { action: 'hold', reason: 'No signal yet - customize this bot' };
}`;
    }
  };

  // Clear any notification after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-4xl h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Trading Bots</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Notification */}
        {message && (
          <div className={cn(
            "mx-4 mt-2 p-2 rounded text-sm",
            message.type === 'success' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          )}>
            {message.text}
          </div>
        )}
        
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left panel: Bot list */}
          <div className="w-full md:w-1/3 border-r p-4 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Your Bots</h3>
              <Button 
                size="sm" 
                onClick={() => {
                  setIsCreating(true);
                  setIsEditing(false);
                  setSelectedBot(null);
                }}
                disabled={isCreating || isEditing}
              >
                <Plus className="h-4 w-4 mr-1" />
                New Bot
              </Button>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {bots && bots.length > 0 ? (
                  bots.map((bot) => (
                    <div 
                      key={bot.id} 
                      className={cn(
                        "border rounded-md p-3 text-sm",
                        selectedBot?.id === bot.id && "border-primary",
                        bot.active && "border-l-4 border-l-green-500"
                      )}
                      onClick={() => {
                        if (!isCreating && !isEditing) {
                          setSelectedBot(bot);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{bot.name}</span>
                        <div className="flex items-center space-x-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleBot(bot);
                            }}
                          >
                            {bot.active ? (
                              <Pause className="h-4 w-4 text-amber-500" />
                            ) : (
                              <Play className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-7 w-7 text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBot(bot.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-1 text-xs flex justify-between text-muted-foreground">
                        <span>{bot.symbol}</span>
                        <span>{bot.type}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          bot.active 
                            ? "bg-green-100 text-green-800" 
                            : "bg-slate-100 text-slate-800"
                        )}>
                          {bot.active ? 'Running' : 'Stopped'}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBot(bot);
                            setIsEditing(true);
                            setIsCreating(false);
                          }}
                          disabled={isCreating || isEditing}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No bots found</p>
                    <p className="text-xs mt-1">Create a new bot to get started</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
          
          {/* Right panel: Bot details/editor */}
          <div className="w-full md:w-2/3 p-4 flex flex-col h-full">
            {isCreating && (
              <>
                <h3 className="font-medium mb-4">Create New Bot</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Bot Name</label>
                    <Input 
                      placeholder="Enter bot name" 
                      value={botName}
                      onChange={(e) => setBotName(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Strategy Type</label>
                      <Select 
                        value={botType} 
                        onValueChange={(value) => setBotType(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select strategy" />
                        </SelectTrigger>
                        <SelectContent>
                          {BOT_STRATEGY_TYPES.map(strategy => (
                            <SelectItem key={strategy} value={strategy}>
                              {strategy}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Trading Symbol</label>
                      <Select 
                        value={botSymbol} 
                        onValueChange={(value) => setBotSymbol(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select symbol" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(TRADING_SYMBOLS).map(symbol => (
                            <SelectItem key={symbol} value={symbol}>
                              {symbol}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="flex w-full justify-between p-0 h-8">
                        <span className="text-sm font-medium">Advanced Configuration</span>
                        {isAdvancedOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Bot Strategy Code</label>
                        <div className="relative">
                          <Textarea 
                            placeholder="Enter custom trading logic"
                            className="h-60 font-mono text-xs"
                            value={botCode}
                            onChange={(e) => setBotCode(e.target.value)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-2"
                            onClick={() => botType && botSymbol && setBotCode(getDefaultCodeForStrategy(botType, botSymbol))}
                          >
                            <Code className="h-4 w-4 mr-1" />
                            Use Template
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Write custom JavaScript code that analyzes market data and returns trading signals
                        </p>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsCreating(false);
                        setBotName('');
                        setBotType('');
                        setBotSymbol('');
                        setBotCode('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreateBot}>
                      Create Bot
                    </Button>
                  </div>
                </div>
              </>
            )}
            
            {isEditing && selectedBot && (
              <>
                <h3 className="font-medium mb-4">Edit Bot</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Bot Name</label>
                    <Input 
                      placeholder="Enter bot name" 
                      value={botName}
                      onChange={(e) => setBotName(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Strategy Type</label>
                      <Select 
                        value={botType} 
                        onValueChange={(value) => setBotType(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select strategy" />
                        </SelectTrigger>
                        <SelectContent>
                          {BOT_STRATEGY_TYPES.map(strategy => (
                            <SelectItem key={strategy} value={strategy}>
                              {strategy}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Trading Symbol</label>
                      <Select 
                        value={botSymbol} 
                        onValueChange={(value) => setBotSymbol(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select symbol" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(TRADING_SYMBOLS).map(symbol => (
                            <SelectItem key={symbol} value={symbol}>
                              {symbol}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Bot Strategy Code</label>
                    <Textarea 
                      placeholder="Enter custom trading logic"
                      className="h-60 font-mono text-xs"
                      value={botCode}
                      onChange={(e) => setBotCode(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false);
                        setSelectedBot(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateBot}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              </>
            )}
            
            {!isCreating && !isEditing && selectedBot && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">{selectedBot.name}</h3>
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="sm" 
                      variant={selectedBot.active ? "destructive" : "default"}
                      onClick={() => handleToggleBot(selectedBot)}
                    >
                      {selectedBot.active ? (
                        <>
                          <Pause className="h-4 w-4 mr-1" />
                          Stop Bot
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-1" />
                          Run Bot
                        </>
                      )}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => {
                        setSelectedBot(selectedBot);
                        setIsEditing(true);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="border rounded-md p-3 text-sm">
                    <p className="text-xs text-muted-foreground">Strategy</p>
                    <p className="font-medium">{selectedBot.type}</p>
                  </div>
                  <div className="border rounded-md p-3 text-sm">
                    <p className="text-xs text-muted-foreground">Symbol</p>
                    <p className="font-medium">{selectedBot.symbol}</p>
                  </div>
                </div>
                
                <div className="border rounded-md p-3 text-sm mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Status</h4>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      selectedBot.active ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-800"
                    )}>
                      {selectedBot.active ? 'Running' : 'Stopped'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                    <div>
                      <p className="text-muted-foreground">Performance (24h)</p>
                      <p className="font-medium text-green-500">+2.3%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Active Since</p>
                      <p className="font-medium">2 days ago</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Signal</p>
                      <p className="font-medium">Buy @ $45,230</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Open Positions</p>
                      <p className="font-medium">1</p>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-3 text-sm">
                  <h4 className="font-medium mb-2">Bot Strategy Code</h4>
                  <ScrollArea className="h-60 w-full">
                    <pre className="text-xs font-mono p-2 bg-slate-50 dark:bg-slate-900 rounded">
                      {selectedBot.code}
                    </pre>
                  </ScrollArea>
                </div>
              </>
            )}
            
            {!isCreating && !isEditing && !selectedBot && (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                <div className="mb-4">
                  <Code className="h-12 w-12 mb-2 opacity-20" />
                  <h3 className="text-lg font-medium">No Bot Selected</h3>
                </div>
                <p className="max-w-md">
                  Select a bot from the list to view details or click "New Bot" to create a trading bot. 
                  Trading bots can automate your strategy and execute trades based on predefined rules.
                </p>
                <Button 
                  className="mt-4" 
                  onClick={() => setIsCreating(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Bot
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}