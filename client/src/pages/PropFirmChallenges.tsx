import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  DollarSign, 
  ArrowLeft, 
  Calendar, 
  Percent, 
  TrendingDown, 
  Info, 
  Briefcase, 
  Loader2,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  BarChart,
  AlignLeft,
  Users
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

const PropFirmChallenges: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchChallenges();
  }, []);

  // Fetch available challenges
  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/prop-firm/challenges');
      
      if (!response.ok) {
        throw new Error('Failed to fetch challenges');
      }
      
      const data = await response.json();
      setChallenges(data);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      toast({
        title: 'Error',
        description: 'Failed to load challenges. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Navigate to challenge signup page
  const goToSignup = (challengeId: number) => {
    navigate(`/prop-firm/challenges/${challengeId}/signup`);
  };

  // Filter challenges by market type
  const filteredChallenges = filter === 'all' 
    ? challenges 
    : challenges.filter(c => c.marketType === filter);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Determine the most suitable account size to display in the card
  const getDisplayAccountSize = (accountSizes: number[]) => {
    if (!accountSizes || accountSizes.length === 0) return '$25,000';
    // If there are multiple account sizes, show the middle one or the first one
    const sizeToShow = accountSizes.length > 2 
      ? accountSizes[Math.floor(accountSizes.length / 2)] 
      : accountSizes[0];
    return formatCurrency(sizeToShow);
  };

  return (
    <div className="container px-4 mx-auto py-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            className="mr-4"
            onClick={() => navigate('/prop-firm')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold">Trading Challenges</h1>
            <p className="text-muted-foreground">
              Choose a challenge that fits your trading style
            </p>
          </div>
        </div>
        
        {/* Filter controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Market Type:</span>
            <Select 
              value={filter} 
              onValueChange={setFilter}
              defaultValue="all"
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Markets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Markets</SelectItem>
                <SelectItem value="futures">Futures</SelectItem>
                <SelectItem value="forex">Forex</SelectItem>
                <SelectItem value="crypto">Crypto</SelectItem>
                <SelectItem value="stocks">Stocks</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            variant="outline" 
            onClick={fetchChallenges}
            className="flex items-center"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Refresh
          </Button>
        </div>
        
        {/* Challenge cards */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground text-lg">Loading challenge details...</p>
          </div>
        ) : filteredChallenges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChallenges.map((challenge) => (
              <Card key={challenge.id} className="overflow-hidden flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        {challenge.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {challenge.marketType.charAt(0).toUpperCase() + challenge.marketType.slice(1)} Trading
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={
                        challenge.marketType === 'futures' ? 'default' :
                        challenge.marketType === 'forex' ? 'secondary' :
                        challenge.marketType === 'crypto' ? 'destructive' : 
                        'outline'
                      }
                    >
                      {challenge.marketType.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pb-0 flex-grow">
                  <p className="text-sm text-muted-foreground mb-4">
                    {challenge.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-primary/5 p-3 rounded-lg flex flex-col justify-center items-center text-center">
                      <DollarSign className="h-5 w-5 text-primary mb-1" />
                      <p className="text-sm font-medium">{getDisplayAccountSize(challenge.accountSizes)}</p>
                      <p className="text-xs text-muted-foreground">Account Size</p>
                    </div>
                    
                    <div className="bg-primary/5 p-3 rounded-lg flex flex-col justify-center items-center text-center">
                      <Percent className="h-5 w-5 text-primary mb-1" />
                      <p className="text-sm font-medium">{challenge.targetProfitPhase1}%</p>
                      <p className="text-xs text-muted-foreground">Profit Target</p>
                    </div>
                    
                    <div className="bg-primary/5 p-3 rounded-lg flex flex-col justify-center items-center text-center">
                      <TrendingDown className="h-5 w-5 text-primary mb-1" />
                      <p className="text-sm font-medium">{challenge.maxTotalDrawdown}%</p>
                      <p className="text-xs text-muted-foreground">Max Drawdown</p>
                    </div>
                    
                    <div className="bg-primary/5 p-3 rounded-lg flex flex-col justify-center items-center text-center">
                      <Calendar className="h-5 w-5 text-primary mb-1" />
                      <p className="text-sm font-medium">{challenge.durationDays}</p>
                      <p className="text-xs text-muted-foreground">Days to Complete</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Profit Split:</span>
                    <span className="font-medium">{challenge.profitSplit}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-medium text-green-600">${challenge.price}</span>
                  </div>
                </CardContent>
                
                <CardFooter className="pt-4 mt-auto">
                  <Button 
                    className="w-full" 
                    onClick={() => goToSignup(challenge.id)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Join Challenge
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center bg-muted/30 rounded-lg p-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Challenges Found</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              There are no challenges available for the selected filter.
              Please try a different filter or check back later.
            </p>
            <Button onClick={() => setFilter('all')}>
              View All Challenges
            </Button>
          </div>
        )}
        
        {/* Learn more section */}
        <div className="mt-12 bg-primary/5 p-6 rounded-lg border border-primary/10">
          <h2 className="text-2xl font-bold mb-4">How Prop Firm Challenges Work</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mr-2">1</div>
                <h3 className="font-semibold">Complete the Challenge</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Pass our trading challenge by reaching the profit target while staying within the drawdown limits.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mr-2">2</div>
                <h3 className="font-semibold">Get Funded</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                After passing, you'll receive access to a funded account with our capital to trade with.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mr-2">3</div>
                <h3 className="font-semibold">Keep the Profits</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Keep up to 85% of your trading profits with zero personal capital at risk.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropFirmChallenges;