import { useState, useEffect } from 'react';
import { useBrokerAggregator } from '@/lib/stores/useBrokerAggregator';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Switch } from './switch';
import { ChevronDown, ChevronUp, RefreshCw, Shield, Star } from 'lucide-react';
import { ScrollArea } from './scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion';
import { Button } from './button';

export function BrokerConfig() {
  const { activeBrokers, aggregator, useABATEV, toggleABATEV, initializeAggregator } = useBrokerAggregator();
  const [brokerStates, setBrokerStates] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState(false);

  // Initialize broker states from active brokers
  useEffect(() => {
    const states: Record<string, boolean> = {};
    
    // List all possible brokers
    const allBrokers = [
      'tradelocker', // Add TradeLocker as first option - it's our unified trading API
      'ironbeam', 
      'alpaca', 
      'oanda', 
      'tradestation', 
      'ibkr', 
      'bitfinex', 
      'etrade'
    ];
    
    // Set initial states based on active brokers
    allBrokers.forEach(broker => {
      states[broker] = activeBrokers.includes(broker);
    });
    
    setBrokerStates(states);
  }, [activeBrokers]);

  // Function to toggle a broker's active state
  const toggleBroker = (brokerId: string) => {
    setBrokerStates(prev => ({
      ...prev,
      [brokerId]: !prev[brokerId]
    }));
    
    // Update would be sent to broker aggregator in a full implementation
    console.log(`Toggled broker: ${brokerId}`);
  };

  // Get broker details
  const getBrokerDetails = (brokerId: string) => {
    const details = {
      tradelocker: {
        name: 'TradeLocker',
        description: 'Unified trading gateway with multi-broker access',
        features: ['Multi-Broker API', 'Universal Access', 'Copy Trading', 'Best Execution'],
        fee: 'Variable',
        reliability: '99.95%'
      },
      ironbeam: {
        name: 'IronBeam',
        description: 'Specialized in commodities and futures',
        features: ['Metals', 'Energy', 'Grains', 'Futures', 'Options'],
        fee: '0.10%',
        reliability: '99.9%'
      },
      alpaca: {
        name: 'Alpaca',
        description: 'Commission-free stock trading',
        features: ['US Equities', 'Commission-free', 'Fractional shares', 'API-first'],
        fee: '0.08%',
        reliability: '99.5%'
      },
      oanda: {
        name: 'OANDA',
        description: 'Specialized in forex trading',
        features: ['Forex', 'CFDs', 'Metals', 'Indices'],
        fee: '0.15%',
        reliability: '99.8%'
      },
      tradestation: {
        name: 'TradeStation',
        description: 'Advanced trading platform for active traders',
        features: ['US Equities', 'Options', 'Futures', 'Crypto'],
        fee: '0.15%',
        reliability: '99.7%'
      },
      ibkr: {
        name: 'Interactive Brokers',
        description: 'Global trading across multiple asset classes',
        features: ['Global markets', 'Equities', 'Options', 'Futures', 'Forex', 'Bonds'],
        fee: '0.15%',
        reliability: '99.9%'
      },
      bitfinex: {
        name: 'Bitfinex',
        description: 'Advanced cryptocurrency exchange',
        features: ['Cryptocurrencies', 'Margin trading', 'Lending', 'Staking'],
        fee: '0.20%',
        reliability: '99.6%'
      },
      etrade: {
        name: 'E*TRADE',
        description: 'Popular retail brokerage for stocks and options',
        features: ['US Equities', 'Options', 'Futures', 'Mutual Funds', 'Bonds'],
        fee: '0.05%',
        reliability: '99.8%'
      }
    };
    
    return details[brokerId as keyof typeof details] || {
      name: brokerId.charAt(0).toUpperCase() + brokerId.slice(1),
      description: 'Trading broker',
      features: ['Trading'],
      fee: 'Variable',
      reliability: 'Unknown'
    };
  };

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Badge variant={useABATEV ? "default" : "outline"} className="inline-flex px-1">ABATEV</Badge>
            <span>Broker Configuration</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      
      {expanded && (
        <CardContent>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">ABATEV Smart Routing</span>
            </div>
            <Switch 
              checked={useABATEV} 
              onCheckedChange={toggleABATEV}
            />
          </div>
          
          <div className="text-xs text-muted-foreground mb-3">
            {useABATEV ? 
              "ABATEV optimizes trade execution by automatically selecting the broker with the best price, latency, and fees." :
              "Manual broker selection is enabled. Toggle brokers below to adjust which ones will be used for trading."
            }
          </div>
          
          <div className="border rounded-md mb-2">
            <ScrollArea className={useABATEV ? "h-[100px]" : "h-[250px]"}>
              <Accordion type="multiple" defaultValue={['bitfinex', 'etrade']} className="w-full">
                {Object.keys(brokerStates).map(brokerId => {
                  const details = getBrokerDetails(brokerId);
                  const isNew = brokerId === 'tradelocker' || brokerId === 'bitfinex' || brokerId === 'etrade';
                  
                  return (
                    <AccordionItem key={brokerId} value={brokerId} className="border-b">
                      <div className="flex items-center justify-between px-4 py-2">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={brokerStates[brokerId]}
                            onCheckedChange={() => toggleBroker(brokerId)}
                            disabled={useABATEV}
                          />
                          <span className="font-medium">{details.name}</span>
                          {isNew && (
                            <Badge variant="default" className="bg-blue-500 text-[10px] h-4">
                              NEW
                            </Badge>
                          )}
                          {brokerId === 'tradelocker' && (
                            <Badge variant="default" className="bg-green-500 text-[10px] h-4 ml-1">
                              COPY TRADE
                            </Badge>
                          )}
                        </div>
                        <AccordionTrigger className="p-0 hover:no-underline">
                          <span className="sr-only">Toggle details</span>
                        </AccordionTrigger>
                      </div>
                      
                      <AccordionContent className="pb-2 pl-10 pr-4">
                        <div className="text-xs text-muted-foreground">{details.description}</div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {details.features.map(feature => (
                            <Badge key={feature} variant="outline" className="text-[10px]">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                        <div className="mt-2 text-xs grid grid-cols-2 gap-x-2">
                          <div>Fee: <span className="font-medium">{details.fee}</span></div>
                          <div>Uptime: <span className="font-medium">{details.reliability}</span></div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </ScrollArea>
          </div>
          
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-8 gap-1"
              onClick={() => initializeAggregator()}
            >
              <RefreshCw className="h-3 w-3" />
              <span>Refresh Connections</span>
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}