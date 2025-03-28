import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';
import { rapidApiService } from '../lib/services/rapid-api-service';
import { cryptoMarketService } from '../lib/services/crypto-market-service';
import { marketSentimentService } from '../lib/services/market-sentiment-service';
import { apiKeyManager } from '../lib/services/api-key-manager';
import { formatCurrency, formatNumber, formatPercent, truncateString } from '../lib/utils';
import { AlertCircle, ArrowDownIcon, ArrowUpIcon, CheckCircle, ArrowRightIcon, RefreshCw } from 'lucide-react';

const ApiDemoPage = () => {
  const navigate = useNavigate();
  
  // Symbol search state
  const [searchSymbol, setSearchSymbol] = useState('AAPL');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  // Crypto market state
  const [topCoins, setTopCoins] = useState<any[]>([]);
  const [marketOverview, setMarketOverview] = useState<any>(null);
  const [loadingCrypto, setLoadingCrypto] = useState(false);
  
  // Market sentiment state
  const [sentimentSymbol, setSentimentSymbol] = useState('AAPL');
  const [sentimentData, setSentimentData] = useState<any>(null);
  const [loadingSentiment, setLoadingSentiment] = useState(false);
  
  // API availability state
  const [availableApis, setAvailableApis] = useState<string[]>([]);
  const [loadingApiStatus, setLoadingApiStatus] = useState(true);
  
  // Initialize API services
  useEffect(() => {
    const initApis = async () => {
      setLoadingApiStatus(true);
      await Promise.all([
        rapidApiService.initialize(),
        cryptoMarketService.initialize(),
        marketSentimentService.initialize(),
        apiKeyManager.initialize()
      ]);
      
      // Get available APIs
      const apis = await apiKeyManager.getAvailableServices();
      setAvailableApis(apis);
      setLoadingApiStatus(false);
      
      // Load initial crypto data
      await loadCryptoData();
    };
    
    initApis();
  }, []);
  
  // Search for stock symbols
  const handleSearch = async () => {
    if (!searchSymbol || searchSymbol.trim().length < 2) return;
    
    setIsSearching(true);
    try {
      const data = await rapidApiService.searchStocks(searchSymbol);
      if (data && data.bestMatches) {
        setSearchResults(data.bestMatches);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching symbols:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Load cryptocurrency data
  const loadCryptoData = async () => {
    setLoadingCrypto(true);
    try {
      const [overview, coins] = await Promise.all([
        cryptoMarketService.getMarketOverview(),
        cryptoMarketService.getTopCoins(10)
      ]);
      
      setMarketOverview(overview);
      setTopCoins(coins);
    } catch (error) {
      console.error('Error loading crypto data:', error);
    } finally {
      setLoadingCrypto(false);
    }
  };
  
  // Analyze market sentiment
  const analyzeSentiment = async () => {
    if (!sentimentSymbol || sentimentSymbol.trim().length < 1) return;
    
    setLoadingSentiment(true);
    try {
      const data = await marketSentimentService.getMarketSentiment(sentimentSymbol);
      setSentimentData(data);
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      setSentimentData(null);
    } finally {
      setLoadingSentiment(false);
    }
  };
  
  // Format sentiment label with color
  const formatSentiment = (sentiment: any) => {
    if (!sentiment) return <Badge>Unknown</Badge>;
    
    const { label, score } = sentiment;
    
    if (label === 'bullish') {
      return (
        <Badge className="bg-green-500">
          <ArrowUpIcon className="mr-1 h-3 w-3" />
          Bullish ({score.toFixed(2)})
        </Badge>
      );
    } else if (label === 'bearish') {
      return (
        <Badge className="bg-red-500">
          <ArrowDownIcon className="mr-1 h-3 w-3" />
          Bearish ({score.toFixed(2)})
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-yellow-500">
          <ArrowRightIcon className="mr-1 h-3 w-3" />
          Neutral ({score.toFixed(2)})
        </Badge>
      );
    }
  };
  
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">API Integrations Demo</h1>
        <Button variant="outline" onClick={() => navigate('/')}>Back to Home</Button>
      </div>
      
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>API Demo Status</AlertTitle>
        <AlertDescription>
          {loadingApiStatus ? (
            <p>Checking API availability...</p>
          ) : (
            <>
              <p>Available APIs: {availableApis.length ? availableApis.join(', ') : 'None'}</p>
              {availableApis.includes('openai') && (
                <p className="text-green-500 flex items-center mt-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  OpenAI integration available: Enhanced sentiment analysis enabled
                </p>
              )}
            </>
          )}
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="crypto" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="crypto">Crypto Market</TabsTrigger>
          <TabsTrigger value="search">Symbol Search</TabsTrigger>
          <TabsTrigger value="sentiment">Market Sentiment</TabsTrigger>
        </TabsList>
        
        {/* Crypto Tab Content */}
        <TabsContent value="crypto" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Cryptocurrency Markets</h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadCryptoData} 
              disabled={loadingCrypto}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loadingCrypto ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          {marketOverview && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Market Cap</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatCurrency(marketOverview.totalMarketCap, 'USD')}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">24h Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatCurrency(marketOverview.totalVolume24h, 'USD')}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">BTC Dominance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{marketOverview.btcDominance ? formatPercent(marketOverview.btcDominance, 1) : 'N/A'}</p>
                </CardContent>
              </Card>
            </div>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Top Cryptocurrencies</CardTitle>
              <CardDescription>Real-time data from Coinranking</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingCrypto ? (
                <div className="flex justify-center items-center h-40">
                  <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : topCoins.length > 0 ? (
                <ScrollArea className="h-[400px]">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left font-medium p-2">Rank</th>
                        <th className="text-left font-medium p-2">Coin</th>
                        <th className="text-right font-medium p-2">Price</th>
                        <th className="text-right font-medium p-2">Market Cap</th>
                        <th className="text-right font-medium p-2">24h Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topCoins.map((coin) => (
                        <tr key={coin.uuid} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="p-2">{coin.rank}</td>
                          <td className="p-2 flex items-center">
                            {coin.iconUrl && (
                              <img 
                                src={coin.iconUrl} 
                                alt={coin.name} 
                                className="w-6 h-6 mr-2"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            )}
                            <div>
                              <div className="font-medium">{coin.name}</div>
                              <div className="text-xs text-gray-500">{coin.symbol}</div>
                            </div>
                          </td>
                          <td className="p-2 text-right">{formatCurrency(coin.price, 'USD')}</td>
                          <td className="p-2 text-right">{formatCurrency(coin.marketCap, 'USD')}</td>
                          <td className={`p-2 text-right ${Number(coin.change24h) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {Number(coin.change24h) >= 0 ? '+' : ''}{coin.change24h}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No cryptocurrency data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Symbol Search Tab Content */}
        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stock Symbol Search</CardTitle>
              <CardDescription>Search for stock symbols using Alpha Vantage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2 mb-4">
                <Input
                  placeholder="Enter symbol or company name"
                  value={searchSymbol}
                  onChange={(e) => setSearchSymbol(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
              </div>
              
              {isSearching ? (
                <div className="flex justify-center items-center h-40">
                  <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : searchResults.length > 0 ? (
                <ScrollArea className="h-[400px]">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left font-medium p-2">Symbol</th>
                        <th className="text-left font-medium p-2">Name</th>
                        <th className="text-left font-medium p-2">Type</th>
                        <th className="text-left font-medium p-2">Region</th>
                        <th className="text-right font-medium p-2">Match Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map((result, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="p-2 font-medium">{result['1. symbol']}</td>
                          <td className="p-2">{result['2. name']}</td>
                          <td className="p-2">{result['3. type']}</td>
                          <td className="p-2">{result['4. region']}</td>
                          <td className="p-2 text-right">{formatNumber(parseFloat(result['9. matchScore']) * 100, 0)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  {searchSymbol ? 'No results found. Try another search term.' : 'Enter a symbol or company name to search'}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Market Sentiment Tab Content */}
        <TabsContent value="sentiment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Sentiment Analysis</CardTitle>
              <CardDescription>Analyze market sentiment for symbols using news and social data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2 mb-4">
                <Input
                  placeholder="Enter symbol (e.g., AAPL, MSFT, BTC)"
                  value={sentimentSymbol}
                  onChange={(e) => setSentimentSymbol(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && analyzeSentiment()}
                />
                <Button onClick={analyzeSentiment} disabled={loadingSentiment}>
                  {loadingSentiment ? 'Analyzing...' : 'Analyze'}
                </Button>
              </div>
              
              {loadingSentiment ? (
                <div className="flex justify-center items-center h-40">
                  <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : sentimentData ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-2 border-primary">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Overall Sentiment</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          {formatSentiment(sentimentData.overallSentiment)}
                          <p className="mt-2 text-sm text-gray-500">Confidence: {(sentimentData.overallSentiment.confidence * 100).toFixed(0)}%</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">News Sentiment</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          {formatSentiment(sentimentData.newsSentiment)}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Social Media</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          {formatSentiment(sentimentData.socialMediaSentiment)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Prediction Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 dark:text-gray-300">{sentimentData.predictionSummary}</p>
                    </CardContent>
                  </Card>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Trending Topics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {sentimentData.trendingTopics.length > 0 ? (
                            sentimentData.trendingTopics.map((topic: string, index: number) => (
                              <Badge key={index} variant="secondary">
                                {topic}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-gray-500">No trending topics found</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Technical Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-center space-x-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-500">Sentiment</p>
                            {formatSentiment(sentimentData.technicalAnalysisSentiment)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Latest News</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {sentimentData.latestNews.length > 0 ? (
                        <div className="space-y-3">
                          {sentimentData.latestNews.map((news: any, index: number) => (
                            <div key={index} className="border-b last:border-0 pb-3 last:pb-0">
                              <div className="flex justify-between items-start">
                                <div>
                                  <a 
                                    href={news.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="font-medium hover:underline"
                                  >
                                    {news.title}
                                  </a>
                                  <div className="text-xs text-gray-500 mt-1">
                                    Source: {news.source} | Published: {new Date(news.publishedAt).toLocaleDateString()}
                                  </div>
                                </div>
                                <div className="ml-2">
                                  {formatSentiment(news.sentiment)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No news articles found</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  {sentimentSymbol ? 'No sentiment data available. Try another symbol.' : 'Enter a symbol to analyze market sentiment'}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiDemoPage;