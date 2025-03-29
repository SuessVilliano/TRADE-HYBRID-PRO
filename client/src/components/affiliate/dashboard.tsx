import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { SpilloverMatrix } from './spillover-matrix';
import { getMatrixContract, Participant } from './matrix-contract';
import { FaUsers, FaCoins, FaWallet, FaLink, FaChartLine, FaCopy, FaUserPlus } from 'react-icons/fa';

export function AffiliateDashboard() {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  
  const [userInfo, setUserInfo] = useState<Participant | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [globalStats, setGlobalStats] = useState<{
    totalParticipants: number;
    totalCommissionsPaid: number;
    topEarners: { address: PublicKey, earnings: number }[];
  } | null>(null);
  
  // Fetch user's matrix data and global stats
  useEffect(() => {
    if (publicKey) {
      fetchUserData();
      fetchGlobalStats();
    } else {
      setLoading(false);
    }
  }, [publicKey, connection]);
  
  const fetchUserData = async () => {
    setLoading(true);
    
    try {
      const matrixContract = getMatrixContract(connection);
      const userData = await matrixContract.getUserMatrix(publicKey!);
      setUserInfo(userData);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchGlobalStats = async () => {
    try {
      const matrixContract = getMatrixContract(connection);
      const stats = await matrixContract.getGlobalStats();
      setGlobalStats(stats);
    } catch (error) {
      console.error("Error fetching global stats:", error);
    }
  };
  
  // Generate affiliate link for sharing
  const getAffiliateLink = () => {
    if (!publicKey) return "";
    
    const baseUrl = window.location.origin;
    return `${baseUrl}/affiliate/register?ref=${publicKey.toString()}`;
  };
  
  const copyAffiliateLink = () => {
    const link = getAffiliateLink();
    if (link) {
      navigator.clipboard.writeText(link);
      alert("Affiliate link copied to clipboard!");
    }
  };
  
  // Claim commissions
  const claimCommissions = async () => {
    if (!publicKey || !userInfo) return;
    
    try {
      setLoading(true);
      const matrixContract = getMatrixContract(connection);
      
      // In a real implementation, this would interact with your wallet for signing
      await matrixContract.claimCommissions({
        publicKey,
        signTransaction: async (tx) => {
          throw new Error("This is a mock implementation");
        }
      });
      
      // Refresh user data after claiming
      await fetchUserData();
      
      alert("Commissions claimed successfully!");
    } catch (error) {
      console.error("Error claiming commissions:", error);
      alert("Failed to claim commissions. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Render the overview tab
  const renderOverview = () => {
    if (!userInfo) return null;
    
    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-slate-800 border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500/20 p-2 rounded">
                <FaUserPlus className="text-blue-500" />
              </div>
              <div>
                <div className="text-sm text-gray-400">Direct Referrals</div>
                <div className="text-2xl font-bold">{userInfo.directReferrals.length}</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-slate-800 border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="bg-green-500/20 p-2 rounded">
                <FaCoins className="text-green-500" />
              </div>
              <div>
                <div className="text-sm text-gray-400">Total Earnings</div>
                <div className="text-2xl font-bold">{userInfo.totalEarnings} THC</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-slate-800 border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-500/20 p-2 rounded">
                <FaUsers className="text-purple-500" />
              </div>
              <div>
                <div className="text-sm text-gray-400">Matrix Positions</div>
                <div className="text-2xl font-bold">{userInfo.matrixPositions.length}</div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Affiliate Link */}
        <Card className="p-4 bg-slate-800 border-slate-700">
          <h3 className="text-lg font-bold mb-2">Your Affiliate Link</h3>
          <div className="flex items-center space-x-2">
            <input 
              type="text" 
              value={getAffiliateLink()}
              className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
              readOnly
            />
            <Button 
              onClick={copyAffiliateLink} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <FaCopy size={14} />
              Copy
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Share this link to receive commissions when new members join through your referral.
          </p>
        </Card>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 bg-slate-800 border-slate-700">
            <h3 className="text-lg font-bold mb-2">Quick Actions</h3>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2"
                onClick={() => window.open('/affiliate/register', '_blank')}
              >
                <FaLink size={14} />
                Open Registration Page
              </Button>
              
              <Button 
                className="w-full flex items-center justify-center gap-2"
                onClick={claimCommissions}
                disabled={userInfo.totalEarnings <= 0 || loading}
              >
                <FaWallet size={14} />
                {loading ? 'Processing...' : 'Claim Commissions'}
              </Button>
            </div>
          </Card>
          
          <Card className="p-4 bg-slate-800 border-slate-700">
            <h3 className="text-lg font-bold mb-2">Network Activity</h3>
            {globalStats ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Total Members:</span>
                  <span className="font-bold">{globalStats.totalParticipants}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Commissions Paid:</span>
                  <span className="font-bold">{globalStats.totalCommissionsPaid} THC</span>
                </div>
                <div className="mt-2">
                  <div className="text-sm text-gray-400 mb-1">Top Earner:</div>
                  <div className="bg-slate-900 p-2 rounded text-xs">
                    {globalStats.topEarners[0]?.address.toString().substring(0, 6)}...
                    {globalStats.topEarners[0]?.address.toString().substring(globalStats.topEarners[0]?.address.toString().length - 4)}
                    <span className="float-right font-bold text-green-400">
                      {globalStats.topEarners[0]?.earnings} THC
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-400 italic">Loading stats...</div>
            )}
          </Card>
        </div>
      </div>
    );
  };
  
  // Render recent activities
  const renderActivity = () => {
    return (
      <Card className="p-4 bg-slate-800 border-slate-700">
        <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
        
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="border-b border-slate-700 pb-3 last:border-0">
              <div className="flex justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${item % 2 === 0 ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                  <span className="text-sm">
                    {item % 2 === 0 
                      ? 'Commission Received' 
                      : 'New Referral Joined'}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(Date.now() - item * 3600000).toLocaleString()}
                </span>
              </div>
              <div className="ml-4 mt-1">
                <div className="text-sm text-gray-300">
                  {item % 2 === 0 
                    ? `Earned 5 THC from level ${item} referral` 
                    : `User 0x${Math.random().toString(16).substring(2, 8)} joined your team`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Affiliate Program Dashboard</h1>
      
      {!connected ? (
        <Card className="p-6 bg-slate-800 border-slate-700 text-center">
          <FaWallet className="text-3xl mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-4">
            Please connect your wallet to access your affiliate dashboard
          </p>
          {/* Wallet connect button would be here, but is likely in the app header */}
          <Button disabled={true}>Connect Wallet</Button>
        </Card>
      ) : loading && !userInfo ? (
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4">Loading your affiliate data...</p>
        </div>
      ) : (
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-6">
            <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
            <TabsTrigger value="matrix" className="flex-1">Matrix Structure</TabsTrigger>
            <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            {renderOverview()}
          </TabsContent>
          
          <TabsContent value="matrix">
            <SpilloverMatrix />
          </TabsContent>
          
          <TabsContent value="activity">
            {renderActivity()}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

export default AffiliateDashboard;