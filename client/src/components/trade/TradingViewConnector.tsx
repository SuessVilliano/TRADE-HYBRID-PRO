import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Copy, LinkIcon, CheckCircle2, RefreshCw } from 'lucide-react';

const TradingViewConnector: React.FC = () => {
  const [webhookToken, setWebhookToken] = useState<string>('your-unique-token-will-appear-here');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const { toast } = useToast();

  // Generate a new webhook token
  const generateWebhookToken = () => {
    setIsGenerating(true);
    
    // Simulate API call to generate token
    setTimeout(() => {
      // Generate a random token for demo purposes
      const randomToken = Math.random().toString(36).substring(2, 15) + 
                         Math.random().toString(36).substring(2, 15);
                         
      setWebhookToken(randomToken);
      setIsGenerating(false);
      
      toast({
        title: "Webhook Token Generated",
        description: "Your new TradingView webhook token has been created successfully.",
      });
    }, 1000);
  };

  // Connect TradingView account (would typically use OAuth)
  const connectTradingView = () => {
    // Simulate connecting to TradingView
    setTimeout(() => {
      setIsConnected(true);
      toast({
        title: "TradingView Connected",
        description: "Your TradingView account has been connected successfully.",
      });
    }, 1500);
  };

  // Copy webhook URL to clipboard
  const copyWebhookUrl = () => {
    const webhookUrl = `${window.location.origin}/api/webhooks/tradingview/${webhookToken}`;
    navigator.clipboard.writeText(webhookUrl);
    
    toast({
      title: "Copied to Clipboard",
      description: "Webhook URL has been copied to your clipboard.",
    });
  };

  const webhookUrl = `${window.location.origin}/api/webhooks/tradingview/${webhookToken}`;

  return (
    <Card className="h-full">
      <CardHeader className="bg-gradient-to-r from-blue-800 to-blue-900 text-white pb-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center p-1">
              <img 
                src="/assets/icons/tradingview-logo.png" 
                alt="TradingView" 
                className="max-w-full max-h-full" 
              />
            </div>
            <div>
              <CardTitle className="text-lg">TradingView</CardTitle>
              <CardDescription className="text-blue-200">
                Chart platform webhook integration
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center">
            {isConnected ? (
              <div className="flex items-center text-green-300 text-sm font-medium">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Connected
              </div>
            ) : (
              <div className="flex items-center text-blue-300 text-sm font-medium">
                <LinkIcon className="h-4 w-4 mr-1" />
                Not Connected
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        <p className="text-sm text-slate-500 mb-4">
          Connect your TradingView account to receive signals and alerts directly from your TradingView charts.
        </p>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Your TradingView Webhook URL</p>
            <div className="flex">
              <Input 
                value={webhookUrl} 
                readOnly 
                className="font-mono text-sm bg-slate-50 dark:bg-slate-900"
              />
              <Button variant="outline" size="icon" onClick={copyWebhookUrl} className="ml-2">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Use this URL in your TradingView alert settings
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={generateWebhookToken}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate New Token
                </>
              )}
            </Button>
            
            <p className="text-xs text-slate-500">
              Generating a new token will invalidate the previous one
            </p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2">
        <Button 
          variant="outline" 
          size="sm" 
          asChild
        >
          <a 
            href="https://www.tradingview.com/support/solutions/43000529348-about-webhooks/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center"
          >
            Documentation
          </a>
        </Button>
        
        {!isConnected && (
          <Button onClick={connectTradingView}>
            Connect TradingView
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default TradingViewConnector;