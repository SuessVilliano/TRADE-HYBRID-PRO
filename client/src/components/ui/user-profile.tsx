import React, { useState } from 'react';
import { User, LogOut, Settings, Wallet, Crown, Shield } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface UserProfileProps {
  className?: string;
}

export function UserProfile({ className }: UserProfileProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    
    try {
      // Call server logout endpoint
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local auth state
      logout();
      setLoggingOut(false);
      navigate('/auth');
    }
  };

  const getMembershipBadge = (level?: string) => {
    switch (level) {
      case 'premium':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'institutional':
        return <Shield className="h-4 w-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const getMembershipColor = (level?: string) => {
    switch (level) {
      case 'premium':
        return 'text-yellow-600 bg-yellow-100';
      case 'institutional':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-4">Please sign in to view your profile</p>
          <Button onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatar} alt={user.username} />
            <AvatarFallback className="bg-blue-600 text-white text-lg">
              {user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold">{user.username}</h3>
              {getMembershipBadge(user.membershipLevel)}
            </div>
            <p className="text-sm text-gray-600">{user.email}</p>
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMembershipColor(user.membershipLevel)}`}>
              {user.membershipLevel?.toUpperCase() || 'FREE'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              ${user.balance?.toLocaleString() || '0'}
            </div>
            <div className="text-sm text-gray-600">Balance</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              {user.thcTokenHolder && <Crown className="h-4 w-4 text-yellow-500" />}
              <div className={`text-sm font-medium ${user.thcTokenHolder ? 'text-yellow-600' : 'text-gray-600'}`}>
                {user.thcTokenHolder ? 'THC Holder' : 'Standard'}
              </div>
            </div>
            <div className="text-xs text-gray-500">Token Status</div>
          </div>
        </div>

        {user.walletAddress && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Wallet Connected</span>
            </div>
            <div className="text-xs text-gray-600 font-mono">
              {user.walletAddress.slice(0, 8)}...{user.walletAddress.slice(-8)}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => navigate('/settings')}
          >
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <LogOut className="h-4 w-4 mr-1" />
            {loggingOut ? 'Signing Out...' : 'Sign Out'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}