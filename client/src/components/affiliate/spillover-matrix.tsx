import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { FaUserPlus, FaCoins, FaUsers, FaNetworkWired } from 'react-icons/fa';

// Matrix Node represents a position in the spillover matrix
interface MatrixNode {
  id: string;
  owner: string;
  referrer: string;
  position: number;
  level: number;
  directReferrals: number;
  totalDownline: number;
  earnings: number;
  children: MatrixNode[];
}

// Affiliate model configuration
const MATRIX_WIDTH = 2; // x2 (binary) structure
const MATRIX_DEPTH = 3; // 3 levels - can be expanded
const LEVEL_COMMISSIONS = [0.05, 0.03, 0.02]; // 5%, 3%, 2% commissions by level
const TOKEN_SYMBOL = 'THC'; // Trade Hybrid Coin

export function SpilloverMatrix() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  
  const [userMatrix, setUserMatrix] = useState<MatrixNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'structure' | 'stats' | 'earnings'>('structure');
  const [registrationFee, setRegistrationFee] = useState(100); // 100 THC token to join
  
  useEffect(() => {
    if (publicKey) {
      fetchUserMatrix(publicKey.toString());
    }
  }, [publicKey]);
  
  // Fetch user's matrix data from the blockchain
  const fetchUserMatrix = async (address: string) => {
    setLoading(true);
    
    try {
      // In a real implementation, this would interact with your smart contract
      // Mock data for development purposes
      const mockMatrix: MatrixNode = {
        id: '1',
        owner: address,
        referrer: '0x123...456',
        position: 0,
        level: 0,
        directReferrals: 3,
        totalDownline: 12,
        earnings: 250,
        children: [
          {
            id: '2',
            owner: '0xabc...def',
            referrer: address,
            position: 0,
            level: 1,
            directReferrals: 2,
            totalDownline: 5,
            earnings: 120,
            children: [
              {
                id: '4',
                owner: '0xghi...jkl',
                referrer: '0xabc...def',
                position: 0,
                level: 2,
                directReferrals: 1,
                totalDownline: 1,
                earnings: 40,
                children: []
              },
              {
                id: '5',
                owner: '0xmno...pqr',
                referrer: '0xabc...def',
                position: 1,
                level: 2,
                directReferrals: 2,
                totalDownline: 2,
                earnings: 65,
                children: []
              }
            ]
          },
          {
            id: '3',
            owner: '0xstu...vwx',
            referrer: address,
            position: 1,
            level: 1,
            directReferrals: 1,
            totalDownline: 4,
            earnings: 95,
            children: [
              {
                id: '6',
                owner: '0xyyy...zzz',
                referrer: '0xstu...vwx',
                position: 0,
                level: 2,
                directReferrals: 0,
                totalDownline: 0,
                earnings: 20,
                children: []
              },
              {
                id: '7',
                owner: '0x111...222',
                referrer: '0xstu...vwx',
                position: 1,
                level: 2,
                directReferrals: 0,
                totalDownline: 0,
                earnings: 15,
                children: []
              }
            ]
          }
        ]
      };
      
      setUserMatrix(mockMatrix);
    } catch (error) {
      console.error("Error fetching matrix data:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Register a new user to the program
  const registerUser = async (referrerAddress: string) => {
    if (!publicKey) {
      alert("Please connect your wallet first");
      return;
    }
    
    try {
      setLoading(true);
      // In a real implementation, this would send a transaction to your smart contract
      
      // Example of how the transaction might look:
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(referrerAddress),
          lamports: registrationFee * 1000000, // Convert to lamports or smallest unit
        })
      );
      
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      
      // After transaction is confirmed, fetch updated matrix
      await fetchUserMatrix(publicKey.toString());
      
      alert("Successfully joined the affiliate program!");
    } catch (error) {
      console.error("Registration error:", error);
      alert("Failed to join affiliate program. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Render a single node in the matrix visualization
  const renderMatrixNode = (node: MatrixNode, depth = 0) => {
    const isCurrentUser = node.owner === publicKey?.toString();
    
    return (
      <div key={node.id} className={`flex flex-col items-center mb-2 ${depth === 0 ? 'mt-4' : ''}`}>
        <div 
          className={`
            rounded-full w-12 h-12 flex items-center justify-center mb-1 
            ${isCurrentUser ? 'bg-green-500' : 'bg-blue-500'}
            text-white font-bold
          `}
        >
          {node.owner.substring(0, 2)}
        </div>
        <div className="text-xs text-center">
          <div>{node.owner.substring(0, 6)}...{node.owner.substring(node.owner.length - 4)}</div>
          <div className="text-gray-400">Level: {node.level}</div>
        </div>
        
        {node.children.length > 0 && (
          <>
            <div className="w-px h-4 bg-gray-400 my-1"></div>
            <div className="flex space-x-8">
              {node.children.map(child => renderMatrixNode(child, depth + 1))}
            </div>
          </>
        )}
      </div>
    );
  };
  
  // Render earnings statistics
  const renderEarningStats = () => {
    if (!userMatrix) return null;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Card className="p-4 bg-slate-800 border-slate-700">
          <div className="flex items-center space-x-3">
            <FaCoins className="text-yellow-500 text-xl" />
            <div>
              <div className="text-sm text-gray-400">Total Earnings</div>
              <div className="text-xl font-bold">{userMatrix.earnings} {TOKEN_SYMBOL}</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-slate-800 border-slate-700">
          <div className="flex items-center space-x-3">
            <FaUserPlus className="text-blue-500 text-xl" />
            <div>
              <div className="text-sm text-gray-400">Direct Referrals</div>
              <div className="text-xl font-bold">{userMatrix.directReferrals}</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-slate-800 border-slate-700">
          <div className="flex items-center space-x-3">
            <FaUsers className="text-purple-500 text-xl" />
            <div>
              <div className="text-sm text-gray-400">Total Downline</div>
              <div className="text-xl font-bold">{userMatrix.totalDownline}</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-slate-800 border-slate-700">
          <div className="flex items-center space-x-3">
            <FaNetworkWired className="text-green-500 text-xl" />
            <div>
              <div className="text-sm text-gray-400">Spillover Received</div>
              <div className="text-xl font-bold">{userMatrix.totalDownline - userMatrix.directReferrals}</div>
            </div>
          </div>
        </Card>
      </div>
    );
  };
  
  // Render how spillover works
  const renderSpilloverInfo = () => {
    return (
      <Card className="p-4 bg-slate-800 border-slate-700 mt-4">
        <h3 className="text-lg font-bold mb-2">How Spillover Works</h3>
        <p className="text-sm text-gray-300 mb-2">
          Our infinite spillover matrix works differently from traditional MLM matrices:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
          <li>You earn commissions from your direct referrals and their downlines</li>
          <li>When your direct referrals bring in new members beyond their matrix capacity, these new members "spillover" to your unfilled positions</li>
          <li>This means you benefit from the recruiting efforts of your entire team</li>
          <li>The matrix expands infinitely deeper, allowing for unlimited earning potential</li>
          <li>Early joiners have the greatest advantage as the system grows</li>
        </ul>
        <div className="mt-4">
          <h4 className="font-semibold">Commission Structure:</h4>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {LEVEL_COMMISSIONS.map((commission, index) => (
              <Card key={index} className="p-2 bg-slate-700 border-slate-600">
                <div className="text-center">
                  <div className="text-xs text-gray-400">Level {index + 1}</div>
                  <div className="font-bold text-green-400">{commission * 100}%</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Card>
    );
  };
  
  // Generate affiliate link for sharing
  const getAffiliateLink = () => {
    if (!publicKey) return "";
    
    const baseUrl = window.location.origin;
    return `${baseUrl}/register?ref=${publicKey.toString()}`;
  };
  
  const copyAffiliateLink = () => {
    const link = getAffiliateLink();
    if (link) {
      navigator.clipboard.writeText(link);
      alert("Affiliate link copied to clipboard!");
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Infinite Spillover Matrix</h2>
      
      {!publicKey ? (
        <Card className="p-6 bg-slate-800 border-slate-700 text-center">
          <p className="mb-4">Connect your wallet to view your affiliate matrix and start earning commissions.</p>
          {/* Wallet connect button would be here, but is likely in the app header */}
        </Card>
      ) : loading ? (
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4">Loading your matrix data...</p>
        </div>
      ) : (
        <>
          {/* Affiliate link generator */}
          <Card className="p-4 bg-slate-800 border-slate-700 mb-6">
            <h3 className="text-lg font-bold mb-2">Your Affiliate Link</h3>
            <div className="flex items-center space-x-2">
              <input 
                type="text" 
                value={getAffiliateLink()}
                className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
                readOnly
              />
              <Button onClick={copyAffiliateLink} size="sm">
                Copy
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Share this link to receive commissions when new members join through your referral.
            </p>
          </Card>
          
          {/* Tab navigation */}
          <div className="flex border-b border-slate-700 mb-4">
            <button 
              className={`px-4 py-2 font-medium ${activeTab === 'structure' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400'}`}
              onClick={() => setActiveTab('structure')}
            >
              Matrix Structure
            </button>
            <button 
              className={`px-4 py-2 font-medium ${activeTab === 'stats' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400'}`}
              onClick={() => setActiveTab('stats')}
            >
              Statistics
            </button>
            <button 
              className={`px-4 py-2 font-medium ${activeTab === 'earnings' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400'}`}
              onClick={() => setActiveTab('earnings')}
            >
              How It Works
            </button>
          </div>
          
          {/* Tab content */}
          <div className="mt-4">
            {activeTab === 'structure' && userMatrix && (
              <Card className="p-4 bg-slate-800 border-slate-700 overflow-auto">
                <div className="min-w-[800px] flex justify-center">
                  {renderMatrixNode(userMatrix)}
                </div>
              </Card>
            )}
            
            {activeTab === 'stats' && renderEarningStats()}
            
            {activeTab === 'earnings' && renderSpilloverInfo()}
          </div>
        </>
      )}
    </div>
  );
}

export default SpilloverMatrix;