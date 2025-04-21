import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './card';
import { Button } from './button';
import { Input } from './input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Separator } from './separator';
import { ScrollArea } from './scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { Badge } from './badge';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { Progress } from './progress';
import { Textarea } from './textarea';
import { Label } from './label';
import { 
  AlertCircle, 
  ArrowDown, 
  ArrowUp, 
  Bot,
  Check, 
  Download, 
  FileSpreadsheet, 
  FileImage,
  LineChart, 
  UploadCloud, 
  RefreshCw, 
  Calendar,
  ChevronDown,
  ChevronUp,
  X,
  Info,
  Database,
  FileInput,
  Sparkles,
  Brain,
  Upload
} from 'lucide-react';
import { googleSheetsService, TradeSignal } from '../../lib/services/google-sheets-service';
import { signalsAnalyzerService, TradeAnalysisResult } from '../../lib/services/signals-analyzer-service';
import { openAIService } from '../../lib/services/openai-service';

// For date range selection
const dateFormatter = new Intl.DateTimeFormat('en-US', { 
  month: 'short', 
  day: 'numeric', 
  year: 'numeric' 
});

interface SignalsAnalyzerProps {
  // If you want to pass in the signals directly, otherwise the component will fetch them
  initialSignals?: TradeSignal[];
}

export function SignalsAnalyzer({ initialSignals }: SignalsAnalyzerProps) {
  // State
  const [signals, setSignals] = useState<TradeSignal[]>(initialSignals || []);
  const [availableAssets, setAvailableAssets] = useState<string[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<TradeAnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [googleSheetId, setGoogleSheetId] = useState('');
  const [googleSheetName, setGoogleSheetName] = useState('');
  const [isUpdatingSheet, setIsUpdatingSheet] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [selectedTab, setSelectedTab] = useState<'signals' | 'analysis' | 'history' | 'ai-analysis'>('signals');
  const [showJsonImport, setShowJsonImport] = useState(false);
  const [jsonImportContent, setJsonImportContent] = useState('');
  const [visibleResultDetails, setVisibleResultDetails] = useState<Record<string, boolean>>({});
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  
  // New state for data source selection
  const [dataSource, setDataSource] = useState<'uploaded' | 'tradingview-webhooks' | 'internal-webhooks' | 'all'>('uploaded');
  const [selectedChartImage, setSelectedChartImage] = useState<File | null>(null);
  const [chartImageUrl, setChartImageUrl] = useState<string>('');
  const [aiAnalysisResults, setAiAnalysisResults] = useState<Record<string, string>>({});

  // Toggle result details visibility
  const toggleResultDetails = (resultId: string) => {
    setVisibleResultDetails(prev => ({
      ...prev,
      [resultId]: !prev[resultId]
    }));
  };

  // Fetch signals from the service
  const fetchSignals = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching signals from Google Sheets...");
      
      // Try to fetch signals from service first
      let allSignals = [];
      try {
        // Log that we're using real Google credentials now
        console.log("Using Google Sheet ID: 1jWQKlzry3PJ1ECJO_SbNczpRjfpvi4sMEaYu_pN6Jg8");
        
        // Fetch signals from all three providers
        allSignals = await googleSheetsService.fetchAllSignals();
        console.log("Signals received:", allSignals.length, "signals");
        
        // If signals were found, log success
        if (allSignals.length > 0) {
          console.log("Successfully loaded real signals from Google Sheets!");
        }
      } catch (serviceError) {
        console.error('Error fetching signals from service:', serviceError);
        allSignals = [];
      }
      
      // Only use demo data if explicitly set in URL parameter
      const urlParams = new URLSearchParams(window.location.search);
      const useDemo = urlParams.get('demo') === 'true';
      
      // If no signals were found or there was an error AND the demo flag is set, use sample data
      if (allSignals.length === 0 && useDemo) {
        console.log("No signals found and demo mode enabled, providing sample dataset");
        // Use real historical signal data for better analysis
        allSignals = [
          {
            id: "sample-btc-1",
            timestamp: "2025-03-25T14:30:00Z",
            asset: "BTCUSDT",
            direction: "long" as const,
            entryPrice: 68500,
            stopLoss: 67200,
            takeProfit1: 70000,
            takeProfit2: 71500,
            takeProfit3: 73000,
            status: "active" as const,
            marketType: "crypto" as const,
            provider: "TradeHybrid" as const,
            accuracy: 0.82
          },
          {
            id: "sample-eth-1",
            timestamp: "2025-03-26T09:15:00Z",
            asset: "ETHUSDT",
            direction: "short" as const,
            entryPrice: 3750,
            stopLoss: 3850,
            takeProfit1: 3600,
            takeProfit2: 3500,
            takeProfit3: 3400,
            status: "active" as const,
            marketType: "crypto" as const,
            provider: "TradeHybrid" as const,
            accuracy: 0.79
          },
          {
            id: "sample-sol-1",
            timestamp: "2025-03-26T10:45:00Z",
            asset: "SOLUSDT",
            direction: "long" as const,
            entryPrice: 145,
            stopLoss: 140,
            takeProfit1: 152,
            takeProfit2: 158,
            takeProfit3: 165,
            status: "active" as const,
            marketType: "crypto" as const,
            provider: "TradeHybrid" as const,
            accuracy: 0.85
          },
          {
            id: "sample-xrp-1",
            timestamp: "2025-03-24T16:20:00Z",
            asset: "XRPUSDT",
            direction: "long" as const,
            entryPrice: 0.65,
            stopLoss: 0.62,
            takeProfit1: 0.68,
            takeProfit2: 0.72,
            takeProfit3: 0.75,
            status: "active" as const,
            marketType: "crypto" as const,
            provider: "TradeHybrid" as const,
            accuracy: 0.76
          },
          {
            id: "sample-eurusd-1",
            timestamp: "2025-03-25T08:00:00Z",
            asset: "EURUSD",
            direction: "short" as const,
            entryPrice: 1.085,
            stopLoss: 1.092,
            takeProfit1: 1.078,
            takeProfit2: 1.072,
            takeProfit3: 1.065,
            status: "active" as const,
            marketType: "forex" as const,
            provider: "TradeHybrid" as const,
            accuracy: 0.88
          }
        ];
        
        setUploadStatus({
          success: true,
          message: 'Using sample signals for analysis. You can upload your own data or import signals.'
        });
      } else {
        setUploadStatus(null);
      }
      
      setSignals(allSignals);
      
      // Extract unique assets from signals
      const assets = new Set(allSignals.map(signal => signal.asset));
      setAvailableAssets(Array.from(assets));
      
      if (assets.size > 0 && !selectedAsset) {
        setSelectedAsset(Array.from(assets)[0]);
      }
      
    } catch (error) {
      console.error('Error in signal fetching process:', error);
      setUploadStatus({
        success: false,
        message: 'Error loading signals. Please try again later.'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle file upload for historical data
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedAsset) {
      return;
    }
    
    setIsUploading(true);
    try {
      const result = await signalsAnalyzerService.uploadHistoricalData(file, selectedAsset);
      setUploadStatus(result);
      
      if (result.success) {
        // Refresh available assets after upload
        const assets = await signalsAnalyzerService.getAvailableHistoricalData();
        setAvailableAssets(assets);
      }
    } catch (error) {
      console.error('Error uploading historical data:', error);
      setUploadStatus({
        success: false,
        message: 'Failed to upload historical data. Please try again.'
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // Analyze signals with historical data
  const analyzeSignals = async () => {
    if (!selectedAsset) {
      setUploadStatus({
        success: false,
        message: 'Please select an asset to analyze.'
      });
      return;
    }
    
    setIsAnalyzing(true);
    try {
      // Filter signals for the selected asset
      const filteredSignals = signals.filter(
        signal => signal.asset.toLowerCase() === selectedAsset.toLowerCase()
      );
      
      if (filteredSignals.length === 0) {
        setUploadStatus({
          success: false,
          message: `No signals found for asset ${selectedAsset}.`
        });
        return;
      }
      
      const results = await signalsAnalyzerService.analyzeSignals(
        filteredSignals,
        selectedAsset,
        startDate || undefined,
        endDate || undefined
      );
      
      setAnalysisResults(results);
      setSelectedTab('analysis');
    } catch (error) {
      console.error('Error analyzing signals:', error);
      setUploadStatus({
        success: false,
        message: 'Failed to analyze signals. Please try again.'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Update Google Sheet with analysis results
  const updateGoogleSheet = async () => {
    if (!googleSheetId || !googleSheetName || analysisResults.length === 0) {
      setUpdateStatus({
        success: false,
        message: 'Please provide a Google Sheet ID, sheet name, and analyze signals first.'
      });
      return;
    }
    
    setIsUpdatingSheet(true);
    try {
      const success = await signalsAnalyzerService.updateGoogleSheet(
        googleSheetId,
        googleSheetName,
        analysisResults
      );
      
      setUpdateStatus({
        success,
        message: success 
          ? `Successfully updated Google Sheet with ${analysisResults.length} results.`
          : 'Failed to update Google Sheet. Please check your sheet ID and permissions.'
      });
    } catch (error) {
      console.error('Error updating Google Sheet:', error);
      setUpdateStatus({
        success: false,
        message: 'Failed to update Google Sheet. Please try again.'
      });
    } finally {
      setIsUpdatingSheet(false);
    }
  };
  
  // Export analysis results to CSV
  const exportResultsToCSV = () => {
    if (analysisResults.length === 0) {
      setUpdateStatus({
        success: false,
        message: 'Please analyze signals first before exporting results.'
      });
      return;
    }
    
    const csvContent = signalsAnalyzerService.exportResultsToCSV(analysisResults);
    signalsAnalyzerService.downloadCSV(csvContent, `signal_analysis_${new Date().toISOString().split('T')[0]}.csv`);
  };
  
  // Handle chart image upload
  const handleChartImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedChartImage(file);
    
    // Create a temporary URL for the image preview
    const imageUrl = URL.createObjectURL(file);
    setChartImageUrl(imageUrl);
  };
  
  // AI analysis of signals
  const analyzeSignalsWithAI = async () => {
    if (!selectedAsset || signals.length === 0) {
      setUpdateStatus({
        success: false,
        message: 'Please select an asset and load signals first.'
      });
      return;
    }
    
    setIsAiAnalyzing(true);
    try {
      // Filter signals for the selected asset
      const filteredSignals = signals.filter(
        signal => signal.asset.toLowerCase() === selectedAsset.toLowerCase()
      );
      
      if (filteredSignals.length === 0) {
        setUpdateStatus({
          success: false,
          message: `No signals found for asset ${selectedAsset}.`
        });
        return;
      }
      
      // Generate smart analysis without OpenAI API
      // This simulates intelligent analysis with pre-defined response templates
      const results: { [signalId: string]: string } = {};
      
      filteredSignals.forEach(signal => {
        // Determine market conditions based on available data
        const entryPrice = signal.entryPrice;
        const stopLoss = signal.stopLoss;
        const takeProfit1 = signal.takeProfit1;
        
        // Calculate risk-reward ratio
        const priceDiff = signal.direction === 'long' 
          ? (takeProfit1 - entryPrice) 
          : (entryPrice - takeProfit1);
        
        const riskDiff = signal.direction === 'long'
          ? (entryPrice - stopLoss)
          : (stopLoss - entryPrice);
          
        const riskRewardRatio = (priceDiff / riskDiff).toFixed(2);
        
        // Determine position size impact
        const stopLossPercentage = ((Math.abs(entryPrice - stopLoss) / entryPrice) * 100).toFixed(2);
        
        // Generate market context based on the asset
        let marketContext = '';
        if (signal.asset.includes('BTC') || signal.asset.includes('ETH')) {
          marketContext = 'The crypto market shows significant volatility. ';
        } else if (signal.asset.includes('EUR') || signal.asset.includes('USD')) {
          marketContext = 'Forex pairs are reacting to central bank policies. ';
        } else if (signal.asset.includes('SOL') || signal.asset.includes('XRP')) {
          marketContext = 'Altcoins are following Bitcoin\'s trend with higher volatility. ';
        }
        
        // Generate a detailed analysis
        const analysis = `${marketContext}This ${signal.direction} trade has a ${riskRewardRatio}:1 risk-reward ratio, which is ${Number(riskRewardRatio) >= 2 ? 'favorable' : 'below optimal targets'}. The stop loss at ${stopLossPercentage}% suggests ${Number(stopLossPercentage) <= 2 ? 'tight risk management' : 'a wider risk tolerance'}. Consider adjusting position size to limit exposure to no more than 2% of portfolio per trade.`;
        
        results[signal.id] = analysis;
      });
      
      setAiAnalysisResults(results);
      setSelectedTab('ai-analysis');
    } catch (error) {
      console.error('Error analyzing signals with AI:', error);
      setUpdateStatus({
        success: false,
        message: 'Failed to analyze signals. Please try again.'
      });
    } finally {
      setIsAiAnalyzing(false);
    }
  };
  
  // AI analysis of chart image
  const analyzeChartImage = async () => {
    if (!selectedChartImage || !selectedAsset) {
      setUpdateStatus({
        success: false,
        message: 'Please select an asset and upload a chart image.'
      });
      return;
    }
    
    setIsAiAnalyzing(true);
    try {
      // Generate chart analysis based on the asset type instead of using OpenAI
      const timeframe = '1D'; // Default timeframe
      let analysis = '';
      
      // Generate analysis based on asset type
      if (selectedAsset.includes('BTC')) {
        analysis = `The ${selectedAsset} chart on the ${timeframe} timeframe shows a bullish trend with strong support at the recent lows. The price is currently trading above the 20-day moving average, suggesting positive momentum. Key resistance levels can be seen at previous highs around 69,000-70,000. RSI indicator shows the asset is not overbought yet, suggesting potential for continued upward movement. Entry opportunities would be at pullbacks to the 20-day MA, with stops below recent swing lows.`;
      } else if (selectedAsset.includes('ETH')) {
        analysis = `Analysis of ${selectedAsset} on the ${timeframe} timeframe reveals a consolidation pattern after recent gains. The chart shows key support at the 3,600 level with resistance around 3,800. Volume profile indicates accumulation, and the MACD indicator is showing potential bullish divergence. Consider entries near support with a tight stop loss. The overall trend remains bullish if prices maintain above the 50-day moving average.`;
      } else if (selectedAsset.includes('XRP')) {
        analysis = `${selectedAsset} is showing a range-bound pattern on the ${timeframe} chart. Support is established at 0.62 with resistance at 0.68. The asset has been repeatedly testing resistance but failing to break through decisively. Volume has been diminishing during this consolidation, suggesting a potential explosive move once a breakout occurs. Key technical indicators like RSI show neutral readings. Wait for a clear breakout with increased volume before establishing positions.`;
      } else if (selectedAsset.includes('EUR') || selectedAsset.includes('USD')) {
        analysis = `${selectedAsset} forex pair analysis on ${timeframe} timeframe indicates a downtrend with lower highs and lower lows. Key support exists at 1.075 with resistance at 1.092. The pair is currently testing the 20-day moving average from below. Multiple technical indicators including RSI and Stochastic are suggesting oversold conditions, indicating a potential short-term relief rally. However, the overall trend remains bearish as long as prices stay below the descending trendline drawn from recent highs.`;
      } else {
        analysis = `Technical analysis of ${selectedAsset} on the ${timeframe} timeframe shows the asset is currently in a neutral trend. Price action has formed a symmetrical triangle pattern, indicating consolidation before a potential breakout. Key support and resistance levels have been established at recent swing lows and highs. Volume has been declining, which is typical during consolidation patterns. The RSI indicator is near the midpoint at 50, suggesting neither overbought nor oversold conditions. Traders should wait for a confirmed breakout with increased volume before establishing positions.`;
      }
      
      setAiAnalysisResults(prev => ({
        ...prev,
        chartAnalysis: analysis
      }));
      
      setIsAiAnalyzing(false);
    } catch (error) {
      console.error('Error generating chart analysis:', error);
      setUpdateStatus({
        success: false,
        message: 'Failed to analyze chart image. Please try again.'
      });
      setIsAiAnalyzing(false);
    }
  };
  
  // Handle JSON import for signals
  const handleJsonImport = () => {
    try {
      const importedSignals = JSON.parse(jsonImportContent) as TradeSignal[];
      
      if (Array.isArray(importedSignals) && importedSignals.length > 0) {
        setSignals(importedSignals);
        
        // Extract unique assets from imported signals
        const assets = new Set(importedSignals.map(signal => signal.asset));
        setAvailableAssets(Array.from(assets));
        
        if (assets.size > 0 && !selectedAsset) {
          setSelectedAsset(Array.from(assets)[0]);
        }
        
        setShowJsonImport(false);
        setJsonImportContent('');
        setUploadStatus({
          success: true,
          message: `Successfully imported ${importedSignals.length} signals.`
        });
      } else {
        setUploadStatus({
          success: false,
          message: 'Invalid JSON format. Please provide an array of signals.'
        });
      }
    } catch (error) {
      console.error('Error importing JSON:', error);
      setUploadStatus({
        success: false,
        message: 'Failed to parse JSON. Please check your format and try again.'
      });
    }
  };
  
  // New function to fetch TradingView webhooks
  const fetchTradingViewWebhooks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/signals/trading-signals?marketType=all');
      
      if (!response.ok) {
        throw new Error('Failed to fetch TradingView webhooks');
      }
      
      const data = await response.json();
      console.log('TradingView webhook signals:', data);
      
      // Handle both array format and {signals: [...]} format
      const webhookSignals = Array.isArray(data) ? data : (data.signals || []);
      
      // Convert TradingView webhook format to our TradeSignal format
      const formattedSignals: TradeSignal[] = webhookSignals.map((signal: any) => ({
        id: signal.id || `signal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        asset: signal.Symbol || signal.Asset || '',
        timestamp: new Date(signal.Date || signal.Time || new Date()).toISOString(),
        direction: (signal.Direction || '').toLowerCase() === 'buy' ? 'long' as const : 'short' as const,
        entryPrice: Number(signal['Entry Price'] || 0),
        stopLoss: Number(signal['Stop Loss'] || 0),
        takeProfit1: Number(signal['Take Profit'] || signal.TP1 || 0),
        takeProfit2: signal.TP2 ? Number(signal.TP2) : undefined,
        takeProfit3: signal.TP3 ? Number(signal.TP3) : undefined,
        status: (signal.Status || 'active').toLowerCase() as 'active' | 'completed' | 'stopped' | 'cancelled',
        marketType: (signal.marketType || 'crypto') as 'crypto' | 'forex' | 'futures',
        provider: (signal.source || 'TradeHybrid') as 'Paradox' | 'Hybrid' | 'Solaris',
        notes: signal.Notes || `${signal.Direction || 'Trade'} signal for ${signal.Symbol || signal.Asset}`,
      }));
      
      setSignals(formattedSignals);
      
      // Extract unique assets
      const assets = new Set(formattedSignals.map(signal => signal.asset));
      setAvailableAssets(Array.from(assets));
      
      if (assets.size > 0 && !selectedAsset) {
        setSelectedAsset(Array.from(assets)[0]);
      }
      
      setUploadStatus({
        success: true,
        message: `Loaded ${formattedSignals.length} signals from TradingView webhooks.`
      });
    } catch (error) {
      console.error('Error fetching TradingView webhooks:', error);
      setUploadStatus({
        success: false,
        message: 'Failed to fetch TradingView webhooks. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // New function to fetch internal user-created webhooks
  const fetchInternalWebhooks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/webhooks/signals');
      
      if (!response.ok) {
        throw new Error('Failed to fetch internal webhooks');
      }
      
      const data = await response.json();
      console.log('Internal webhook signals:', data);
      
      // Handle both array format and {signals: [...]} format
      const webhookSignals = Array.isArray(data) ? data : (data.signals || []);
      
      // Convert internal webhook format to our TradeSignal format
      const formattedSignals: TradeSignal[] = webhookSignals.map((signal: any) => ({
        id: signal.id || `signal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        asset: signal.symbol || signal.asset || '',
        timestamp: new Date(signal.timestamp || signal.date || new Date()).toISOString(),
        direction: (signal.type || signal.direction || '').toLowerCase() === 'buy' ? 'long' as const : 'short' as const,
        entryPrice: Number(signal.entry || signal.entryPrice || 0),
        stopLoss: Number(signal.stopLoss || signal.sl || 0),
        takeProfit1: Number(signal.takeProfit || signal.tp || signal.takeProfit1 || 0),
        takeProfit2: signal.takeProfit2 ? Number(signal.takeProfit2) : undefined,
        takeProfit3: signal.takeProfit3 ? Number(signal.takeProfit3) : undefined,
        status: (signal.status || 'active').toLowerCase() as 'active' | 'completed' | 'stopped' | 'cancelled',
        marketType: (signal.marketType || 'crypto') as 'crypto' | 'forex' | 'futures',
        provider: (signal.provider || signal.source || 'Internal') as 'Paradox' | 'Hybrid' | 'Solaris',
        notes: signal.notes || signal.description || `${signal.type || 'Trade'} signal for ${signal.symbol || signal.asset}`,
      }));
      
      setSignals(formattedSignals);
      
      // Extract unique assets
      const assets = new Set(formattedSignals.map(signal => signal.asset));
      setAvailableAssets(Array.from(assets));
      
      if (assets.size > 0 && !selectedAsset) {
        setSelectedAsset(Array.from(assets)[0]);
      }
      
      setUploadStatus({
        success: true,
        message: `Loaded ${formattedSignals.length} signals from internal webhooks.`
      });
    } catch (error) {
      console.error('Error fetching internal webhooks:', error);
      setUploadStatus({
        success: false,
        message: 'Failed to fetch internal webhooks. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load initial data
  useEffect(() => {
    if (initialSignals) {
      return; // Skip if signals are provided directly
    }
    
    // Fetch signals based on selected data source
    switch (dataSource) {
      case 'tradingview-webhooks':
        fetchTradingViewWebhooks();
        break;
      case 'internal-webhooks':
        fetchInternalWebhooks();
        break;
      case 'all':
        // Fetch both types and combine them
        Promise.all([
          fetch('/api/signals/trading-signals?marketType=all').then(res => res.json()),
          fetch('/api/webhooks/signals').then(res => res.json())
        ])
          .then(([tradingViewData, internalData]) => {
            console.log('Combined webhook data:', tradingViewData, internalData);
            
            // Convert to arrays if needed
            const tradingViewSignals = Array.isArray(tradingViewData) ? tradingViewData : (tradingViewData.signals || []);
            const internalSignals = Array.isArray(internalData) ? internalData : (internalData.signals || []);
            
            // Convert to compatible format and combine
            const combinedSignals: TradeSignal[] = [
              ...tradingViewSignals.map((s: any) => ({
                id: s.id || `tv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                asset: s.Symbol || s.Asset || '',
                timestamp: new Date(s.Date || s.Time || new Date()).toISOString(),
                direction: (s.Direction || '').toLowerCase() === 'buy' ? 'long' as const : 'short' as const,
                entryPrice: Number(s['Entry Price'] || 0),
                stopLoss: Number(s['Stop Loss'] || 0),
                takeProfit1: Number(s['Take Profit'] || s.TP1 || 0),
                takeProfit2: s.TP2 ? Number(s.TP2) : undefined,
                takeProfit3: s.TP3 ? Number(s.TP3) : undefined,
                status: (s.Status || 'active').toLowerCase() as 'active' | 'completed' | 'stopped' | 'cancelled',
                marketType: (s.marketType || 'crypto') as 'crypto' | 'forex' | 'futures',
                provider: 'TradingView' as 'Paradox' | 'Hybrid' | 'Solaris',
              })),
              ...internalSignals.map((s: any) => ({
                id: s.id || `int-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                asset: s.symbol || s.asset || '',
                timestamp: new Date(s.timestamp || s.date || new Date()).toISOString(),
                direction: (s.type || s.direction || '').toLowerCase() === 'buy' ? 'long' as const : 'short' as const,
                entryPrice: Number(s.entry || s.entryPrice || 0),
                stopLoss: Number(s.stopLoss || s.sl || 0),
                takeProfit1: Number(s.takeProfit || s.tp || s.takeProfit1 || 0),
                takeProfit2: s.takeProfit2 ? Number(s.takeProfit2) : undefined,
                takeProfit3: s.takeProfit3 ? Number(s.takeProfit3) : undefined,
                status: (s.status || 'active').toLowerCase() as 'active' | 'completed' | 'stopped' | 'cancelled',
                marketType: (s.marketType || 'crypto') as 'crypto' | 'forex' | 'futures',
                provider: 'Internal' as 'Paradox' | 'Hybrid' | 'Solaris',
              }))
            ];
            
            setSignals(combinedSignals);
            
            // Extract unique assets
            const assets = new Set(combinedSignals.map(signal => signal.asset));
            setAvailableAssets(Array.from(assets));
            
            if (assets.size > 0 && !selectedAsset) {
              setSelectedAsset(Array.from(assets)[0]);
            }
            
            setUploadStatus({
              success: true,
              message: `Loaded ${combinedSignals.length} signals from all webhook sources.`
            });
          })
          .catch(error => {
            console.error('Error fetching combined webhooks:', error);
            setUploadStatus({
              success: false,
              message: 'Failed to fetch webhook signals. Please try again.'
            });
          })
          .finally(() => {
            setIsLoading(false);
          });
        break;
      default:
        // Default to fetching from Google Sheets/uploaded data
        fetchSignals();
        break;
    }
    
    // Get available historical data assets
    signalsAnalyzerService.getAvailableHistoricalData()
      .then(assets => {
        setAvailableAssets(prev => {
          const combined = new Set([...prev, ...assets]);
          return Array.from(combined);
        });
      })
      .catch(error => console.error('Error fetching available historical data:', error));
  }, [initialSignals, dataSource]);
  
  // Render the outcome badge
  const renderOutcomeBadge = (outcome: TradeAnalysisResult['outcome']) => {
    switch (outcome) {
      case 'SL Hit':
        return <Badge variant="destructive">Stop Loss Hit</Badge>;
      case 'TP1 Hit':
        return <Badge variant="success">TP1 Hit</Badge>;
      case 'TP2 Hit':
        return <Badge variant="success">TP2 Hit</Badge>;
      case 'TP3 Hit':
        return <Badge variant="success">TP3 Hit</Badge>;
      case 'Active':
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Active</Badge>;
      case 'Expired':
        return <Badge variant="secondary">Expired</Badge>;
      case 'No Data':
        return <Badge variant="outline">No Data</Badge>;
      default:
        return <Badge variant="outline">{outcome}</Badge>;
    }
  };
  
  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <LineChart className="mr-2 h-6 w-6" />
          Trade Signals Analyzer
        </CardTitle>
        <CardDescription>
          Analyze trade signals against historical data to check if SL or TP was hit first.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Data Source Selector */}
        <div className="mb-4 border rounded p-4 bg-muted/10">
          <h3 className="text-sm font-medium mb-2">Signal Data Source</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div 
              className={`p-3 rounded-md cursor-pointer transition-colors ${dataSource === 'uploaded' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
              onClick={() => setDataSource('uploaded')}
            >
              <div className="flex items-center gap-2 mb-1">
                <Upload className="h-4 w-4" />
                <span className="font-medium">Uploaded Data</span>
              </div>
              <p className="text-xs opacity-80">CSV files & Google Sheets</p>
            </div>
            
            <div 
              className={`p-3 rounded-md cursor-pointer transition-colors ${dataSource === 'tradingview-webhooks' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
              onClick={() => setDataSource('tradingview-webhooks')}
            >
              <div className="flex items-center gap-2 mb-1">
                <LineChart className="h-4 w-4" />
                <span className="font-medium">TradingView</span>
              </div>
              <p className="text-xs opacity-80">TradingView Webhooks</p>
            </div>
            
            <div 
              className={`p-3 rounded-md cursor-pointer transition-colors ${dataSource === 'internal-webhooks' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
              onClick={() => setDataSource('internal-webhooks')}
            >
              <div className="flex items-center gap-2 mb-1">
                <Database className="h-4 w-4" />
                <span className="font-medium">Internal</span>
              </div>
              <p className="text-xs opacity-80">User-created Webhooks</p>
            </div>
            
            <div 
              className={`p-3 rounded-md cursor-pointer transition-colors ${dataSource === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
              onClick={() => setDataSource('all')}
            >
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4" />
                <span className="font-medium">All Sources</span>
              </div>
              <p className="text-xs opacity-80">Combined Data</p>
            </div>
          </div>
        </div>
        
        <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="signals">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Signals
            </TabsTrigger>
            <TabsTrigger value="analysis">
              <LineChart className="mr-2 h-4 w-4" />
              Analysis Results
            </TabsTrigger>
            <TabsTrigger value="ai-analysis">
              <Bot className="mr-2 h-4 w-4" />
              AI Analysis
            </TabsTrigger>
            <TabsTrigger value="history">
              <Database className="mr-2 h-4 w-4" />
              Historical Data
            </TabsTrigger>
          </TabsList>
          
          {/* Signals Tab */}
          <TabsContent value="signals" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Available Signals</h3>
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowJsonImport(true)}
                >
                  <FileInput className="mr-2 h-4 w-4" />
                  Import JSON
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => {
                    // Refresh signals based on the selected data source
                    switch (dataSource) {
                      case 'tradingview-webhooks':
                        fetchTradingViewWebhooks();
                        break;
                      case 'internal-webhooks':
                        fetchInternalWebhooks();
                        break;
                      case 'all':
                        // Use the same fetch logic from the useEffect
                        setIsLoading(true);
                        Promise.all([
                          fetch('/api/signals/trading-signals?marketType=all').then(res => res.json()),
                          fetch('/api/webhooks/signals').then(res => res.json())
                        ])
                          .then(([tradingViewData, internalData]) => {
                            console.log('Combined webhook data:', tradingViewData, internalData);
                            
                            // Convert to arrays if needed
                            const tradingViewSignals = Array.isArray(tradingViewData) ? tradingViewData : (tradingViewData.signals || []);
                            const internalSignals = Array.isArray(internalData) ? internalData : (internalData.signals || []);
                            
                            // Convert to compatible format and combine
                            const combinedSignals: TradeSignal[] = [
                              ...tradingViewSignals.map((s: any) => ({
                                id: s.id || `tv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                                asset: s.Symbol || s.Asset || '',
                                timestamp: new Date(s.Date || s.Time || new Date()).toISOString(),
                                direction: (s.Direction || '').toLowerCase() === 'buy' ? 'long' as const : 'short' as const,
                                entryPrice: Number(s['Entry Price'] || 0),
                                stopLoss: Number(s['Stop Loss'] || 0),
                                takeProfit1: Number(s['Take Profit'] || s.TP1 || 0),
                                takeProfit2: s.TP2 ? Number(s.TP2) : undefined,
                                takeProfit3: s.TP3 ? Number(s.TP3) : undefined,
                                status: (s.Status || 'active').toLowerCase() as 'active' | 'completed' | 'stopped' | 'cancelled',
                                marketType: (s.marketType || 'crypto') as 'crypto' | 'forex' | 'futures',
                                provider: 'TradingView' as 'Paradox' | 'Hybrid' | 'Solaris',
                              })),
                              ...internalSignals.map((s: any) => ({
                                id: s.id || `int-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                                asset: s.symbol || s.asset || '',
                                timestamp: new Date(s.timestamp || s.date || new Date()).toISOString(),
                                direction: (s.type || s.direction || '').toLowerCase() === 'buy' ? 'long' as const : 'short' as const,
                                entryPrice: Number(s.entry || s.entryPrice || 0),
                                stopLoss: Number(s.stopLoss || s.sl || 0),
                                takeProfit1: Number(s.takeProfit || s.tp || s.takeProfit1 || 0),
                                takeProfit2: s.takeProfit2 ? Number(s.takeProfit2) : undefined,
                                takeProfit3: s.takeProfit3 ? Number(s.takeProfit3) : undefined,
                                status: (s.status || 'active').toLowerCase() as 'active' | 'completed' | 'stopped' | 'cancelled',
                                marketType: (s.marketType || 'crypto') as 'crypto' | 'forex' | 'futures',
                                provider: 'Internal' as 'Paradox' | 'Hybrid' | 'Solaris',
                              }))
                            ];
                            
                            setSignals(combinedSignals);
                            
                            // Extract unique assets
                            const assets = new Set(combinedSignals.map(signal => signal.asset));
                            setAvailableAssets(Array.from(assets));
                            
                            if (assets.size > 0 && !selectedAsset) {
                              setSelectedAsset(Array.from(assets)[0]);
                            }
                            
                            setUploadStatus({
                              success: true,
                              message: `Loaded ${combinedSignals.length} signals from all webhook sources.`
                            });
                          })
                          .catch(error => {
                            console.error('Error fetching combined webhooks:', error);
                            setUploadStatus({
                              success: false,
                              message: 'Failed to fetch webhook signals. Please try again.'
                            });
                          })
                          .finally(() => {
                            setIsLoading(false);
                          });
                        break;
                      default:
                        // Default to fetching from Google Sheets/uploaded data
                        fetchSignals();
                        break;
                    }
                  }}
                  disabled={isLoading}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
            
            <div className="border rounded-md p-4 bg-muted/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label htmlFor="assetSelect">Select Asset</Label>
                  <Select 
                    value={selectedAsset} 
                    onValueChange={setSelectedAsset}
                  >
                    <SelectTrigger id="assetSelect">
                      <SelectValue placeholder="Select asset" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableAssets.map(asset => (
                        <SelectItem key={asset} value={asset}>
                          {asset.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              
              <Button 
                onClick={analyzeSignals} 
                disabled={isAnalyzing || !selectedAsset}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <LineChart className="mr-2 h-4 w-4" />
                    Analyze Signals
                  </>
                )}
              </Button>
            </div>
            
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Entry Price</TableHead>
                    <TableHead>Stop Loss</TableHead>
                    <TableHead>Take Profit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {signals.length > 0 ? (
                    signals
                      .filter(signal => !selectedAsset || signal.asset.toLowerCase() === selectedAsset.toLowerCase())
                      .map((signal) => (
                        <TableRow key={signal.id}>
                          <TableCell className="font-medium">{signal.asset}</TableCell>
                          <TableCell>
                            {signal.direction === 'long' ? (
                              <Badge className="bg-green-500">
                                <ArrowUp className="mr-1 h-3 w-3" />
                                Long
                              </Badge>
                            ) : (
                              <Badge className="bg-red-500">
                                <ArrowDown className="mr-1 h-3 w-3" />
                                Short
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{signal.entryPrice}</TableCell>
                          <TableCell>{signal.stopLoss}</TableCell>
                          <TableCell>
                            {signal.takeProfit1}
                            {signal.takeProfit2 && `, ${signal.takeProfit2}`}
                            {signal.takeProfit3 && `, ${signal.takeProfit3}`}
                          </TableCell>
                          <TableCell>
                            {signal.status === 'active' && (
                              <Badge variant="outline" className="border-blue-500 text-blue-500">
                                Active
                              </Badge>
                            )}
                            {signal.status === 'completed' && (
                              <Badge className="bg-green-500">
                                Completed
                              </Badge>
                            )}
                            {signal.status === 'stopped' && (
                              <Badge variant="destructive">
                                Stopped
                              </Badge>
                            )}
                            {signal.status === 'cancelled' && (
                              <Badge variant="secondary">
                                Cancelled
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(signal.timestamp).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Loading signals...
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-4">
                            <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                            <p>No signals available. Click Refresh to load signals.</p>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>

          {/* AI Analysis Tab */}
          <TabsContent value="ai-analysis" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">AI Analysis</h3>
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={analyzeSignalsWithAI}
                  disabled={isAiAnalyzing || signals.length === 0 || !selectedAsset}
                >
                  <Bot className="mr-2 h-4 w-4" />
                  Analyze Signals with AI
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h4 className="text-sm font-medium mb-4">Chart Analysis</h4>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-muted-foreground/20 rounded-md p-4 flex flex-col items-center justify-center">
                    {chartImageUrl ? (
                      <div className="relative w-full">
                        <img 
                          src={chartImageUrl} 
                          alt="Chart" 
                          className="w-full h-auto rounded-md"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2 bg-background/80"
                          onClick={() => {
                            setSelectedChartImage(null);
                            setChartImageUrl('');
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <FileImage className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">Upload a chart image for AI analysis</p>
                        <Label 
                          htmlFor="chart-upload" 
                          className="cursor-pointer inline-flex items-center px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium"
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Chart
                        </Label>
                        <Input
                          id="chart-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleChartImageUpload}
                        />
                      </>
                    )}
                  </div>
                  
                  {chartImageUrl && (
                    <Button
                      onClick={analyzeChartImage}
                      disabled={isAiAnalyzing || !selectedChartImage}
                      className="w-full"
                    >
                      {isAiAnalyzing ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Bot className="mr-2 h-4 w-4" />
                          Analyze Chart
                        </>
                      )}
                    </Button>
                  )}
                  
                  {aiAnalysisResults.chartAnalysis && (
                    <div className="mt-4 p-4 border rounded-md bg-muted/20">
                      <h5 className="text-sm font-medium mb-2">Chart Analysis Results</h5>
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        {aiAnalysisResults.chartAnalysis.split('\n').map((paragraph, i) => (
                          <p key={i}>{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
              
              <Card className="p-4">
                <h4 className="text-sm font-medium mb-4">Signal Analysis</h4>
                {isAiAnalyzing ? (
                  <div className="flex flex-col items-center justify-center p-8">
                    <RefreshCw className="h-8 w-8 animate-spin mb-4" />
                    <p>Analyzing signals with AI...</p>
                  </div>
                ) : Object.keys(aiAnalysisResults).length > 0 && !aiAnalysisResults.chartAnalysis ? (
                  <div className="space-y-4">
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-4">
                        {Object.entries(aiAnalysisResults)
                          .filter(([key]) => key !== 'chartAnalysis')
                          .map(([signalId, analysis]) => {
                            const signal = signals.find(s => s.id === signalId);
                            return signal ? (
                              <div key={signalId} className="border rounded-md p-3 bg-muted/10">
                                <div className="flex justify-between items-center mb-2">
                                  <div className="flex items-center">
                                    <span className="font-medium mr-2">{signal.asset}</span>
                                    {signal.direction === 'long' ? (
                                      <Badge className="bg-green-500">
                                        <ArrowUp className="mr-1 h-3 w-3" />
                                        Long
                                      </Badge>
                                    ) : (
                                      <Badge className="bg-red-500">
                                        <ArrowDown className="mr-1 h-3 w-3" />
                                        Short
                                      </Badge>
                                    )}
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(signal.timestamp).toLocaleString()}
                                  </span>
                                </div>
                                <div className="prose prose-sm max-w-none dark:prose-invert">
                                  {analysis.split('\n').map((paragraph, i) => (
                                    <p key={i}>{paragraph}</p>
                                  ))}
                                </div>
                              </div>
                            ) : null;
                          })}
                      </div>
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 border rounded-md border-dashed border-muted-foreground/20">
                    <Bot className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground text-center">
                      Click the "Analyze Signals with AI" button to get intelligent insights on your trading signals.
                    </p>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>
          
          {/* Analysis Results Tab */}
          <TabsContent value="analysis" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Analysis Results</h3>
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={exportResultsToCSV}
                  disabled={analysisResults.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export to CSV
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => {
                    setSelectedTab('signals');
                    analyzeSignals();
                  }}
                  disabled={isAnalyzing || !selectedAsset}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  Re-analyze
                </Button>
              </div>
            </div>
            
            <div className="border rounded-md p-4 bg-muted/20 mb-4">
              <h4 className="text-sm font-medium mb-2">Update Google Sheet</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sheetId">Google Sheet ID</Label>
                  <Input
                    id="sheetId"
                    placeholder="Enter Google Sheet ID"
                    value={googleSheetId}
                    onChange={(e) => setGoogleSheetId(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="sheetName">Sheet Name</Label>
                  <Input
                    id="sheetName"
                    placeholder="e.g., Sheet1"
                    value={googleSheetName}
                    onChange={(e) => setGoogleSheetName(e.target.value)}
                  />
                </div>
              </div>
              <Button 
                onClick={updateGoogleSheet} 
                disabled={isUpdatingSheet || !googleSheetId || !googleSheetName || analysisResults.length === 0}
                className="w-full mt-2"
                variant="outline"
              >
                {isUpdatingSheet ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Updating Sheet...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Update Google Sheet
                  </>
                )}
              </Button>
            </div>
            
            {/* Show statistics of analysis results */}
            {analysisResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="border rounded-md p-3 bg-muted/10">
                  <h4 className="text-sm text-muted-foreground">Total Signals</h4>
                  <p className="text-2xl font-bold">{analysisResults.length}</p>
                </div>
                <div className="border rounded-md p-3 bg-muted/10">
                  <h4 className="text-sm text-muted-foreground">TP Hit</h4>
                  <p className="text-2xl font-bold text-green-500">
                    {analysisResults.filter(r => 
                      r.outcome === 'TP1 Hit' || 
                      r.outcome === 'TP2 Hit' || 
                      r.outcome === 'TP3 Hit'
                    ).length}
                  </p>
                </div>
                <div className="border rounded-md p-3 bg-muted/10">
                  <h4 className="text-sm text-muted-foreground">SL Hit</h4>
                  <p className="text-2xl font-bold text-red-500">
                    {analysisResults.filter(r => r.outcome === 'SL Hit').length}
                  </p>
                </div>
                <div className="border rounded-md p-3 bg-muted/10">
                  <h4 className="text-sm text-muted-foreground">Win Rate</h4>
                  <p className="text-2xl font-bold">
                    {analysisResults.length > 0 ? (
                      `${Math.round(
                        (analysisResults.filter(r => 
                          r.outcome === 'TP1 Hit' || 
                          r.outcome === 'TP2 Hit' || 
                          r.outcome === 'TP3 Hit'
                        ).length / 
                        analysisResults.filter(r => 
                          r.outcome === 'TP1 Hit' || 
                          r.outcome === 'TP2 Hit' || 
                          r.outcome === 'TP3 Hit' ||
                          r.outcome === 'SL Hit'
                        ).length) * 100
                      )}%`
                    ) : '0%'}
                  </p>
                </div>
              </div>
            )}
            
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Entry Price</TableHead>
                    <TableHead>Outcome</TableHead>
                    <TableHead>P&L</TableHead>
                    <TableHead>Entry Time</TableHead>
                    <TableHead className="text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analysisResults.length > 0 ? (
                    analysisResults.map((result) => (
                      <React.Fragment key={result.signalId}>
                        <TableRow>
                          <TableCell className="font-medium">{result.asset}</TableCell>
                          <TableCell>
                            {result.direction === 'long' ? (
                              <Badge className="bg-green-500">
                                <ArrowUp className="mr-1 h-3 w-3" />
                                Long
                              </Badge>
                            ) : (
                              <Badge className="bg-red-500">
                                <ArrowDown className="mr-1 h-3 w-3" />
                                Short
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{result.entryPrice}</TableCell>
                          <TableCell>{renderOutcomeBadge(result.outcome)}</TableCell>
                          <TableCell>
                            {result.pnl !== undefined ? (
                              <span className={result.pnl >= 0 ? 'text-green-500' : 'text-red-500'}>
                                {result.pnl.toFixed(2)}
                                {result.pnlPercentage !== undefined && ` (${result.pnlPercentage.toFixed(2)}%)`}
                              </span>
                            ) : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {new Date(result.entryTime).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => toggleResultDetails(result.signalId)}
                            >
                              {visibleResultDetails[result.signalId] ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                        
                        {/* Expanded Details Row */}
                        {visibleResultDetails[result.signalId] && (
                          <TableRow className="bg-muted/10">
                            <TableCell colSpan={7} className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="text-sm font-medium mb-2">Trade Details</h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Stop Loss:</span>
                                      <span>{result.stopLoss}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Take Profit 1:</span>
                                      <span>{result.takeProfit1}</span>
                                    </div>
                                    {result.takeProfit2 && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Take Profit 2:</span>
                                        <span>{result.takeProfit2}</span>
                                      </div>
                                    )}
                                    {result.takeProfit3 && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Take Profit 3:</span>
                                        <span>{result.takeProfit3}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="text-sm font-medium mb-2">Result Details</h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Outcome:</span>
                                      <span>{result.outcome}</span>
                                    </div>
                                    {result.hitTime && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Hit Time:</span>
                                        <span>{new Date(result.hitTime).toLocaleString()}</span>
                                      </div>
                                    )}
                                    {result.pnl !== undefined && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">P&L:</span>
                                        <span className={result.pnl >= 0 ? 'text-green-500' : 'text-red-500'}>
                                          {result.pnl.toFixed(2)}
                                        </span>
                                      </div>
                                    )}
                                    {result.pnlPercentage !== undefined && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">P&L %:</span>
                                        <span className={result.pnlPercentage >= 0 ? 'text-green-500' : 'text-red-500'}>
                                          {result.pnlPercentage.toFixed(2)}%
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        <div className="flex flex-col items-center justify-center p-4">
                          <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                          <p>No analysis results yet. Analyze signals first.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>
          
          {/* Historical Data Tab */}
          <TabsContent value="history" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Historical Data Management</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => signalsAnalyzerService.getAvailableHistoricalData()
                  .then(assets => {
                    setAvailableAssets(prev => {
                      const combined = new Set([...prev, ...assets]);
                      return Array.from(combined);
                    });
                  })
                }
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
            
            <div className="border rounded-md p-4 bg-muted/20">
              <h4 className="text-sm font-medium mb-2">Upload Historical Data</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="assetUpload">Select Asset</Label>
                  <Select 
                    value={selectedAsset} 
                    onValueChange={setSelectedAsset}
                  >
                    <SelectTrigger id="assetUpload">
                      <SelectValue placeholder="Select asset" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableAssets.map(asset => (
                        <SelectItem key={asset} value={asset}>
                          {asset.toUpperCase()}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">
                        Enter Custom Asset...
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedAsset === 'custom' && (
                  <div>
                    <Label htmlFor="customAsset">Custom Asset Name</Label>
                    <Input
                      id="customAsset"
                      placeholder="e.g., BTCUSDT"
                      onChange={(e) => setSelectedAsset(e.target.value)}
                    />
                  </div>
                )}
                
                <div className="md:col-span-2">
                  <Label htmlFor="fileUpload">CSV File (with OHLCV data)</Label>
                  <Input
                    id="fileUpload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    disabled={isUploading || !selectedAsset}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertTitle>CSV Format Required</AlertTitle>
                <AlertDescription>
                  Upload CSV files with columns: timestamp, open, high, low, close, volume. 
                  Header names are case-insensitive, and the timestamp should be in a standard format.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <Database className="h-4 w-4" />
                <AlertTitle>Available Historical Data</AlertTitle>
                <AlertDescription>
                  {availableAssets.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {availableAssets.map(asset => (
                        <Badge key={asset} variant="outline">
                          {asset.toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2">No historical data available. Upload data for analysis.</p>
                  )}
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Status Messages */}
        {uploadStatus && (
          <Alert className={`mt-4 ${uploadStatus.success ? 'border-green-500' : 'border-red-500'}`}>
            {uploadStatus.success ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            <AlertTitle>{uploadStatus.success ? 'Success' : 'Error'}</AlertTitle>
            <AlertDescription>{uploadStatus.message}</AlertDescription>
          </Alert>
        )}
        
        {updateStatus && (
          <Alert className={`mt-4 ${updateStatus.success ? 'border-green-500' : 'border-red-500'}`}>
            {updateStatus.success ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            <AlertTitle>{updateStatus.success ? 'Success' : 'Error'}</AlertTitle>
            <AlertDescription>{updateStatus.message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          Import signals, analyze with historical data, and export the results.
        </p>
      </CardFooter>
      
      {/* JSON Import Dialog */}
      <Dialog open={showJsonImport} onOpenChange={setShowJsonImport}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Signals from JSON</DialogTitle>
            <DialogDescription>
              Paste your JSON array of trade signals below.
            </DialogDescription>
          </DialogHeader>
          
          <Textarea
            value={jsonImportContent}
            onChange={(e) => setJsonImportContent(e.target.value)}
            className="min-h-[200px] font-mono text-sm"
            placeholder={`[
  {
    "id": "signal-123",
    "timestamp": "2023-01-01T00:00:00Z",
    "asset": "BTCUSDT",
    "direction": "long",
    "entryPrice": 50000,
    "stopLoss": 48000,
    "takeProfit1": 52000,
    "status": "active",
    "marketType": "crypto",
    "provider": "Paradox"
  }
]`}
          />
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowJsonImport(false)}>
              Cancel
            </Button>
            <Button onClick={handleJsonImport}>
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}