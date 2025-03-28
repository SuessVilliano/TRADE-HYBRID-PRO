import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { PopupContainer } from './components/ui/popup-container';
import NFTMarketplace from './pages/nft-marketplace';
import { Button } from './components/ui/button';
import THCBalanceDisplay from './components/ui/thc-balance-display';
import { useUserStore } from './lib/stores/useUserStore';

// Light wrapper with providers
function AppWithProviders() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const { isLoggedIn, login, logout, user } = useUserStore();
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    if (!username || !password) {
      setLoginError('Please enter both username and password');
      return;
    }
    
    const success = await login(username, password);
    if (success) {
      setShowLoginForm(false);
      setUsername('');
      setPassword('');
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
  };
  
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <PopupContainer className="border-b border-slate-700 backdrop-blur-md sticky top-0 z-10 p-4" padding>
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-2xl font-bold text-blue-500">Trade Hybrid</Link>
            <nav className="hidden md:flex gap-4">
              <Link to="/" className="hover:text-blue-400 transition-colors">Home</Link>
              <Link to="/trading" className="hover:text-blue-400 transition-colors">Trading</Link>
              <Link to="/metaverse" className="hover:text-blue-400 transition-colors">Metaverse</Link>
              <Link to="/marketplace" className="hover:text-blue-400 transition-colors">NFT Marketplace</Link>
              <Link to="/learn" className="hover:text-blue-400 transition-colors">Learn</Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <THCBalanceDisplay />
                <div className="flex items-center gap-2">
                  <span>Welcome, {user?.username}</span>
                  <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
                </div>
              </>
            ) : (
              <>
                {showLoginForm ? (
                  <form onSubmit={handleLogin} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm"
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm"
                    />
                    <Button type="submit" size="sm">Login</Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowLoginForm(false)}>Cancel</Button>
                  </form>
                ) : (
                  <Button onClick={() => setShowLoginForm(true)}>Login</Button>
                )}
              </>
            )}
          </div>
        </div>
      </PopupContainer>
      
      {/* Main Content */}
      <main className="min-h-[calc(100vh-130px)]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={<NFTMarketplace />} />
          <Route path="/trading" element={<TradingPlaceholder />} />
          <Route path="/metaverse" element={<MetaversePlaceholder />} />
          <Route path="/learn" element={<LearnPlaceholder />} />
        </Routes>
      </main>
      
      {/* Footer */}
      <PopupContainer className="border-t border-slate-700 p-4 text-sm" padding>
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p>&copy; {new Date().getFullYear()} Trade Hybrid. All rights reserved.</p>
            </div>
            <div className="flex gap-6">
              <Link to="/terms" className="hover:text-blue-400 transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-blue-400 transition-colors">Privacy</Link>
              <Link to="/contact" className="hover:text-blue-400 transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </PopupContainer>
    </div>
  );
}

// Placeholder components for other routes
function Home() {
  return (
    <PopupContainer className="container mx-auto py-12 px-4" padding>
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">Welcome to Trade Hybrid</h1>
        <p className="text-xl text-slate-300 max-w-3xl mx-auto">
          The ultimate AI-driven trading metaverse. Experience the future of trading with immersive visualization, real-time data, and social trading in a gamified environment.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <FeatureCard 
          title="Trading"
          description="Trade with AI-powered insights, real-time market data, and advanced charting tools."
          linkTo="/trading"
        />
        <FeatureCard 
          title="Metaverse"
          description="Explore the trading metaverse, interact with other traders, and join trading communities."
          linkTo="/metaverse"
        />
        <FeatureCard 
          title="NFT Marketplace"
          description="Buy, sell, and trade unique NFTs including trading strategies, virtual properties, and more."
          linkTo="/marketplace"
        />
      </div>
    </PopupContainer>
  );
}

function FeatureCard({ title, description, linkTo }: { title: string, description: string, linkTo: string }) {
  return (
    <PopupContainer className="h-full flex flex-col p-6 border border-slate-700 rounded-lg" padding>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <p className="text-slate-300 mb-6 flex-grow">{description}</p>
      <Link to={linkTo}>
        <Button className="w-full">Explore {title}</Button>
      </Link>
    </PopupContainer>
  );
}

function TradingPlaceholder() {
  const TradingViewWidgetLazy = React.lazy(() => import('./components/ui/TradingViewWidget'));
  const AIAssistantLazy = React.lazy(() => import('./components/ui/AIAssistant'));
  const TradingSignalsLazy = React.lazy(() => import('./components/ui/TradingSignals'));
  const CopyTradingLazy = React.lazy(() => import('./components/ui/CopyTrading'));
  
  const [selectedSymbol, setSelectedSymbol] = useState('BITSTAMP:BTCUSD');
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('chart');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  
  // Track window size for responsive layout
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
        // Auto-close sidebars on small screens
        if (window.innerWidth < 768) {
          setLeftSidebarOpen(false);
          setRightSidebarOpen(false);
        }
      };
      
      window.addEventListener('resize', handleResize);
      handleResize(); // Initial check
      
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);
  
  const cryptoSymbols = [
    { value: 'BITSTAMP:BTCUSD', label: 'Bitcoin (BTC/USD)' },
    { value: 'BINANCE:ETHUSDT', label: 'Ethereum (ETH/USDT)' },
    { value: 'BINANCE:BNBUSDT', label: 'Binance Coin (BNB/USDT)' },
    { value: 'BINANCE:SOLUSDT', label: 'Solana (SOL/USDT)' },
    { value: 'BINANCE:ADAUSDT', label: 'Cardano (ADA/USDT)' },
  ];
  
  // For smaller screens, we'll use a dropdown menu instead of tabs
  const renderMobileNavigation = () => (
    <div className="mb-4">
      <select 
        value={activeTab}
        onChange={(e) => setActiveTab(e.target.value)}
        className="w-full bg-slate-800 border border-slate-700 rounded-md p-2"
      >
        <option value="chart">Charts</option>
        <option value="signals">Signals</option>
        <option value="copy">Copy Trading</option>
        <option value="assistant">AI Assistant</option>
      </select>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header with controls and symbol selector */}
      <div className="border-b border-slate-700 bg-slate-800/95 backdrop-blur-sm sticky top-0 z-10 p-4">
        <div className="container mx-auto flex flex-wrap justify-between items-center">
          <div className="flex items-center mb-2 sm:mb-0">
            <h1 className="text-lg font-bold mr-4">Trading Platform</h1>
            
            {/* Sidebar toggle buttons for desktop */}
            <div className="hidden md:flex space-x-2">
              <Button 
                variant={leftSidebarOpen ? "default" : "outline"} 
                size="sm"
                onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
              >
                {leftSidebarOpen ? "Hide" : "Show"} Signals
              </Button>
              <Button 
                variant={rightSidebarOpen ? "default" : "outline"} 
                size="sm"
                onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
              >
                {rightSidebarOpen ? "Hide" : "Show"} Tools
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <select 
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {cryptoSymbols.map(symbol => (
                <option key={symbol.value} value={symbol.value}>{symbol.label}</option>
              ))}
            </select>
            
            <Button size="sm" variant="outline">Connect Broker</Button>
          </div>
        </div>
      </div>
      
      {/* Mobile tabs/navigation (only visible on small screens) */}
      <div className="md:hidden container mx-auto px-4 py-3">
        {renderMobileNavigation()}
      </div>
      
      {/* Main content area with flexible layout */}
      <div className="container mx-auto py-4 px-2 md:px-4 flex">
        {/* Left Sidebar - Trading Signals */}
        {(leftSidebarOpen || activeTab === 'signals') && (
          <div className={`
            ${(windowWidth >= 768 && leftSidebarOpen) ? 'w-[320px] mr-4' : windowWidth < 768 ? 'w-full' : 'hidden'}
            ${windowWidth < 768 && activeTab !== 'signals' ? 'hidden' : ''}
            flex-shrink-0
          `}>
            <React.Suspense fallback={
              <div className="h-[600px] bg-slate-800 rounded-lg animate-pulse"></div>
            }>
              <TradingSignalsLazy />
            </React.Suspense>
          </div>
        )}
        
        {/* Main Chart Area */}
        <div className={`
          flex-grow overflow-hidden
          ${windowWidth < 768 && activeTab !== 'chart' ? 'hidden' : ''}
          ${(windowWidth >= 768 && leftSidebarOpen && rightSidebarOpen) ? 'mx-4' : ''}
        `}>
          <PopupContainer className="h-[600px] mb-4" padding>
            <React.Suspense fallback={
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-slate-300">Loading charts...</p>
                </div>
              </div>
            }>
              {typeof window !== 'undefined' && (
                <TradingViewWidgetLazy 
                  symbol={selectedSymbol} 
                  theme="dark" 
                  height="600px" 
                />
              )}
            </React.Suspense>
          </PopupContainer>
          
          {/* Trade Controls */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              Buy / Long
            </Button>
            <Button size="lg" className="bg-red-600 hover:bg-red-700">
              Sell / Short
            </Button>
          </div>
          
          {/* Quick Trade Form */}
          <PopupContainer className="mb-4" padding>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Quantity
                </label>
                <input
                  type="text"
                  placeholder="0.01"
                  className="w-full bg-slate-800 border border-slate-700 rounded-md p-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Price
                </label>
                <input
                  type="text"
                  placeholder="Market"
                  className="w-full bg-slate-800 border border-slate-700 rounded-md p-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Stop Loss
                </label>
                <input
                  type="text"
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
                  placeholder="Optional"
                  className="w-full bg-slate-800 border border-slate-700 rounded-md p-2"
                />
              </div>
            </div>
          </PopupContainer>
        </div>
        
        {/* Right Sidebar - Trading Tools */}
        {(rightSidebarOpen || activeTab === 'copy' || activeTab === 'assistant') && (
          <div className={`
            ${(windowWidth >= 768 && rightSidebarOpen) ? 'w-[320px] ml-4' : windowWidth < 768 ? 'w-full' : 'hidden'}
            ${windowWidth < 768 && (activeTab !== 'copy' && activeTab !== 'assistant') ? 'hidden' : ''}
            flex-shrink-0 space-y-4
          `}>
          
            {/* AI Assistant */}
            {(windowWidth >= 768 || activeTab === 'assistant') && (
              <React.Suspense fallback={
                <div className="h-[300px] bg-slate-800 rounded-lg animate-pulse"></div>
              }>
                <AIAssistantLazy />
              </React.Suspense>
            )}
            
            {/* Copy Trading */}
            {(windowWidth >= 768 || activeTab === 'copy') && (
              <React.Suspense fallback={
                <div className="h-[300px] bg-slate-800 rounded-lg animate-pulse"></div>
              }>
                <CopyTradingLazy />
              </React.Suspense>
            )}
          </div>
        )}
      </div>
      
      {/* Mobile Navigation for quick access to hidden features */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-800/95 border-t border-slate-700 p-2 backdrop-blur-sm">
        <div className="grid grid-cols-4 gap-1">
          <Button
            variant={activeTab === 'chart' ? 'default' : 'ghost'}
            className="h-auto py-2 flex flex-col items-center text-xs"
            onClick={() => setActiveTab('chart')}
          >
            <div className="mb-1">📊</div>
            Charts
          </Button>
          <Button
            variant={activeTab === 'signals' ? 'default' : 'ghost'}
            className="h-auto py-2 flex flex-col items-center text-xs"
            onClick={() => setActiveTab('signals')}
          >
            <div className="mb-1">🔔</div>
            Signals
          </Button>
          <Button
            variant={activeTab === 'copy' ? 'default' : 'ghost'}
            className="h-auto py-2 flex flex-col items-center text-xs"
            onClick={() => setActiveTab('copy')}
          >
            <div className="mb-1">👥</div>
            Copy
          </Button>
          <Button
            variant={activeTab === 'assistant' ? 'default' : 'ghost'}
            className="h-auto py-2 flex flex-col items-center text-xs"
            onClick={() => setActiveTab('assistant')}
          >
            <div className="mb-1">🤖</div>
            AI
          </Button>
        </div>
      </div>
    </div>
  );
}

function MetaversePlaceholder() {
  const MinimalScene = React.lazy(() => import('./components/MinimalScene'));
  
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Metaverse</h1>
        <p className="text-xl text-slate-300">Experience our 3D trading world (Coming Soon)</p>
      </div>
      
      <PopupContainer className="h-[500px] mb-8" padding>
        <div className="h-full">
          <React.Suspense fallback={
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-slate-300">Loading 3D Scene...</p>
              </div>
            </div>
          }>
            {typeof window !== 'undefined' && <MinimalScene />}
          </React.Suspense>
        </div>
      </PopupContainer>
      
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Metaverse Features</h2>
        <ul className="list-disc pl-6 space-y-2 text-slate-300">
          <li>Interactive trading floors with real-time market visualizations</li>
          <li>Social spaces to connect with other traders and exchange strategies</li>
          <li>Educational zones for learning about trading and finance</li>
          <li>Customizable avatar and virtual property ownership</li>
          <li>Daily trading challenges and competitions with rewards</li>
        </ul>
      </div>
    </div>
  );
}

function LearnPlaceholder() {
  const learningResources = [
    {
      title: "Trading Fundamentals",
      description: "Learn the core concepts of trading, including market structure, order types, and risk management.",
      icon: "📈",
      level: "Beginner"
    },
    {
      title: "Technical Analysis",
      description: "Master chart patterns, indicators, and other technical tools to analyze price action.",
      icon: "📊",
      level: "Intermediate"
    },
    {
      title: "Trading Psychology",
      description: "Develop the right mindset for trading success and overcome emotional biases.",
      icon: "🧠",
      level: "All Levels"
    },
    {
      title: "Crypto Trading",
      description: "Specialized course on cryptocurrency trading strategies and market dynamics.",
      icon: "🪙",
      level: "Intermediate"
    },
    {
      title: "Algorithmic Trading",
      description: "Learn to create and backtest automated trading strategies and bots.",
      icon: "🤖",
      level: "Advanced"
    },
    {
      title: "Trade Hybrid Certification",
      description: "Comprehensive professional certification program for serious traders.",
      icon: "🏆",
      level: "Advanced"
    }
  ];
  
  const tradingTips = [
    "Always use stop losses to protect your capital",
    "Don't risk more than 1-2% of your account on a single trade",
    "Develop and follow a consistent trading plan",
    "Keep a trading journal to track and improve your performance",
    "Trade the trend - the trend is your friend"
  ];
  
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Learning Resources</h1>
        <p className="text-xl text-slate-300 max-w-3xl mx-auto">
          Comprehensive educational materials to help you master trading and financial markets
        </p>
      </div>
      
      {/* Courses Grid */}
      <h2 className="text-2xl font-bold mb-6">Trading Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {learningResources.map((resource, index) => (
          <PopupContainer key={index} padding className="h-full flex flex-col">
            <div className="flex items-start mb-4">
              <div className="text-4xl mr-4">{resource.icon}</div>
              <div>
                <h3 className="text-xl font-bold">{resource.title}</h3>
                <span className="inline-block bg-slate-700 text-xs px-2 py-1 rounded-full">
                  {resource.level}
                </span>
              </div>
            </div>
            <p className="text-slate-300 mb-4 flex-grow">{resource.description}</p>
            <Button className="w-full mt-2">Explore Course</Button>
          </PopupContainer>
        ))}
      </div>
      
      {/* Trading Tips & Daily Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-6">Trading Tips Library</h2>
          <PopupContainer padding>
            <ul className="space-y-4">
              {tradingTips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <div className="text-blue-500 mr-3 mt-1">•</div>
                  <p className="text-slate-300">{tip}</p>
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full mt-6">
              View Full Library
            </Button>
          </PopupContainer>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold mb-6">Daily Trading Insights</h2>
          <PopupContainer padding className="h-full flex flex-col">
            <div className="bg-slate-700/50 rounded-md p-3 mb-4">
              <p className="text-xs text-slate-400 mb-1">MARKET ANALYSIS</p>
              <h3 className="font-semibold mb-2">Market volatility expected ahead of economic data releases</h3>
              <p className="text-sm text-slate-300">Key reports could impact major currency pairs and equities...</p>
            </div>
            
            <div className="bg-slate-700/50 rounded-md p-3 mb-4">
              <p className="text-xs text-slate-400 mb-1">TRADING STRATEGY</p>
              <h3 className="font-semibold mb-2">Breakout strategy for cryptocurrency markets</h3>
              <p className="text-sm text-slate-300">Identifying key support and resistance levels for major coins...</p>
            </div>
            
            <Button variant="outline" className="w-full mt-auto">
              Subscribe to Daily Insights
            </Button>
          </PopupContainer>
        </div>
      </div>
      
      {/* Community & Live Sessions */}
      <h2 className="text-2xl font-bold mb-6">Community Learning</h2>
      <PopupContainer padding className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Trading Community</h3>
            <p className="text-slate-300 mb-4">
              Join our community of traders to share insights, strategies, and support each other on your trading journey.
            </p>
            <Button variant="outline">Join Community</Button>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Live Trading Sessions</h3>
            <p className="text-slate-300 mb-4">
              Participate in live trading sessions with professional traders who analyze markets and execute trades in real-time.
            </p>
            <Button variant="outline">View Schedule</Button>
          </div>
        </div>
      </PopupContainer>
    </div>
  );
}

export default function App() {
  return <AppWithProviders />;
}