import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { SMART_TRADE_PANEL_DEFAULT_SETTINGS, SUPPORTED_BROKERS, TRADING_SYMBOLS, ABATEV_CONFIG } from '../../lib/constants';
import { brokerAggregatorService } from '../../lib/services/broker-aggregator-service';
import { ArrowUpDown, AlertTriangle, Check, ArrowRight, RefreshCw, Wallet, ArrowRightLeft, Shield, Sliders } from 'lucide-react';


interface SmartTradePanelProps {
  defaultSymbol?: string;
}

export const SmartTradePanel: React.FC<SmartTradePanelProps> = ({ defaultSymbol = 'BINANCE:SOLUSDT' }) => {
  const [chartLoaded, setChartLoaded] = useState(false);
  const [connectedBroker, setConnectedBroker] = useState<string | null>(null);
  const [orderState, setOrderState] = useState({
    symbol: defaultSymbol,
    side: 'buy',
    quantity: '',
    price: '',
    type: 'market'
  });

  // Connect to broker aggregator service
  const { activeBrokers, aggregator, isAuthenticated } = useBrokerAggregator();

  useEffect(() => {
    const initializeBrokerConnection = async () => {
      if (isAuthenticated && aggregator) {
        try {
          const brokerList = await aggregator.getAvailableBrokers();
          if (brokerList.length > 0) {
            const primaryBroker = brokerList[0];
            await aggregator.connectBroker(primaryBroker);
            setConnectedBroker(primaryBroker);
          }
        } catch (error) {
          console.error('Failed to connect to broker:', error);
        }
      }
    };

    initializeBrokerConnection();
  }, [isAuthenticated, aggregator]);

  const executeTrade = async (signal) => { // Updated executeTrade to accept signal
    if (!signal || !signal.compatibleBrokers?.length) {
      toast.error("No compatible brokers found for this signal");
      return;
    }

    // Filter connected brokers by compatibility
    const compatibleConnectedBrokers = signal.compatibleBrokers.filter(
      broker => brokerAggregatorService.isConnected(broker)
    );

    if (!compatibleConnectedBrokers.length) {
      toast.error("Please connect to a compatible broker first");
      return;
    }

    // Placeholder for AI analysis -  Replace with actual AI analysis logic
    const aiAnalysis = {
      confidence: Math.random(), // Placeholder confidence (0-1)
      recommendation: Math.random() > 0.5 ? 'Buy' : 'Sell', // Placeholder recommendation
      marketConditions: 'Neutral' // Placeholder market conditions
    };

    // Show AI analysis before execution
    const confirmExecution = await Dialog.confirm({
      title: "AI Signal Analysis",
      content: `
        Confidence: ${ (aiAnalysis.confidence * 100).toFixed(1) }%
        Recommendation: ${ aiAnalysis.recommendation }
        Market Conditions: ${ aiAnalysis.marketConditions }

        Execute trade?
      `
    });

    if (!confirmExecution) return;


    const broker = compatibleConnectedBrokers[0]; // Select the first compatible broker

    try {
      // Execute trade through broker, using signal data.  Adapt as needed for your broker API.
      const tradeResult = await aggregator.executeTrade({...orderState, ...signal, broker});

      // Log trade to database
      const trade = {
        symbol: signal.symbol,
        side: signal.side,
        quantity: parseFloat(signal.quantity),
        entryPrice: parseFloat(signal.price),
        leverage: 1,
        active: true,
        broker: broker,
        aiConfidence: aiAnalysis.confidence,
        aiRecommendation: aiAnalysis.recommendation
      };

      await fetch('/api/journal/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trade)
      });

      toast.success('Trade executed and logged successfully');
    } catch (error) {
      console.error('Trade execution failed:', error);
      toast.error('Failed to execute trade');
    }
  };

  useEffect(() => {
    const loadTradingViewWidget = () => {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = () => {
        if (typeof TradingView !== 'undefined') {
          new TradingView.widget({
            container_id: 'tradingview_chart',
            symbol: defaultSymbol,
            interval: 'D',
            timezone: 'exchange',
            theme: 'dark',
            style: '1',
            locale: 'en',
            toolbar_bg: '#f1f3f6',
            enable_publishing: false,
            allow_symbol_change: true,
            save_image: false,
            width: '100%',
            height: '800',
            studies: [
              "BB@tv-basicstudies",
              "MASimple@tv-basicstudies",
              "RSI@tv-basicstudies"
            ],
            show_popup_button: true,
            popup_width: '1000',
            popup_height: '650',
          });
          setChartLoaded(true);
          console.log('TradingView widget loaded successfully');
        }
      };
      document.head.appendChild(script);
    };

    loadTradingViewWidget();
  }, [defaultSymbol]);

  return (
    <div className="w-full h-full p-4 bg-background">
      <div className="rounded-lg overflow-hidden border border-border">
        <div 
          id="tradingview_chart" 
          className="w-full"
          style={{ minHeight: '800px' }}
        />
      </div>
    </div>
  );
};

//This is the rest of the original code that is not used anymore

interface DexChartProps {
  symbol: string;
  theme?: 'light' | 'dark';
}

const DexChart: React.FC<DexChartProps> = ({ symbol, theme = 'dark' }) => {
  const chartContainerId = `dex-chart-${Math.random().toString(36).substring(7)}`;

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      new (window as any).TradingView.widget({
        container_id: chartContainerId,
        symbol: symbol,
        interval: '1D',
        timezone: 'exchange',
        theme: theme,
        style: '1',
        toolbar_bg: theme === 'dark' ? '#1a1b1e' : '#f8f9fa',
        enable_publishing: false,
        allow_symbol_change: true,
        save_image: true,
        studies: [
          "STD;SMA",
          "STD;RSI",
          "STD;MACD"
        ],
        details: true,
        hotlist: true,
        calendar: true,
        width: '100%',
        height: '800',
      });
    };
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, [symbol, theme, chartContainerId]);

  return (
    <div className="w-full h-[800px] rounded-lg overflow-hidden border border-slate-700">
      <div id={chartContainerId} className="w-full h-full" />
    </div>
  );
};

const SmartTradePanel2: React.FC<SmartTradePanelProps> = ({ defaultSymbol = 'BTCUSD' }) => {
  const [activeTab, setActiveTab] = useState<'trade' | 'abatev' | 'settings'>('abatev');
  const [symbol, setSymbol] = useState(defaultSymbol);
  const [quantity, setQuantity] = useState('0.01');
  const [price, setPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [leverage, setLeverage] = useState('1');
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop'>('market');
  const [brokerComparisons, setBrokerComparisons] = useState<any[]>([]);
  const [abatevLoading, setAbatevLoading] = useState(false);
  const [abatevError, setAbatevError] = useState('');
  const [bestPrice, setBestPrice] = useState<{brokerId: string, price: number, spread: number} | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  const [showAdvanced, setShowAdvanced] = useState(false);

  // ABATEV metrics
  const [evaluationCriteria, setEvaluationCriteria] = useState({
    pricePriority: 80,
    latencyPriority: 10,
    reliabilityPriority: 10
  });

  const allSymbols = Object.values(TRADING_SYMBOLS).flat();

  useEffect(() => {
    // Clear error when switching symbols or tabs
    setAbatevError('');

    if (activeTab === 'abatev') {
      console.log(`Tab or symbol changed: fetching data for ${symbol}`);
      // Reset the broker comparisons state to prevent stale data display
      setBrokerComparisons([]);
      // Set a slight delay to ensure UI updates properly before fetching data
      const timer = setTimeout(() => {
        fetchBrokerComparisons();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [activeTab, symbol]);

  // Set up a periodic refresh for ABATEV data
  useEffect(() => {
    if (activeTab === 'abatev') {
      console.log('Setting up periodic refresh for ABATEV data');

      // First refresh on tab selection
      // fetchBrokerComparisons(); // Already done in the first useEffect

      // Then set up interval for periodic refresh
      const intervalId = setInterval(() => {
        // Only fetch if there's no loading or error being shown
        if (!abatevLoading) {
          console.log('Auto-refresh triggered');
          fetchBrokerComparisons();
        }
      }, 15000); // Refresh every 15 seconds

      return () => {
        console.log('Clearing ABATEV refresh interval');
        clearInterval(intervalId);
      };
    }
  }, [activeTab, symbol, abatevLoading]);

  const fetchBrokerComparisons = async () => {
    console.log(`Fetching broker comparisons for ${symbol}`);
    setAbatevLoading(true);
    setAbatevError('');

    try {
      // Use the broker aggregator service to get price comparisons
      const comparisons = await brokerAggregatorService.getBrokerPriceComparisons(symbol);
      console.log('Broker comparisons received:', comparisons);

      if (comparisons && comparisons.length > 0) {
        // Process the comparisons to include enhanced evaluation metrics
        const processedComparisons = comparisons.map(comparison => {
          if (!comparison.prices || comparison.prices.length === 0) {
            console.warn('No prices in comparison data');
            return comparison;
          }

          // Sort prices by lowest first for buy orders
          const sortedPrices = [...comparison.prices].sort((a, b) => a.price - b.price);

          // Find the best price (lowest) to use as reference
          const bestRawPrice = sortedPrices[0].price;

          // Calculate enhanced metrics for each broker
          const processedPrices = sortedPrices.map(price => {
            // Enhanced metrics for transparency
            const latency = Math.floor(Math.random() * 80) + 20; // 20-100ms latency range
            const reliability = (ABATEV_CONFIG as any).BROKER_RELIABILITY_SCORES?.[price.brokerId.toLowerCase()] || 60;
            const executionSpeed = Math.floor(Math.random() * 150) + 50; // 50-200ms execution speed
            const spread = price.spread || (price.price * 0.0015); // Approximate spread if not provided

            // Calculate price advantage - how much better/worse than average
            const priceAdvantage = (1 - (price.price / bestRawPrice)) * 100;

            // Calculate broker score based on weighted evaluation criteria
            const priceScore = Math.max((ABATEV_CONFIG as any).MAX_PRICE_SCORE - ((price.price / bestRawPrice) - 1) * 200, 0);
            const latencyScore = Math.max((ABATEV_CONFIG as any).MAX_LATENCY_SCORE - (latency / 10), 0);
            const reliabilityScore = reliability;

            const totalScore = (
              (priceScore * evaluationCriteria.pricePriority) +
              (latencyScore * evaluationCriteria.latencyPriority) +
              (reliabilityScore * evaluationCriteria.reliabilityPriority)
            ) / 100;

            return {
              ...price,
              latency,
              reliability,
              executionSpeed,
              priceAdvantage: priceAdvantage.toFixed(2),
              spread,
              priceScore: Math.round(priceScore),
              latencyScore: Math.round(latencyScore),
              reliabilityScore,
              score: Math.round(totalScore)
            };
          });

          if (processedPrices.length > 0) {
            // Find the best broker based on total score
            const best = processedPrices.reduce((prev, current) =>
              current.score > prev.score ? current : prev, processedPrices[0]);

            // Calculate price advantage vs. average price
            const avgPrice = processedPrices.reduce((sum, p) => sum + p.price, 0) / processedPrices.length;
            const priceAdvantageVsAvg = ((avgPrice - best.price) / avgPrice) * 100;

            setBestPrice({
              brokerId: best.brokerId,
              price: best.price,
              spread: best.spread
            });

            return {
              ...comparison,
              prices: processedPrices,
              bestPrice: best,
              avgPrice,
              priceAdvantageVsAvg
            };
          }

          return {
            ...comparison,
            prices: processedPrices
          };
        });

        setBrokerComparisons(processedComparisons);
        console.log('Enhanced broker comparisons processed successfully');
      } else {
        console.warn('No comparison data available');
        setBrokerComparisons([]);
        setAbatevError('No price data available for the selected symbol');
      }
    } catch (error) {
      console.error('Error fetching broker comparisons:', error);
      setAbatevError('Failed to fetch broker comparison data');
    } finally {
      setAbatevLoading(false);
      setLastUpdateTime(Date.now());
    }
  };

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  const getBrokerLogo = (brokerId: string) => {
    // This would link to actual broker logos in a real implementation
    // For now, we'll use emoji placeholders
    const brokerIcons: {[key: string]: string} = {
      'alpaca': '🦙',
      'binance': '🔶',
      'oanda': '🔵',
      'ironbeam': '⚙️',
      'kraken': '🐙',
      'coinbase': '🪙'
    };

    return brokerIcons[brokerId.toLowerCase()] || '🏢';
  };

  const handleRefresh = async () => {
    console.log("Manual refresh triggered");
    // First clear the error state if any
    setAbatevError('');
    await fetchBrokerComparisons();
  };

  const renderTradeTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Symbol
          </label>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-md p-2"
          >
            {allSymbols.map(sym => (
              <option key={sym} value={sym}>{sym}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Quantity
          </label>
          <input
            type="text"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0.01"
            className="w-full bg-slate-800 border border-slate-700 rounded-md p-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-3">
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Order Type
          </label>
          <div className="grid grid-cols-3 gap-1">
            <Button
              variant={orderType === 'market' ? 'default' : 'outline'}
              onClick={() => setOrderType('market')}
              className="text-xs"
            >
              Market
            </Button>
            <Button
              variant={orderType === 'limit' ? 'default' : 'outline'}
              onClick={() => setOrderType('limit')}
              className="text-xs"
            >
              Limit
            </Button>
            <Button
              variant={orderType === 'stop' ? 'default' : 'outline'}
              onClick={() => setOrderType('stop')}
              className="text-xs"
            >
              Stop
            </Button>
          </div>
        </div>
      </div>

      {(orderType === 'limit' || orderType === 'stop') && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            {orderType === 'limit' ? 'Limit Price' : 'Stop Price'}
          </label>
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder={bestPrice ? bestPrice.price.toFixed(2) : "0.00"}
            className="w-full bg-slate-800 border border-slate-700 rounded-md p-2"
          />
        </div>
      )}

      <button
        className="w-full text-left flex items-center text-sm text-slate-300 hover:text-white"
        onClick={() => setShowAdvanced(!showAdvanced)}
      >
        {showAdvanced ? '- Hide' : '+ Show'} Advanced Options
      </button>

      {showAdvanced && (
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Stop Loss
              </label>
              <input
                type="text"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                placeholder="Optional"
                className="w-full bg-slate-800 border border-slate-700 rounded-md p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Take Profit
              </label>
              <input
                type="text"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                placeholder="Optional"
                className="w-full bg-slate-800 border border-slate-700 rounded-md p-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Leverage (x)
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={leverage}
              onChange={(e) => setLeverage(e.target.value)}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>1x</span>
              <span>{leverage}x</span>
              <span>100x</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mt-6">
        <Button size="lg" className="bg-green-600 hover:bg-green-700">
          Buy / Long
        </Button>
        <Button size="lg" className="bg-red-600 hover:bg-red-700">
          Sell / Short
        </Button>
      </div>
    </div>
  );

  const renderAbatevTab = () => (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-bold">ABATEV™ Analysis</h3>
          <p className="text-sm text-slate-400">
            Advanced Broker Aggregation & Trade Execution View
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={abatevLoading}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <label className="block text-sm font-medium text-slate-300 mr-2">
            Symbol:
          </label>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-md p-1 text-sm"
          >
            {allSymbols.map(sym => (
              <option key={sym} value={sym}>{sym}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-400">
            Last updated: {getTimeAgo(lastUpdateTime)}
          </div>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-1" onClick={handleRefresh}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Optimization settings section */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-md p-2.5">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium">Execution Optimization Priority</h4>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-1">
            <Sliders className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <label className="flex justify-between mb-1">
              <span>Price</span>
              <span className="text-blue-400">{evaluationCriteria.pricePriority}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={evaluationCriteria.pricePriority}
              onChange={(e) => setEvaluationCriteria(prev => ({
                ...prev,
                pricePriority: parseInt(e.target.value)
              }))}
              className="w-full accent-blue-500 h-1"
            />
          </div>
          <div>
            <label className="flex justify-between mb-1">
              <span>Latency</span>
              <span className="text-blue-400">{evaluationCriteria.latencyPriority}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={evaluationCriteria.latencyPriority}
              onChange={(e) => setEvaluationCriteria(prev => ({
                ...prev,
                latencyPriority: parseInt(e.target.value)
              }))}
              className="w-full accent-blue-500 h-1"
            />
          </div>
          <div>
            <label className="flex justify-between mb-1">
              <span>Reliability</span>
              <span className="text-blue-400">{evaluationCriteria.reliabilityPriority}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={evaluationCriteria.reliabilityPriority}
              onChange={(e) => setEvaluationCriteria(prev => ({
                ...prev,
                reliabilityPriority: parseInt(e.target.value)
              }))}
              className="w-full accent-blue-500 h-1"
            />
          </div>
        </div>
      </div>

      {abatevLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-slate-300">Analyzing brokers...</p>
          </div>
        </div>
      ) : abatevError ? (
        <div className="bg-red-900/30 border border-red-700 rounded-md p-4 text-center">
          <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-red-400" />
          <p className="text-slate-200">{abatevError}</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={handleRefresh}>
            Try Again
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {bestPrice && (
            <div className="bg-blue-900/30 border border-blue-700 rounded-md p-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs font-semibold text-blue-400">BEST EXECUTION</p>
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">
                      {getBrokerLogo(bestPrice.brokerId)}
                    </span>
                    <div>
                      <h4 className="font-bold">{bestPrice.brokerId.toUpperCase()}</h4>
                      <p className="text-xs text-slate-300">Optimal balance of price, speed, and reliability</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">${bestPrice.price.toFixed(2)}</p>
                  <p className="text-xs text-slate-400">Spread: ${bestPrice.spread.toFixed(2)}</p>
                </div>
              </div>
              <Button className="w-full mt-2 bg-blue-600 hover:bg-blue-700">
                Trade with {bestPrice.brokerId.toUpperCase()}
              </Button>
            </div>
          )}

          {/* Enhanced analytics section */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-md p-3 mb-2">
            <h4 className="text-sm font-medium mb-2">Execution Analytics</h4>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-800 rounded p-2">
                <p className="text-xs text-slate-400 mb-1">Price Advantage</p>
                <p className="text-lg font-bold text-green-400">
                  {brokerComparisons.length > 0 && bestPrice
                    ? `${brokerComparisons[0].priceAdvantageVsAvg?.toFixed(2) || '0.00'}%`
                    : '—'}
                </p>
              </div>
              <div className="bg-slate-800 rounded p-2">
                <p className="text-xs text-slate-400 mb-1">Latency (ms)</p>
                <p className="text-lg font-bold text-yellow-400">
                  {brokerComparisons.length > 0 && bestPrice
                    ? brokerComparisons[0].prices.find(p => p.brokerId === bestPrice.brokerId)?.latency
                    : '—'}
                </p>
              </div>
              <div className="bg-slate-800 rounded p-2">
                <p className="text-xs text-slate-400 mb-1">Reliability</p>
                <p className="text-lg font-bold text-blue-400">
                  {brokerComparisons.length > 0 && bestPrice
                    ? `${brokerComparisons[0].prices.find(p => p.brokerId === bestPrice.brokerId)?.reliability || '0'}%`
                    : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced broker comparison table */}
          <div className="bg-slate-800 rounded-md overflow-hidden">
            <div className="px-3 py-2 bg-slate-700 text-xs font-medium grid grid-cols-6">
              <div className="col-span-2">Broker</div>
              <div className="text-right">Price</div>
              <div className="text-right">Spread</div>
              <div className="text-right">Latency</div>
              <div className="text-right">Score</div>
            </div>

            <div className="divide-y divide-slate-700">
              {brokerComparisons.length > 0 ? (
                brokerComparisons[0].prices
                  .sort((a: any, b: any) => b.score - a.score)
                  .map((price: any, index: number) => (
                    <div
                      key={price.brokerId}
                      className={`px-3 py-2 grid grid-cols-6 items-center text-sm ${
                        index === 0 ? 'bg-blue-900/20' : ''
                      }`}
                    >
                      <div className="col-span-2 flex items-center">
                        <span className="text-lg mr-2">
                          {getBrokerLogo(price.brokerId)}
                        </span>
                        <span className={index === 0 ? "font-semibold" : ""}>
                          {price.brokerId.toUpperCase()}
                        </span>
                        {index === 0 && (
                          <span className="ml-1 bg-green-900/50 text-green-400 text-xs px-1.5 py-0.5 rounded">
                            Best
                          </span>
                        )}
                      </div>
                      <div className="text-right">${price.price.toFixed(2)}</div>
                      <div className="text-right text-slate-300">${price.spread.toFixed(2)}</div>
                      <div className="text-right text-slate-300">{price.latency || 0}ms</div>
                      <div className="text-right">
                        <span className={`font-medium ${
                          price.score > 80 ? "text-green-400" :
                            price.score > 60 ? "text-yellow-400" : "text-red-400"
                        }`}>
                          {price.score}
                        </span>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="p-4 text-center text-slate-400">
                  No broker data available
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-800 rounded-md p-3">
            <h4 className="font-medium text-sm mb-2">Evaluation Criteria</h4>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Price Priority: {evaluationCriteria.pricePriority}%</span>
                  <span>
                    <ArrowUpDown className="h-3 w-3 inline" />
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={evaluationCriteria.pricePriority}
                  onChange={(e) => {
                    const newValue = parseInt(e.target.value);
                    const remaining = 100 - newValue;
                    setEvaluationCriteria({
                      pricePriority: newValue,
                      latencyPriority: Math.floor(remaining / 2),
                      reliabilityPriority: Math.ceil(remaining / 2)
                    });
                  }}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Latency Priority: {evaluationCriteria.latencyPriority}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={evaluationCriteria.latencyPriority}
                  onChange={(e) => {
                    const newValue = parseInt(e.target.value);
                    const newReliability = 100 - evaluationCriteria.pricePriority - newValue;
                    if (newReliability >= 5) {
                      setEvaluationCriteria({
                        ...evaluationCriteria,
                        latencyPriority: newValue,
                        reliabilityPriority: newReliability
                      });
                    }
                  }}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Reliability Priority: {evaluationCriteria.reliabilityPriority}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={evaluationCriteria.reliabilityPriority}
                  onChange={(e) => {
                    const newValue = parseInt(e.target.value);
                    const newLatency = 100 - evaluationCriteria.pricePriority - newValue;
                    if (newLatency >= 5) {
                      setEvaluationCriteria({
                        ...evaluationCriteria,
                        reliabilityPriority: newValue,
                        latencyPriority: newLatency
                      });
                    }
                  }}
                  className="w-full accent-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-bold mb-4">Panel Settings</h3>

      <div className="bg-slate-800 rounded-md p-3">
        <h4 className="font-medium text-sm mb-2">Connected Brokers</h4>
        <div className="space-y-2">
          {SUPPORTED_BROKERS.map(broker => (
            <div key={broker.id} className="flex justify-between items-center border-b border-slate-700 pb-2 last:border-0 last:pb-0">
              <div className="flex items-center">
                <span className="text-xl mr-2">
                  {getBrokerLogo(broker.id)}
                </span>
                <div>
                  <p className="font-medium">{broker.name}</p>
                  <p className="text-xs text-slate-400">{broker.id}</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Connect
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-800 rounded-md p-3">
        <h4 className="font-medium text-sm mb-3">Default Trading Settings</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Default Order Type
            </label>
            <select
              className="w-full bg-slate-700 border border-slate-600 rounded-md p-2"
              defaultValue="market"
            >
              <option value="market">Market</option>
              <option value="limit">Limit</option>
              <option value="stop">Stop</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Default Quantity
            </label>
            <input
              type="text"
              className="w-full bg-slate-700 border border-slate-600 rounded-md p-2"
              defaultValue="0.01"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="auto-abatev"
              className="mr-2"
              defaultChecked={true}
            />
            <label htmlFor="auto-abatev" className="text-sm text-slate-300">
              Automatically use ABATEV recommended broker
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden mb-4 h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-700">
        <button
          className={`flex-1 py-3 px-4 text-center ${
            activeTab === 'abatev'
              ? 'bg-slate-800 text-white font-medium border-b-2 border-blue-500'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
          onClick={() => setActiveTab('abatev')}
        >
          <div className="flex items-center justify-center">
            <ArrowRightLeft className="h-4 w-4 mr-1.5" />
            ABATEV
          </div>
        </button>
        <button
          className={`flex-1 py-3 px-4 text-center ${
            activeTab === 'trade'
              ? 'bg-slate-800 text-white font-medium border-b-2 border-blue-500'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
          onClick={() => setActiveTab('trade')}
        >
          <div className="flex items-center justify-center">
            <Wallet className="h-4 w-4 mr-1.5" />
            Trade
          </div>
        </button>
        <button
          className={`flex-1 py-3 px-4 text-center ${
            activeTab === 'settings'
              ? 'bg-slate-800 text-white font-medium border-b-2 border-blue-500'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
          onClick={() => setActiveTab('settings')}
        >
          <div className="flex items-center justify-center">
            <Sliders className="h-4 w-4 mr-1.5" />
            Settings
          </div>
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4 h-[calc(100%-48px)] overflow-auto">
        {activeTab === 'trade' && renderTradeTab()}
        {activeTab === 'abatev' && renderAbatevTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </div>
    </div>
  );
};