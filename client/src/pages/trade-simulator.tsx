import React, { useState, useEffect } from 'react';
import { PopupContainer } from '../components/ui/popup-container';
import { Button } from '../components/ui/button';
import { useTradeSimulator } from '../lib/stores/useTradeSimulator';

// Import components
import AssetSelector from '../components/trading-simulator/asset-selector';
import SimpleChart from '../components/trading-simulator/simple-chart';
import TradeActionPanel from '../components/trading-simulator/trade-action-panel';
import EducationalTooltip from '../components/trading-simulator/educational-tooltip';
import TradeResultModal from '../components/trading-simulator/trade-result-modal';

const TradeSimulatorPage: React.FC = () => {
  const {
    balance,
    selectedAsset,
    setSelectedAsset,
    currentPrice,
    positionSize,
    setPositionSize,
    positionType,
    setPositionType,
    activePosition,
    openPosition,
    closePosition,
    priceHistory,
    tradingHistory
  } = useTradeSimulator();

  const [showResultModal, setShowResultModal] = useState(false);
  const [lastTradeResult, setLastTradeResult] = useState<any>(null);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);
  const [tooltipVisible, setTooltipVisible] = useState('');

  // Handle position close
  const handleClosePosition = () => {
    if (activePosition) {
      const result = closePosition();
      setLastTradeResult(result);
      setShowResultModal(true);
    }
  };

  // Calculate profit/loss for active position
  const calculatePnL = () => {
    if (!activePosition) return 0;
    
    const entryPrice = activePosition.entryPrice;
    const currentPriceValue = currentPrice || entryPrice;
    const size = activePosition.size;
    
    if (activePosition.type === 'buy') {
      return size * (currentPriceValue - entryPrice);
    } else {
      return size * (entryPrice - currentPriceValue);
    }
  };

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Format percentage
  const formatPercentage = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100);
  };

  // Return to trading after seeing result
  const handleContinueTrading = () => {
    setShowResultModal(false);
  };

  // Dismiss welcome message
  const dismissWelcomeMessage = () => {
    setShowWelcomeMessage(false);
    localStorage.setItem('tradeSimulator_welcomeMessageSeen', 'true');
  };

  // Check if welcome message has been seen before
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('tradeSimulator_welcomeMessageSeen');
    if (hasSeenWelcome) {
      setShowWelcomeMessage(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Trading Simulator</h1>
          <p className="text-slate-300">Practice trading with virtual money in a risk-free environment</p>
        </div>

        {/* Welcome Message */}
        {showWelcomeMessage && (
          <PopupContainer className="mb-8 p-6" padding>
            <div className="flex items-start">
              <div className="flex-grow">
                <h2 className="text-xl font-bold mb-2">Welcome to the Trading Simulator!</h2>
                <p className="text-slate-300 mb-4">
                  This trading simulator allows you to practice trading with virtual money. You start with $10,000 
                  and can trade various assets including cryptocurrencies and stocks.
                </p>
                <p className="text-slate-300 mb-4">
                  Select an asset, choose your position size, and decide whether to buy (go long) or sell (go short). 
                  The simulator provides real-time price charts and calculates your profit or loss.
                </p>
                <p className="text-slate-300">
                  Look for the <span className="inline-block bg-blue-500/20 text-blue-300 rounded-md px-2 py-1 text-xs">i</span> icons for educational tips about trading concepts.
                </p>
              </div>
              <Button variant="ghost" onClick={dismissWelcomeMessage} className="ml-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </Button>
            </div>
          </PopupContainer>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Dashboard & Account Summary */}
          <div className="lg:col-span-3 space-y-6">
            <PopupContainer padding>
              <h2 className="text-lg font-bold mb-4 flex items-center">
                Account Summary
                <button 
                  className="ml-2 bg-blue-500/20 text-blue-300 rounded-md px-2 py-0.5 text-xs"
                  onClick={() => setTooltipVisible(tooltipVisible === 'account' ? '' : 'account')}
                >
                  i
                </button>
              </h2>
              
              {tooltipVisible === 'account' && (
                <EducationalTooltip 
                  title="Account Balance"
                  content="Your account balance represents your available funds for trading. This is virtual money used for simulation purposes only."
                  onClose={() => setTooltipVisible('')}
                />
              )}
              
              <div className="space-y-4">
                <div>
                  <p className="text-slate-400 text-sm">Available Balance</p>
                  <p className="text-2xl font-bold">{formatCurrency(balance)}</p>
                </div>
                
                {activePosition && (
                  <div>
                    <p className="text-slate-400 text-sm">Open Position</p>
                    <div className="flex items-center">
                      <span className={`text-lg font-semibold ${activePosition.type === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
                        {activePosition.type === 'buy' ? 'LONG' : 'SHORT'} {activePosition.asset}
                      </span>
                    </div>
                    <div className="mt-1">
                      <p className="text-sm">Size: {formatCurrency(activePosition.size)}</p>
                      <p className="text-sm">Entry: {formatCurrency(activePosition.entryPrice)}</p>
                      <p className="text-sm flex items-center">
                        P/L: 
                        <span className={`ml-1 ${calculatePnL() >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatCurrency(calculatePnL())} ({(calculatePnL() / activePosition.size * 100).toFixed(2)}%)
                        </span>
                      </p>
                    </div>
                    <Button 
                      variant="destructive" 
                      className="w-full mt-2"
                      onClick={handleClosePosition}
                    >
                      Close Position
                    </Button>
                  </div>
                )}
              </div>
            </PopupContainer>
            
            {/* Asset Selector Component */}
            <AssetSelector 
              selectedAsset={selectedAsset} 
              onSelectAsset={setSelectedAsset}
              onShowTooltip={() => setTooltipVisible(tooltipVisible === 'assets' ? '' : 'assets')}
              tooltipVisible={tooltipVisible === 'assets'}
              onCloseTooltip={() => setTooltipVisible('')}
            />
            
            {/* Trade History */}
            <PopupContainer padding>
              <h2 className="text-lg font-bold mb-4 flex items-center">
                Trade History
                <button 
                  className="ml-2 bg-blue-500/20 text-blue-300 rounded-md px-2 py-0.5 text-xs"
                  onClick={() => setTooltipVisible(tooltipVisible === 'history' ? '' : 'history')}
                >
                  i
                </button>
              </h2>
              
              {tooltipVisible === 'history' && (
                <EducationalTooltip 
                  title="Trade History"
                  content="Your trade history shows all your closed positions and their outcomes. Review this regularly to learn from both successful and unsuccessful trades."
                  onClose={() => setTooltipVisible('')}
                />
              )}
              
              {tradingHistory.length === 0 ? (
                <p className="text-slate-400 text-sm">No trades yet. Start trading to build your history.</p>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {tradingHistory.slice().reverse().map((trade, index) => (
                    <div key={index} className="border-b border-slate-700 pb-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{trade.asset}</span>
                        <span className={`text-sm ${trade.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatCurrency(trade.profit)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>{trade.type === 'buy' ? 'LONG' : 'SHORT'}</span>
                        <span>{new Date(trade.closedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </PopupContainer>
          </div>
          
          {/* Main Content: Chart & Trading Panel */}
          <div className="lg:col-span-9 space-y-6">
            {/* Price Chart */}
            <PopupContainer padding className="h-[400px]">
              <SimpleChart 
                assetName={selectedAsset}
                priceData={priceHistory}
                activePosition={activePosition}
                onShowTooltip={() => setTooltipVisible(tooltipVisible === 'chart' ? '' : 'chart')}
                tooltipVisible={tooltipVisible === 'chart'}
                onCloseTooltip={() => setTooltipVisible('')}
              />
            </PopupContainer>
            
            {/* Trading Panel */}
            <TradeActionPanel
              asset={selectedAsset}
              currentPrice={currentPrice}
              balance={balance}
              positionSize={positionSize}
              setPositionSize={setPositionSize}
              positionType={positionType}
              setPositionType={setPositionType}
              onOpenPosition={openPosition}
              activePosition={activePosition}
              onShowTooltip={(tooltipId) => setTooltipVisible(tooltipVisible === tooltipId ? '' : tooltipId)}
              tooltipVisible={tooltipVisible}
              onCloseTooltip={() => setTooltipVisible('')}
            />
          </div>
        </div>
      </div>
      
      {/* Trade Result Modal */}
      {showResultModal && lastTradeResult && (
        <TradeResultModal
          result={lastTradeResult}
          onClose={handleContinueTrading}
        />
      )}
    </div>
  );
};

export default TradeSimulatorPage;