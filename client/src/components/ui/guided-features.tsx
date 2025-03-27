import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { useGuideTour, ContextualTooltip, GuideTooltipTrigger } from './contextual-tooltip';
import { 
  CandlestickChart, 
  Bot, 
  Radio, 
  Award, 
  BarChart2, 
  ArrowRightCircle,
  Wallet,
  MessageSquare
} from 'lucide-react';

/**
 * This component showcases the platform's key features with animated contextual tooltips
 * It serves as an interactive guided introduction for new users
 */
export function GuidedFeatures() {
  const guideTour = useGuideTour();
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  
  // Features with their guide steps
  const features = [
    {
      id: 'trading-charts',
      title: 'Interactive Trading Charts',
      description: 'View real-time market data in customizable charts with TradingView integration',
      icon: <CandlestickChart className="h-5 w-5" />,
      guideStep: 1
    },
    {
      id: 'trading-bots',
      title: 'AI Trading Bots',
      description: 'Create and manage automated trading strategies with our no-code bot builder',
      icon: <Bot className="h-5 w-5" />,
      guideStep: 2
    },
    {
      id: 'signals',
      title: 'Trading Signals',
      description: 'Receive curated trading signals with entry, exit, and stop-loss points',
      icon: <Radio className="h-5 w-5" />,
      guideStep: 3
    },
    {
      id: 'leaderboard',
      title: 'Trader Leaderboard',
      description: 'Compete with other traders and climb the rankings with successful trades',
      icon: <Award className="h-5 w-5" />,
      guideStep: 4
    },
    {
      id: 'community',
      title: 'Trader Community',
      description: 'Chat with other traders, share insights, and form trading groups',
      icon: <MessageSquare className="h-5 w-5" />,
      guideStep: 5
    },
    {
      id: 'wallet',
      title: 'Crypto Wallet Integration',
      description: 'Connect your Web3 wallet to trade directly from your holdings',
      icon: <Wallet className="h-5 w-5" />,
      guideStep: 6
    }
  ];
  
  // Update active feature based on guide tour step
  useEffect(() => {
    if (guideTour.isTourActive) {
      const feature = features.find(f => f.guideStep === guideTour.currentStep);
      if (feature) {
        setActiveFeature(feature.id);
      }
    }
  }, [guideTour.isTourActive, guideTour.currentStep]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-6xl mx-auto">
      {features.map((feature) => (
        <ContextualTooltip
          key={feature.id}
          id={`feature-${feature.id}`}
          title={feature.title}
          content={
            <div>
              <p>{feature.description}</p>
              <p className="mt-2 text-primary">
                Click to learn more about this feature.
              </p>
            </div>
          }
          guideStep={feature.guideStep}
          position="top"
          appearance={activeFeature === feature.id ? "success" : "info"}
          pulse={guideTour.isTourActive && guideTour.currentStep === feature.guideStep}
          highlight={true}
          showArrow={true}
          persistent={guideTour.isTourActive}
          autoShow={false}
          trigger={
            <GuideTooltipTrigger 
              type={activeFeature === feature.id ? "success" : "info"}
              pulse={guideTour.isTourActive && guideTour.currentStep === feature.guideStep}
            />
          }
          onAcknowledge={() => setActiveFeature(null)}
        >
          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              activeFeature === feature.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setActiveFeature(feature.id === activeFeature ? null : feature.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="bg-primary/10 p-2 rounded-full">{feature.icon}</div>
                {/* Empty div to balance the layout */}
                <div className="w-5"></div>
              </div>
              <CardTitle className="text-lg mt-2">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
            <CardFooter className="pt-0">
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2 w-full justify-between"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveFeature(feature.id);
                  // This would normally navigate to the feature
                  console.log(`Navigating to ${feature.id}`);
                }}
              >
                Explore <ArrowRightCircle className="h-4 w-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>
        </ContextualTooltip>
      ))}
    </div>
  );
}