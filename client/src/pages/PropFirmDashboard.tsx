import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Shield, Info, AlertTriangle } from 'lucide-react';

const PropFirmDashboardPage: React.FC = () => {
  const handleDashboardAccess = () => {
    window.open('https://hybridfundingdashboard.propaccount.com/en/signin', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl border-0">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <ExternalLink className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Access Your HybridFunding Dashboard</CardTitle>
          <CardDescription className="text-lg">
            You're about to be redirected to your personal prop trading account
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Leaving Trade Hybrid Platform</h3>
                <p className="text-blue-800 text-sm">
                  You will be redirected to HybridFunding.co, an independent prop trading firm. 
                  Trade Hybrid serves as a gateway but is not affiliated with or responsible for HybridFunding's services.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">Important Disclaimer</h3>
                <p className="text-amber-800 text-sm">
                  HybridFunding.co operates independently. All trading activities, account management, 
                  and financial transactions are subject to HybridFunding's terms and conditions. 
                  Trade Hybrid is not liable for any activities on the HybridFunding platform.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Secure connection to HybridFunding.co</span>
              <Badge variant="outline" className="text-xs">SSL Encrypted</Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Direct access to your prop trading account</span>
              <Badge variant="outline" className="text-xs">External Site</Badge>
            </div>
          </div>

          <div className="pt-4">
            <Button 
              onClick={handleDashboardAccess}
              className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg font-semibold"
              size="lg"
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              Access HybridFunding Dashboard
            </Button>
            
            <p className="text-xs text-muted-foreground text-center mt-3">
              By clicking above, you acknowledge that you understand this will redirect you to an external website 
              operated by HybridFunding.co, which is independent of Trade Hybrid.
            </p>
          </div>

          <Separator />

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              <strong>Legal Notice:</strong> Trade Hybrid provides platform access only. 
              All prop trading services, challenges, and funded accounts are provided by HybridFunding.co. 
              Users are subject to HybridFunding's terms of service and risk disclosures.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropFirmDashboardPage;