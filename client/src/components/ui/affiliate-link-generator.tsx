import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useAffiliateTracking, AffiliateService } from '@/lib/services/affiliate-service';
import { Copy, Link as LinkIcon, Share2, Check, Twitter, Facebook, Linkedin } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface AffiliateLinkGeneratorProps {
  userId?: string;
  username?: string;
  customPrefix?: string;
  showStatsPanel?: boolean;
}

export function AffiliateLinkGenerator({
  userId,
  username,
  customPrefix = 'thc',
  showStatsPanel = true
}: AffiliateLinkGeneratorProps) {
  const [customCode, setCustomCode] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [useCustomCode, setUseCustomCode] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  
  // Mock stats data
  const [affiliateStats, setAffiliateStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
    conversionRate: 0,
  });
  
  const { generateReferralLink, trackReferral, currentReferralCode } = useAffiliateTracking();

  useEffect(() => {
    // Generate initial referral code based on user info or random value
    const initialCode = userId || username || `${customPrefix}${Math.random().toString(36).substring(2, 8)}`;
    setReferralCode(initialCode);
    
    // Simulate loading affiliate stats
    setTimeout(() => {
      setAffiliateStats({
        totalReferrals: Math.floor(Math.random() * 50),
        activeReferrals: Math.floor(Math.random() * 20),
        totalEarnings: parseFloat((Math.random() * 1000).toFixed(2)),
        pendingEarnings: parseFloat((Math.random() * 100).toFixed(2)),
        conversionRate: parseFloat((Math.random() * 20).toFixed(1)),
      });
      setStatsVisible(true);
    }, 1500);
  }, [userId, username, customPrefix]);

  // Generate the full referral URL
  const referralUrl = generateReferralLink(useCustomCode && customCode ? customCode : referralCode);

  // Handle copying the referral link
  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Handle updating custom code
  const updateCustomCode = () => {
    if (customCode.trim() === '') {
      setUseCustomCode(false);
      return;
    }
    setUseCustomCode(true);
  };

  // Handle social media sharing
  const shareViaTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent('Join me on Trade Hybrid, the ultimate AI-driven trading metaverse!')}`, '_blank');
  };

  const shareViaFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`, '_blank');
  };

  const shareViaLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-blue-500" />
            Affiliate Link Generator
          </CardTitle>
          <CardDescription>
            Share your referral link and earn commissions when new users join through your link.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="customCode">Custom Referral Code</Label>
              <div className="flex items-center space-x-2">
                <Label htmlFor="custom-code-switch" className="text-sm text-gray-500">Use Custom Code</Label>
                <Switch
                  id="custom-code-switch"
                  checked={useCustomCode}
                  onCheckedChange={setUseCustomCode}
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Input
                id="customCode"
                placeholder="Enter a memorable code (e.g., yourname123)"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                className="flex-1"
                disabled={!useCustomCode}
              />
              <Button variant="outline" onClick={updateCustomCode} disabled={!useCustomCode}>
                Update
              </Button>
            </div>
          </div>

          <div className="pt-2">
            <Label>Your Referral Link</Label>
            <div className="flex mt-1.5">
              <Input
                value={referralUrl}
                readOnly
                className="flex-1 font-mono text-sm bg-slate-100 dark:bg-slate-800"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" onClick={copyToClipboard} className="ml-2 flex items-center">
                      {copySuccess ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{copySuccess ? 'Copied!' : 'Copy to clipboard'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={shareViaTwitter}>
              <Twitter className="h-4 w-4" />
              <span>Twitter</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={shareViaFacebook}>
              <Facebook className="h-4 w-4" />
              <span>Facebook</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={shareViaLinkedIn}>
              <Linkedin className="h-4 w-4" />
              <span>LinkedIn</span>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50 dark:bg-slate-800/50 border-t px-6 py-3">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <LinkIcon className="h-3.5 w-3.5" />
              <span>Your unique affiliate ID: <span className="font-mono font-semibold">{useCustomCode ? customCode : referralCode}</span></span>
            </div>
          </div>
        </CardFooter>
      </Card>

      {showStatsPanel && statsVisible && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Affiliate Performance</CardTitle>
            <CardDescription>
              Track your referral metrics and earnings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-3 bg-slate-50 dark:bg-slate-800">
                <div className="text-sm text-slate-500 dark:text-slate-400">Total Referrals</div>
                <div className="text-2xl font-bold mt-1">{affiliateStats.totalReferrals}</div>
              </div>
              <div className="border rounded-lg p-3 bg-slate-50 dark:bg-slate-800">
                <div className="text-sm text-slate-500 dark:text-slate-400">Active Referrals</div>
                <div className="text-2xl font-bold mt-1">{affiliateStats.activeReferrals}</div>
              </div>
              <div className="border rounded-lg p-3 bg-slate-50 dark:bg-slate-800">
                <div className="text-sm text-slate-500 dark:text-slate-400">Total Earnings</div>
                <div className="text-2xl font-bold text-green-600 mt-1">{affiliateStats.totalEarnings.toFixed(2)} THC</div>
              </div>
              <div className="border rounded-lg p-3 bg-slate-50 dark:bg-slate-800">
                <div className="text-sm text-slate-500 dark:text-slate-400">Pending Earnings</div>
                <div className="text-2xl font-bold text-amber-600 mt-1">{affiliateStats.pendingEarnings.toFixed(2)} THC</div>
              </div>
            </div>
            <div className="mt-4 p-3 border rounded-lg bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium">Conversion Rate</div>
                <div className="text-sm font-medium">{affiliateStats.conversionRate}%</div>
              </div>
              <div className="mt-2 h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full" 
                  style={{ width: `${Math.min(affiliateStats.conversionRate * 5, 100)}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}