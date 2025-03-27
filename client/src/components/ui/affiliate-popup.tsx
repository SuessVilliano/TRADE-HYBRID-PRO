import { useState, useEffect } from 'react';
import { ScrollArea } from './scroll-area';
import { Button } from './button';
import { X, Copy, Link, ExternalLink, Users, DollarSign, Award } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Input } from './input';
import { formatCurrency, formatDate, cn } from '@/lib/utils';

/**
 * Affiliate Program Popup Component
 * - Displays the trader's affiliate dashboard
 * - Shows referral links and tracking codes
 * - Visualizes earnings from referred traders
 * - Provides withdrawal access for earned commissions
 */
export function AffiliatePopup({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'referrals' | 'earnings'>('overview');
  const [affiliateLink, setAffiliateLink] = useState('https://app.tradehybrid.co/r/trader123');
  const [referralCode, setReferralCode] = useState('TRADER123');
  const [linkCopied, setLinkCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  
  // Mock data for the affiliate dashboard
  const affiliateStats = {
    totalReferrals: 14,
    activeReferrals: 8,
    totalEarnings: 527.35,
    availableBalance: 284.72,
    conversionRate: 57, // percent
    clickCount: 126,
    commissionRate: 30, // percent
  };
  
  const mockReferrals = [
    { id: '1', username: 'crypto_trader', date: new Date(2025, 1, 15), status: 'active', earnings: 125.45 },
    { id: '2', username: 'moon_investor', date: new Date(2025, 1, 10), status: 'active', earnings: 98.20 },
    { id: '3', username: 'btc_hodler', date: new Date(2025, 1, 5), status: 'active', earnings: 85.70 },
    { id: '4', username: 'defi_master', date: new Date(2025, 0, 28), status: 'inactive', earnings: 52.30 },
    { id: '5', username: 'altcoin_hunter', date: new Date(2025, 0, 20), status: 'active', earnings: 68.95 },
    { id: '6', username: 'nft_collector', date: new Date(2025, 0, 15), status: 'active', earnings: 42.15 },
    { id: '7', username: 'whale_alert', date: new Date(2025, 0, 10), status: 'inactive', earnings: 32.80 },
    { id: '8', username: 'trading_bot', date: new Date(2025, 0, 5), status: 'active', earnings: 21.80 },
  ];
  
  const mockEarnings = [
    { id: '1', date: new Date(2025, 2, 15), amount: 45.20, source: 'commission', status: 'pending' },
    { id: '2', date: new Date(2025, 2, 10), amount: 32.75, source: 'commission', status: 'completed' },
    { id: '3', date: new Date(2025, 2, 5), amount: 18.40, source: 'commission', status: 'completed' },
    { id: '4', date: new Date(2025, 1, 28), amount: 26.90, source: 'commission', status: 'completed' },
    { id: '5', date: new Date(2025, 1, 20), amount: 50.00, source: 'bonus', status: 'completed' },
    { id: '6', date: new Date(2025, 1, 15), amount: 22.55, source: 'commission', status: 'completed' },
    { id: '7', date: new Date(2025, 1, 10), amount: 16.75, source: 'commission', status: 'completed' },
    { id: '8', date: new Date(2025, 1, 5), amount: 25.30, source: 'commission', status: 'completed' },
  ];

  // Handle copying the affiliate link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(affiliateLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  // Handle copying the referral code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-4xl h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Affiliate Program</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <div className="border-b px-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="referrals">Referrals</TabsTrigger>
              <TabsTrigger value="earnings">Earnings</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <TabsContent value="overview" className="h-full p-0 m-0">
              <div className="p-6 h-full">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Users className="h-5 w-5 mr-2 text-blue-500" />
                      <h3 className="font-medium">Total Referrals</h3>
                    </div>
                    <p className="text-2xl font-bold">{affiliateStats.totalReferrals}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {affiliateStats.activeReferrals} active users
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <DollarSign className="h-5 w-5 mr-2 text-green-500" />
                      <h3 className="font-medium">Total Earnings</h3>
                    </div>
                    <p className="text-2xl font-bold">{formatCurrency(affiliateStats.totalEarnings)}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatCurrency(affiliateStats.availableBalance)} available
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Award className="h-5 w-5 mr-2 text-amber-500" />
                      <h3 className="font-medium">Commission Rate</h3>
                    </div>
                    <p className="text-2xl font-bold">{affiliateStats.commissionRate}%</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {affiliateStats.conversionRate}% conversion rate
                    </p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4">Your Referral Links</h3>
                  
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <p className="text-sm font-medium mb-2">Affiliate Link</p>
                      <div className="flex gap-2">
                        <Input
                          value={affiliateLink}
                          onChange={(e) => setAffiliateLink(e.target.value)}
                          className="flex-1"
                          readOnly
                        />
                        <Button variant="outline" onClick={handleCopyLink}>
                          {linkCopied ? 'Copied!' : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Share this link to earn {affiliateStats.commissionRate}% on all trades from referred users
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <p className="text-sm font-medium mb-2">Referral Code</p>
                      <div className="flex gap-2">
                        <Input
                          value={referralCode}
                          onChange={(e) => setReferralCode(e.target.value)}
                          className="flex-1"
                          readOnly
                        />
                        <Button variant="outline" onClick={handleCopyCode}>
                          {codeCopied ? 'Copied!' : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Users can enter this code during registration
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4">Promotional Materials</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <p className="font-medium mb-2">Banners & Graphics</p>
                      <p className="text-sm text-muted-foreground mb-3">
                        Download high-quality promotional materials to share with your audience
                      </p>
                      <Button variant="outline" className="w-full">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Assets
                      </Button>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <p className="font-medium mb-2">Marketing Content</p>
                      <p className="text-sm text-muted-foreground mb-3">
                        Access pre-written content, posts, and email templates
                      </p>
                      <Button variant="outline" className="w-full">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Content
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Payout Information</h3>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="font-medium">Available Balance</p>
                        <p className="text-2xl font-bold">{formatCurrency(affiliateStats.availableBalance)}</p>
                      </div>
                      <Button>Request Payout</Button>
                    </div>
                    
                    <div className="text-sm">
                      <p className="mb-2"><strong>Payout Method:</strong> Crypto Wallet</p>
                      <p className="mb-2"><strong>Address:</strong> 0x1a2b...3c4d</p>
                      <p className="text-xs text-muted-foreground">
                        Minimum payout amount: {formatCurrency(50)}. Payouts are processed every Monday.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="referrals" className="h-full p-6 m-0">
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Your Referrals</h3>
                <p className="text-sm text-muted-foreground">
                  Track the performance of your referred traders and earned commissions
                </p>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-4 gap-4 p-3 bg-muted/50 text-sm font-medium">
                  <div>User</div>
                  <div>Date Joined</div>
                  <div>Status</div>
                  <div>Total Earnings</div>
                </div>
                
                <ScrollArea className="h-[calc(100vh-370px)]">
                  {mockReferrals.map((referral) => (
                    <div 
                      key={referral.id} 
                      className="grid grid-cols-4 gap-4 p-3 border-t text-sm"
                    >
                      <div className="font-medium">{referral.username}</div>
                      <div>{formatDate(referral.date.toString())}</div>
                      <div>
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-xs",
                          referral.status === 'active' ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-800"
                        )}>
                          {referral.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="text-green-600">{formatCurrency(referral.earnings)}</div>
                    </div>
                  ))}
                </ScrollArea>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Referral Analytics</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <p className="text-sm font-medium mb-2">Clicks</p>
                    <p className="text-2xl font-bold">{affiliateStats.clickCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last 30 days
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <p className="text-sm font-medium mb-2">Conversions</p>
                    <p className="text-2xl font-bold">{affiliateStats.totalReferrals}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {affiliateStats.conversionRate}% conversion rate
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <p className="text-sm font-medium mb-2">Earnings per Referral</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(affiliateStats.totalEarnings / affiliateStats.totalReferrals)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Average earnings per user
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="earnings" className="h-full p-6 m-0">
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium mb-1">Earnings History</h3>
                  <p className="text-sm text-muted-foreground">
                    Track your commission earnings and payouts
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-xl font-bold">{formatCurrency(affiliateStats.totalEarnings)}</p>
                </div>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-4 gap-4 p-3 bg-muted/50 text-sm font-medium">
                  <div>Date</div>
                  <div>Amount</div>
                  <div>Source</div>
                  <div>Status</div>
                </div>
                
                <ScrollArea className="h-[calc(100vh-370px)]">
                  {mockEarnings.map((earning) => (
                    <div 
                      key={earning.id} 
                      className="grid grid-cols-4 gap-4 p-3 border-t text-sm"
                    >
                      <div>{formatDate(earning.date.toString())}</div>
                      <div className="text-green-600">{formatCurrency(earning.amount)}</div>
                      <div className="capitalize">{earning.source}</div>
                      <div>
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-xs",
                          earning.status === 'completed' ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                        )}>
                          {earning.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Request Payout</h3>
                
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="font-medium">Available Balance</p>
                      <p className="text-2xl font-bold">{formatCurrency(affiliateStats.availableBalance)}</p>
                    </div>
                    <Button>Request Payout</Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium mb-2">Payout Method</p>
                      <div className="flex items-center space-x-2">
                        <input type="radio" id="crypto" name="payout_method" defaultChecked />
                        <label htmlFor="crypto">Crypto Wallet</label>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <input type="radio" id="bank" name="payout_method" />
                        <label htmlFor="bank">Bank Transfer</label>
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-medium mb-2">Payout Schedule</p>
                      <p className="text-muted-foreground">
                        Payouts are processed every Monday for requests submitted by Sunday at 11:59 PM UTC.
                      </p>
                      <p className="text-muted-foreground mt-2">
                        Minimum payout amount: {formatCurrency(50)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}