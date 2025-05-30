import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Swords, ExternalLink, Users, Award, Target } from 'lucide-react';

const PodcastSection: React.FC = () => {
  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Trade House Battles</h2>
        <p className="text-muted-foreground">Compete with traders worldwide and win exciting prizes in our trading competitions.</p>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Trading Competitions</CardTitle>
              <CardDescription>Join live battles and showcase your trading skills</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8 border rounded-md bg-card">
            <div className="text-center mb-6">
              <Swords className="h-20 w-20 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Enter Trade House Battles</h3>
              <p className="text-muted-foreground mb-4">
                Join our competitive trading platform where traders battle in real-time competitions with cash prizes and recognition.
              </p>
            </div>
            <Button 
              size="lg" 
              className="gap-2"
              onClick={() => window.open('https://battles.hybridfunding.co', '_blank')}
            >
              <Trophy className="h-5 w-5" />
              Join Battles Now
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <BattleFeatureCard 
          title="Live Competitions"
          description="Join real-time trading battles with traders from around the world and compete for top rankings."
          icon={<Users className="h-6 w-6" />}
        />
        <BattleFeatureCard 
          title="Cash Prizes"
          description="Win exciting cash prizes and rewards based on your trading performance in competitions."
          icon={<Award className="h-6 w-6" />}
        />
        <BattleFeatureCard 
          title="Skill-Based Matching"
          description="Get matched with traders of similar skill levels for fair and competitive battles."
          icon={<Target className="h-6 w-6" />}
        />
        <BattleFeatureCard 
          title="Leaderboards"
          description="Track your progress and climb the global leaderboards to showcase your trading prowess."
          icon={<Trophy className="h-6 w-6" />}
        />
        <BattleFeatureCard 
          title="Multiple Markets"
          description="Compete across various markets including forex, crypto, stocks, and commodities."
          icon={<Swords className="h-6 w-6" />}
        />
        <BattleFeatureCard 
          title="Community"
          description="Connect with fellow traders, share strategies, and learn from the trading community."
          icon={<Users className="h-6 w-6" />}
        />
      </div>
    </div>
  );
};

const BattleFeatureCard: React.FC<{ title: string; description: string; icon: React.ReactNode }> = ({ title, description, icon }) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-primary">{icon}</div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
      <div className="p-4 pt-0 mt-auto">
        <Button variant="outline" className="w-full" onClick={() => window.open('https://battles.hybridfunding.co', '_blank')}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Enter Battle
        </Button>
      </div>
    </Card>
  );
};

export default PodcastSection;