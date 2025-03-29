import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { ContextualTooltip } from './contextual-tooltip';
import { Share2, Copy, CheckCircle, ArrowUpRight, Users } from 'lucide-react';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';

export function AffiliateSystem() {
  const { account, active } = useWeb3React<Web3Provider>();
  const [referralLink, setReferralLink] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [earnings, setEarnings] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Generate a referral link based on connected wallet or randomly
  useEffect(() => {
    const customDomain = 'https://pro.tradehybrid.club';
    if (active && account) {
      setReferralLink(`${customDomain}?ref=${account.substring(2, 10)}`);
      
      // Simulate loading referral data
      // In a real implementation, you would fetch this from an API
      loadReferralData(account);
    } else {
      // Use a temporary random ID if not connected
      const randomId = Math.random().toString(36).substring(2, 10);
      setReferralLink(`${customDomain}?ref=${randomId}`);
    }
  }, [active, account]);
  
  // Show tooltip on first visit
  useEffect(() => {
    const hasSeenAffiliateTooltip = localStorage.getItem('hasSeenAffiliateTooltip');
    if (!hasSeenAffiliateTooltip) {
      setShowTooltip(true);
    }
  }, []);

  // Simulate loading referral data
  const loadReferralData = (address: string) => {
    // This would be an API call in a real implementation
    setTimeout(() => {
      // Mock data - replace with real data from API
      setReferrals([
        {
          id: 1,
          address: '0x' + Math.random().toString(36).substring(2, 15),
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'active',
          earnings: (Math.random() * 0.05).toFixed(4)
        },
        {
          id: 2,
          address: '0x' + Math.random().toString(36).substring(2, 15),
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'active',
          earnings: (Math.random() * 0.03).toFixed(4)
        }
      ]);
      
      // Calculate total earnings
      setEarnings(0.0237); // Example value
    }, 1000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTooltipAcknowledge = () => {
    setShowTooltip(false);
    localStorage.setItem('hasSeenAffiliateTooltip', 'true');
  };

  // Helper to truncate wallet address
  const truncateAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="relative">
      <ContextualTooltip
        id="affiliate-system-tooltip"
        title="Earn with Referrals"
        content={
          <div className="space-y-2">
            <p>Share your unique referral link to invite friends to Trade Hybrid!</p>
            <p>You'll earn 20% of their trading fees for the first 3 months.</p>
          </div>
        }
        position="bottom"
        highlight={true}
        showArrow={true}
        autoShow={showTooltip}
        onAcknowledge={handleTooltipAcknowledge}
        persistent={false}
      >
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={() => setShowPanel(!showPanel)}
        >
          <Share2 className="h-4 w-4" />
          <span className="hidden md:inline">Affiliate Program</span>
          {earnings > 0 && (
            <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-xs px-2 py-0.5 rounded-full">
              {earnings.toFixed(4)} ETH
            </span>
          )}
        </Button>
      </ContextualTooltip>

      {showPanel && (
        <Card className="absolute right-0 mt-2 z-50 w-full max-w-md shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Affiliate Program
              </CardTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7" 
                onClick={() => setShowPanel(false)}
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
              </Button>
            </div>
            <CardDescription>
              Share your referral link and earn rewards
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="referral-link">Your Referral Link</Label>
              <div className="flex gap-2">
                <Input
                  id="referral-link"
                  value={referralLink}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyToClipboard}
                  title="Copy to clipboard"
                >
                  {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                When someone signs up using your link, you'll earn 20% of their trading fees.
              </p>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted rounded-md">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Your Referrals</div>
                  <div className="text-xs text-muted-foreground">
                    {referrals.length} active users
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-right">Total Earnings</div>
                <div className="text-sm font-bold text-right text-green-600 dark:text-green-400">
                  {earnings.toFixed(4)} ETH
                </div>
              </div>
            </div>
            
            {referrals.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Recent Referrals</h4>
                <div className="space-y-2">
                  {referrals.map((referral) => (
                    <div 
                      key={referral.id}
                      className="p-2 border rounded-md text-xs flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium">{truncateAddress(referral.address)}</div>
                        <div className="text-muted-foreground">{referral.date}</div>
                      </div>
                      <div>
                        <div className="text-green-600 dark:text-green-400 font-medium text-right">
                          +{referral.earnings} ETH
                        </div>
                        <div className="flex items-center justify-end gap-1 text-muted-foreground">
                          <span className={`w-2 h-2 rounded-full ${referral.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                          {referral.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="border-t pt-3">
              <h4 className="text-sm font-medium mb-2">Program Details</h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <ArrowUpRight className="h-3 w-3 text-green-500 shrink-0 mt-0.5" />
                  20% commission on all referred trading fees
                </li>
                <li className="flex items-start gap-2">
                  <ArrowUpRight className="h-3 w-3 text-green-500 shrink-0 mt-0.5" />
                  Instant payout to your connected wallet
                </li>
                <li className="flex items-start gap-2">
                  <ArrowUpRight className="h-3 w-3 text-green-500 shrink-0 mt-0.5" />
                  Higher rates for high-volume referrers
                </li>
              </ul>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t pt-4">
            <Button variant="outline" onClick={() => setShowPanel(false)}>
              Close
            </Button>
            <Button onClick={copyToClipboard}>
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}