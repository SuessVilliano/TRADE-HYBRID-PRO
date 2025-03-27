import { useState, useEffect } from 'react';
import { ScrollArea } from './scroll-area';
import { Button } from './button';
import { X, Copy, ExternalLink, Wallet, ArrowUpRight, ArrowDownLeft, BarChart3, History, CreditCard, Eye, EyeOff } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Input } from './input';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';

/**
 * Crypto Wallet Popup Component
 * - Displays connected wallet information and balances
 * - Shows transaction history
 * - Provides deposit and withdrawal functionality
 * - Supports multiple cryptocurrencies and tokens
 */
export function WalletPopup({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'deposit' | 'withdraw' | 'history'>('overview');
  const [walletAddress, setWalletAddress] = useState('0x71C7656EC7ab88b098defB751B7401B5f6d8976F');
  const [addressCopied, setAddressCopied] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [selectedToken, setSelectedToken] = useState('ETH');
  const [amount, setAmount] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [chain, setChain] = useState('Ethereum');
  
  // Mock wallet data
  const walletData = {
    totalBalance: 15782.45,
    totalBalanceFiat: 15782.45,
    tokens: [
      { symbol: 'ETH', name: 'Ethereum', balance: 5.24, value: 10480.00, icon: '🔷' },
      { symbol: 'BTC', name: 'Bitcoin', balance: 0.12, value: 4320.00, icon: '₿' },
      { symbol: 'USDT', name: 'Tether', balance: 982.45, value: 982.45, icon: '💵' },
    ],
    transactions: [
      { id: '1', type: 'deposit', token: 'ETH', amount: 2.0, value: 4000.00, date: new Date(2025, 2, 15), hash: '0x71C7...976F', status: 'completed' },
      { id: '2', type: 'withdraw', token: 'USDT', amount: 500.0, value: 500.00, date: new Date(2025, 2, 10), hash: '0x83D9...457A', status: 'completed' },
      { id: '3', type: 'deposit', token: 'BTC', amount: 0.05, value: 1750.00, date: new Date(2025, 2, 5), hash: '0x92E8...123B', status: 'completed' },
      { id: '4', type: 'trade', token: 'ETH', amount: 1.5, value: 3000.00, date: new Date(2025, 1, 28), hash: '0x45F7...789C', status: 'completed' },
      { id: '5', type: 'withdraw', token: 'ETH', amount: 0.5, value: 1000.00, date: new Date(2025, 1, 20), hash: '0x62A3...456D', status: 'completed' },
      { id: '6', type: 'deposit', token: 'USDT', amount: 1000.0, value: 1000.00, date: new Date(2025, 1, 15), hash: '0x74B2...567E', status: 'completed' },
    ],
    networks: ['Ethereum', 'Binance Smart Chain', 'Polygon', 'Arbitrum', 'Optimism'],
  };

  // Handle copying the wallet address
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setAddressCopied(true);
    setTimeout(() => setAddressCopied(false), 2000);
  };

  // Handle form submission for withdrawal
  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !destinationAddress) return;
    
    alert(`Withdrawal request submitted: ${amount} ${selectedToken} to ${destinationAddress} on ${chain}`);
    
    // Reset form
    setAmount('');
    setDestinationAddress('');
  };

  // Get token icon
  const getTokenIcon = (symbol: string) => {
    const token = walletData.tokens.find(t => t.symbol === symbol);
    return token ? token.icon : '💰';
  };

  // Format transaction type
  const formatTransactionType = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case 'withdraw':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'trade':
        return <BarChart3 className="h-4 w-4 text-blue-500" />;
      default:
        return <History className="h-4 w-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-3xl h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Crypto Wallet</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <div className="border-b px-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="deposit">Deposit</TabsTrigger>
              <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <TabsContent value="overview" className="h-full p-6 m-0">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium">Connected Wallet</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowBalance(!showBalance)}
                  >
                    {showBalance ? (
                      <><EyeOff className="h-4 w-4 mr-2" /> Hide Balance</>
                    ) : (
                      <><Eye className="h-4 w-4 mr-2" /> Show Balance</>
                    )}
                  </Button>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <Wallet className="h-5 w-5 mr-2 text-primary" />
                      <div>
                        <p className="font-medium">
                          {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                        </p>
                        <p className="text-xs text-muted-foreground">MetaMask</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleCopyAddress}>
                      {addressCopied ? 'Copied!' : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Total Balance</p>
                    <p className="text-2xl font-bold">
                      {showBalance ? formatCurrency(walletData.totalBalanceFiat) : '••••••'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Your Assets</h3>
                
                <div className="space-y-3">
                  {walletData.tokens.map((token) => (
                    <div key={token.symbol} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                            <span className="text-lg">{token.icon}</span>
                          </div>
                          <div>
                            <p className="font-medium">{token.name}</p>
                            <p className="text-xs text-muted-foreground">{token.symbol}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {showBalance ? token.balance : '•••'} {token.symbol}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {showBalance ? formatCurrency(token.value) : '•••••'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 flex justify-between">
                  <Button onClick={() => setActiveTab('deposit')}>
                    <ArrowDownLeft className="h-4 w-4 mr-2" />
                    Deposit
                  </Button>
                  <Button onClick={() => setActiveTab('withdraw')}>
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Withdraw
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="deposit" className="h-full p-6 m-0">
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">Deposit Crypto</h3>
                
                <div className="border rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium mb-4">Select Token</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {walletData.tokens.map((token) => (
                      <div 
                        key={token.symbol}
                        className={cn(
                          "border rounded-lg p-3 cursor-pointer",
                          selectedToken === token.symbol && "border-primary bg-primary/5"
                        )}
                        onClick={() => setSelectedToken(token.symbol)}
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                            <span className="text-lg">{token.icon}</span>
                          </div>
                          <div>
                            <p className="font-medium">{token.symbol}</p>
                            <p className="text-xs text-muted-foreground">{token.name}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium mb-4">Select Network</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {walletData.networks.map((network) => (
                      <div 
                        key={network}
                        className={cn(
                          "border rounded-lg p-3 cursor-pointer",
                          chain === network && "border-primary bg-primary/5"
                        )}
                        onClick={() => setChain(network)}
                      >
                        <p className="font-medium">{network}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">Your Deposit Address ({selectedToken})</p>
                  
                  <div className="flex gap-2 mb-4">
                    <Input
                      value={walletAddress}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button variant="outline" onClick={handleCopyAddress}>
                      {addressCopied ? 'Copied!' : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  <div className="flex justify-center mb-4">
                    <div className="w-40 h-40 bg-slate-200 rounded-lg flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">QR Code</p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>• Only send {selectedToken} to this address on the {chain} network</p>
                    <p>• Sending any other token may result in permanent loss</p>
                    <p>• Minimum deposit: 0.001 {selectedToken}</p>
                    <p>• Deposits will be credited after 12 network confirmations</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="withdraw" className="h-full p-6 m-0">
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">Withdraw Crypto</h3>
                
                <form onSubmit={handleWithdraw}>
                  <div className="border rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium mb-4">Select Token</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {walletData.tokens.map((token) => (
                        <div 
                          key={token.symbol}
                          className={cn(
                            "border rounded-lg p-3 cursor-pointer",
                            selectedToken === token.symbol && "border-primary bg-primary/5"
                          )}
                          onClick={() => setSelectedToken(token.symbol)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                                <span className="text-lg">{token.icon}</span>
                              </div>
                              <div>
                                <p className="font-medium">{token.symbol}</p>
                                <p className="text-xs text-muted-foreground">{token.name}</p>
                              </div>
                            </div>
                            <div className="text-right text-sm">
                              <p className="font-medium">
                                {showBalance ? token.balance : '•••'} {token.symbol}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium mb-4">Select Network</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {walletData.networks.map((network) => (
                        <div 
                          key={network}
                          className={cn(
                            "border rounded-lg p-3 cursor-pointer",
                            chain === network && "border-primary bg-primary/5"
                          )}
                          onClick={() => setChain(network)}
                        >
                          <p className="font-medium">{network}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium mb-2">Withdrawal Details</p>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm mb-1 block">
                          Destination Address
                        </label>
                        <Input
                          value={destinationAddress}
                          onChange={(e) => setDestinationAddress(e.target.value)}
                          placeholder={`Enter ${selectedToken} address`}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm mb-1 block">
                          Amount
                        </label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            min="0"
                            step="0.000001"
                            required
                          />
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => {
                              const token = walletData.tokens.find(t => t.symbol === selectedToken);
                              if (token) setAmount(token.balance.toString());
                            }}
                          >
                            MAX
                          </Button>
                        </div>
                        
                        <div className="flex justify-between mt-1">
                          <p className="text-xs text-muted-foreground">
                            Available: {showBalance ? `${walletData.tokens.find(t => t.symbol === selectedToken)?.balance} ${selectedToken}` : '•••'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ≈ {amount && showBalance ? formatCurrency(parseFloat(amount) * (walletData.tokens.find(t => t.symbol === selectedToken)?.value || 0) / (walletData.tokens.find(t => t.symbol === selectedToken)?.balance || 1)) : '$0.00'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground space-y-2 mb-4">
                    <p>• Network Fee: 0.0005 {selectedToken}</p>
                    <p>• Minimum withdrawal: 0.001 {selectedToken}</p>
                    <p>• Withdrawals are processed within 30 minutes</p>
                    <p>• Please verify the address before confirming</p>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={!amount || !destinationAddress}>
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Withdraw {amount} {selectedToken}
                  </Button>
                </form>
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="h-full p-0 m-0">
              <div className="border-b p-4">
                <h3 className="text-lg font-medium">Transaction History</h3>
              </div>
              
              <div className="border-b grid grid-cols-6 gap-4 p-3 bg-muted/50 text-sm font-medium">
                <div>Type</div>
                <div>Token</div>
                <div>Amount</div>
                <div>Value</div>
                <div>Date</div>
                <div>Status</div>
              </div>
              
              <ScrollArea className="h-[calc(100vh-290px)]">
                {walletData.transactions.map((tx) => (
                  <div 
                    key={tx.id} 
                    className="grid grid-cols-6 gap-4 p-3 border-b text-sm items-center"
                  >
                    <div className="flex items-center">
                      {formatTransactionType(tx.type)}
                      <span className="ml-2 capitalize">{tx.type}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-1">{getTokenIcon(tx.token)}</span>
                      <span>{tx.token}</span>
                    </div>
                    <div>{tx.amount}</div>
                    <div>{formatCurrency(tx.value)}</div>
                    <div>{formatDate(tx.date.toString())}</div>
                    <div>
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-xs",
                        tx.status === 'completed' ? "bg-green-100 text-green-800" : 
                        tx.status === 'pending' ? "bg-amber-100 text-amber-800" : 
                        "bg-red-100 text-red-800"
                      )}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </ScrollArea>
              
              <div className="p-4 border-t">
                <Button variant="outline" className="flex items-center">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View All Transactions
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}