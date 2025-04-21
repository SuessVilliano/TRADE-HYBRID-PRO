import * as React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
const SimpleChartingDashboard = React.lazy(() => import('./pages/simple-charting'));
const TestPage = React.lazy(() => import('./pages/test-page'));
const TradingViewWidgetsTest = React.lazy(() => import('./pages/tradingview-widgets-test'));
import { AuthProvider } from './lib/context/AuthContext';
import { SolanaAuthProvider } from './lib/context/SolanaAuthProvider';
import { SolanaWalletProvider } from './lib/context/SolanaWalletProvider';
import OnboardingProvider from './lib/context/OnboardingProvider';
import { ThemeProvider } from './lib/hooks/useTheme';
import { OnboardingTooltip } from './components/ui/onboarding-tooltip';
import { OnboardingButton } from './components/ui/onboarding-button';
import { BottomNav } from './components/ui/bottom-nav';
import { UniversalHeader } from './components/ui/universal-header';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
// Core Platform Pages
import LoginPage from './pages/login';
import HomePage from './pages/home';
import SignupPage from './pages/signup';
import TradeView from './pages/trading-space';
import JournalView from './pages/trade-journal';
import AdvancedJournalView from './pages/trade-journal-advanced';
import MetaversePage from './pages/metaverse';
// import LearnView from './pages/learning-center'; // Using LearningCenterPage instead
import SignalsView from './pages/trading-signals';
import Leaderboard from './pages/leaderboard';
import ProfileView from './pages/profile';
import SettingsView from './pages/settings';
import BotsView from './pages/trading-bots';
import NewsView from './pages/NewsView';
import NewsSimpleView from './pages/news-dashboard-simple';
import LandingPage from './pages/landing';
import EventsPage from './pages/events';
import NotFoundPage from './pages/not-found';
import SocialNetworkPage from './pages/social-network';
import CopyTradingPage from './pages/copy-trading';
import WalletConnectOnboarding from './pages/wallet-connect-onboarding';
import WalletConnectionPage from './pages/wallet-connection';
import WebhookSettingsPage from './pages/webhook-settings';
import { WebhookLogsPage } from './pages/WebhookLogsPage';
import { BrokerApiSettingsPage } from './pages/BrokerApiSettingsPage';
import ConnectionsPage from './pages/connections';
import ConnectionsSimplePage from './pages/connections-simple';
import NinjaTraderConnectionPage from './pages/NinjaTraderConnectionPage';

// Trading & Markets
import AdvancedTradingDashboard from './pages/advanced-trading-dashboard';
import AdvancedChartingDashboard from './pages/advanced-charting-dashboard';
import TradingDashboard from './pages/trading-dashboard';
import TradingIndicatorsPage from './pages/trading-indicators';
import SolanaTradingPage from './pages/solana-trading';
import SolanaDexEmbedded from './pages/solana-dex-embedded';
import BrokerConnectionsView from './pages/broker-connections';

// Learning & Education
import LearningJourneyPage from './pages/learning-journey';
import LearningModuleDetailPage from './pages/learning-module-detail';
import LearnEmbeddedPage from './pages/learn-embedded';
import EducationalGamesPage from './pages/educational-games';
import TradingFreedomPodcast from './pages/trading-freedom-podcast';
import LearningCenterPage from './pages/learning-center';
import LearningCenterNewPage from './pages/learning-center-new';
import CourseDetail from './components/learning/CourseDetail';
import LessonDetail from './components/learning/LessonDetail';

// Game Center
import GamePage from './pages/game';
import BullsVsBearsPage from './pages/bulls-vs-bears';
import BullsVsBearsNewPage from './pages/bulls-vs-bears-new';
import TradeRunnerPage from './pages/trade-runner';
import TradeRunnerBrowserPage from './pages/trade-runner-browser';

// Tools & Analysis
import SignalsAnalyzerPage from './pages/signals-analyzer';
import AiMarketAnalysisPage from './pages/ai-market-analysis-page';
import VoiceTradeDemoPage from './pages/voice-trade-demo';
import ApiDemoPage from './pages/api-demo-page';
import SmartTradeExplainer from './pages/smart-trade-explainer';
import TradingToolsPage from './pages/trading-tools';

// Prop Firm
import PropFirmDashboardPage from './pages/PropFirmDashboard';
import PropFirmAdminDashboardPage from './pages/PropFirmAdminDashboard';
import PropFirmChallengeSignupPage from './pages/PropFirmChallengeSignup';
import PropFirmAccountDetailsPage from './pages/PropFirmAccountDetails';

// Investor Dashboard Pages
import InvestorDashboardPage from './pages/InvestorDashboard';
import InvestorAdminDashboardPage from './pages/InvestorAdminDashboard';
import InvestmentDetailsPage from './pages/InvestmentDetails';

// NFT & Crypto
import NftMarketplacePage from './pages/nft-marketplace';
import NftMarketplaceSimplePage from './pages/nft-marketplace-simple';
import ThcStakingPage from './pages/thc-staking';
import MatrixVisualizationPage from './pages/matrix-visualization-demo';

// Other Pages
import AffiliatePage from './pages/affiliate';
import ShopPage from './pages/shop';
import LiveStreamPage from './pages/live-stream';
import NotificationSettingsPage from './pages/notification-settings';

const App: React.FC = () => {
  console.log("App component rendering");
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="dark">
        <SolanaWalletProvider>
          <SolanaAuthProvider>
            <OnboardingProvider>
              <Router>
                {/* Onboarding Components */}
                <OnboardingTooltip />
                <OnboardingButton />
                
                {/* Universal Header for consistent navigation */}
                <UniversalHeader />
                
                {/* Bottom Nav Bar (optional based on user preferences) */}
                <BottomNav />
                
                <div className="mt-14"> {/* Add margin to account for fixed header */}
                  <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/trading-freedom-podcast" element={<TradingFreedomPodcast />} />
                  <Route path="/simple-charting" element={<React.Suspense fallback={<div>Loading chart...</div>}><SimpleChartingDashboard /></React.Suspense>} />
                  <Route path="/test-page" element={<React.Suspense fallback={<div>Loading test page...</div>}><TestPage /></React.Suspense>} />
                  <Route path="/tv-widgets" element={<React.Suspense fallback={<div>Loading TradingView widgets...</div>}><TradingViewWidgetsTest /></React.Suspense>} />
                  <Route path="/tv-simple" element={<iframe 
                    src="https://www.tradingview.com/chart/GtJVbpFg/" 
                    style={{ width: '100%', height: '90vh', border: 'none' }}
                    title="TradingView Chart"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  />} />
                  <Route path="/tv-direct" element={<React.Suspense fallback={<div>Loading chart...</div>}>
                    {React.createElement(React.lazy(() => import('./pages/tradingview-direct-chart')))}
                  </React.Suspense>} />
                  <Route path="/tv-calendar" element={<iframe 
                    src="https://www.tradingview.com/markets/currencies/economic-calendar/" 
                    style={{ width: '100%', height: '90vh', border: 'none' }}
                    title="TradingView Economic Calendar"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  />} />
                  <Route path="/th-video" element={<iframe 
                    src="https://elearning.builderall.com/course/52786/aaLZMM95/" 
                    style={{ width: '100%', height: '90vh', border: 'none' }}
                    title="Trade Hybrid Learning Video"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />} />
                  
                  {/* Auth routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/wallet" element={<WalletConnectOnboarding />} />
                  <Route path="/wallet-connection" element={<ProtectedRoute><WalletConnectionPage /></ProtectedRoute>} />
                  
                  {/* Core Platform Routes */}
                  <Route path="/dashboard" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                  <Route path="/trade" element={<ProtectedRoute><TradeView /></ProtectedRoute>} />
                  <Route path="/journal" element={<ProtectedRoute><JournalView /></ProtectedRoute>} />
                  <Route path="/journal/advanced" element={<ProtectedRoute><AdvancedJournalView /></ProtectedRoute>} />
                  <Route path="/metaverse" element={<ProtectedRoute><MetaversePage /></ProtectedRoute>} />
                  <Route path="/learn" element={<ProtectedRoute><LearningCenterPage /></ProtectedRoute>} />
                  <Route path="/signals" element={<ProtectedRoute><SignalsView /></ProtectedRoute>} />
                  <Route path="/copy-trading" element={<ProtectedRoute><CopyTradingPage /></ProtectedRoute>} />
                  <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><ProfileView /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><SettingsView /></ProtectedRoute>} />
                  <Route path="/notification-settings" element={<ProtectedRoute><NotificationSettingsPage /></ProtectedRoute>} />
                  <Route path="/webhook-settings" element={<ProtectedRoute><WebhookSettingsPage /></ProtectedRoute>} />
                  <Route path="/webhook-logs" element={<ProtectedRoute><WebhookLogsPage /></ProtectedRoute>} />
                  <Route path="/broker-api-settings" element={<ProtectedRoute><BrokerApiSettingsPage /></ProtectedRoute>} />
                  <Route path="/ninjatrader-connection" element={<ProtectedRoute><NinjaTraderConnectionPage /></ProtectedRoute>} />
                  <Route path="/trading-bots" element={<ProtectedRoute><BotsView /></ProtectedRoute>} />
                  {/* Redirect for backward compatibility */}
                  <Route path="/bots" element={<Navigate to="/trading-bots" replace />} />
                  <Route path="/news" element={<ProtectedRoute><NewsView /></ProtectedRoute>} />
                  <Route path="/news/simple" element={<ProtectedRoute><NewsSimpleView /></ProtectedRoute>} />
                  <Route path="/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
                  
                  {/* Trading & Markets */}
                  <Route path="/trading-dashboard" element={<ProtectedRoute><AdvancedTradingDashboard /></ProtectedRoute>} />
                  <Route path="/trading-dashboard/custom" element={<ProtectedRoute><TradingDashboard /></ProtectedRoute>} />
                  <Route path="/advanced-charting" element={<ProtectedRoute><AdvancedChartingDashboard /></ProtectedRoute>} />
                  <Route path="/trading/indicators" element={<ProtectedRoute><TradingIndicatorsPage /></ProtectedRoute>} />
                  <Route path="/trading/solana" element={<ProtectedRoute><SolanaTradingPage /></ProtectedRoute>} />
                  <Route path="/dex" element={<ProtectedRoute><SolanaDexEmbedded /></ProtectedRoute>} />
                  <Route path="/broker-connections" element={<ProtectedRoute><BrokerConnectionsView /></ProtectedRoute>} />
                  <Route path="/connections" element={<ProtectedRoute><ConnectionsPage /></ProtectedRoute>} />
                  <Route path="/connections-simple" element={<ProtectedRoute><ConnectionsSimplePage /></ProtectedRoute>} />

                  {/* Learning & Education */}
                  <Route path="/learning-journey" element={<ProtectedRoute><LearningJourneyPage /></ProtectedRoute>} />
                  <Route path="/learn/:moduleId" element={<ProtectedRoute><LearningModuleDetailPage /></ProtectedRoute>} />
                  <Route path="/learn-embed" element={<ProtectedRoute><LearnEmbeddedPage /></ProtectedRoute>} />
                  <Route path="/educational-games" element={<ProtectedRoute><EducationalGamesPage /></ProtectedRoute>} />
                  
                  {/* Learning Center Routes - Pro Trader Academy */}
                  <Route path="/learning-center" element={<ProtectedRoute><LearningCenterNewPage /></ProtectedRoute>} />
                  <Route path="/learning-center/:view/:id" element={<ProtectedRoute><LearningCenterNewPage /></ProtectedRoute>} />
                  
                  {/* Legacy Learning Center Routes - Keeping for backward compatibility */}
                  <Route path="/learning-center/old" element={<ProtectedRoute><LearningCenterPage /></ProtectedRoute>} />
                  <Route path="/learning-center/old/:tab" element={<ProtectedRoute><LearningCenterPage /></ProtectedRoute>} />
                  <Route path="/learning-center/courses/:courseId" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
                  <Route path="/learning-center/courses/:courseId/lessons/:lessonId" element={<ProtectedRoute><LessonDetail /></ProtectedRoute>} />
                  
                  {/* Game Center */}
                  <Route path="/game" element={<ProtectedRoute><GamePage /></ProtectedRoute>} />
                  <Route path="/game/bulls-vs-bears" element={<ProtectedRoute><BullsVsBearsPage /></ProtectedRoute>} />
                  <Route path="/game/bulls-vs-bears-new" element={<ProtectedRoute><BullsVsBearsNewPage /></ProtectedRoute>} />
                  <Route path="/game/trade-runner" element={<ProtectedRoute><TradeRunnerPage /></ProtectedRoute>} />
                  <Route path="/game/trade-runner-browser" element={<ProtectedRoute><TradeRunnerBrowserPage /></ProtectedRoute>} />
                  
                  {/* Tools & Analysis */}
                  <Route path="/trading-tools" element={<ProtectedRoute><TradingToolsPage /></ProtectedRoute>} />
                  <Route path="/ai-market-analysis" element={<ProtectedRoute><AiMarketAnalysisPage /></ProtectedRoute>} />
                  <Route path="/signals-analyzer" element={<ProtectedRoute><SignalsAnalyzerPage /></ProtectedRoute>} />
                  <Route path="/voice-trade" element={<ProtectedRoute><VoiceTradeDemoPage /></ProtectedRoute>} />
                  <Route path="/smart-trade-explainer" element={<ProtectedRoute><SmartTradeExplainer /></ProtectedRoute>} />
                  <Route path="/api-demo" element={<ProtectedRoute><ApiDemoPage /></ProtectedRoute>} />
                  
                  {/* Prop Firm */}
                  <Route path="/prop-firm" element={<ProtectedRoute><PropFirmDashboardPage /></ProtectedRoute>} />
                  <Route path="/prop-firm/admin" element={<ProtectedRoute><PropFirmAdminDashboardPage /></ProtectedRoute>} />
                  <Route path="/prop-firm/challenge" element={<ProtectedRoute><PropFirmChallengeSignupPage /></ProtectedRoute>} />
                  <Route path="/prop-firm/account/:accountId" element={<ProtectedRoute><PropFirmAccountDetailsPage /></ProtectedRoute>} />
                  
                  {/* Investor Dashboard */}
                  <Route path="/investors" element={<ProtectedRoute><InvestorDashboardPage /></ProtectedRoute>} />
                  <Route path="/investors/admin" element={<ProtectedRoute><InvestorAdminDashboardPage /></ProtectedRoute>} />
                  <Route path="/investors/investment/:investmentId" element={<ProtectedRoute><InvestmentDetailsPage /></ProtectedRoute>} />
                  
                  {/* NFT & Crypto */}
                  <Route path="/nft-marketplace" element={<ProtectedRoute><NftMarketplacePage /></ProtectedRoute>} />
                  <Route path="/nft-marketplace/simple" element={<ProtectedRoute><NftMarketplaceSimplePage /></ProtectedRoute>} />
                  <Route path="/thc-staking" element={<ProtectedRoute><ThcStakingPage /></ProtectedRoute>} />
                  <Route path="/matrix" element={<ProtectedRoute><MatrixVisualizationPage /></ProtectedRoute>} />
                  
                  {/* Other Pages */}
                  <Route path="/affiliate/*" element={<ProtectedRoute><AffiliatePage /></ProtectedRoute>} />
                  <Route path="/shop" element={<ProtectedRoute><ShopPage /></ProtectedRoute>} />
                  <Route path="/live-stream" element={<ProtectedRoute><LiveStreamPage /></ProtectedRoute>} />
                  <Route path="/social-network" element={<ProtectedRoute><SocialNetworkPage /></ProtectedRoute>} />
                  
                  {/* Fallback route */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
                </div>
              </Router>
            </OnboardingProvider>
          </SolanaAuthProvider>
        </SolanaWalletProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;