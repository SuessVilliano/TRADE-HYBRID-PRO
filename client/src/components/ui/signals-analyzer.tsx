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
  const [aiAnalysisResults, setAiAnalysisResults] = useState<Record<string, string>>({});
  const [selectedChartImage, setSelectedChartImage] = useState<File | null>(null);
  const [chartImageUrl, setChartImageUrl] = useState<string>('');

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
      const allSignals = await googleSheetsService.fetchAllSignals();
      console.log("Signals received:", allSignals.length, "signals");
      setSignals(allSignals);
      
      // Extract unique assets from signals
      const assets = new Set(allSignals.map(signal => signal.asset));
      setAvailableAssets(Array.from(assets));
      
      if (assets.size > 0 && !selectedAsset) {
        setSelectedAsset(Array.from(assets)[0]);
      }
      
      // Show a debug message to the user if no signals were found
      if (allSignals.length === 0) {
        setUploadStatus({
          success: false,
          message: 'No signals found in Google Sheets. The demo version uses fallback data for testing.'
        });
        
        // Add some demo signals for testing
        const demoSignals = [
          {
            id: "demo-btc-1",
            timestamp: new Date().toISOString(),
            asset: "BTCUSDT",
            direction: "long" as const,
            entryPrice: 50000,
            stopLoss: 49000,
            takeProfit1: 52000,
            status: "active" as const,
            marketType: "crypto" as const,
            provider: "Paradox" as const,
            accuracy: 0.89
          },
          {
            id: "demo-eth-1",
            timestamp: new Date().toISOString(),
            asset: "ETHUSDT",
            direction: "short" as const,
            entryPrice: 3000,
            stopLoss: 3150,
            takeProfit1: 2800,
            status: "active" as const,
            marketType: "crypto" as const,
            provider: "Hybrid" as const,
            accuracy: 0.92
          }
        ];
        
        setSignals(demoSignals);
        
        // Extract assets from demo signals
        const demoAssets = new Set(demoSignals.map(signal => signal.asset));
        setAvailableAssets(Array.from(demoAssets));
        
        if (demoAssets.size > 0 && !selectedAsset) {
          setSelectedAsset(Array.from(demoAssets)[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching signals:', error);
      setUploadStatus({
        success: false,
        message: 'Error fetching signals. Using demo signals for testing.'
      });
      
      // Add demo signals as fallback
      const demoSignals = [
        {
          id: "demo-btc-1",
          timestamp: new Date().toISOString(),
          asset: "BTCUSDT",
          direction: "long" as const,
          entryPrice: 50000,
          stopLoss: 49000,
          takeProfit1: 52000,
          status: "active" as const,
          marketType: "crypto" as const,
          provider: "Paradox" as const,
          accuracy: 0.89
        },
        {
          id: "demo-eth-1",
          timestamp: new Date().toISOString(),
          asset: "ETHUSDT",
          direction: "short" as const,
          entryPrice: 3000,
          stopLoss: 3150,
          takeProfit1: 2800,
          status: "active" as const,
          marketType: "crypto" as const,
          provider: "Hybrid" as const,
          accuracy: 0.92
        }
      ];
      
      setSignals(demoSignals);
      
      // Extract assets from demo signals
      const demoAssets = new Set(demoSignals.map(signal => signal.asset));
      setAvailableAssets(Array.from(demoAssets));
      
      if (demoAssets.size > 0 && !selectedAsset) {
        setSelectedAsset(Array.from(demoAssets)[0]);
      }
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
      
      // Call OpenAI to analyze signals
      const results = await openAIService.analyzeSignals(filteredSignals);
      setAiAnalysisResults(results);
      setSelectedTab('ai-analysis');
    } catch (error) {
      console.error('Error analyzing signals with AI:', error);
      setUpdateStatus({
        success: false,
        message: 'Failed to analyze signals with AI. Please try again.'
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
      // Convert the image to base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedChartImage);
      
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        
        // Call OpenAI to analyze the chart image
        const timeframe = '1D'; // Default timeframe, could be made dynamic
        const result = await openAIService.analyzeChart(base64Image, selectedAsset, timeframe);
        
        setAiAnalysisResults(prev => ({
          ...prev,
          chartAnalysis: result
        }));
        
        setIsAiAnalyzing(false);
      };
    } catch (error) {
      console.error('Error analyzing chart image:', error);
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
  
  // Load initial data
  useEffect(() => {
    if (!initialSignals) {
      fetchSignals();
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
  }, [initialSignals]);
  
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
                  onClick={fetchSignals}
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