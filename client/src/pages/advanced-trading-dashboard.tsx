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
                Customizable multi-chart trading workspace with DEX and CEX integration
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
              <TabsTrigger value="dex" className="flex items-center">
                DEX Trading
              </TabsTrigger>
              <TabsTrigger value="cex" className="flex items-center">
                CEX Trading
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Dashboard Content */}
          {selectedTab === 'dashboard' && (
            <div className="grid gap-6">
              {/* Quick symbol select and actions */}
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                      {tradingSymbols.slice(0, 4).map(symbol => (
                        <Button 
                          key={symbol.value}
                          variant={selectedSymbol === symbol.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedSymbol(symbol.value)}
                          className={selectedSymbol === symbol.value ? "bg-purple-600 hover:bg-purple-700" : ""}
                        >
                          {symbol.label}
                        </Button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Save className="h-4 w-4" />
                        Save Layout
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Main Dashboard */}
              <CustomizableTradingDashboard defaultSymbol={selectedSymbol.split(':')[1]} />
            </div>
          )}
          
          {/* DEX Trading Tab Content */}
          {selectedTab === 'dex' && (
            <div className="grid gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle>DEX Trading Coming Soon</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>We're working on integrating decentralized exchange trading directly into this dashboard.</p>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* CEX Trading Tab Content */}
          {selectedTab === 'cex' && (
            <div className="grid gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle>CEX Trading Coming Soon</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Centralized exchange trading features will be available in an upcoming update.</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </PopupContainer>
  );
}