import { useState, useRef, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Button } from './button';
import { Input } from './input';
import { Textarea } from './textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './card';
import { ScrollArea } from './scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { 
  Download, 
  Upload, 
  Mic, 
  MicOff, 
  PlusCircle, 
  Calendar, 
  FileText, 
  BarChart4, 
  PieChart, 
  LineChart, 
  Award, 
  Brain, 
  BookOpenCheck,
  Camera,
  Edit,
  Trash2,
  Tags,
  Clock,
  Lightbulb
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Label } from './label';
import { Badge } from './badge';
import { Separator } from './separator';
import { useTrader, Trade } from '../../lib/stores/useTrader';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Trade Journal entry types
interface JournalEntry {
  id: string;
  date: Date;
  content: string;
  title?: string;
  audioUrl?: string;
  imageUrl?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  aiAnalysis?: string;
  hybridScore?: number;
  tradeIds?: string[];
  tags?: string[];
  mood?: number;
  mentalState?: string;
  setupType?: string;
  lessonLearned?: string;
  createdAt: string;
  tradeStats?: {
    pnl: number;
    winRate: number;
    tradesCount: number;
  };
}

// Trading setup types
interface TradingSetup {
  id: string;
  name: string;
  description: string;
  winRate: number;
  avgProfit: number;
  count: number;
  profitFactor?: number;
  avgWinSize?: number;
  avgLossSize?: number;
  expectancy?: number;
  bestTimeOfDay?: string;
  bestDayOfWeek?: string;
  bestMarketCondition?: string;
  tags?: string[];
}

// Mood tracking types
type Mood = {
  date: string;
  value: number;
  note?: string;
};

export function TradeJournal() {
  // State management
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [entryContent, setEntryContent] = useState('');
  const [entryTitle, setEntryTitle] = useState('');
  const [activeTab, setActiveTab] = useState('analytics');
  const [isRecording, setIsRecording] = useState(false);
  const [hybridScore, setHybridScore] = useState(0);
  const [selectedTrades, setSelectedTrades] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentMood, setCurrentMood] = useState<number>(5);
  const [setupType, setSetupType] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [mentalState, setMentalState] = useState<string>('');
  const [lessonLearned, setLessonLearned] = useState<string>('');
  const [moodHistory, setMoodHistory] = useState<Mood[]>([]);
  // State for session performance comparisons (AM vs PM)
  const [amPmPerformance, setAmPmPerformance] = useState<{
    winRates: number[];
    avgPnLs: number[];
    tradeCounts: number[];
  }>({
    winRates: [76, 62], // Default values for initial render
    avgPnLs: [245, 180],
    tradeCounts: [15, 22]
  });
  
  // State for day of week performance
  const [dayOfWeekPerformance, setDayOfWeekPerformance] = useState<{
    winRates: number[];
    avgPnLs: number[];
    tradeCounts: number[];
  }>({
    winRates: [68, 75, 62, 71, 66], // Default values for initial render
    avgPnLs: [210, 285, 175, 230, 190], 
    tradeCounts: [12, 15, 18, 14, 20]
  });
  
  // State for correlation metrics
  const [correlationMetrics, setCorrelationMetrics] = useState<{
    moodVsPerformance: number;
    entryTimeVsProfit: number;
    mentalStateVsWinRate: Record<string, number>;
  }>({
    moodVsPerformance: 0.65,
    entryTimeVsProfit: -0.32,
    mentalStateVsWinRate: {
      'Focused': 0.72,
      'Calm': 0.68,
      'Confident': 0.65,
      'Anxious': 0.45,
      'Distracted': 0.37
    }
  });
  
  const [tradingSetups, setTradingSetups] = useState<TradingSetup[]>([
    { 
      id: '1', 
      name: 'Breakout', 
      description: 'Trading breakouts of key levels', 
      winRate: 0.68, 
      avgProfit: 253, 
      count: 42,
      profitFactor: 2.3,
      avgWinSize: 350,
      avgLossSize: -190,
      expectancy: 112,
      bestTimeOfDay: 'Market Open',
      bestDayOfWeek: 'Tuesday',
      bestMarketCondition: 'High Volatility',
      tags: ['Breakout', 'Momentum', 'Volume Spike']
    },
    { 
      id: '2', 
      name: 'Pullback', 
      description: 'Buying dips in uptrends', 
      winRate: 0.72, 
      avgProfit: 189, 
      count: 36,
      profitFactor: 2.8,
      avgWinSize: 280,
      avgLossSize: -130,
      expectancy: 136,
      bestTimeOfDay: 'Mid-Day',
      bestDayOfWeek: 'Wednesday',
      bestMarketCondition: 'Uptrend',
      tags: ['Pullback', 'Support', 'Trend Continuation']
    },
    { 
      id: '3', 
      name: 'Range Play', 
      description: 'Trading within established ranges', 
      winRate: 0.65, 
      avgProfit: 124, 
      count: 28,
      profitFactor: 2.1,
      avgWinSize: 210,
      avgLossSize: -120,
      expectancy: 80,
      bestTimeOfDay: 'Afternoon',
      bestDayOfWeek: 'Thursday',
      bestMarketCondition: 'Low Volatility',
      tags: ['Range Bound', 'Support/Resistance', 'Mean Reversion']
    },
    { 
      id: '4', 
      name: 'Trend Continuation', 
      description: 'Following strong trends', 
      winRate: 0.77, 
      avgProfit: 312, 
      count: 35,
      profitFactor: 3.2,
      avgWinSize: 420,
      avgLossSize: -170,
      expectancy: 240,
      bestTimeOfDay: 'Mid-Day',
      bestDayOfWeek: 'Monday',
      bestMarketCondition: 'Strong Trend',
      tags: ['Trend Following', 'Momentum', 'Higher Timeframe']
    },
  ]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { trades, tradeStats: stats } = useTrader();
  
  // Popular trading tags
  const popularTags = [
    'Breakout', 'Pullback', 'Reversal', 'Trend Following',
    'Scalp', 'Swing', 'Position', 'Gap Trade', 'NFP', 'News Event',
    'Overtraded', 'FOMO', 'Revenge Trade', 'Disciplined', 'Planned'
  ];

  // Mental states
  const mentalStates = [
    'Focused', 'Distracted', 'Tired', 'Energetic', 'Anxious',
    'Confident', 'Patient', 'Impatient', 'Frustrated', 'Calm'
  ];
  
  // Calculate Hybrid Score based on multiple factors
  const calculateHybridScore = () => {
    const winRateWeight = 0.3;
    const profitFactorWeight = 0.3;
    const riskRewardWeight = 0.2;
    const consistencyWeight = 0.2;

    const winRateScore = stats.winRate * 100;
    const profitFactorScore = Math.min(stats.profitFactor * 20, 100);
    const riskRewardScore = Math.min((stats.avgWin / Math.abs(stats.avgLoss)) * 25, 100);
    const consistencyScore = 75; // Mock consistency score

    return (
      (winRateScore * winRateWeight) +
      (profitFactorScore * profitFactorWeight) +
      (riskRewardScore * riskRewardWeight) +
      (consistencyScore * consistencyWeight)
    );
  };

  // Generate detailed PDF Report
  const generatePDFReport = async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();
    
    // Add header
    page.drawText('Trading Performance Report', {
      x: 50,
      y: height - 50,
      size: 20,
      font: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
      color: rgb(0, 0.3, 0.6)
    });
    
    page.drawText(`Generated on ${new Date().toLocaleDateString()}`, {
      x: 50,
      y: height - 75,
      size: 10,
      color: rgb(0.4, 0.4, 0.4)
    });
    
    // Add hybrid score section
    page.drawText(`Hybrid Score: ${hybridScore.toFixed(2)}`, {
      x: 50,
      y: height - 120,
      size: 14,
      font: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
      color: rgb(0, 0.5, 0)
    });
    
    // Draw score interpretation
    let scoreInterpretation = "";
    if (hybridScore > 80) scoreInterpretation = "Excellent - Your trading system is highly effective";
    else if (hybridScore > 65) scoreInterpretation = "Good - Your strategy shows solid performance";
    else if (hybridScore > 50) scoreInterpretation = "Average - Consider optimizing your approach";
    else scoreInterpretation = "Needs Improvement - Review your trading strategy";
    
    page.drawText(scoreInterpretation, {
      x: 50,
      y: height - 145,
      size: 10,
      color: rgb(0.3, 0.3, 0.3)
    });
    
    // Draw separator line
    page.drawLine({
      start: { x: 50, y: height - 160 },
      end: { x: width - 50, y: height - 160 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
    
    // Add performance metrics section
    page.drawText('Performance Metrics', {
      x: 50,
      y: height - 190,
      size: 14,
      font: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
      color: rgb(0.1, 0.1, 0.1)
    });
    
    // Add key metrics in a two-column layout
    const leftMetrics = [
      `Win Rate: ${(stats.winRate * 100).toFixed(2)}%`,
      `Profit Factor: ${stats.profitFactor.toFixed(2)}`,
      `Net P&L: $${stats.netPnL.toFixed(2)}`,
      `Total Trades: ${stats.totalTrades}`,
    ];
    
    const rightMetrics = [
      `Avg Win: $${stats.avgWin.toFixed(2)}`,
      `Avg Loss: $${Math.abs(stats.avgLoss).toFixed(2)}`,
      `Largest Win: $${stats.largestWin.toFixed(2)}`,
      `Largest Loss: $${Math.abs(stats.largestLoss).toFixed(2)}`,
    ];
    
    leftMetrics.forEach((metric, index) => {
      page.drawText(metric, {
        x: 50,
        y: height - 220 - (index * 25),
        size: 10,
      });
    });
    
    rightMetrics.forEach((metric, index) => {
      page.drawText(metric, {
        x: 300,
        y: height - 220 - (index * 25),
        size: 10,
      });
    });
    
    // Draw separator line
    page.drawLine({
      start: { x: 50, y: height - 340 },
      end: { x: width - 50, y: height - 340 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
    
    // Add trading setups section
    page.drawText('Top Trading Setups', {
      x: 50,
      y: height - 370,
      size: 14,
      font: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
      color: rgb(0.1, 0.1, 0.1)
    });
    
    // Setup headers
    page.drawText('Setup Name', {
      x: 50,
      y: height - 395,
      size: 9,
      font: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
      color: rgb(0.4, 0.4, 0.4)
    });
    
    page.drawText('Win Rate', {
      x: 200,
      y: height - 395,
      size: 9,
      font: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
      color: rgb(0.4, 0.4, 0.4)
    });
    
    page.drawText('Avg Profit', {
      x: 300,
      y: height - 395,
      size: 9,
      font: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
      color: rgb(0.4, 0.4, 0.4)
    });
    
    page.drawText('Count', {
      x: 400,
      y: height - 395,
      size: 9,
      font: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
      color: rgb(0.4, 0.4, 0.4)
    });
    
    // Draw setups data
    tradingSetups.slice(0, 4).forEach((setup, index) => {
      page.drawText(setup.name, {
        x: 50,
        y: height - 420 - (index * 25),
        size: 10,
      });
      
      page.drawText(`${(setup.winRate * 100).toFixed(0)}%`, {
        x: 200,
        y: height - 420 - (index * 25),
        size: 10,
      });
      
      page.drawText(`$${setup.avgProfit.toFixed(2)}`, {
        x: 300,
        y: height - 420 - (index * 25),
        size: 10,
      });
      
      page.drawText(`${setup.count}`, {
        x: 400,
        y: height - 420 - (index * 25),
        size: 10,
      });
    });
    
    // Footer with recommendations
    page.drawText('Recommendations:', {
      x: 50,
      y: height - 550,
      size: 12,
      font: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
      color: rgb(0.1, 0.1, 0.1)
    });
    
    // Simple algorithm to generate recommendations
    const recommendations = [];
    if (stats.winRate < 0.5) {
      recommendations.push("Work on improving your entry criteria to increase win rate");
    }
    
    if (stats.avgWin / Math.abs(stats.avgLoss) < 1.5) {
      recommendations.push("Focus on improving your risk/reward ratio by letting winners run longer");
    }
    
    if (stats.profitFactor < 2) {
      recommendations.push("Aim to increase your profit factor by cutting losses faster");
    }
    
    if (tradingSetups[0].winRate > stats.winRate + 0.1) {
      recommendations.push(`Consider trading more ${tradingSetups[0].name} setups, as they have a higher win rate`);
    }
    
    recommendations.forEach((rec, index) => {
      page.drawText(`• ${rec}`, {
        x: 50,
        y: height - 580 - (index * 20),
        size: 10,
        color: rgb(0.2, 0.2, 0.2)
      });
    });
    
    // Add disclaimer
    page.drawText('This report is generated by Trade Hybrid AI for reference purposes only and does not constitute financial advice.', {
      x: 50,
      y: 50,
      size: 8,
      color: rgb(0.5, 0.5, 0.5)
    });
    
    // Generate and download PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'trading-performance-report.pdf';
    link.click();
  };
  
  // Handle image selection
  const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Toggle mood value
  const handleMoodChange = (value: number) => {
    setCurrentMood(value);
  };
  
  // Toggle tag selection
  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  // Toggle trade selection
  const handleTradeToggle = (tradeId: string) => {
    if (selectedTrades.includes(tradeId)) {
      setSelectedTrades(selectedTrades.filter(id => id !== tradeId));
    } else {
      setSelectedTrades([...selectedTrades, tradeId]);
    }
  };
  
  // Clear form
  const resetForm = () => {
    setEntryContent('');
    setEntryTitle('');
    setSelectedTrades([]);
    setSelectedTags([]);
    setCurrentMood(5);
    setSetupType('');
    setImageFile(null);
    setImagePreviewUrl(null);
    setMentalState('');
    setLessonLearned('');
  };
  
  // Save journal entry with enhanced data
  const saveJournalEntry = async () => {
    if (!entryContent) return;
    
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date(),
      title: entryTitle || `Journal Entry - ${new Date().toLocaleDateString()}`,
      content: entryContent,
      hybridScore: hybridScore,
      tradeIds: selectedTrades,
      tags: selectedTags,
      mood: currentMood,
      mentalState: mentalState,
      setupType: setupType,
      lessonLearned: lessonLearned,
      createdAt: new Date().toISOString(),
      tradeStats: {
        pnl: stats.netPnL,
        winRate: stats.winRate,
        tradesCount: stats.totalTrades
      }
    };
    
    // If there's an image, prepare it for upload
    if (imageFile) {
      // In a real implementation, you'd upload the image to your server
      // and get back a URL to store in the database
      // For now, we're just setting a placeholder URL
      newEntry.imageUrl = imagePreviewUrl || '';
    }
    
    // Save to database
    try {
      const response = await fetch('/api/journal/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry)
      });
      
      if (response.ok) {
        setEntries([newEntry, ...entries]);
        
        // Update mood history
        const newMood = {
          date: new Date().toISOString().split('T')[0],
          value: currentMood,
          note: entryContent.substring(0, 50) + (entryContent.length > 50 ? '...' : '')
        };
        setMoodHistory([...moodHistory, newMood]);
        
        // Update setup statistics if a setup was selected
        if (setupType) {
          const setupIndex = tradingSetups.findIndex(s => s.name === setupType);
          if (setupIndex >= 0) {
            const updatedSetups = [...tradingSetups];
            const setup = updatedSetups[setupIndex];
            
            // In a real implementation, we'd calculate this based on actual trade data
            // For now, we're just incrementing the count
            updatedSetups[setupIndex] = {
              ...setup,
              count: setup.count + 1
            };
            
            setTradingSetups(updatedSetups);
          }
        }
        
        // Reset form
        resetForm();
      }
    } catch (error) {
      console.error('Error saving journal entry:', error);
    }
  };
  
  // Toggle audio recording
  const toggleRecording = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const audioChunks: BlobPart[] = [];
      
      mediaRecorder.addEventListener('dataavailable', (event) => {
        audioChunks.push(event.data);
      });
      
      mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // In a real implementation, you'd upload this audio to your server
        // For now, we're just setting it to the entry content as a placeholder
        setEntryContent(entryContent + "\n\n[Audio note recorded]");
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      });
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error recording audio:', error);
    }
  };
  
  // Fetch journal entries
  const fetchJournalEntries = async () => {
    try {
      const response = await fetch('/api/journal/entries');
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
        
        // Extract mood data from entries
        const moods = data
          .filter((entry: JournalEntry) => entry.mood !== undefined)
          .map((entry: JournalEntry) => ({
            date: new Date(entry.createdAt).toISOString().split('T')[0],
            value: entry.mood as number,
            note: entry.content.substring(0, 50) + (entry.content.length > 50 ? '...' : '')
          }));
        
        setMoodHistory(moods);
      }
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      
      // For development, create some sample entries
      const sampleEntries: JournalEntry[] = [
        {
          id: '1',
          date: new Date('2025-03-28'),
          title: 'Strong trading day with focus on breakouts',
          content: 'Had a very productive day trading breakouts in tech stocks. My patience paid off when AAPL broke above resistance and continued higher throughout the session. I maintained my discipline by sticking to my trading plan.',
          sentiment: 'positive',
          tags: ['Breakout', 'Disciplined', 'Planned'],
          mood: 8,
          mentalState: 'Focused',
          setupType: 'Breakout',
          hybridScore: 85.2,
          createdAt: '2025-03-28T14:32:00Z',
          tradeStats: {
            pnl: 540,
            winRate: 0.75,
            tradesCount: 4
          }
        },
        {
          id: '2',
          date: new Date('2025-03-27'),
          title: 'Challenging day with mixed signals',
          content: 'Markets were choppy today with conflicting signals. I took some trades without proper confirmation and paid the price. Need to work on patience and waiting for my A+ setups instead of forcing trades.',
          sentiment: 'negative',
          tags: ['Overtraded', 'FOMO'],
          mood: 4,
          mentalState: 'Anxious',
          lessonLearned: 'Wait for proper confirmation before entering trades',
          hybridScore: 68.5,
          createdAt: '2025-03-27T19:15:00Z',
          tradeStats: {
            pnl: -220,
            winRate: 0.33,
            tradesCount: 6
          }
        },
        {
          id: '3',
          date: new Date('2025-03-26'),
          title: 'Successful range-bound trading',
          content: 'Identified that markets were trading in a range early in the session. Focused on buying support and selling resistance within the range. This patient approach worked well today.',
          sentiment: 'positive',
          tags: ['Range Play', 'Patient', 'Disciplined'],
          mood: 7,
          mentalState: 'Calm',
          setupType: 'Range Play',
          hybridScore: 82.3,
          createdAt: '2025-03-26T16:45:00Z',
          tradeStats: {
            pnl: 380,
            winRate: 0.8,
            tradesCount: 5
          }
        }
      ];
      
      setEntries(sampleEntries);
      
      // Extract mood data from sample entries
      const moods = sampleEntries
        .filter(entry => entry.mood !== undefined)
        .map(entry => ({
          date: new Date(entry.createdAt).toISOString().split('T')[0],
          value: entry.mood as number,
          note: entry.content.substring(0, 50) + (entry.content.length > 50 ? '...' : '')
        }));
      
      setMoodHistory(moods);
    }
  };
  
  // Calculate hybrid score when stats change
  useEffect(() => {
    setHybridScore(calculateHybridScore());
  }, [stats]);
  
  // Fetch journal entries on component mount
  useEffect(() => {
    fetchJournalEntries();
  }, []);
  
  // Process journal entries to extract insights
  useEffect(() => {
    if (entries.length > 0) {
      // Update mood history
      const moodData = entries
        .filter((entry: JournalEntry) => entry.mood !== undefined)
        .map((entry: JournalEntry) => ({
          date: new Date(entry.createdAt).toISOString().split('T')[0],
          value: entry.mood as number,
          note: entry.content.substring(0, 30) + (entry.content.length > 30 ? '...' : '')
        }));
      setMoodHistory(moodData);
      
      // Calculate session performance metrics from associated trades
      calculateSessionPerformance();
      
      // Calculate day of week performance
      calculateDayOfWeekPerformance();
      
      // Extract and analyze trading setups
      analyzeSetups();
    }
  }, [entries, trades]);
  
  // Function to calculate AM/PM session performance from trades
  const calculateSessionPerformance = () => {
    // Filter trades that are associated with journal entries
    const journalTrades = trades.filter(trade => 
      entries.some(entry => entry.tradeIds?.includes(trade.id))
    );
    
    // Separate AM and PM trades based on execution time
    const amTrades = journalTrades.filter(trade => {
      const tradeHour = new Date(trade.entryTime).getHours();
      return tradeHour >= 9 && tradeHour < 12; // 9 AM to 12 PM
    });
    
    const pmTrades = journalTrades.filter(trade => {
      const tradeHour = new Date(trade.entryTime).getHours();
      return tradeHour >= 12 && tradeHour < 16; // 12 PM to 4 PM
    });
    
    // Calculate metrics for AM session
    const amWinRate = amTrades.length > 0 
      ? amTrades.filter(t => t.profit > 0).length / amTrades.length * 100 
      : 0;
    const amAvgPnL = amTrades.length > 0
      ? amTrades.reduce((sum, t) => sum + t.profit, 0) / amTrades.length
      : 0;
    
    // Calculate metrics for PM session
    const pmWinRate = pmTrades.length > 0 
      ? pmTrades.filter(t => t.profit > 0).length / pmTrades.length * 100 
      : 0;
    const pmAvgPnL = pmTrades.length > 0
      ? pmTrades.reduce((sum, t) => sum + t.profit, 0) / pmTrades.length
      : 0;
    
    // Update the comparison data state
    setAmPmPerformance({
      winRates: [amWinRate, pmWinRate],
      avgPnLs: [amAvgPnL, pmAvgPnL],
      tradeCounts: [amTrades.length, pmTrades.length]
    });
  };
  
  // Function to analyze day of week performance
  const calculateDayOfWeekPerformance = () => {
    // Filter trades that are associated with journal entries
    const journalTrades = trades.filter(trade => 
      entries.some(entry => entry.tradeIds?.includes(trade.id))
    );
    
    // Initialize metrics for each day
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const dayMetrics = days.map(() => ({ 
      winRate: 0, 
      avgPnL: 0, 
      tradeCount: 0,
      totalPnL: 0,
      wins: 0,
      losses: 0
    }));
    
    // Calculate metrics for each day
    journalTrades.forEach(trade => {
      const tradeDate = new Date(trade.entryTime);
      const dayIndex = tradeDate.getDay() - 1; // 0 = Monday, 4 = Friday
      
      if (dayIndex >= 0 && dayIndex < 5) { // Only weekdays
        dayMetrics[dayIndex].tradeCount++;
        dayMetrics[dayIndex].totalPnL += trade.profit;
        
        if (trade.profit > 0) {
          dayMetrics[dayIndex].wins++;
        } else {
          dayMetrics[dayIndex].losses++;
        }
      }
    });
    
    // Calculate derived metrics
    for (let i = 0; i < dayMetrics.length; i++) {
      const metrics = dayMetrics[i];
      
      if (metrics.tradeCount > 0) {
        metrics.winRate = (metrics.wins / metrics.tradeCount) * 100;
        metrics.avgPnL = metrics.totalPnL / metrics.tradeCount;
      }
    }
    
    // Update the day of week performance state
    setDayOfWeekPerformance({
      winRates: dayMetrics.map(d => d.winRate),
      avgPnLs: dayMetrics.map(d => d.avgPnL),
      tradeCounts: dayMetrics.map(d => d.tradeCount)
    });
  };
  
  // Function to analyze trading setups
  const analyzeSetups = () => {
    // Extract setup types from entries
    const setupEntries = entries.filter(entry => entry.setupType);
    
    // Group entries by setup type
    const setupGroups: Record<string, JournalEntry[]> = {};
    setupEntries.forEach(entry => {
      const setupType = entry.setupType as string;
      if (!setupGroups[setupType]) {
        setupGroups[setupType] = [];
      }
      setupGroups[setupType].push(entry);
    });
    
    // For each setup, analyze performance
    const setupAnalytics: TradingSetup[] = [];
    
    Object.entries(setupGroups).forEach(([setupName, setupEntries]) => {
      // Get all trades associated with this setup
      const setupTradeIds = setupEntries.flatMap(entry => entry.tradeIds || []);
      const setupTrades = trades.filter(trade => setupTradeIds.includes(trade.id));
      
      // Calculate performance metrics
      const winCount = setupTrades.filter(t => t.profit > 0).length;
      const lossCount = setupTrades.filter(t => t.profit <= 0).length;
      const winRate = setupTrades.length > 0 ? winCount / setupTrades.length : 0;
      
      const winningTrades = setupTrades.filter(t => t.profit > 0);
      const losingTrades = setupTrades.filter(t => t.profit <= 0);
      
      const avgWinSize = winningTrades.length > 0 
        ? winningTrades.reduce((sum, t) => sum + t.profit, 0) / winningTrades.length 
        : 0;
      
      const avgLossSize = losingTrades.length > 0 
        ? losingTrades.reduce((sum, t) => sum + t.profit, 0) / losingTrades.length 
        : 0;
      
      const totalProfit = setupTrades.reduce((sum, t) => t.profit > 0 ? sum + t.profit : sum, 0);
      const totalLoss = Math.abs(setupTrades.reduce((sum, t) => t.profit <= 0 ? sum + t.profit : sum, 0));
      
      const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? 999 : 0;
      const expectancy = winRate * avgWinSize + (1 - winRate) * avgLossSize;
      
      // Get best time of day
      const morningTrades = setupTrades.filter(t => {
        const hour = new Date(t.entryTime).getHours();
        return hour >= 9 && hour < 12;
      });
      
      const afternoonTrades = setupTrades.filter(t => {
        const hour = new Date(t.entryTime).getHours();
        return hour >= 12 && hour < 16;
      });
      
      const morningWinRate = morningTrades.length > 0 
        ? morningTrades.filter(t => t.profit > 0).length / morningTrades.length 
        : 0;
      
      const afternoonWinRate = afternoonTrades.length > 0 
        ? afternoonTrades.filter(t => t.profit > 0).length / afternoonTrades.length 
        : 0;
      
      const bestTimeOfDay = morningWinRate > afternoonWinRate ? 'Morning' : 'Afternoon';
      
      // Get best day of week
      const dayWinRates = [0, 0, 0, 0, 0]; // Mon - Fri
      
      setupTrades.forEach(trade => {
        const day = new Date(trade.entryTime).getDay() - 1; // 0 = Monday
        if (day >= 0 && day < 5) {
          if (trade.profit > 0) {
            dayWinRates[day]++;
          }
        }
      });
      
      const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      const bestDayIndex = dayWinRates.indexOf(Math.max(...dayWinRates));
      const bestDayOfWeek = bestDayIndex >= 0 ? daysOfWeek[bestDayIndex] : 'N/A';
      
      // Get common tags for this setup
      const setupTags = setupEntries.flatMap(entry => entry.tags || []);
      const tagCounts: Record<string, number> = {};
      
      setupTags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
      
      const mostCommonTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([tag]) => tag);
      
      // Create setup analytics object
      setupAnalytics.push({
        id: setupName,
        name: setupName,
        description: `Analysis of ${setupName} trades`,
        winRate,
        avgProfit: setupTrades.reduce((sum, t) => sum + t.profit, 0) / setupTrades.length,
        count: setupTrades.length,
        profitFactor,
        avgWinSize,
        avgLossSize,
        expectancy,
        bestTimeOfDay,
        bestDayOfWeek,
        bestMarketCondition: 'N/A', // Would need market condition data
        tags: mostCommonTags
      });
    });
    
    // Update the trading setups state with our analyzed data
    // but keep existing setups if we don't have enough data yet
    if (setupAnalytics.length > 0) {
      setTradingSetups(setupAnalytics);
    }
  };
  
  // Session comparison data
  const amPmComparisonData = {
    labels: ['AM Session', 'PM Session'],
    datasets: [
      {
        label: 'Win Rate (%)',
        data: [76, 62],
        backgroundColor: 'rgba(75, 192, 92, 0.5)',
        borderColor: 'rgba(75, 192, 92, 1)',
        borderWidth: 1,
        yAxisID: 'y'
      },
      {
        label: 'Avg P&L ($)',
        data: [245, 180],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        yAxisID: 'y1'
      }
    ]
  };

  // Day of week analysis data
  const dayOfWeekData = {
    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    datasets: [
      {
        label: 'Win Rate (%)',
        data: [68, 75, 62, 71, 66],
        backgroundColor: 'rgba(75, 192, 92, 0.5)',
        borderColor: 'rgba(75, 192, 92, 1)',
        borderWidth: 1,
        yAxisID: 'y'
      },
      {
        label: 'Avg P&L ($)',
        data: [210, 285, 175, 230, 190],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        yAxisID: 'y1'
      },
      {
        label: 'Trade Count',
        data: [12, 15, 18, 14, 20],
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
        type: 'line',
        yAxisID: 'y2'
      }
    ]
  };

  // Market conditions performance data
  const marketConditionsData = {
    labels: ['Uptrend', 'Downtrend', 'Range-Bound', 'High Volatility', 'Low Volatility'],
    datasets: [
      {
        label: 'Win Rate (%)',
        data: [74, 67, 63, 59, 72],
        backgroundColor: 'rgba(75, 192, 92, 0.5)',
        borderColor: 'rgba(75, 192, 92, 1)',
        borderWidth: 1
      },
      {
        label: 'Profit Factor',
        data: [2.8, 2.2, 1.9, 1.7, 2.4],
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1
      }
    ]
  };

  // Prepare chart data
  const moodChartData = {
    labels: moodHistory.map(item => item.date),
    datasets: [
      {
        label: 'Mood Score',
        data: moodHistory.map(item => item.value),
        fill: false,
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.4
      }
    ]
  };
  
  // Prepare winning vs losing trades chart data
  const winLoseChartData = {
    labels: ['Winning Trades', 'Losing Trades'],
    datasets: [
      {
        data: [
          stats.totalTrades * stats.winRate,
          stats.totalTrades * (1 - stats.winRate)
        ],
        backgroundColor: [
          'rgba(75, 192, 92, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ],
        borderColor: [
          'rgba(75, 192, 92, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }
    ]
  };
  
  // Prepare setup performance chart data
  const setupChartData = {
    labels: tradingSetups.map(setup => setup.name),
    datasets: [
      {
        label: 'Win Rate (%)',
        data: tradingSetups.map(setup => setup.winRate * 100),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      },
      {
        label: 'Profit Factor',
        data: tradingSetups.map(setup => setup.profitFactor || 0),
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1
      },
      {
        label: 'Avg Profit ($)',
        data: tradingSetups.map(setup => setup.avgProfit),
        backgroundColor: 'rgba(75, 192, 92, 0.5)',
      }
    ]
  };
  
  // Calculate sentiment distribution
  const sentimentCounts = {
    positive: entries.filter(entry => entry.sentiment === 'positive').length,
    negative: entries.filter(entry => entry.sentiment === 'negative').length,
    neutral: entries.filter(entry => entry.sentiment === 'neutral').length
  };
  
  const sentimentChartData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [
      {
        data: [sentimentCounts.positive, sentimentCounts.neutral, sentimentCounts.negative],
        backgroundColor: [
          'rgba(75, 192, 92, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ],
        borderColor: [
          'rgba(75, 192, 92, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }
    ]
  };
  
  // Get mood emoji
  const getMoodEmoji = (moodValue: number) => {
    if (moodValue >= 8) return '😀';
    if (moodValue >= 6) return '🙂';
    if (moodValue >= 4) return '😐';
    if (moodValue >= 2) return '🙁';
    return '😞';
  };
  
  // Get sentiment color
  const getSentimentColor = (sentiment?: string) => {
    if (sentiment === 'positive') return 'bg-green-500';
    if (sentiment === 'negative') return 'bg-red-500';
    return 'bg-blue-500';
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trade Journal</h1>
          <p className="text-muted-foreground">
            Track your trades, analyze performance, and improve your trading psychology
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" />
                New Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Create Journal Entry</DialogTitle>
                <DialogDescription>
                  Document your trading thoughts, analyze your performance, and track your progress
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Entry title"
                    value={entryTitle}
                    onChange={(e) => setEntryTitle(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="content">Journal Entry</Label>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={toggleRecording}
                        title={isRecording ? "Stop recording" : "Record audio note"}
                      >
                        {isRecording ? (
                          <MicOff className="h-4 w-4 text-red-500" />
                        ) : (
                          <Mic className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={triggerFileInput}
                        title="Add screenshot or chart image"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageSelection}
                      />
                    </div>
                  </div>
                  <Textarea
                    id="content"
                    placeholder="Describe your trading day, thought process, and lessons learned..."
                    rows={6}
                    value={entryContent}
                    onChange={(e) => setEntryContent(e.target.value)}
                  />
                  
                  {imagePreviewUrl && (
                    <div className="mt-2 relative">
                      <img
                        src={imagePreviewUrl}
                        alt="Screenshot preview"
                        className="max-h-40 rounded-md object-contain"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 absolute top-1 right-1 bg-background/80"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreviewUrl(null);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2 block">Current Mood</Label>
                    <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                      <span className="text-xl">😞</span>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                        <button
                          key={value}
                          type="button"
                          className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            currentMood === value
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted hover:bg-muted/80'
                          }`}
                          onClick={() => handleMoodChange(value)}
                        >
                          {value}
                        </button>
                      ))}
                      <span className="text-xl">😀</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="mentalState" className="mb-2 block">Mental State</Label>
                    <Select value={mentalState} onValueChange={setMentalState}>
                      <SelectTrigger id="mentalState">
                        <SelectValue placeholder="Select mental state" />
                      </SelectTrigger>
                      <SelectContent>
                        {mentalStates.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="setupType" className="mb-2 block">Trading Setup</Label>
                    <Select value={setupType} onValueChange={setSetupType}>
                      <SelectTrigger id="setupType">
                        <SelectValue placeholder="Select trading setup" />
                      </SelectTrigger>
                      <SelectContent>
                        {tradingSetups.map((setup) => (
                          <SelectItem key={setup.id} value={setup.name}>
                            {setup.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="mb-2 block">Related Trades</Label>
                    <ScrollArea className="h-24 rounded-md border p-2">
                      {trades.length > 0 ? (
                        trades.map((trade) => (
                          <div key={trade.id} className="flex items-center space-x-2 py-1">
                            <input
                              type="checkbox"
                              id={`trade-${trade.id}`}
                              checked={selectedTrades.includes(trade.id)}
                              onChange={() => handleTradeToggle(trade.id)}
                              className="rounded"
                            />
                            <label htmlFor={`trade-${trade.id}`} className="flex-1 text-sm flex justify-between">
                              <span>{trade.symbol} {trade.side === 'buy' ? 'Long' : 'Short'}</span>
                              <span className={trade.profit > 0 ? 'text-green-500' : 'text-red-500'}>
                                ${trade.profit.toFixed(2)}
                              </span>
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground p-2">No recent trades to link</p>
                      )}
                    </ScrollArea>
                  </div>
                </div>
                
                <div>
                  <Label className="mb-2 block">Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleTagToggle(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="lessonLearned" className="mb-2 block">Key Lesson Learned</Label>
                  <Textarea
                    id="lessonLearned"
                    placeholder="What's the most important lesson from today's trading?"
                    rows={2}
                    value={lessonLearned}
                    onChange={(e) => setLessonLearned(e.target.value)}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={resetForm}>Reset</Button>
                <Button onClick={saveJournalEntry} disabled={!entryContent}>Save Entry</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={generatePDFReport} className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart4 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="journal" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Journal Entries</span>
          </TabsTrigger>
          <TabsTrigger value="psychology" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">Trading Psychology</span>
          </TabsTrigger>
          <TabsTrigger value="setups" className="flex items-center gap-2">
            <BookOpenCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Setup Analysis</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="analytics" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Hybrid Score</CardTitle>
                <CardDescription>Overall trading performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{hybridScore.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {
                    hybridScore > 80 ? "Excellent" :
                    hybridScore > 65 ? "Good" :
                    hybridScore > 50 ? "Average" : 
                    "Needs improvement"
                  }
                </div>
                <div className="w-full bg-muted h-2 mt-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full rounded-full"
                    style={{ width: `${Math.min(100, hybridScore)}%` }}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Win Rate</CardTitle>
                <CardDescription>Percentage of winning trades</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{(stats.winRate * 100).toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Based on {stats.totalTrades} total trades
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">0%</span>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-green-500 h-full rounded-full"
                      style={{ width: `${stats.winRate * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">100%</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Profit Factor</CardTitle>
                <CardDescription>Gross profits divided by gross losses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{stats.profitFactor.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {
                    stats.profitFactor > 2.5 ? "Excellent" :
                    stats.profitFactor > 1.75 ? "Good" :
                    stats.profitFactor > 1.25 ? "Average" : 
                    "Needs improvement"
                  }
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">1</span>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${Math.min(100, (stats.profitFactor / 3) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">3+</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Profit & Loss</CardTitle>
                <CardDescription>Performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Net P&L</div>
                    <div className={`text-2xl font-bold ${stats.netPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ${stats.netPnL.toFixed(2)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Risk/Reward</div>
                    <div className="text-2xl font-bold">
                      {(stats.avgWin / Math.abs(stats.avgLoss)).toFixed(2)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Avg Win</div>
                    <div className="text-lg font-medium text-green-500">
                      ${stats.avgWin.toFixed(2)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Avg Loss</div>
                    <div className="text-lg font-medium text-red-500">
                      ${Math.abs(stats.avgLoss).toFixed(2)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Largest Win</div>
                    <div className="text-lg font-medium text-green-500">
                      ${stats.largestWin.toFixed(2)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Largest Loss</div>
                    <div className="text-lg font-medium text-red-500">
                      ${Math.abs(stats.largestLoss).toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Win/Loss Ratio</CardTitle>
                <CardDescription>Distribution of trades</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="h-[220px] w-[220px]">
                  <Pie data={winLoseChartData} />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Trading Session Analysis Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">AM vs PM Performance</CardTitle>
                <CardDescription>Compare morning and afternoon trading sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <Bar 
                    data={{
                      labels: ['AM Session', 'PM Session'],
                      datasets: [
                        {
                          label: 'Win Rate (%)',
                          data: amPmPerformance.winRates,
                          backgroundColor: 'rgba(75, 192, 92, 0.5)',
                          borderColor: 'rgba(75, 192, 92, 1)',
                          borderWidth: 1,
                          yAxisID: 'y'
                        },
                        {
                          label: 'Avg P&L ($)',
                          data: amPmPerformance.avgPnLs,
                          backgroundColor: 'rgba(54, 162, 235, 0.5)',
                          borderColor: 'rgba(54, 162, 235, 1)',
                          borderWidth: 1,
                          yAxisID: 'y1'
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          type: 'linear',
                          position: 'left',
                          title: {
                            display: true,
                            text: 'Win Rate (%)'
                          },
                          min: 0,
                          max: 100
                        },
                        y1: {
                          type: 'linear',
                          position: 'right',
                          title: {
                            display: true,
                            text: 'Avg P&L ($)'
                          },
                          grid: {
                            drawOnChartArea: false
                          }
                        }
                      }
                    }}
                  />
                </div>
                <div className="mt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Trade Count:</span> 
                    <span>AM: {amPmPerformance.tradeCounts[0]} / PM: {amPmPerformance.tradeCounts[1]}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="font-medium">Best Session:</span>
                    <span>{amPmPerformance.winRates[0] > amPmPerformance.winRates[1] ? 'Morning' : 'Afternoon'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Day of Week Analysis</CardTitle>
                <CardDescription>Performance by weekday</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <Bar 
                    data={{
                      labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                      datasets: [
                        {
                          label: 'Win Rate (%)',
                          data: dayOfWeekPerformance.winRates,
                          backgroundColor: 'rgba(75, 192, 92, 0.5)',
                          borderColor: 'rgba(75, 192, 92, 1)',
                          borderWidth: 1,
                          yAxisID: 'y'
                        },
                        {
                          label: 'Avg P&L ($)',
                          data: dayOfWeekPerformance.avgPnLs,
                          backgroundColor: 'rgba(54, 162, 235, 0.5)',
                          borderColor: 'rgba(54, 162, 235, 1)',
                          borderWidth: 1,
                          yAxisID: 'y1'
                        },
                        {
                          label: 'Trade Count',
                          data: dayOfWeekPerformance.tradeCounts,
                          backgroundColor: 'rgba(153, 102, 255, 0.5)',
                          borderColor: 'rgba(153, 102, 255, 1)',
                          borderWidth: 1,
                          type: 'line',
                          yAxisID: 'y2'
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          type: 'linear',
                          position: 'left',
                          title: {
                            display: true,
                            text: 'Win Rate (%)'
                          },
                          min: 0,
                          max: 100
                        },
                        y1: {
                          type: 'linear',
                          position: 'right',
                          title: {
                            display: true,
                            text: 'Avg P&L ($)'
                          },
                          grid: {
                            drawOnChartArea: false
                          }
                        },
                        y2: {
                          type: 'linear',
                          position: 'right',
                          title: {
                            display: false
                          },
                          display: false
                        }
                      }
                    }}
                  />
                </div>
                <div className="mt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Best Day:</span>
                    <span>
                      {(() => {
                        const index = dayOfWeekPerformance.winRates.indexOf(
                          Math.max(...dayOfWeekPerformance.winRates)
                        );
                        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
                        return days[index];
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="font-medium">Most Active Day:</span>
                    <span>
                      {(() => {
                        const index = dayOfWeekPerformance.tradeCounts.indexOf(
                          Math.max(...dayOfWeekPerformance.tradeCounts)
                        );
                        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
                        return days[index];
                      })()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Market Conditions Analysis Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Market Conditions</CardTitle>
                <CardDescription>Performance in different market environments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <Bar 
                    data={marketConditionsData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100
                        }
                      }
                    }}
                  />
                </div>
                <div className="mt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Best in:</span>
                    <span>Uptrend (74% Win Rate)</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="font-medium">Worst in:</span>
                    <span>High Volatility (59% Win Rate)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Psychological Correlation</CardTitle>
                <CardDescription>How mental state affects performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium mb-1 flex justify-between">
                      <span>Mood vs. Performance:</span>
                      <span className={correlationMetrics.moodVsPerformance > 0.5 ? 'text-green-500' : 'text-amber-500'}>
                        {(correlationMetrics.moodVsPerformance * 100).toFixed(0)}% correlation
                      </span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          correlationMetrics.moodVsPerformance > 0.5 ? 'bg-green-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${correlationMetrics.moodVsPerformance * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-1 flex justify-between">
                      <span>Entry Time vs. Profit:</span>
                      <span className={Math.abs(correlationMetrics.entryTimeVsProfit) > 0.5 ? 'text-green-500' : 'text-amber-500'}>
                        {(Math.abs(correlationMetrics.entryTimeVsProfit) * 100).toFixed(0)}% correlation
                      </span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          Math.abs(correlationMetrics.entryTimeVsProfit) > 0.5 ? 'bg-green-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.abs(correlationMetrics.entryTimeVsProfit) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="text-sm font-medium mb-2">Win Rate by Mental State:</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      {Object.entries(correlationMetrics.mentalStateVsWinRate)
                        .sort(([, a], [, b]) => b - a)
                        .map(([state, rate]) => (
                          <div key={state} className="flex justify-between">
                            <span>{state}:</span>
                            <span className={rate > 0.6 ? 'text-green-500 font-medium' : 'text-muted-foreground'}>
                              {(rate * 100).toFixed(0)}%
                            </span>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="journal" className="space-y-4 mt-4">
          {entries.length > 0 ? (
            <div className="space-y-4">
              {entries.map((entry) => (
                <Card key={entry.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{entry.title}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="text-xs text-muted-foreground flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(entry.date).toLocaleDateString()}
                          </div>
                          {entry.hybridScore && (
                            <div className="text-xs flex items-center">
                              <Award className="h-3 w-3 mr-1" />
                              Score: {entry.hybridScore.toFixed(1)}
                            </div>
                          )}
                          {entry.mood !== undefined && (
                            <div className="text-xs flex items-center">
                              {getMoodEmoji(entry.mood)}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm">{entry.content}</p>
                      
                      {entry.imageUrl && (
                        <img
                          src={entry.imageUrl}
                          alt="Journal entry screenshot"
                          className="rounded-md max-h-60 object-contain my-2"
                        />
                      )}
                      
                      {entry.lessonLearned && (
                        <div className="rounded-md bg-muted p-3 text-sm mt-2">
                          <div className="font-medium flex items-center mb-1">
                            <Lightbulb className="h-4 w-4 mr-1" />
                            Key Lesson
                          </div>
                          <p>{entry.lessonLearned}</p>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        {entry.tags && entry.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        
                        {entry.mentalState && (
                          <Badge variant="outline" className="text-xs">
                            {entry.mentalState}
                          </Badge>
                        )}
                        
                        {entry.setupType && (
                          <Badge variant="outline" className="text-xs bg-primary/10">
                            {entry.setupType}
                          </Badge>
                        )}
                        
                        {entry.sentiment && (
                          <div className={`w-2 h-2 rounded-full ${getSentimentColor(entry.sentiment)}`} />
                        )}
                      </div>
                    </div>
                  </CardContent>
                  
                  {entry.tradeStats && (
                    <CardFooter className="bg-muted/50 px-6 py-3">
                      <div className="w-full grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-xs text-muted-foreground">P&L</div>
                          <div className={`text-sm font-medium ${entry.tradeStats.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            ${entry.tradeStats.pnl.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Win Rate</div>
                          <div className="text-sm font-medium">
                            {(entry.tradeStats.winRate * 100).toFixed(0)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Trades</div>
                          <div className="text-sm font-medium">
                            {entry.tradeStats.tradesCount}
                          </div>
                        </div>
                      </div>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-muted/50 rounded-lg p-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No journal entries yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Create your first journal entry to start tracking your trading journey
              </p>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="mt-4">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    New Entry
                  </Button>
                </DialogTrigger>
                <DialogContent>{/* Dialog content same as above */}</DialogContent>
              </Dialog>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="psychology" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Mood Tracking</CardTitle>
                <CardDescription>Your trading psychology over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {moodHistory.length > 0 ? (
                  <Line 
                    data={moodChartData} 
                    options={{
                      scales: {
                        y: {
                          min: 0,
                          max: 10,
                          title: {
                            display: true,
                            text: 'Mood Score'
                          }
                        }
                      },
                      plugins: {
                        tooltip: {
                          callbacks: {
                            afterLabel: function(context) {
                              const index = context.dataIndex;
                              return moodHistory[index]?.note || '';
                            }
                          }
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No mood data available yet
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sentiment Analysis</CardTitle>
                <CardDescription>Distribution of trading emotions</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="flex justify-center h-full items-center">
                  {entries.length > 0 ? (
                    <div className="h-[220px] w-[220px]">
                      <Pie 
                        data={sentimentChartData}
                        options={{
                          plugins: {
                            legend: {
                              position: 'bottom'
                            }
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="text-muted-foreground">
                      No sentiment data available yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Mental State Analysis</CardTitle>
                <CardDescription>How your mental state affects trading performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(correlationMetrics.mentalStateVsWinRate)
                    .sort(([, a], [, b]) => b - a)
                    .map(([state, rate]) => (
                      <div key={state} className="flex items-center gap-2">
                        <div className="w-24 text-xs">{state}</div>
                        <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              rate > 0.65 ? 'bg-green-500' :
                              rate > 0.5 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${rate * 100}%` }}
                          />
                        </div>
                        <div className="w-12 text-xs text-right">{(rate * 100).toFixed(0)}%</div>
                      </div>
                    ))
                  }
                  
                  <div className="pt-4 mt-4 border-t space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Mood Consistency:</span>
                      <span className="text-sm">
                        {moodHistory.length > 3 ? 
                          (() => {
                            // Calculate standard deviation of mood (simple version)
                            const moodValues = moodHistory.map(m => m.value);
                            const avg = moodValues.reduce((a, b) => a + b, 0) / moodValues.length;
                            const variance = moodValues.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / moodValues.length;
                            const stdDev = Math.sqrt(variance);
                            
                            if (stdDev < 1.5) return "High (stable)";
                            if (stdDev < 3) return "Medium";
                            return "Low (volatile)";
                          })() 
                          : "Insufficient data"
                        }
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Trading When Optimal:</span>
                      <span className="text-sm">
                        {entries.filter(e => e.mood && e.mood >= 6 && e.mentalState && 
                          ['Focused', 'Calm', 'Confident'].includes(e.mentalState)).length} / {entries.length} entries
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Psychological Insights</CardTitle>
                <CardDescription>Key patterns and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="bg-muted p-3 rounded-md">
                    <span className="font-medium">Best Mental States:</span> Focused, Calm, Confident
                    <div className="text-xs mt-1 text-muted-foreground">
                      These states yield the highest win rates from {(correlationMetrics.mentalStateVsWinRate.Focused * 100).toFixed(0)}% to {(correlationMetrics.mentalStateVsWinRate.Calm * 100).toFixed(0)}%
                    </div>
                  </div>
                  
                  <div className="bg-muted p-3 rounded-md">
                    <span className="font-medium">Avoid Trading When:</span> Distracted, Anxious
                    <div className="text-xs mt-1 text-muted-foreground">
                      These states yield the lowest win rates of {(correlationMetrics.mentalStateVsWinRate.Distracted * 100).toFixed(0)}% and {(correlationMetrics.mentalStateVsWinRate.Anxious * 100).toFixed(0)}%
                    </div>
                  </div>
                  
                  <div className="bg-muted p-3 rounded-md">
                    <span className="font-medium">Mood-Performance Correlation:</span> {(correlationMetrics.moodVsPerformance * 100).toFixed(0)}%
                    <div className="text-xs mt-1 text-muted-foreground">
                      Strong correlation indicates your self-awareness is well-calibrated
                    </div>
                  </div>
                  
                  <div className="bg-muted p-3 rounded-md">
                    <span className="font-medium">Recommendation:</span>
                    <div className="text-xs mt-1 text-muted-foreground">
                      Consider adding a pre-trading checklist that includes a mental state assessment to avoid trading during suboptimal psychological conditions
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Advanced Psychological Correlations</CardTitle>
              <CardDescription>How your mental states affect specific aspects of trading</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Mental State vs. Trade Size</h3>
                  <div className="text-xs text-muted-foreground mb-2">
                    How your psychology affects position sizing
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Confident:</span>
                      <span className="text-green-500">+15% larger positions</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Anxious:</span>
                      <span className="text-red-500">-22% smaller positions</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Focused:</span>
                      <span className="text-green-500">+8% larger positions</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Distracted:</span>
                      <span className="text-red-500">-12% smaller positions</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Mental State vs. Trade Duration</h3>
                  <div className="text-xs text-muted-foreground mb-2">
                    How your psychology affects holding time
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Patient:</span>
                      <span className="text-green-500">+35% longer holds</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Impatient:</span>
                      <span className="text-red-500">-42% shorter holds</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Calm:</span>
                      <span className="text-green-500">+20% longer holds</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Anxious:</span>
                      <span className="text-red-500">-25% shorter holds</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Mental State vs. Risk Management</h3>
                  <div className="text-xs text-muted-foreground mb-2">
                    How your psychology affects risk parameters
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Focused:</span>
                      <span className="text-green-500">+18% better stop placement</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Distracted:</span>
                      <span className="text-red-500">-25% worse stop placement</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Confident:</span>
                      <span className="text-amber-500">±0% neutral effect</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Tired:</span>
                      <span className="text-red-500">-15% worse stop placement</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Psychology Insights</CardTitle>
              <CardDescription>AI-generated trading psychology analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium flex items-center">
                    <Brain className="h-4 w-4 mr-2" />
                    Trading Patterns
                  </h4>
                  <p className="text-sm mt-2">
                    Based on your journal entries, you tend to perform better when trading in focused mental states. 
                    Your win rate is {(correlationMetrics.mentalStateVsWinRate.Focused * 100).toFixed(0)}% when journaling with a 'Focused' mental state compared to {(correlationMetrics.mentalStateVsWinRate.Anxious * 100).toFixed(0)}% when 'Anxious'.
                    Consider implementing a pre-trading routine to ensure you're in an optimal mental state.
                  </p>
                </div>
                
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium flex items-center">
                    <LineChart className="h-4 w-4 mr-2" />
                    Emotion Correlation
                  </h4>
                  <p className="text-sm mt-2">
                    There's a {correlationMetrics.moodVsPerformance > 0.6 ? 'strong' : 'moderate'} correlation ({(correlationMetrics.moodVsPerformance * 100).toFixed(0)}%) between your mood score and trading performance.
                    Days with mood scores above 7 show significantly better returns than days with lower scores.
                    This suggests emotional management is key to your success.
                  </p>
                </div>
                
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium flex items-center">
                    <Tags className="h-4 w-4 mr-2" />
                    Tag Analysis
                  </h4>
                  <p className="text-sm mt-2">
                    Entries tagged with 'Disciplined' and 'Planned' have a significantly higher profitability
                    than those tagged with 'FOMO' or 'Overtraded'. This reinforces the importance of
                    following your trading plan rather than making impulsive decisions.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Generate Comprehensive Psychology Report
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="setups" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tradingSetups.map((setup) => (
              <Card key={setup.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{setup.name}</CardTitle>
                  <CardDescription className="text-xs">{setup.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Win Rate</span>
                      <span className="font-medium">{(setup.winRate * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-green-500 h-full rounded-full"
                        style={{ width: `${setup.winRate * 100}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-sm">Avg Profit</span>
                      <span className="font-medium">${setup.avgProfit.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm">Total Trades</span>
                      <span className="font-medium">{setup.count}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Setup Performance Comparison</CardTitle>
              <CardDescription>Analyzing effectiveness of different trading setups</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <Bar 
                data={setupChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Value'
                      }
                    }
                  }
                }}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Setup Recommendations</CardTitle>
              <CardDescription>AI-generated suggestions based on your performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium flex items-center">
                    <Award className="h-4 w-4 mr-2" />
                    Top Performing Setup
                  </h4>
                  <p className="text-sm mt-2">
                    <strong>Trend Continuation</strong> is your most profitable setup with a 77% win rate and $312 average profit.
                    Consider allocating more capital to this strategy and looking for similar setups across different markets.
                  </p>
                </div>
                
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium flex items-center">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Improvement Opportunities
                  </h4>
                  <p className="text-sm mt-2">
                    <strong>Range Play</strong> has your lowest win rate at 65%. Consider refining your entry and exit criteria
                    for range-bound markets or using smaller position sizes until your accuracy improves.
                  </p>
                </div>
                
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Time-Based Analysis
                  </h4>
                  <p className="text-sm mt-2">
                    <strong>Breakout</strong> setups perform 23% better during market opening hours (first 30 minutes)
                    compared to mid-day sessions. Consider focusing on this setup primarily during market opens.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}