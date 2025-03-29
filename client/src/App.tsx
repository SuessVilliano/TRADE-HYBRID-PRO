import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { PopupContainer } from './components/ui/popup-container';
import NFTMarketplace from './pages/nft-marketplace';
import { Button } from './components/ui/button';
import THCBalanceDisplay from './components/ui/thc-balance-display';
import { ThemeToggle } from './components/ui/theme-toggle';
import { TradingTipsButton } from './components/ui/trading-tips-button';
import { useUserStore } from './lib/stores/useUserStore';
import { useAffiliateTracking } from './lib/services/affiliate-service';
import { SolanaWalletProvider } from './lib/context/SolanaWalletProvider';
import { SolanaAuthProvider } from './lib/context/SolanaAuthProvider';
import { useSolanaAuth } from './lib/context/SolanaAuthProvider';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';

// Lazy load pages
const TradeRunner = lazy(() => import('./pages/trade-runner'));
const BullsVsBears = lazy(() => import('./pages/bulls-vs-bears-new')); // Legacy reference
const NewsDashboardSimple = lazy(() => import('./pages/news-dashboard-simple'));
const TradeJournalSimple = lazy(() => import('./pages/trade-journal-simple'));
const NFTMarketplaceSimple = lazy(() => import('./pages/nft-marketplace-simple'));
const SolanaDexEmbedded = lazy(() => import('./pages/solana-dex-embedded'));
const LearnEmbedded = lazy(() => import('./pages/learn-embedded'));
const StakeAndBake = lazy(() => import('./pages/thc-staking'));
const LiveStream = lazy(() => import('./pages/live-stream'));
const AIMarketAnalysisPage = lazy(() => import('./pages/ai-market-analysis-page'));
const TradingSignalsPage = lazy(() => import('./pages/trading-signals'));
const EmbeddedAppPage = lazy(() => import('./pages/embedded-app'));

// Import the MicroLearningProvider and renderer
import { MicroLearningProvider } from './lib/context/MicroLearningProvider';
import { MicroLearningTipRenderer } from './components/ui/micro-learning-tip-renderer';
import { ToastProvider } from './components/ui/toaster';

// Light wrapper with providers
function AppWithProviders() {
  return (
    <Router>
      <ToastProvider>
        <SolanaWalletProvider>
          <SolanaAuthProvider>
            <MicroLearningProvider>
              <AppContent />
              <MicroLearningTipRenderer />
            </MicroLearningProvider>
          </SolanaAuthProvider>
        </SolanaWalletProvider>
      </ToastProvider>
    </Router>
  );
}

function AppContent() {
  const { isAuthenticated, login, logout, user } = useUserStore();
  const { loginWithSolana, isWalletAuthenticated, solanaAuthError, isAuthenticatingWithSolana, logoutFromSolana } = useSolanaAuth();
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Auto-login with Solana when wallet is connected
  useEffect(() => {
    // This will check if a wallet is connected but user is not authenticated
    if (!isAuthenticated && !isAuthenticatingWithSolana && !solanaAuthError) {
      // Attempt to login with Solana
      loginWithSolana().catch(error => {
        console.log("Auto wallet login failed:", error);
      });
    }
  }, [isAuthenticated, isAuthenticatingWithSolana, solanaAuthError, loginWithSolana]);
  
  // Initialize affiliate tracking
  const { trackReferral, currentReferralCode } = useAffiliateTracking();
  
  // Check for referrals on initial load
  useEffect(() => {
    // Track any referral codes in the URL
    const detectedReferralCode = trackReferral();
    if (detectedReferralCode) {
      console.log(`Affiliate referral detected: ${detectedReferralCode}`);
    }
  }, [trackReferral]);

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    if (!username || !password) {
      setLoginError('Please enter both username and password');
      return;
    }
    
    try {
      await login(username, password);
      // If login doesn't throw an error, consider it successful
      setShowLoginForm(false);
      setUsername('');
      setPassword('');
    } catch (error) {
      console.error('Login failed:', error);
      setLoginError('Login failed. Please check your credentials.');
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
            <Link to="/" className="flex items-center">
              <img src="/images/trade_hybrid_logo.png" alt="Trade Hybrid Logo" className="h-10 w-10" />
            </Link>
            <nav className="hidden md:flex gap-4">
              <Link to="/" className="hover:text-blue-400 transition-colors">Home</Link>
              <Link to="/trading" className="hover:text-blue-400 transition-colors">Trading</Link>
              <Link to="/solana-trading" className="hover:text-blue-400 transition-colors">DEX</Link>
              <Link to="/thc-staking" className="hover:text-blue-400 transition-colors">Stake & Bake</Link>
              <Link to="/metaverse" className="hover:text-blue-400 transition-colors">Metaverse</Link>
              <Link to="/news" className="hover:text-blue-400 transition-colors">News</Link>
              <Link to="/live-stream" className="hover:text-blue-400 transition-colors">Trade Hybrid TV</Link>
              <Link to="/trade-journal" className="hover:text-blue-400 transition-colors">Journal</Link>
              <Link to="/marketplace" className="hover:text-blue-400 transition-colors">NFTs</Link>
              <Link to="/learn" className="hover:text-blue-400 transition-colors">Learn</Link>
              <Link to="/ai-market-analysis" className="hover:text-blue-400 transition-colors">Market Buddy</Link>
              <Link to="/trading-signals" className="hover:text-blue-400 transition-colors">Signals</Link>
              <Link to="/app" className="hover:text-blue-400 transition-colors">App</Link>
              <Link to="/trade-runner" className="hover:text-blue-400 transition-colors">Trade Runner</Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <TradingTipsButton />
            <ThemeToggle className="mr-2" />
            
            {isAuthenticated ? (
              <>
                <THCBalanceDisplay />
                <div className="flex items-center gap-2">
                  <span>Welcome, {user?.username}</span>
                  {user?.walletAddress && (
                    <div className="text-xs text-slate-400">
                      Wallet: {user.walletAddress.substring(0, 4)}...{user.walletAddress.substring(user.walletAddress.length - 4)}
                    </div>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      // If using wallet auth, also logout from Solana
                      if (isWalletAuthenticated) {
                        logoutFromSolana();
                      }
                      handleLogout();
                    }}
                  >
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <WalletMultiButton className="wallet-adapter-button-custom max-w-[200px] text-sm px-2 py-1 overflow-hidden text-ellipsis whitespace-nowrap" />
                <div className="border-r border-slate-600 h-8 hidden sm:block" />
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
                  <>
                    <Button onClick={() => setShowLoginForm(true)}>Password Login</Button>
                  </>
                )}
              </div>
            )}
            {loginError && (
              <div className="absolute top-16 right-4 bg-red-900/90 text-white p-2 rounded text-sm">
                {loginError}
              </div>
            )}
          </div>
        </div>
      </PopupContainer>
      
      {/* Main Content */}
      <main className="min-h-[calc(100vh-130px)]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={
            <Suspense fallback={
              <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                  <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-slate-300">Loading NFT marketplace...</p>
                </div>
              </div>
            }>
              {typeof window !== 'undefined' && <NFTMarketplaceSimple />}
            </Suspense>
          } />
          <Route path="/trading" element={<TradingPlaceholder />} />
          <Route path="/solana-trading" element={
            <Suspense fallback={
              <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                  <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-slate-300">Loading DEX trading...</p>
                </div>
              </div>
            }>
              {typeof window !== 'undefined' && <SolanaDexEmbedded />}
            </Suspense>
          } />
          <Route path="/metaverse" element={<MetaversePlaceholder />} />
          <Route path="/news" element={
            <Suspense fallback={
              <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                  <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-slate-300">Loading news dashboard...</p>
                </div>
              </div>
            }>
              {typeof window !== 'undefined' && <NewsDashboardSimple />}
            </Suspense>
          } />
          <Route path="/trade-journal" element={
            <Suspense fallback={
              <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                  <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-slate-300">Loading trade journal...</p>
                </div>
              </div>
            }>
              {typeof window !== 'undefined' && <TradeJournalSimple />}
            </Suspense>
          } />
          <Route path="/trade-runner" element={
            <Suspense fallback={
              <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                  <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-slate-300">Loading the Trade Runner game...</p>
                </div>
              </div>
            }>
              {typeof window !== 'undefined' && <TradeRunner />}
            </Suspense>
          } />
          {/* Legacy route for backward compatibility */}
          <Route path="/bulls-vs-bears" element={
            <Suspense fallback={
              <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                  <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-slate-300">Loading the Trade Runner game...</p>
                </div>
              </div>
            }>
              {typeof window !== 'undefined' && <BullsVsBears />}
            </Suspense>
          } />
          <Route path="/learn" element={
            <Suspense fallback={
              <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                  <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-slate-300">Loading education content...</p>
                </div>
              </div>
            }>
              {typeof window !== 'undefined' && <LearnEmbedded />}
            </Suspense>
          } />
          <Route path="/thc-staking" element={
            <Suspense fallback={
              <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                  <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-slate-300">Loading Stake & Bake...</p>
                </div>
              </div>
            }>
              {typeof window !== 'undefined' && <StakeAndBake />}
            </Suspense>
          } />
          <Route path="/live-stream" element={
            <Suspense fallback={
              <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                  <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-slate-300">Loading TV Channel...</p>
                </div>
              </div>
            }>
              {typeof window !== 'undefined' && <LiveStream />}
            </Suspense>
          } />
          <Route path="/ai-market-analysis" element={
            <Suspense fallback={
              <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                  <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-slate-300">Loading AI Market Analysis...</p>
                </div>
              </div>
            }>
              {typeof window !== 'undefined' && <AIMarketAnalysisPage />}
            </Suspense>
          } />
          <Route path="/trading-signals" element={
            <Suspense fallback={
              <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                  <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-slate-300">Loading Trading Signals...</p>
                </div>
              </div>
            }>
              {typeof window !== 'undefined' && <TradingSignalsPage />}
            </Suspense>
          } />
          
          <Route path="/app" element={
            <Suspense fallback={
              <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                  <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-slate-300">Loading App...</p>
                </div>
              </div>
            }>
              {typeof window !== 'undefined' && <EmbeddedAppPage />}
            </Suspense>
          } />
        </Routes>
      </main>
      
      {/* Footer */}
      <PopupContainer className="border-t border-slate-700 p-4 text-sm" padding>
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0 flex items-center gap-2">
              <img src="/images/trade_hybrid_logo.png" alt="Trade Hybrid Logo" className="h-6 w-6" />
              <p>&copy; {new Date().getFullYear()} Trade Hybrid. All rights reserved.</p>
            </div>
            <div className="flex gap-6">
              <a href="https://www.tradehybrid.club/terms" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">Terms</a>
              <a href="https://www.tradehybrid.club/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">Privacy</a>
              <a href="https://www.tradehybrid.club/contact" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">Contact</a>
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
        <div className="flex justify-center mb-4">
          <img src="/images/trade_hybrid_logo.png" alt="Trade Hybrid Logo" className="h-20 w-20" />
        </div>
        <h1 className="text-5xl font-bold mb-4">Welcome to Trade Hybrid</h1>
        <p className="text-xl text-slate-300 max-w-3xl mx-auto">
          The ultimate AI-driven trading metaverse. Experience the future of trading with immersive visualization, real-time data, and social trading in a gamified environment.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <FeatureCard 
          title="Trading"
          description="Trade with AI-powered insights, real-time market data, and advanced charting tools."
          linkTo="/trading"
        />
        <FeatureCard 
          title="DEX"
          description="Trade directly on Solana decentralized exchanges with lower fees using THC token."
          linkTo="/solana-trading"
        />
        <FeatureCard 
          title="Metaverse"
          description="Explore the trading metaverse, interact with other traders, and join trading communities."
          linkTo="/metaverse"
        />
        <FeatureCard 
          title="News & Analysis"
          description="Stay informed with real-time financial news, economic calendar, and market sentiment analysis."
          linkTo="/news"
        />
        <FeatureCard 
          title="NFT Marketplace"
          description="Buy, sell, and trade unique NFTs including trading strategies, virtual properties, and more."
          linkTo="/marketplace"
        />
        <FeatureCard 
          title="Learning"
          description="Access comprehensive educational resources to master trading and financial markets."
          linkTo="/learn"
        />
        <FeatureCard 
          title="Stake & Bake"
          description="Stake THC tokens for rewards and build your network with our 2x3 affiliate matrix system."
          linkTo="/thc-staking"
        />
        <FeatureCard 
          title="Trade Hybrid TV"
          description="Watch live trading sessions, market analysis, and educational content from our expert traders."
          linkTo="/live-stream"
        />
        <FeatureCard 
          title="Market Buddy"
          description="Get advanced AI-powered market analysis, trading suggestions, and risk assessment for any asset."
          linkTo="/ai-market-analysis"
        />
        <FeatureCard 
          title="Trading Signals"
          description="Stay ahead with AI-generated trading signals, price alerts, and personalized notification settings."
          linkTo="/trading-signals"
        />
        <FeatureCard 
          title="App"
          description="Access the Trade Hybrid app directly within the platform with our embedded web browser experience."
          linkTo="/app"
        />
        <FeatureCard 
          title="Trade Runner"
          description="Test your trading skills in our gamified trading simulator. Compete on the leaderboard and earn rewards."
          linkTo="/trade-runner"
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
  const ControlCenterLazy = React.lazy(() => import('./components/ui/control-center'));
  const [selectedSymbol, setSelectedSymbol] = useState('BINANCE:SOLUSDT');
  const [brokerModalOpen, setBrokerModalOpen] = useState(false);
  
  const tradingSymbols = [
    { value: 'BINANCE:SOLUSDT', label: 'Solana (SOL/USDT)' },
    { value: 'BITSTAMP:BTCUSD', label: 'Bitcoin (BTC/USD)' },
    { value: 'BINANCE:ETHUSDT', label: 'Ethereum (ETH/USDT)' },
    { value: 'CME:MNQ!', label: 'MNQ (Micro E-mini Nasdaq)' },
    { value: 'OANDA:XAUUSD', label: 'Gold (XAU/USD)' },
    { value: 'COMEX:GC1!', label: 'Gold Futures' },
    { value: 'CME:NQ!', label: 'Nasdaq 100 (Nas100)' },
  ];
  
  const handleSymbolChange = (newSymbol: string) => {
    setSelectedSymbol(newSymbol);
  };
  
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header with controls and symbol selector */}
      <div className="border-b border-slate-700 bg-slate-800/95 backdrop-blur-sm sticky top-0 z-10 p-4">
        <div className="container mx-auto flex flex-wrap justify-between items-center">
          <div className="flex items-center mb-2 sm:mb-0">
            <h1 className="text-lg font-bold mr-4">Trading Platform</h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <select 
              value={selectedSymbol}
              onChange={(e) => handleSymbolChange(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {tradingSymbols.map(symbol => (
                <option key={symbol.value} value={symbol.value}>{symbol.label}</option>
              ))}
            </select>
            
            <Button size="sm" onClick={() => setBrokerModalOpen(true)}>
              Connect Broker
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Trading Interface with ControlCenter */}
      <div className="container mx-auto h-[calc(100vh-120px)] py-4 px-2 md:px-4">
        <React.Suspense fallback={
          <div className="h-full w-full flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-slate-300">Loading trading dashboard...</p>
            </div>
          </div>
        }>
          <ControlCenterLazy 
            selectedSymbol={selectedSymbol}
            onChangeSymbol={handleSymbolChange}
            initialPanels={['chart', 'signals', 'smart-trade', 'companion', 'economic-calendar', 'market-overview']}
            className="h-full"
          />
        </React.Suspense>
      </div>
      
      {/* Broker Connection Modal would go here */}
    </div>
  );
}

function MetaversePlaceholder() {
  const MinimalScene = React.lazy(() => import('./components/MinimalScene'));
  const [minimized, setMinimized] = useState(false);
  
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Metaverse</h1>
        <p className="text-xl text-slate-300">Experience our 3D trading world (Coming Soon)</p>
      </div>
      
      <PopupContainer className={`${minimized ? 'h-14' : 'h-[500px]'} mb-8 transition-all duration-300`} padding>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">3D Trading Metaverse</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setMinimized(!minimized)}
            className="p-1 h-8 w-8 rounded-full"
          >
            {minimized ? '▼' : '▲'}
          </Button>
        </div>
        
        {!minimized && (
          <div className="h-[calc(100%-2rem)]">
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
        )}
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