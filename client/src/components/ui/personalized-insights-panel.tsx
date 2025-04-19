import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useViewport } from '@/lib/services/responsive-layout-service';
import { aiInsightsService, PersonalizedInsight } from '@/lib/services/ai-insights-service';
import { useAuth } from '@/lib/context/AuthContext';
import { 
  Lightbulb, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  RotateCcw, 
  BrainCircuit,
  ChevronRight,
  Check,
  AlertCircle,
  Info,
  BarChart2,
  RefreshCw,
  Clock
} from 'lucide-react';

interface PersonalizedInsightsPanelProps {
  className?: string;
  maxHeight?: string;
  showHeader?: boolean;
  limitItems?: number;
}

export function PersonalizedInsightsPanel({
  className = '',
  maxHeight = '400px',
  showHeader = true,
  limitItems = 3
}: PersonalizedInsightsPanelProps) {
  const { isMobile } = useViewport();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [insights, setInsights] = useState<PersonalizedInsight[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useAuth();
  
  useEffect(() => {
    fetchInsights();
  }, [userId]);
  
  const fetchInsights = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await aiInsightsService.getPersonalizedInsights(userId);
      setInsights(data);
    } catch (err) {
      console.error('Error fetching personalized insights:', err);
      setError('Failed to load insights. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Filter insights based on active tab
  const filteredInsights = activeTab === 'all' 
    ? insights 
    : insights.filter(insight => insight.type === activeTab);
  
  // Limit the number of insights to display
  const displayedInsights = filteredInsights.slice(0, limitItems);
  
  // Get icon based on insight type
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'strength':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'weakness':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'opportunity':
        return <Target className="h-4 w-4 text-blue-500" />;
      case 'threat':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };
  
  // Get badge color based on priority
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>;
      case 'medium':
        return <Badge variant="default">Medium Priority</Badge>;
      case 'low':
        return <Badge variant="outline">Low Priority</Badge>;
      default:
        return null;
    }
  };
  
  // Get icon for category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'execution':
        return <Check className="h-3 w-3" />;
      case 'psychology':
        return <BrainCircuit className="h-3 w-3" />;
      case 'strategy':
        return <BarChart2 className="h-3 w-3" />;
      case 'risk-management':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };
  
  return (
    <Card className={`overflow-hidden ${className}`}>
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <CardTitle className="text-lg">Personalized Insights</CardTitle>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={fetchInsights}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="sr-only">Refresh</span>
            </Button>
          </div>
          <CardDescription>
            AI-powered analysis to improve your trading performance
          </CardDescription>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 h-8">
              <TabsTrigger value="all" className="text-xs px-2">All</TabsTrigger>
              <TabsTrigger value="strength" className="text-xs px-2">Strengths</TabsTrigger>
              <TabsTrigger value="weakness" className="text-xs px-2">Weaknesses</TabsTrigger>
              <TabsTrigger value="opportunity" className="text-xs px-2">Opportunities</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
      )}
      
      <CardContent className={`p-0 ${!showHeader ? 'pt-4 px-4' : ''}`}>
        <ScrollArea className={`${maxHeight}`}>
          {loading ? (
            <div className="space-y-4 p-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-4 w-[70px]" />
                  </div>
                  <Skeleton className="h-16 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-[100px]" />
                    <Skeleton className="h-8 w-[100px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-4 text-center">
              <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2" 
                onClick={fetchInsights}
              >
                Try Again
              </Button>
            </div>
          ) : displayedInsights.length === 0 ? (
            <div className="p-4 text-center">
              <BrainCircuit className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No insights available for this category yet.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Insights will be generated as you continue trading.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {displayedInsights.map((insight) => (
                <div key={insight.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {getInsightIcon(insight.type)}
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                    </div>
                    {getPriorityBadge(insight.priority)}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {insight.description}
                  </p>
                  
                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold">Action Items:</h5>
                    <ul className="text-xs space-y-1">
                      {insight.actionItems.map((action, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <ChevronRight className="h-3 w-3 mt-0.5 flex-shrink-0 text-primary" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3 pt-2 border-t text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      {getCategoryIcon(insight.category)}
                      <span className="capitalize">{insight.category.replace('-', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {new Date(insight.dateIdentified).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
      
      {displayedInsights.length > 0 && (
        <CardFooter className="flex justify-between pt-2 pb-3">
          <span className="text-xs text-muted-foreground">
            Showing {displayedInsights.length} of {filteredInsights.length} insights
          </span>
          <Button 
            variant="link" 
            size="sm" 
            className="h-auto p-0 text-xs"
            onClick={() => window.location.href = '/trading-ai'}
          >
            View All
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

export default PersonalizedInsightsPanel;