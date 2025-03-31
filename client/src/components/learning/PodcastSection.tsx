import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Podcast, PlayCircle, ExternalLink } from 'lucide-react';

const PodcastSection: React.FC = () => {
  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Trading Freedom Podcast</h2>
        <p className="text-muted-foreground">Expert interviews and insights to improve your trading success.</p>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Podcast className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Latest Episodes</CardTitle>
              <CardDescription>Fresh trading knowledge and market insights</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8 border rounded-md bg-card">
            <div className="text-center mb-6">
              <Podcast className="h-20 w-20 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Listen on Wattbaa Platform</h3>
              <p className="text-muted-foreground mb-4">
                All episodes of the Trading Freedom Podcast are hosted on the Wattbaa platform for an enhanced listening experience.
              </p>
            </div>
            <Button 
              size="lg" 
              className="gap-2"
              onClick={() => window.open('https://wattbaa.profit-vibe.com/album/17695/meta-sv/trading-for-freedom-podcast-series', '_blank')}
            >
              <PlayCircle className="h-5 w-5" />
              Listen on Wattbaa
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PodcastFeatureCard 
          title="Expert Interviews"
          description="Hear from successful traders, fund managers, and financial experts about their journeys and strategies."
        />
        <PodcastFeatureCard 
          title="Market Analysis"
          description="Get deep dives into current market conditions, trends, and potential opportunities across various asset classes."
        />
        <PodcastFeatureCard 
          title="Trading Psychology"
          description="Learn how to master your emotions and develop the mindset of a successful trader."
        />
        <PodcastFeatureCard 
          title="Risk Management"
          description="Discover proven strategies to protect your capital and optimize your risk-reward ratios."
        />
        <PodcastFeatureCard 
          title="Technical Analysis"
          description="Enhance your charting skills with detailed breakdowns of patterns, indicators, and trading setups."
        />
        <PodcastFeatureCard 
          title="Trading Lifestyle"
          description="Navigate the challenges of trading as a career and building sustainable success."
        />
      </div>
    </div>
  );
};

const PodcastFeatureCard: React.FC<{ title: string; description: string }> = ({ title, description }) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
      <div className="p-4 pt-0 mt-auto">
        <Button variant="outline" className="w-full" onClick={() => window.open('https://wattbaa.profit-vibe.com/album/17695/meta-sv/trading-for-freedom-podcast-series', '_blank')}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Explore Episodes
        </Button>
      </div>
    </Card>
  );
};

export default PodcastSection;