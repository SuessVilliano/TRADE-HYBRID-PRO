import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/context/AuthContext';
import { SolanaAuthProvider } from './lib/context/SolanaAuthProvider';
import { WalletProvider } from './lib/context/WalletProvider';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import LoginPage from './pages/login';
import HomePage from './pages/home';
import SignupPage from './pages/signup';
import TradeView from './pages/trading-space';
import JournalView from './pages/trade-journal';
import MetaversePage from './pages/metaverse';
import LearnView from './pages/learning-center';
import SignalsView from './pages/trading-signals';
import LeaderboardView from './pages/not-found';
import ProfileView from './pages/not-found';
import SettingsView from './pages/not-found';
import BotsView from './pages/not-found';
import NewsView from './pages/news-dashboard';
import LandingPage from './pages/landing';
import TradingFreedomPodcast from './pages/trading-freedom-podcast';
import SignalsAnalyzerPage from './pages/signals-analyzer';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <WalletProvider>
        <SolanaAuthProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/trading-freedom-podcast" element={<TradingFreedomPodcast />} />
              <Route path="/signals-analyzer" element={<SignalsAnalyzerPage />} />
              
              {/* Auth routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
              <Route path="/trade" element={<ProtectedRoute><TradeView /></ProtectedRoute>} />
              <Route path="/journal" element={<ProtectedRoute><JournalView /></ProtectedRoute>} />
              <Route path="/metaverse" element={<ProtectedRoute><MetaversePage /></ProtectedRoute>} />
              <Route path="/learn" element={<ProtectedRoute><LearnView /></ProtectedRoute>} />
              <Route path="/signals" element={<ProtectedRoute><SignalsView /></ProtectedRoute>} />
              <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardView /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfileView /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsView /></ProtectedRoute>} />
              <Route path="/bots" element={<ProtectedRoute><BotsView /></ProtectedRoute>} />
              <Route path="/news" element={<ProtectedRoute><NewsView /></ProtectedRoute>} />
              
              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </SolanaAuthProvider>
      </WalletProvider>
    </AuthProvider>
  );
};

export default App;