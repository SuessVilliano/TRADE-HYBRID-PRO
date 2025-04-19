import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend } from 'recharts';

// Sample AI analysis data
const sampleAnalysisData = [
  {
    title: 'Market Sentiment Analysis',
    description: 'Analysis of market sentiment based on trading signals and order flow.',
    chartType: 'line',
    data: [
      { name: 'Jan', sentiment: 65 },
      { name: 'Feb', sentiment: 59 },
      { name: 'Mar', sentiment: 80 },
      { name: 'Apr', sentiment: 81 },
      { name: 'May', sentiment: 56 },
      { name: 'Jun', sentiment: 55 },
      { name: 'Jul', sentiment: 40 },
    ],
    insights: [
      'The market sentiment has been declining since March.',
      'Current sentiment score of 40 is relatively bearish.',
      'This suggests caution for long positions in growth stocks.',
      'Consider defensive sectors with consistent dividends.'
    ]
  },
  {
    title: 'Trading Pattern Recognition',
    description: 'Identification of recurring patterns in your trading behavior.',
    chartType: 'bar',
    data: [
      { name: 'Breakout', success: 72, failure: 28 },
      { name: 'Trend', success: 65, failure: 35 },
      { name: 'Reversal', success: 43, failure: 57 },
      { name: 'Range', success: 80, failure: 20 },
      { name: 'News', success: 35, failure: 65 },
    ],
    insights: [
      'You perform best in range-bound markets (80% success).',
      'Breakout trades have a strong success rate of 72%.',
      'News-based trading has been less successful (35%).',
      'Consider focusing on range and breakout strategies.'
    ]
  },
  {
    title: 'Asset Allocation Analysis',
    description: 'Optimal asset allocation based on market conditions and risk profile.',
    chartType: 'pie',
    data: [
      { name: 'Technology', value: 35 },
      { name: 'Healthcare', value: 20 },
      { name: 'Consumer Staples', value: 15 },
      { name: 'Financials', value: 10 },
      { name: 'Energy', value: 10 },
      { name: 'Other', value: 10 },
    ],
    insights: [
      'Your portfolio is heavily weighted towards Technology (35%).',
      'Consider increasing Healthcare exposure for defensive growth.',
      'Energy sector allocation may be increased as a hedge against inflation.',
      'Financials could benefit from rising interest rates environment.'
    ]
  }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF6B6B'];

export function AdvancedAIAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('sentiment');
  const [refreshing, setRefreshing] = useState<string | null>(null);
  
  // Function to refresh analysis
  const refreshAnalysis = (type: string) => {
    setRefreshing(type);
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setRefreshing(null);
    }, 1500);
  };
  
  const renderChart = (analysis: typeof sampleAnalysisData[0]) => {
    switch (analysis.chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={analysis.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sentiment" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analysis.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="success" fill="#82ca9d" name="Success %" />
              <Bar dataKey="failure" fill="#ff8042" name="Failure %" />
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analysis.data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {analysis.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Trading Analysis</CardTitle>
        <CardDescription>
          Advanced AI analysis of your trading patterns and market sentiment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sentiment" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
            <TabsTrigger value="allocation">Allocation</TabsTrigger>
          </TabsList>
          
          {sampleAnalysisData.map((analysis, index) => {
            const tabValue = ['sentiment', 'patterns', 'allocation'][index];
            
            return (
              <TabsContent key={tabValue} value={tabValue} className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{analysis.title}</h3>
                  <p className="text-sm text-muted-foreground">{analysis.description}</p>
                  
                  {renderChart(analysis)}
                  
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium">AI Insights:</h4>
                    <ul className="space-y-1">
                      {analysis.insights.map((insight, i) => (
                        <li key={i} className="text-sm">• {insight}</li>
                      ))}
                    </ul>
                  </div>
                  
                  {refreshing === tabValue && (
                    <Alert className="mt-4">
                      <AlertTitle>Refreshing Analysis</AlertTitle>
                      <AlertDescription>
                        We're analyzing your recent trading data to generate new insights...
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </div>
        <Button 
          variant="outline" 
          onClick={() => refreshAnalysis(activeTab)}
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing...' : 'Refresh Analysis'}
        </Button>
      </CardFooter>
    </Card>
  );
}