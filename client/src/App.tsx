import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/context/AuthContext';
import { SolanaAuthProvider } from './lib/context/SolanaAuthProvider';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import LoginPage from './pages/login';
import HomePage from './pages/home';
import SignupPage from './pages/signup';
import TradeView from './pages/tradeview';
import JournalView from './pages/journal';
import MetaversePage from './pages/metaverse';
import LearnView from './pages/learn';
import SignalsView from './pages/signals';
import LeaderboardView from './pages/leaderboard';
import ProfileView from './pages/profile';
import SettingsView from './pages/settings';
import BotsView from './pages/bots';
import NewsView from './pages/news';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SolanaAuthProvider>
        <Router>
          <Routes>
            {/* Auth routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
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
    </AuthProvider>
  );
};

export default App;