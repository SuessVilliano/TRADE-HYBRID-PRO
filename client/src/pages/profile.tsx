import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/context/AuthContext';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { LogOut, AlertCircle } from 'lucide-react';

// Simple placeholder component until we implement the full layout
const LayoutPlaceholder: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-slate-900 p-6">
    <div className="max-w-6xl mx-auto">
      <header className="mb-6 p-4 bg-slate-800 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-white">Trade Hybrid Platform</h1>
      </header>
      <main className="bg-slate-800 rounded-lg shadow-sm p-4 text-white">
        {children}
      </main>
    </div>
  </div>
);

// ProfileDashboard with real user data from context
const ProfileDashboard: React.FC = () => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  
  // Fallback user data if not authenticated
  const userData = {
    name: currentUser?.username || "Demo Trader",
    accountType: currentUser?.membershipLevel || "Free",
    joinDate: currentUser?.membershipExpiresAt 
      ? new Date(currentUser.membershipExpiresAt).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0],
    email: currentUser?.email || "user@example.com",
    walletAddress: currentUser?.walletAddress || null,
  };
  
  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 border-b border-slate-700 pb-6">
        <div className="w-24 h-24 rounded-full bg-blue-900 flex items-center justify-center text-blue-300 text-2xl font-bold">
          {userData.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="flex-grow">
          <h2 className="text-2xl font-bold text-white">{userData.name}</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="bg-blue-900/50 text-blue-300 px-2 py-1 rounded text-xs">
              {userData.accountType} Account
            </span>
            <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs">
              Member since {userData.joinDate}
            </span>
          </div>
          {userData.email && (
            <div className="text-sm text-slate-300 mt-2">{userData.email}</div>
          )}
          {userData.walletAddress && (
            <div className="text-xs text-slate-400 mt-1 font-mono">
              Wallet: {userData.walletAddress.substring(0, 6)}...{userData.walletAddress.substring(userData.walletAddress.length - 4)}
            </div>
          )}
        </div>
        <div>
          <Button 
            variant="destructive" 
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            {isLoggingOut ? "Signing Out..." : "Sign Out"}
          </Button>
        </div>
      </div>
      
      {!isAuthenticated && (
        <Alert variant="destructive" className="bg-red-900/20 border-red-800 mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You are not logged in. Please sign in to access all features.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
          <h3 className="text-lg font-medium mb-2 text-white">Trading Stats</h3>
          <p className="text-slate-300">Profile data is being loaded...</p>
        </div>
        
        <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
          <h3 className="text-lg font-medium mb-2 text-white">Achievement Progress</h3>
          <p className="text-slate-300">Profile data is being loaded...</p>
        </div>
        
        <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
          <h3 className="text-lg font-medium mb-2 text-white">Recent Activity</h3>
          <p className="text-slate-300">Profile data is being loaded...</p>
        </div>
      </div>
    </div>
  );
};

export default function ProfileView() {
  return (
    <LayoutPlaceholder>
      <ProfileDashboard />
    </LayoutPlaceholder>
  );
}