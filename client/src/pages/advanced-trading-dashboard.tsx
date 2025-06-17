import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { LayoutDashboard, Settings, RefreshCw, Save, PlusCircle } from 'lucide-react';
import { CustomizableTradingDashboard } from '../components/ui/customizable-trading-dashboard';
import { toast } from 'sonner';
import { PopupContainer } from '../components/ui/popup-container';
import { useConnectWallet } from '../hooks/use-connect-wallet';

interface AdvancedTradingDashboardProps {
  // Add any props here
}

export default function AdvancedTradingDashboard({}: AdvancedTradingDashboardProps) {
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [selectedSymbol, setSelectedSymbol] = useState('BINANCE:BTCUSDT');
  const { isConnected, connectWallet, walletAddress } = useConnectWallet();

  // Sample trading symbols
  const tradingSymbols = [
    { value: 'BINANCE:BTCUSDT', label: 'Bitcoin (BTC/USDT)' },
    { value: 'BINANCE:ETHUSDT', label: 'Ethereum (ETH/USDT)' },
    { value: 'BINANCE:SOLUSDT', label: 'Solana (SOL/USDT)' },
    { value: 'BINANCE:BNBUSDT', label: 'BNB (BNB/USDT)' },
    { value: 'BINANCE:JUPUSDT', label: 'Jupiter (JUP/USDT)' },
    { value: 'BINANCE:AVAXUSDT', label: 'Avalanche (AVAX/USDT)' },
  ];

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
  };

  const handleConnect = async () => {
    try {
      await connectWallet();
      toast.success('Wallet connected successfully!');
    } catch (error) {
      toast.error('Failed to connect wallet');
      console.error('Wallet connection error:', error);
    }
  };

  return (
    <PopupContainer className="min-h-[calc(100vh-130px)] bg-slate-900 text-white p-4 md:p-6" padding>
      <div className="container mx-auto">
        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">Advanced Trading Dashboard</h1>
              <p className="text-slate-400 text-sm">
                Professional prop firm trading workspace with multi-platform integration
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {!isConnected ? (
                <Button onClick={handleConnect} className="bg-purple-600 hover:bg-purple-700">
                  Connect Wallet
                </Button>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="text-sm bg-slate-800 px-3 py-1.5 rounded-md border border-slate-700">
                    <span className="text-slate-400 mr-1">Wallet:</span>
                    <span className="text-purple-400">
                      {walletAddress?.substring(0, 6)}...{walletAddress?.substring(walletAddress.length - 4)}
                    </span>
                  </div>
                  <Button variant="outline" size="sm">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Deposit
                  </Button>
                </div>
              )}
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Tab navigation */}
          <Tabs value={selectedTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="dashboard" className="flex items-center">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Trading Dashboard
              </TabsTrigger>
              <TabsTrigger value="platforms" className="flex items-center">
                Prop Firm Platforms
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex items-center">
                Market Analysis
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Dashboard Content */}
          {selectedTab === 'dashboard' && (
            <div className="grid gap-6">
              {/* Dashboard actions */}
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center justify-end gap-4">
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="gap-2 bg-purple-600 hover:bg-purple-700"
                      onClick={() => window.location.href = '/trading-dashboard/custom'}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Customizable Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Main Dashboard */}
              <CustomizableTradingDashboard defaultSymbol={selectedSymbol.split(':')[1]} />
            </div>
          )}
          
          {/* Prop Firm Platforms Tab Content */}
          {selectedTab === 'platforms' && (
            <div className="grid gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle>Prop Firm Trading Platforms</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-700 rounded-lg">
                      <h3 className="font-semibold mb-2">cTrader</h3>
                      <p className="text-sm text-slate-400 mb-3">Professional ECN trading platform</p>
                      <Button 
                        size="sm" 
                        onClick={() => window.open('https://app.gooeytrade.com/', '_blank')}
                        className="w-full"
                      >
                        Access cTrader
                      </Button>
                    </div>
                    <div className="p-4 bg-slate-700 rounded-lg">
                      <h3 className="font-semibold mb-2">DX Trade</h3>
                      <p className="text-sm text-slate-400 mb-3">Multi-asset trading platform</p>
                      <Button 
                        size="sm" 
                        onClick={() => window.open('https://trade.gooeytrade.com/', '_blank')}
                        className="w-full"
                      >
                        Access DX Trade
                      </Button>
                    </div>
                    <div className="p-4 bg-slate-700 rounded-lg">
                      <h3 className="font-semibold mb-2">Match Trader</h3>
                      <p className="text-sm text-slate-400 mb-3">Social trading with copy trading</p>
                      <Button 
                        size="sm" 
                        onClick={() => window.open('https://mtr.gooeytrade.com/dashboard', '_blank')}
                        className="w-full"
                      >
                        Access Match Trader
                      </Button>
                    </div>
                    <div className="p-4 bg-slate-700 rounded-lg">
                      <h3 className="font-semibold mb-2">Rithmic</h3>
                      <p className="text-sm text-slate-400 mb-3">Ultra-low latency futures trading</p>
                      <Button 
                        size="sm" 
                        onClick={() => window.open('https://rtraderpro.rithmic.com/rtraderpro-web/', '_blank')}
                        className="w-full"
                      >
                        Access RTrader Pro
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Market Analysis Tab Content */}
          {selectedTab === 'analysis' && (
            <div className="grid gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle>Market Analysis Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-700 rounded-lg">
                      <h3 className="font-semibold mb-2">Real-time Market Data</h3>
                      <p className="text-sm text-slate-400">Access live market data and analysis across all prop firm platforms</p>
                    </div>
                    <div className="p-4 bg-slate-700 rounded-lg">
                      <h3 className="font-semibold mb-2">Trading Signals</h3>
                      <p className="text-sm text-slate-400">AI-powered trading signals from Paradox, Solaris, and Hybrid providers</p>
                    </div>
                    <div className="p-4 bg-slate-700 rounded-lg">
                      <h3 className="font-semibold mb-2">Risk Management</h3>
                      <p className="text-sm text-slate-400">Advanced risk assessment and position sizing tools</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </PopupContainer>
  );
}