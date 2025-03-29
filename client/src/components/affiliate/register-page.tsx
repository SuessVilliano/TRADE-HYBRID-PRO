import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { getMatrixContract } from './matrix-contract';
import { FaUsers, FaWallet, FaLink, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

export function RegisterPage() {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [referrer, setReferrer] = useState<string>('');
  const [isValidReferrer, setIsValidReferrer] = useState<boolean | null>(null);
  const [registrationFee, setRegistrationFee] = useState<number>(100);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Extract referrer from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    
    if (ref) {
      setReferrer(ref);
      validateReferrer(ref);
    }
  }, [location]);
  
  // Validate that the referrer is a valid address and exists in the system
  const validateReferrer = async (address: string) => {
    setError(null);
    
    try {
      // Check if it's a valid Solana address
      new PublicKey(address);
      
      // In production, this would check if the referrer is registered in the system
      // For now, we'll just assume it's valid
      setIsValidReferrer(true);
    } catch (err) {
      console.error("Invalid referrer address:", err);
      setIsValidReferrer(false);
      setError("Invalid referrer address format");
    }
  };
  
  // Handle referrer input change
  const handleReferrerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setReferrer(value);
    
    if (value.length > 30) {
      validateReferrer(value);
    } else {
      setIsValidReferrer(null);
    }
  };
  
  // Register the user
  const handleRegister = async () => {
    if (!publicKey) {
      setError("Please connect your wallet first");
      return;
    }
    
    if (!isValidReferrer) {
      setError("Please enter a valid referrer address");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const matrixContract = getMatrixContract(connection);
      
      // Attempt to register the user
      await matrixContract.registerUser(
        { 
          publicKey, 
          signTransaction: async (tx) => {
            throw new Error("This is a mock implementation - actual wallet signing would be used in production");
          }
        }, 
        new PublicKey(referrer)
      );
      
      // If successful, navigate to the matrix dashboard
      navigate('/affiliate/dashboard');
    } catch (err) {
      console.error("Registration error:", err);
      setError("Failed to register. Please check your wallet balance and try again.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto max-w-2xl p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Join the Infinite Spillover Matrix</h1>
      
      <Card className="bg-slate-800 border-slate-700 p-6 mb-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-blue-500 p-3 rounded-full">
            <FaUsers className="text-white text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Affiliate Program Registration</h2>
            <p className="text-gray-400">Join our infinite spillover matrix for unlimited earning benefits</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Referrer Address</label>
            <div className="relative">
              <Input
                value={referrer}
                onChange={handleReferrerChange}
                placeholder="Enter referrer's Solana address"
                className={`${isValidReferrer === false ? 'border-red-500' : 
                  isValidReferrer === true ? 'border-green-500' : 'border-slate-600'} pr-10`}
                disabled={loading}
              />
              {isValidReferrer !== null && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {isValidReferrer ? (
                    <FaCheckCircle className="text-green-500" />
                  ) : (
                    <FaExclamationTriangle className="text-red-500" />
                  )}
                </div>
              )}
            </div>
            {isValidReferrer === false && error && (
              <p className="text-red-500 text-xs mt-1">{error}</p>
            )}
          </div>
          
          <div className="bg-slate-900 p-4 rounded-md border border-slate-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Registration Fee:</span>
              <span className="font-bold">{registrationFee} THC</span>
            </div>
            <div className="text-xs text-gray-500">
              This one-time fee gives you lifetime access to the affiliate program
            </div>
          </div>
          
          <div className="pt-2">
            {connected ? (
              <Button 
                onClick={handleRegister} 
                className="w-full" 
                disabled={!isValidReferrer || loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  'Register Now'
                )}
              </Button>
            ) : (
              <div className="text-center">
                <p className="text-yellow-500 mb-2 flex items-center justify-center">
                  <FaWallet className="mr-2" /> Connect your wallet to register
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled={true}
                >
                  Connect Wallet
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  (Wallet connect button is available in the header)
                </p>
              </div>
            )}
          </div>
          
          {error && !loading && isValidReferrer !== false && (
            <div className="bg-red-900/30 border border-red-500/50 text-red-400 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
        </div>
      </Card>
      
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h3 className="text-lg font-bold mb-3">Benefits of Our Spillover Matrix:</h3>
        <ul className="space-y-2">
          <li className="flex items-start">
            <div className="bg-green-500/20 p-1 rounded mr-2 mt-0.5">
              <FaCheckCircle className="text-green-500 text-sm" />
            </div>
            <span className="text-sm">Earn from your direct referrals and their downlines</span>
          </li>
          <li className="flex items-start">
            <div className="bg-green-500/20 p-1 rounded mr-2 mt-0.5">
              <FaCheckCircle className="text-green-500 text-sm" />
            </div>
            <span className="text-sm">Benefit from spillovers as your team grows</span>
          </li>
          <li className="flex items-start">
            <div className="bg-green-500/20 p-1 rounded mr-2 mt-0.5">
              <FaCheckCircle className="text-green-500 text-sm" />
            </div>
            <span className="text-sm">Early adopters receive unlimited depth commissions</span>
          </li>
          <li className="flex items-start">
            <div className="bg-green-500/20 p-1 rounded mr-2 mt-0.5">
              <FaCheckCircle className="text-green-500 text-sm" />
            </div>
            <span className="text-sm">Commissions paid instantly via smart contract</span>
          </li>
          <li className="flex items-start">
            <div className="bg-green-500/20 p-1 rounded mr-2 mt-0.5">
              <FaCheckCircle className="text-green-500 text-sm" />
            </div>
            <span className="text-sm">Transparent blockchain-based matrix structure</span>
          </li>
        </ul>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400 mb-2">Already registered?</p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/affiliate/dashboard')}
          >
            Go to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default RegisterPage;