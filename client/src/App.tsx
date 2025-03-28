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
  const [selectedSymbol, setSelectedSymbol] = useState('BITSTAMP:BTCUSD');
  
  const cryptoSymbols = [
    { value: 'BITSTAMP:BTCUSD', label: 'Bitcoin (BTC/USD)' },
    { value: 'BINANCE:ETHUSDT', label: 'Ethereum (ETH/USDT)' },
    { value: 'BINANCE:BNBUSDT', label: 'Binance Coin (BNB/USDT)' },
    { value: 'BINANCE:SOLUSDT', label: 'Solana (SOL/USDT)' },
    { value: 'BINANCE:ADAUSDT', label: 'Cardano (ADA/USDT)' },
  ];
  
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Trading Platform</h1>
          <p className="text-slate-300">
            Advanced charting and analysis tools to enhance your trading
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <select 
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full md:w-auto"
          >
            {cryptoSymbols.map(symbol => (
              <option key={symbol.value} value={symbol.value}>{symbol.label}</option>
            ))}
          </select>
        </div>
      </div>
      
      <PopupContainer className="mb-8" padding>
        <React.Suspense fallback={
          <div className="h-[500px] flex items-center justify-center">
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
              height="500px" 
            />
          )}
        </React.Suspense>
      </PopupContainer>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PopupContainer padding>
          <h2 className="text-xl font-bold mb-4">AI Market Analysis</h2>
          <p className="text-slate-300 mb-4">
            Our AI-powered market analysis system identifies key trends and patterns to help you make informed trading decisions.
          </p>
          <Button variant="outline" className="w-full">
            View Analysis
          </Button>
        </PopupContainer>
        
        <PopupContainer padding>
          <h2 className="text-xl font-bold mb-4">Trading Signals</h2>
          <p className="text-slate-300 mb-4">
            Get real-time trading signals and alerts based on technical indicators and market movements.
          </p>
          <Button variant="outline" className="w-full">
            View Signals
          </Button>
        </PopupContainer>
        
        <PopupContainer padding>
          <h2 className="text-xl font-bold mb-4">Trading Bots</h2>
          <p className="text-slate-300 mb-4">
            Create and customize automated trading bots to execute your trading strategies 24/7.
          </p>
          <Button variant="outline" className="w-full">
            Manage Bots
          </Button>
        </PopupContainer>
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