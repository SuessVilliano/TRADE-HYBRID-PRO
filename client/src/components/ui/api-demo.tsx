import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { ScrollArea } from './scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion';
import { marketDataService } from '../../lib/services/market-data-service';
import { cnbcService } from '../../lib/services/cnbc-service';
import { fidelityService } from '../../lib/services/fidelity-service';
import { Separator } from './separator';

export function APIDemo() {
  const [symbol, setSymbol] = useState('AAPL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dataView, setDataView] = useState<'enhanced' | 'symbol' | 'search'>('enhanced');
  const [enhancedData, setEnhancedData] = useState<any>(null);
  const [symbolData, setSymbolData] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Helper function to load enhanced stock data
  const loadEnhancedData = async (sym: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await marketDataService.getEnhancedStockData(sym);
      setEnhancedData(data);
      if (!data) {
        setError(`No data found for symbol ${sym}`);
      }
    } catch (error: any) {
      console.error('Error loading enhanced data:', error);
      setError(error.message || 'Error loading data');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to load CNBC symbol data
  const loadSymbolData = async (sym: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await cnbcService.getSymbolInfo(sym);
      setSymbolData(data);
      if (!data) {
        setError(`No CNBC data found for symbol ${sym}`);
      }
    } catch (error: any) {
      console.error('Error loading CNBC data:', error);
      setError(error.message || 'Error loading data');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to search for symbols
  const searchSymbols = async (query: string) => {
    if (!query.trim()) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const results = await marketDataService.searchSymbols(query);
      setSearchResults(results);
      if (results.length === 0) {
        setError(`No results found for "${query}"`);
      }
    } catch (error: any) {
      console.error('Error searching symbols:', error);
      setError(error.message || 'Error searching symbols');
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    if (symbol) {
      loadEnhancedData(symbol);
    }
  }, []);

  // Handle input change for symbol
  const handleSymbolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSymbol(e.target.value.toUpperCase());
  };

  // Handle input change for search query
  const handleSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle form submission for symbol
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dataView === 'enhanced') {
      loadEnhancedData(symbol);
    } else if (dataView === 'symbol') {
      loadSymbolData(symbol);
    }
  };

  // Handle form submission for search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchSymbols(searchQuery);
  };

  // Handle selecting a symbol from search results
  const handleSelectSymbol = (sym: string) => {
    setSymbol(sym);
    setDataView('enhanced');
    loadEnhancedData(sym);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Trade Hybrid API Integration Demo</CardTitle>
        <CardDescription>
          This demo showcases the integration of multiple financial APIs in the Trade Hybrid platform.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={dataView} onValueChange={(value) => setDataView(value as any)}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="enhanced" className="flex-1">Enhanced Data</TabsTrigger>
            <TabsTrigger value="symbol" className="flex-1">CNBC Symbol Info</TabsTrigger>
            <TabsTrigger value="search" className="flex-1">Symbol Search</TabsTrigger>
          </TabsList>

          <TabsContent value="enhanced">
            <form onSubmit={handleSubmit} className="flex items-center space-x-2 mb-4">
              <Input
                placeholder="Enter Symbol (e.g., AAPL)"
                value={symbol}
                onChange={handleSymbolChange}
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Get Data'}
              </Button>
            </form>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            {enhancedData && (
              <ScrollArea className="h-[400px] rounded-md border p-4">
                <h3 className="text-xl font-bold mb-2">
                  {enhancedData.name || enhancedData.symbol}
                </h3>

                <div className="flex items-center mb-4">
                  <div className="text-3xl font-bold">${enhancedData.price.toFixed(2)}</div>
                  <div className={`ml-2 ${enhancedData.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {enhancedData.change >= 0 ? '+' : ''}{enhancedData.change.toFixed(2)} ({enhancedData.changePercent.toFixed(2)}%)
                  </div>
                </div>

                {enhancedData.sector && (
                  <div className="mb-4">
                    <span className="font-semibold">Sector:</span> {enhancedData.sector}
                    {enhancedData.industry && <> | <span className="font-semibold">Industry:</span> {enhancedData.industry}</>}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-semibold">Market Data</h4>
                    <div className="text-sm">
                      <div><span className="font-medium">Open:</span> ${enhancedData.open?.toFixed(2)}</div>
                      <div><span className="font-medium">High:</span> ${enhancedData.high?.toFixed(2)}</div>
                      <div><span className="font-medium">Low:</span> ${enhancedData.low?.toFixed(2)}</div>
                      <div><span className="font-medium">Volume:</span> {enhancedData.volume?.toLocaleString()}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold">Key Metrics</h4>
                    <div className="text-sm">
                      {enhancedData.marketCap && <div><span className="font-medium">Market Cap:</span> ${(enhancedData.marketCap / 1000000000).toFixed(2)}B</div>}
                      {enhancedData.peRatio && <div><span className="font-medium">P/E Ratio:</span> {enhancedData.peRatio.toFixed(2)}</div>}
                      {enhancedData.dividendYield && <div><span className="font-medium">Dividend Yield:</span> {enhancedData.dividendYield.toFixed(2)}%</div>}
                    </div>
                  </div>
                </div>

                {enhancedData.analystRating && (
                  <div className="mb-4">
                    <h4 className="font-semibold">Analyst Insights</h4>
                    <div className="text-sm">
                      <div><span className="font-medium">Analyst Rating:</span> {enhancedData.analystRating.toFixed(1)}/5</div>
                      {enhancedData.targetPrice && <div><span className="font-medium">Price Target:</span> ${enhancedData.targetPrice.toFixed(2)}</div>}
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-500 mt-4">
                  Data provided by: {enhancedData.dataProvider}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="symbol">
            <form onSubmit={handleSubmit} className="flex items-center space-x-2 mb-4">
              <Input
                placeholder="Enter Symbol (e.g., AAPL)"
                value={symbol}
                onChange={handleSymbolChange}
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Get CNBC Info'}
              </Button>
            </form>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            {symbolData && (
              <ScrollArea className="h-[400px] rounded-md border p-4">
                <h3 className="text-xl font-bold mb-2">{symbolData.symbolDesc || symbolData.symbolName}</h3>
                <div className="text-lg font-semibold mb-4">{symbolData.securityName}</div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-semibold">Symbol Details</h4>
                    <div className="text-sm">
                      <div><span className="font-medium">Symbol:</span> {symbolData.symbolName}</div>
                      <div><span className="font-medium">Exchange:</span> {symbolData.exchange}</div>
                      <div><span className="font-medium">Security Type:</span> {symbolData.securityType}</div>
                      <div><span className="font-medium">Country:</span> {symbolData.country}</div>
                      <div><span className="font-medium">Issue Type:</span> {symbolData.issueType}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold">Market Classification</h4>
                    <div className="text-sm">
                      <div><span className="font-medium">Industry:</span> {symbolData.industry || 'N/A'}</div>
                      <div><span className="font-medium">Sector:</span> {symbolData.sector || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold">Latest Price Information</h4>
                  <div className="flex items-center">
                    <div className="text-2xl font-bold">{symbolData.priceString}</div>
                    <div className={`ml-2 ${!symbolData.priceChange?.startsWith('-') ? 'text-green-500' : 'text-red-500'}`}>
                      {symbolData.priceChange} ({symbolData.priceChangePercent})
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Last updated: {new Date(symbolData.timestampSince1970 * 1000).toLocaleString()}
                  </div>
                </div>

                <div className="text-xs text-gray-500 mt-4">
                  Data provided by: CNBC
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="search">
            <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 mb-4">
              <Input
                placeholder="Search for symbols (e.g., Apple, TSLA, Bank)"
                value={searchQuery}
                onChange={handleSearchQueryChange}
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Searching...' : 'Search'}
              </Button>
            </form>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            {searchResults.length > 0 && (
              <ScrollArea className="h-[400px] rounded-md border">
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-2">Search Results ({searchResults.length})</h3>
                  
                  <Accordion type="single" collapsible className="w-full">
                    {searchResults.map((result, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="hover:bg-gray-100 dark:hover:bg-gray-800 px-2">
                          <div className="flex items-center justify-between w-full">
                            <div className="font-semibold">{result.symbol}</div>
                            <div className="text-sm text-gray-500 mr-4">{result.name}</div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 py-2">
                          <div className="flex flex-col gap-2">
                            <div><span className="font-semibold">Name:</span> {result.name}</div>
                            <div><span className="font-semibold">Type:</span> {result.type}</div>
                            <div><span className="font-semibold">Exchange:</span> {result.exchange}</div>
                            <div><span className="font-semibold">Source:</span> {result.source}</div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2 w-full"
                              onClick={() => handleSelectSymbol(result.symbol)}
                            >
                              View Enhanced Data
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex flex-col items-start">
        <div className="text-sm text-gray-500">
          <p>Data pulled from multiple providers including Alpha Vantage, CNBC, Fidelity, and more.</p>
          <p>Trade Hybrid API Aggregation provides seamless access to diverse market data sources.</p>
        </div>
      </CardFooter>
    </Card>
  );
}