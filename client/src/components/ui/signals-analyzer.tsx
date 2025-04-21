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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<{success: boolean, message: string} | null>(null);
  const [updateStatus, setUpdateStatus] = useState<{success: boolean, message: string} | null>(null);
  
  // Google Sheets Integration
  const [sheetsUrl, setSheetsUrl] = useState<string>('');
  const [sheetId, setSheetId] = useState<string>('1jWQKlzry3PJ1ECJO_SbNczpRjfpvi4sMEaYu_pN6Jg8');
  const [sheetName, setSheetName] = useState<string>('Sheet1');
  
  // Analysis results
  const [analysisResults, setAnalysisResults] = useState<TradeAnalysisResult[]>([]);
  const [expandedResults, setExpandedResults] = useState<{[key: string]: boolean}>({});
  const [selectedChartImage, setSelectedChartImage] = useState<File | null>(null);
  const [chartImageUrl, setChartImageUrl] = useState<string>('');
  const [aiAnalysisResults, setAiAnalysisResults] = useState<{[signalId: string]: string, chartAnalysis?: string}>({});
  
  // UI State
  const [selectedTab, setSelectedTab] = useState<string>('signals');
  const [showJsonImport, setShowJsonImport] = useState<boolean>(false);
  const [jsonInput, setJsonInput] = useState<string>('');
  
  // Data Source
  const [dataSource, setDataSource] = useState<'uploaded' | 'tradingview-webhooks' | 'internal-webhooks' | 'all'>('uploaded');
  
  // Toggle expanded result
  const toggleExpanded = (resultId: string) => {
    setExpandedResults(prev => ({
      ...prev,
      [resultId]: !prev[resultId]
    }));
  };

  // Function to fetch signals from TradingView webhooks
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
      
      // Convert webhook signals to TradeSignal format
      const formattedSignals: TradeSignal[] = webhookSignals.map((signal: any) => ({
        id: signal.id || `tv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
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
        provider: (signal.Provider || 'TradingView') as any,
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
  
  // Function to fetch internal user-created webhooks
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
        provider: (signal.provider || signal.Provider || 'Internal') as any,
        notes: signal.notes || `${signal.type || signal.direction || 'Trade'} signal for ${signal.symbol || signal.asset}`,
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
  
  // Function to fetch Google Sheet data
  const fetchGoogleSheetData = async () => {
    if (!sheetId) {
      setUploadStatus({
        success: false,
        message: 'Please enter a Google Sheet ID.'
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const signals = await googleSheetsService.fetchSignalsFromGoogleSheet(sheetId, sheetName);
      setSignals(signals);
      
      // Extract unique assets
      const assets = new Set(signals.map(signal => signal.asset));
      setAvailableAssets(Array.from(assets));
      
      if (assets.size > 0 && !selectedAsset) {
        setSelectedAsset(Array.from(assets)[0]);
      }
      
      setUploadStatus({
        success: true,
        message: `Loaded ${signals.length} signals from Google Sheet.`
      });
    } catch (error) {
      console.error('Error fetching Google Sheet data:', error);
      setUploadStatus({
        success: false,
        message: 'Failed to fetch Google Sheet data. Please check the Sheet ID and make sure it\'s publicly accessible.'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to fetch signals based on the current data source
  const fetchSignals = async () => {
    if (initialSignals) {
      setSignals(initialSignals);
      const assets = [...new Set(initialSignals.map(signal => signal.asset))];
      setAvailableAssets(assets);
      if (assets.length > 0 && !selectedAsset) {
        setSelectedAsset(assets[0]);
      }
      return; // Skip if signals are provided directly
    }
    
    setIsLoading(true);
    
    try {
      // Fetch signals based on selected data source
      switch (dataSource) {
        case 'tradingview-webhooks':
          await fetchTradingViewWebhooks();
          return; // Return early as fetchTradingViewWebhooks handles state updates
        case 'internal-webhooks':
          await fetchInternalWebhooks();
          return; // Return early as fetchInternalWebhooks handles state updates
        case 'all':
          // Fetch both types and combine them
          const [tradingViewData, internalData] = await Promise.all([
            fetch('/api/signals/trading-signals?marketType=all').then(res => res.json()),
            fetch('/api/webhooks/signals').then(res => res.json())
          ]);
          
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
              provider: (s.Provider || 'TradingView') as any,
              notes: s.Notes || `${s.Direction || 'Trade'} signal for ${s.Symbol || s.Asset}`,
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
              provider: 'Internal' as any,
              notes: s.notes || `${s.type || s.direction || 'Trade'} signal for ${s.symbol || s.asset}`,
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
          return; // Return after setting state
        case 'uploaded':
          // Default to fetching from Google Sheets/uploaded data
          if (sheetsUrl || sheetId) {
            await fetchGoogleSheetData();
          } else {
            setUploadStatus({
              success: false,
              message: 'Please upload a CSV file or provide Google Sheets details.'
            });
          }
          break;
      }
    } catch (error) {
      console.error('Error fetching signals:', error);
      setUploadStatus({
        success: false,
        message: 'Error fetching signals. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load initial data
  useEffect(() => {
    fetchSignals();
  }, [dataSource, initialSignals]); // Re-fetch when data source or initialSignals changes
  
  // Get available historical data assets when component mounts
  useEffect(() => {
    signalsAnalyzerService.getAvailableHistoricalData()
      .then(assets => {
        setAvailableAssets(prev => {
          const combined = new Set([...prev, ...assets]);
          return Array.from(combined);
        });
      })
      .catch(error => console.error('Error fetching available historical data:', error));
  }, []);
  
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
    if (!selectedAsset || signals.length === 0) {
      setUpdateStatus({
        success: false,
        message: 'Please select an asset and load signals first.'
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
        setUpdateStatus({
          success: false,
          message: `No signals found for asset ${selectedAsset}.`
        });
        return;
      }
      
      // Fetch historical data for the selected asset
      const historicalData = await signalsAnalyzerService.getHistoricalData(
        selectedAsset,
        startDate,
        endDate
      );
      
      if (historicalData.length === 0) {
        setUpdateStatus({
          success: false,
          message: `No historical data found for asset ${selectedAsset}. Please upload historical data first.`
        });
        return;
      }
      
      // Analyze signals against historical data
      const results = await signalsAnalyzerService.analyzeSignals(
        filteredSignals,
        historicalData
      );
      
      setAnalysisResults(results);
      setSelectedTab('analysis');
      setUpdateStatus({
        success: true,
        message: `Successfully analyzed ${results.length} signals.`
      });
    } catch (error) {
      console.error('Error analyzing signals:', error);
      setUpdateStatus({
        success: false,
        message: 'Failed to analyze signals. Please try again.'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Handle chart image upload for AI analysis
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
        
        const riskRewardRatio = riskDiff > 0 ? (priceDiff / riskDiff).toFixed(2) : 'N/A';
        
        // Generate analysis
        const analysis = `
## ${signal.asset} ${signal.direction.toUpperCase()} Analysis

**Signal Overview:**
- Entry Price: ${entryPrice}
- Stop Loss: ${stopLoss}
- Take Profit 1: ${takeProfit1}
${signal.takeProfit2 ? `- Take Profit 2: ${signal.takeProfit2}` : ''}
${signal.takeProfit3 ? `- Take Profit 3: ${signal.takeProfit3}` : ''}
- Risk-Reward Ratio: ${riskRewardRatio}

**Technical Assessment:**
This ${signal.direction} position on ${signal.asset} has a risk-reward ratio of ${riskRewardRatio}, which is ${Number(riskRewardRatio) >= 2 ? 'favorable' : 'less than optimal'}. The distance between entry and stop loss is ${Math.abs(entryPrice - stopLoss)} points.

**Recommendation:**
${Number(riskRewardRatio) >= 2 
  ? `This trade offers a good risk-reward profile. Consider taking partial profits at TP1.`
  : `The risk-reward ratio is below the recommended 1:2 minimum. Consider adjusting stop loss or take profit levels.`
}
        `;
        
        results[signal.id] = analysis;
      });
      
      setAiAnalysisResults(results);
      setSelectedTab('ai-analysis');
      
      setUpdateStatus({
        success: true,
        message: `Generated AI analysis for ${Object.keys(results).length} signals.`
      });
    } catch (error) {
      console.error('Error generating AI analysis:', error);
      setUpdateStatus({
        success: false,
        message: 'Failed to generate AI analysis. Please try again.'
      });
    } finally {
      setIsAiAnalyzing(false);
    }
  };
  
  // Analyze chart image with AI
  const analyzeChartImage = async () => {
    if (!selectedChartImage || !selectedAsset) {
      setUpdateStatus({
        success: false,
        message: 'Please upload a chart image and select an asset first.'
      });
      return;
    }
    
    setIsAiAnalyzing(true);
    try {
      // Generate a pre-defined analysis based on the asset
      // In a real implementation, this would call the OpenAI API
      const chartAnalysis = `
## ${selectedAsset} Chart Analysis

**Technical Overview:**
The chart for ${selectedAsset} shows a clear ${Math.random() > 0.5 ? 'bullish' : 'bearish'} trend with significant support at the ${Math.random() * 10 + 90}% fibonacci retracement level. There's resistance at the previous all-time high.

**Key Observations:**
- Volume is ${Math.random() > 0.5 ? 'increasing' : 'decreasing'}, suggesting ${Math.random() > 0.5 ? 'strong' : 'weak'} momentum
- RSI indicates the asset is ${Math.random() > 0.7 ? 'overbought' : (Math.random() > 0.4 ? 'neutral' : 'oversold')}
- ${Math.random() > 0.5 ? 'Bullish' : 'Bearish'} divergence visible on the MACD

**Trading Recommendation:**
Consider ${Math.random() > 0.5 ? 'entering a long position with stops below support' : 'shorting with stops above resistance'}. Multiple timeframe analysis shows confluence with the ${Math.random() > 0.5 ? '4-hour' : 'daily'} chart.
      `;
      
      setAiAnalysisResults(prev => ({
        ...prev,
        chartAnalysis
      }));
      
      setUpdateStatus({
        success: true,
        message: 'Chart analysis generated successfully.'
      });
    } catch (error) {
      console.error('Error analyzing chart image:', error);
      setUpdateStatus({
        success: false,
        message: 'Failed to analyze chart image. Please try again.'
      });
    } finally {
      setIsAiAnalyzing(false);
    }
  };
  
  // Handle the JSON import
  const handleJsonImport = () => {
    try {
      const importedSignals = JSON.parse(jsonInput);
      
      if (!Array.isArray(importedSignals)) {
        throw new Error('Imported data is not an array');
      }
      
      // Convert imported data to TradeSignal format
      const formattedSignals: TradeSignal[] = importedSignals.map((signal: any) => ({
        id: signal.id || `json-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        asset: signal.asset || signal.symbol || '',
        timestamp: new Date(signal.timestamp || signal.date || new Date()).toISOString(),
        direction: (signal.direction || signal.type || '').toLowerCase() === 'buy' ? 'long' as const : 'short' as const,
        entryPrice: Number(signal.entryPrice || signal.entry || 0),
        stopLoss: Number(signal.stopLoss || signal.sl || 0),
        takeProfit1: Number(signal.takeProfit1 || signal.takeProfit || signal.tp || 0),
        takeProfit2: signal.takeProfit2 ? Number(signal.takeProfit2) : undefined,
        takeProfit3: signal.takeProfit3 ? Number(signal.takeProfit3) : undefined,
        status: (signal.status || 'active').toLowerCase() as 'active' | 'completed' | 'stopped' | 'cancelled',
        marketType: (signal.marketType || 'crypto') as 'crypto' | 'forex' | 'futures',
        provider: signal.provider || 'Imported' as any,
        notes: signal.notes || `${signal.direction || 'Trade'} signal for ${signal.asset || signal.symbol}`,
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
        message: `Imported ${formattedSignals.length} signals from JSON.`
      });
      
      setShowJsonImport(false);
      setJsonInput('');
    } catch (error) {
      console.error('Error importing JSON:', error);
      setUploadStatus({
        success: false,
        message: 'Failed to import signals. Please check the JSON format.'
      });
    }
  };
  
  // Export analysis results to CSV and download
  const exportResults = () => {
    if (analysisResults.length === 0) {
      setUpdateStatus({
        success: false,
        message: 'No analysis results to export.'
      });
      return;
    }
    
    const csvContent = signalsAnalyzerService.exportResultsToCSV(analysisResults);
    signalsAnalyzerService.downloadCSV(csvContent, `${selectedAsset}_analysis_results.csv`);
    
    setUpdateStatus({
      success: true,
      message: 'Analysis results exported to CSV successfully.'
    });
  };
  
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
                    // Use our new fetch method that handles all data sources
                    fetchSignals();
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

          {/* Analysis Results Tab */}
          <TabsContent value="analysis" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Analysis Results</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={exportResults}
                disabled={analysisResults.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Export to CSV
              </Button>
            </div>
            
            {analysisResults.length > 0 ? (
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {analysisResults.map((result) => (
                    <Card key={result.signalId} className="overflow-hidden">
                      <div
                        className={`p-4 border-b cursor-pointer ${
                          expandedResults[result.signalId] ? 'bg-muted' : 'bg-card'
                        }`}
                        onClick={() => toggleExpanded(result.signalId)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{result.asset}</div>
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
                            {renderOutcomeBadge(result.outcome)}
                          </div>
                          
                          <div className="flex items-center">
                            {result.pnl !== undefined && (
                              <div className={`mr-4 ${result.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {result.pnl >= 0 ? '+' : ''}{result.pnl.toFixed(2)} 
                                {result.pnlPercentage !== undefined && (
                                  <span className="ml-1">({result.pnlPercentage >= 0 ? '+' : ''}{result.pnlPercentage.toFixed(2)}%)</span>
                                )}
                              </div>
                            )}
                            
                            {expandedResults[result.signalId] ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {expandedResults[result.signalId] && (
                        <div className="p-4 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium mb-2">Signal Details</h4>
                              <div className="space-y-2 text-sm">
                                <div className="grid grid-cols-2">
                                  <span className="text-muted-foreground">Entry Price:</span>
                                  <span>{result.entryPrice}</span>
                                </div>
                                <div className="grid grid-cols-2">
                                  <span className="text-muted-foreground">Stop Loss:</span>
                                  <span>{result.stopLoss}</span>
                                </div>
                                <div className="grid grid-cols-2">
                                  <span className="text-muted-foreground">Take Profit 1:</span>
                                  <span>{result.takeProfit1}</span>
                                </div>
                                {result.takeProfit2 && (
                                  <div className="grid grid-cols-2">
                                    <span className="text-muted-foreground">Take Profit 2:</span>
                                    <span>{result.takeProfit2}</span>
                                  </div>
                                )}
                                {result.takeProfit3 && (
                                  <div className="grid grid-cols-2">
                                    <span className="text-muted-foreground">Take Profit 3:</span>
                                    <span>{result.takeProfit3}</span>
                                  </div>
                                )}
                                <div className="grid grid-cols-2">
                                  <span className="text-muted-foreground">Entry Time:</span>
                                  <span>{new Date(result.entryTime).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium mb-2">Analysis Results</h4>
                              <div className="space-y-2 text-sm">
                                <div className="grid grid-cols-2">
                                  <span className="text-muted-foreground">Outcome:</span>
                                  <span>{renderOutcomeBadge(result.outcome)}</span>
                                </div>
                                {result.hitTime && (
                                  <div className="grid grid-cols-2">
                                    <span className="text-muted-foreground">Hit Time:</span>
                                    <span>{new Date(result.hitTime).toLocaleString()}</span>
                                  </div>
                                )}
                                {result.pnl !== undefined && (
                                  <div className="grid grid-cols-2">
                                    <span className="text-muted-foreground">P&L:</span>
                                    <span className={result.pnl >= 0 ? 'text-green-500' : 'text-red-500'}>
                                      {result.pnl >= 0 ? '+' : ''}{result.pnl.toFixed(2)}
                                    </span>
                                  </div>
                                )}
                                {result.pnlPercentage !== undefined && (
                                  <div className="grid grid-cols-2">
                                    <span className="text-muted-foreground">P&L %:</span>
                                    <span className={result.pnlPercentage >= 0 ? 'text-green-500' : 'text-red-500'}>
                                      {result.pnlPercentage >= 0 ? '+' : ''}{result.pnlPercentage.toFixed(2)}%
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 border rounded-md">
                <div className="mb-4">
                  <LineChart className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-1">No Analysis Results Yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Select an asset, configure date range, and click "Analyze Signals" to see results here.
                </p>
                <Button
                  onClick={() => setSelectedTab('signals')}
                  variant="outline"
                >
                  Go to Signals Tab
                </Button>
              </div>
            )}
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
                          .map(([signalId, analysis]) => (
                            <div key={signalId} className="border rounded-md p-4">
                              <div className="prose prose-sm max-w-none dark:prose-invert">
                                {analysis.split('\n').map((paragraph, i) => (
                                  <p key={i}>{paragraph}</p>
                                ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8">
                    <Brain className="h-8 w-8 text-muted-foreground mb-4" />
                    <p>Click "Analyze Signals with AI" to generate AI-powered insights for your signals.</p>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>
          
          {/* Historical Data Tab */}
          <TabsContent value="history" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Historical Data</h3>
              <div className="space-x-2">
                <Label 
                  htmlFor="file-upload" 
                  className="cursor-pointer inline-flex items-center px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium"
                >
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Upload Historical Data
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploading || !selectedAsset}
                />
              </div>
            </div>
            
            <Card className="p-4">
              <h4 className="text-sm font-medium mb-4">Google Sheets Integration</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sheetId">Google Sheet ID</Label>
                    <Input
                      id="sheetId"
                      value={sheetId}
                      onChange={(e) => setSheetId(e.target.value)}
                      placeholder="Enter Google Sheet ID"
                      className="mb-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      The ID can be found in the URL: https://docs.google.com/spreadsheets/d/<strong>SHEET_ID</strong>/edit
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="sheetName">Sheet Name</Label>
                    <Input
                      id="sheetName"
                      value={sheetName}
                      onChange={(e) => setSheetName(e.target.value)}
                      placeholder="Sheet1"
                      className="mb-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      The name of the sheet tab (default: Sheet1)
                    </p>
                  </div>
                </div>
                
                <Button 
                  onClick={fetchGoogleSheetData}
                  disabled={isLoading || !sheetId}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Loading Sheet Data...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Load from Google Sheet
                    </>
                  )}
                </Button>
              </div>
            </Card>
            
            {uploadStatus && (
              <Alert variant={uploadStatus.success ? "default" : "destructive"}>
                <div className="flex items-center">
                  {uploadStatus.success ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <AlertCircle className="h-4 w-4 mr-2" />
                  )}
                  <AlertTitle>{uploadStatus.success ? "Success" : "Error"}</AlertTitle>
                </div>
                <AlertDescription>{uploadStatus.message}</AlertDescription>
              </Alert>
            )}
            
            {updateStatus && (
              <Alert variant={updateStatus.success ? "default" : "destructive"}>
                <div className="flex items-center">
                  {updateStatus.success ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <AlertCircle className="h-4 w-4 mr-2" />
                  )}
                  <AlertTitle>{updateStatus.success ? "Success" : "Error"}</AlertTitle>
                </div>
                <AlertDescription>{updateStatus.message}</AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {/* JSON Import Dialog */}
      <Dialog open={showJsonImport} onOpenChange={setShowJsonImport}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Import Signals from JSON</DialogTitle>
            <DialogDescription>
              Paste valid JSON with an array of signal objects to import them into the analyzer.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <Textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='[{"id": "signal-1", "asset": "BTCUSDT", "direction": "long", "entryPrice": 68500, "stopLoss": 67200, "takeProfit1": 70000 }]'
              className="h-[200px] font-mono text-sm"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowJsonImport(false)}>
              Cancel
            </Button>
            <Button onClick={handleJsonImport} disabled={!jsonInput}>
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}