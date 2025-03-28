import React, { useState } from 'react';
import { Toaster } from '../components/ui/toaster';
import { Button } from '../components/ui/button';

// Placeholder/Mock configs for THC token
const THC_TOKEN_CONFIG = {
  stakingApyTiers: [
    { minStakingPeriod: 30, apy: 4.5 },
    { minStakingPeriod: 90, apy: 7.2 },
    { minStakingPeriod: 180, apy: 10.8 },
    { minStakingPeriod: 365, apy: 15.0 }
  ],
  feeReductionTiers: [
    { minHolding: 0, reduction: 0 },
    { minHolding: 1000, reduction: 10 },
    { minHolding: 5000, reduction: 25 },
    { minHolding: 10000, reduction: 40 },
    { minHolding: 50000, reduction: 50 }
  ]
};

// Trading pairs for the DEX
const TRADING_PAIRS = [
  { symbol: 'SOL/USDC', price: 191.24, change: 2.45 },
  { symbol: 'BTC/USDC', price: 69548.32, change: -1.2 },
  { symbol: 'ETH/USDC', price: 3452.78, change: 0.85 },
  { symbol: 'BONK/USDC', price: 0.00001234, change: 15.7 },
  { symbol: 'JUP/USDC', price: 1.43, change: 3.1 },
  { symbol: 'THC/USDC', price: 0.87, change: 5.3 }
];

const SolanaTrading: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trading' | 'staking' | 'bridge'>('trading');
  const [connectedWallet, setConnectedWallet] = useState(false);
  const [selectedPair, setSelectedPair] = useState('SOL/USDC');
  
  // Mock wallet connection
  const connectWallet = () => {
    setConnectedWallet(true);
  };
  
  // Mock disconnect wallet
  const disconnectWallet = () => {
    setConnectedWallet(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 text-white">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mb-2">Trade with Low Fees</h1>
          <p className="text-slate-300 mb-4">
            Connect your wallet to trade directly from the DEX with THC fee reduction.
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-slate-700/50 rounded-full text-sm">
              <span className="font-semibold text-blue-400 mr-1">50%</span> Lower Fees
            </span>
            <span className="px-3 py-1 bg-slate-700/50 rounded-full text-sm">
              <span className="font-semibold text-blue-400 mr-1">Direct DEX</span> Trading
            </span>
            <span className="px-3 py-1 bg-slate-700/50 rounded-full text-sm">
              <span className="font-semibold text-blue-400 mr-1">No</span> Intermediaries
            </span>
            <span className="px-3 py-1 bg-slate-700/50 rounded-full text-sm">
              <span className="font-semibold text-blue-400 mr-1">THC</span> Token Utility
            </span>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="border border-slate-700 rounded-lg p-4 bg-slate-800/50">
            <h2 className="text-lg font-semibold mb-3">Wallet</h2>
            {connectedWallet ? (
              <div>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-slate-400 text-sm">Account</div>
                    <div className="font-mono text-sm">CRxp...9uKs</div>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-slate-400 text-sm">Balance</div>
                    <div>
                      <div className="font-semibold">2.45 SOL</div>
                      <div className="text-xs text-slate-400">~$468.53</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-slate-400 text-sm">THC Balance</div>
                    <div>
                      <div className="font-semibold">1,250 THC</div>
                      <div className="text-xs text-slate-400">Tier: 10% Fee Reduction</div>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={disconnectWallet}>
                  Disconnect
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-slate-400 mb-4">
                  Connect your wallet to access DEX trading and THC benefits.
                </p>
                <Button className="w-full" onClick={connectWallet}>
                  Connect Wallet
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-b border-slate-700 mb-6">
        <div className="flex">
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'trading' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-slate-400'}`}
            onClick={() => setActiveTab('trading')}
          >
            Trading
          </button>
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'staking' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-slate-400'}`}
            onClick={() => setActiveTab('staking')}
          >
            Staking
          </button>
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'bridge' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-slate-400'}`}
            onClick={() => setActiveTab('bridge')}
          >
            Bridge
          </button>
        </div>
      </div>

      {activeTab === 'trading' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="border border-slate-700 rounded-lg overflow-hidden">
              <div className="bg-slate-800 px-4 py-3 border-b border-slate-700">
                <h3 className="text-sm font-semibold">Trading Pairs</h3>
              </div>
              <div className="divide-y divide-slate-700">
                {TRADING_PAIRS.map((pair) => (
                  <div 
                    key={pair.symbol} 
                    className={`px-4 py-3 cursor-pointer hover:bg-slate-800/50 ${selectedPair === pair.symbol ? 'bg-slate-800' : ''}`}
                    onClick={() => setSelectedPair(pair.symbol)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-medium">{pair.symbol}</div>
                      <div className="text-right">
                        <div>${pair.price.toLocaleString()}</div>
                        <div className={pair.change >= 0 ? 'text-green-500 text-sm' : 'text-red-500 text-sm'}>
                          {pair.change >= 0 ? '+' : ''}{pair.change}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-3">
            <div className="border border-slate-700 rounded-lg overflow-hidden p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{selectedPair}</h2>
                <div className="text-sm bg-slate-800 px-3 py-1 rounded-full">
                  Fee: <span className="text-blue-400">0.1%</span>
                </div>
              </div>
              
              <div className="h-64 bg-slate-800/50 rounded mb-4 flex items-center justify-center border border-slate-700">
                <p className="text-slate-400">Price chart will be displayed here</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Buy {selectedPair.split('/')[0]}</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Price</label>
                      <input 
                        type="text"
                        value={selectedPair === 'SOL/USDC' ? '191.24' : '0.00'}
                        className="w-full bg-slate-800 border border-slate-700 rounded p-2"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Amount</label>
                      <input 
                        type="text"
                        placeholder="0.00"
                        className="w-full bg-slate-800 border border-slate-700 rounded p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Total</label>
                      <input 
                        type="text"
                        placeholder="0.00"
                        className="w-full bg-slate-800 border border-slate-700 rounded p-2"
                      />
                    </div>
                    <Button className="w-full" disabled={!connectedWallet}>
                      Buy {selectedPair.split('/')[0]}
                    </Button>
                  </div>
                </div>
                
                <div className="border border-slate-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Sell {selectedPair.split('/')[0]}</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Price</label>
                      <input 
                        type="text"
                        value={selectedPair === 'SOL/USDC' ? '191.24' : '0.00'}
                        className="w-full bg-slate-800 border border-slate-700 rounded p-2"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Amount</label>
                      <input 
                        type="text"
                        placeholder="0.00"
                        className="w-full bg-slate-800 border border-slate-700 rounded p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Total</label>
                      <input 
                        type="text"
                        placeholder="0.00"
                        className="w-full bg-slate-800 border border-slate-700 rounded p-2"
                      />
                    </div>
                    <Button className="w-full" variant="outline" disabled={!connectedWallet}>
                      Sell {selectedPair.split('/')[0]}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'staking' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="rounded-lg border border-slate-700 p-6 bg-slate-800/30">
              <h2 className="text-xl font-semibold mb-4">Stake THC Tokens</h2>
              <p className="text-sm text-slate-400 mb-6">
                Earn rewards by staking your THC tokens. The longer you stake, the higher the APY.
              </p>
              
              <div className="space-y-4 mb-6">
                {THC_TOKEN_CONFIG.stakingApyTiers.map((tier, index) => (
                  <div key={index} className="flex justify-between items-center p-3 rounded-md border border-slate-700 bg-slate-800/50">
                    <div>
                      <div className="font-medium">{tier.minStakingPeriod} Days</div>
                      <div className="text-xs text-slate-400">Min. Staking Period</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-400">{tier.apy}% APY</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button className="w-full" disabled={!connectedWallet}>
                {connectedWallet ? 'Stake THC Tokens' : 'Connect Wallet First'}
              </Button>
            </div>
          </div>
          
          <div>
            <div className="rounded-lg border border-slate-700 p-6 bg-slate-800/30">
              <h2 className="text-xl font-semibold mb-4">THC Benefits</h2>
              <p className="text-sm text-slate-400 mb-6">
                Holding THC tokens reduces your trading fees on all pairs.
              </p>
              
              <div className="space-y-4 mb-6">
                {THC_TOKEN_CONFIG.feeReductionTiers.slice(1).map((tier, index) => (
                  <div key={index} className="flex justify-between items-center p-3 rounded-md border border-slate-700 bg-slate-800/50">
                    <div>
                      <div className="font-medium">{tier.minHolding.toLocaleString()} THC</div>
                      <div className="text-xs text-slate-400">Min. Token Holding</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-400">{tier.reduction}% Off</div>
                      <div className="text-xs text-slate-400">Fee Reduction</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button variant="outline" className="w-full">Buy THC Tokens</Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'bridge' && (
        <div className="max-w-2xl mx-auto">
          <div className="rounded-lg border border-slate-700 p-6 bg-slate-800/30 text-center">
            <h2 className="text-xl font-semibold mb-4">Bridge Assets</h2>
            <p className="text-slate-400 mb-8">
              Bridge your assets between Solana and other networks. Coming soon!
            </p>
            <Button variant="outline" disabled>Bridge Coming Soon</Button>
          </div>
        </div>
      )}
      
      <Toaster />
    </div>
  );
};

export default SolanaTrading;