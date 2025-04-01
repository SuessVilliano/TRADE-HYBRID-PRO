import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/context/AuthContext';
import { useSolanaAuth } from '../lib/context/SolanaAuthProvider';
import OriginalDashboard from '../components/dashboard/OriginalDashboard';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { isWalletAuthenticated } = useSolanaAuth();
  const navigate = useNavigate();
  
  // Redirect to login page if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isWalletAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isWalletAuthenticated, navigate]);
  
  // If not authenticated, show nothing (will redirect)
  if (!isAuthenticated && !isWalletAuthenticated) {
    return null;
  }
  
  return <OriginalDashboard />;
};

export default HomePage;