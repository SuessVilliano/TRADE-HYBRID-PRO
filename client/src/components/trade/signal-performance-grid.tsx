import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  RotateCw,
  Search
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { SignalPerformanceCard } from './signal-performance-card';
import { TradeSignal, tradeSignalService } from '@/lib/services/trade-signal-service';
import { cn } from '@/lib/utils';

interface SignalPerformanceGridProps {
  className?: string;
}

export function SignalPerformanceGrid({ className }: SignalPerformanceGridProps) {
  const [signals, setSignals] = useState<TradeSignal[]>([]);
  const [filteredSignals, setFilteredSignals] = useState<TradeSignal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSource, setActiveSource] = useState<string | null>(null);
  
  // Load signals on mount
  useEffect(() => {
    // Get signals from service
    const loadSignals = async () => {
      setIsLoading(true);
      
      try {
        // Subscribe to signal updates
        tradeSignalService.subscribe('signal_added', (signal) => {
          setSignals(prev => [signal, ...prev]);
        });
        
        // Get initial signals
        const initialSignals = tradeSignalService.getAllSignals();
        setSignals(initialSignals);
        setFilteredSignals(initialSignals);
      } catch (error) {
        console.error('Error loading signals:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSignals();
    
    // Cleanup subscription on unmount
    return () => {
      tradeSignalService.unsubscribe('signal_added', () => {});
    };
  }, []);
  
  // Apply filters when dependencies change
  useEffect(() => {
    let result = [...signals];
    
    // Apply tab filter (all, buy, sell)
    if (activeTab === 'buy') {
      result = result.filter(signal => signal.type === 'buy');
    } else if (activeTab === 'sell') {
      result = result.filter(signal => signal.type === 'sell');
    } else if (activeTab === 'active') {
      result = result.filter(signal => signal.status === 'active');
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(signal => 
        signal.symbol.toLowerCase().includes(query) ||
        signal.source.toLowerCase().includes(query) ||
        (signal.notes && signal.notes.toLowerCase().includes(query))
      );
    }
    
    // Apply source filter
    if (activeSource) {
      result = result.filter(signal => signal.source === activeSource);
    }
    
    setFilteredSignals(result);
  }, [signals, activeTab, searchQuery, activeSource]);
  
  // Get unique signal sources for filter dropdown
  const getUniqueSources = () => {
    const sources = signals.map(signal => signal.source);
    return Array.from(new Set(sources));
  };
  
  // Refresh signals
  const refreshSignals = async () => {
    setIsLoading(true);
    
    try {
      await tradeSignalService.fetchRealSignals();
      const refreshedSignals = tradeSignalService.getAllSignals();
      setSignals(refreshedSignals);
    } catch (error) {
      console.error('Error refreshing signals:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset all filters
  const resetFilters = () => {
    setActiveTab('all');
    setSearchQuery('');
    setActiveSource(null);
  };
  
  // Get appropriate empty state message
  const getEmptyStateMessage = () => {
    if (searchQuery || activeSource || activeTab !== 'all') {
      return "No signals match your filters. Try adjusting your filters or search query.";
    }
    return "No signals available. Check back later for new trading signals.";
  };
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Trade Signals</h2>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshSignals}
            disabled={isLoading}
          >
            <RotateCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by Source</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setActiveSource(null)}>
                  <span className={!activeSource ? "font-medium" : ""}>All Sources</span>
                </DropdownMenuItem>
                {getUniqueSources().map(source => (
                  <DropdownMenuItem 
                    key={source} 
                    onClick={() => setActiveSource(source)}
                  >
                    <span className={activeSource === source ? "font-medium" : ""}>{source}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={resetFilters}>
                Reset All Filters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Search and tabs */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search symbols, sources..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Signals</TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              Active
            </TabsTrigger>
            <TabsTrigger value="buy" className="flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              Buy
            </TabsTrigger>
            <TabsTrigger value="sell" className="flex items-center gap-1">
              <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
              Sell
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Status bar */}
      <div className="flex items-center justify-between text-sm">
        <div className="text-muted-foreground">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent"></div>
              <span>Loading signals...</span>
            </div>
          ) : (
            <>
              Showing {filteredSignals.length} of {signals.length} signals
              {activeSource && <span> from <span className="font-medium">{activeSource}</span></span>}
              {activeTab !== 'all' && <span> ({activeTab})</span>}
            </>
          )}
        </div>
        
        {(searchQuery || activeSource || activeTab !== 'all') && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Clear Filters
          </Button>
        )}
      </div>
      
      {/* Signal grid */}
      {!isLoading && filteredSignals.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <Filter className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No Signals Found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {getEmptyStateMessage()}
          </p>
          <Button variant="outline" className="mt-4" onClick={resetFilters}>
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSignals.map((signal, index) => (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <SignalPerformanceCard signal={signal} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}