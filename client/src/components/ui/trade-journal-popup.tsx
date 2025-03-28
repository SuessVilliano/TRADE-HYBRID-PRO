import { useEffect, useState } from 'react';
import { ScrollArea, ScrollableContent } from './scroll-area';
import { X, Download, Upload, Mic, MicOff } from 'lucide-react';
import { Button } from './button';
import { useTrader, Trade } from '@/lib/stores/useTrader';
import { Textarea } from './textarea';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Switch } from './switch';
import { cn } from '@/lib/utils';
import { Input } from './input';
import { PopupContainer } from './popup-container';

// Same journal entry interface from ai-assistant.tsx
interface JournalEntry {
  id: string;
  date: Date;
  content: string;
  symbol: string;
  trades?: {
    side: 'buy' | 'sell';
    price: number;
    quantity: number;
    pnl?: number;
  }[];
  sentiment: 'positive' | 'negative' | 'neutral';
  lessons?: string[];
}

/**
 * Trade Journal Popup Component
 * - Displays trade history and journal entries
 * - Supports voice input for journal entries
 * - Allows importing trades from CSV/PDF files
 */
export function TradeJournalPopup({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  // Ensure safe closing with cleanup
  const handleClose = () => {
    if (onClose) {
      try {
        onClose();
      } catch (error) {
        console.error("Error closing trade journal popup:", error);
      }
    }
  };
  const { trades, tradeStats } = useTrader();
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [newEntry, setNewEntry] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [useVoiceInput, setUseVoiceInput] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedText, setRecordedText] = useState('');
  const [recognition, setRecognition] = useState<any | null>(null);

  // Tracking for new entries being recorded
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);

  // Initialize voice recognition if supported
  useEffect(() => {
    // Define the SpeechRecognition type to fix TypeScript errors
    interface IWindow extends Window {
      SpeechRecognition?: any;
      webkitSpeechRecognition?: any;
    }
    
    const customWindow = window as IWindow;
    
    if ('SpeechRecognition' in customWindow || 'webkitSpeechRecognition' in customWindow) {
      setIsVoiceSupported(true);
      const SpeechRecognitionConstructor = customWindow.SpeechRecognition || customWindow.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognitionConstructor();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      
      recognitionInstance.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setRecordedText(prev => prev + ' ' + finalTranscript);
        }
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);

  // Auto-cleanup recognition on unmount
  useEffect(() => {
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [recognition]);

  // Toggle voice recording
  const toggleRecording = () => {
    if (!recognition) return;
    
    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
      // Add recorded text to new entry
      setNewEntry(prev => prev + ' ' + recordedText.trim());
      setRecordedText('');
    } else {
      setRecordedText('');
      recognition.start();
      setIsRecording(true);
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Handle different file types
    const fileType = file.name.split('.').pop()?.toLowerCase();
    
    if (fileType === 'csv') {
      processCSVFile(file);
    } else if (fileType === 'pdf') {
      processPDFFile(file);
    } else {
      alert('Please upload a CSV or PDF file');
    }
  };

  const processCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string;
        const lines = csvContent.split('\n');
        
        // Skip header row and create trades from CSV data
        const importedTrades: any[] = [];
        const csvJournalEntries: JournalEntry[] = [];
        
        // Generate an entry for this import
        const newJournalEntry: JournalEntry = {
          id: `import-${Date.now()}`,
          date: new Date(),
          content: `Imported trades from ${file.name}`,
          symbol: 'Multiple',
          sentiment: 'neutral',
          trades: []
        };
        
        // Process each line and create trades
        lines.slice(1).forEach((line, index) => {
          if (!line.trim()) return;
          
          const columns = line.split(',');
          // Assuming format: date,symbol,side,quantity,price,exitPrice
          if (columns.length >= 6) {
            const symbol = columns[1].trim();
            const side = columns[2].trim().toLowerCase() as 'buy' | 'sell';
            const quantity = parseFloat(columns[3]);
            const price = parseFloat(columns[4]);
            const exitPrice = parseFloat(columns[5]);
            
            // Calculate profit
            const profit = side === 'buy' 
              ? (exitPrice - price) * quantity 
              : (price - exitPrice) * quantity;
            
            // Add to journal entry
            if (newJournalEntry.trades) {
              newJournalEntry.trades.push({
                side,
                price,
                quantity,
                pnl: profit
              });
            }
          }
        });
        
        // Add the new entry
        setJournalEntries(prev => [newJournalEntry, ...prev]);
        
      } catch (error) {
        console.error('Error processing CSV:', error);
        alert('Failed to process the CSV file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  const processPDFFile = (file: File) => {
    // In a real implementation, this would use a PDF parsing library
    // For now, we'll just create a placeholder entry
    const newEntry: JournalEntry = {
      id: `pdf-${Date.now()}`,
      date: new Date(),
      content: `Imported trading notes from ${file.name}`,
      symbol: 'PDF Import',
      sentiment: 'neutral'
    };
    
    setJournalEntries(prev => [newEntry, ...prev]);
    alert('PDF processing would parse trade data in a production environment');
  };

  // Add a new journal entry
  const addJournalEntry = () => {
    if (!newEntry.trim()) return;
    
    const entry: JournalEntry = {
      id: `entry-${Date.now()}`,
      date: new Date(),
      content: newEntry,
      symbol: selectedSymbol || 'General',
      sentiment: detectSentiment(newEntry),
      lessons: extractLessons(newEntry)
    };
    
    setJournalEntries(prev => [entry, ...prev]);
    setNewEntry('');
  };

  // Simple sentiment detection based on keywords
  const detectSentiment = (text: string): 'positive' | 'negative' | 'neutral' => {
    const lowerText = text.toLowerCase();
    const positiveWords = ['profit', 'gain', 'success', 'good', 'positive', 'happy', 'win'];
    const negativeWords = ['loss', 'mistake', 'bad', 'negative', 'error', 'wrong', 'failed'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    positiveWords.forEach(word => {
      if (lowerText.includes(word)) positiveCount++;
    });
    
    negativeWords.forEach(word => {
      if (lowerText.includes(word)) negativeCount++;
    });
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  };

  // Extract trading lessons from text
  const extractLessons = (text: string): string[] => {
    const lessons: string[] = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Extract sentences with lesson keywords
    const lessonKeywords = ['learn', 'lesson', 'takeaway', 'improve', 'next time', 'should have'];
    
    for (const sentence of sentences) {
      for (const keyword of lessonKeywords) {
        if (sentence.toLowerCase().includes(keyword)) {
          lessons.push(sentence.trim());
          break;
        }
      }
    }
    
    return lessons;
  };

  if (!isOpen) return null;

  return (
    <PopupContainer title="Trading Journal" onClose={onClose}>
      <div className="w-full flex flex-col md:flex-row gap-4">
        {/* Left panel: Trade history */}
        <div className="w-full md:w-1/2 flex flex-col">
          <h3 className="font-medium mb-2">Trade History</h3>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-sm text-muted-foreground">Win Rate:</span>
              <span className="ml-2 font-semibold">{tradeStats?.winRate || 0}%</span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Net P&L:</span>
              <span className={cn(
                "ml-2 font-semibold",
                (tradeStats?.netPnL || 0) > 0 ? "text-green-500" : "text-red-500"
              )}>
                {formatCurrency(tradeStats?.netPnL || 0)}
              </span>
            </div>
          </div>
          
          <ScrollableContent className="flex-1 h-[300px]">
            <div className="space-y-2">
              {trades && trades.length > 0 ? (
                trades.map((trade: Trade) => (
                  <div key={trade.id} className="border rounded-md p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{trade.symbol}</span>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        trade.side === 'buy' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      )}>
                        {trade.side.toUpperCase()}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {formatDate(trade.timestamp)}
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                      <div>Entry: {formatCurrency(trade.entryPrice)}</div>
                      <div>Exit: {formatCurrency(trade.exitPrice)}</div>
                      <div>Quantity: {trade.quantity}</div>
                      <div className={cn(
                        "font-semibold",
                        trade.profit > 0 ? "text-green-500" : "text-red-500"
                      )}>
                        P&L: {formatCurrency(trade.profit)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No trades found</p>
                  <p className="text-xs mt-1">Import your trades or execute new ones</p>
                </div>
              )}
            </div>
          </ScrollableContent>
          
          <div className="mt-4 flex justify-between">
            <div>
              <Input 
                type="file" 
                id="trade-import"
                className="hidden"
                accept=".csv,.pdf" 
                onChange={handleFileUpload}
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => document.getElementById('trade-import')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import Trades
              </Button>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        
        {/* Right panel: Journal entries */}
        <div className="w-full md:w-1/2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Journal Entries</h3>
            
            {isVoiceSupported && (
              <div className="flex items-center">
                <span className="text-xs mr-2">Voice Input</span>
                <Switch
                  checked={useVoiceInput}
                  onCheckedChange={setUseVoiceInput}
                />
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <div className="flex mb-2">
              <Input
                placeholder="Symbol (optional)"
                className="w-32 mr-2"
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
              />
              
              {useVoiceInput && (
                <Button
                  variant={isRecording ? "destructive" : "secondary"}
                  onClick={toggleRecording}
                  className="mr-2"
                >
                  {isRecording ? (
                    <>
                      <MicOff className="h-4 w-4 mr-2" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 mr-2" />
                      Record
                    </>
                  )}
                </Button>
              )}
            </div>
            
            <Textarea
              placeholder="Write your trading thoughts, lessons learned, and reflections..."
              className="min-h-[100px]"
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
            />
            
            {isRecording && (
              <div className="text-sm mt-2 text-muted-foreground">
                <p className="font-medium">Recording:</p>
                <p className="italic">{recordedText || "Speak now..."}</p>
              </div>
            )}
            
            <Button 
              className="mt-2" 
              onClick={addJournalEntry}
              disabled={!newEntry.trim()}
            >
              Add Entry
            </Button>
          </div>
          
          <ScrollableContent className="flex-1 h-[300px]">
            <div className="space-y-4">
              {journalEntries.length > 0 ? (
                journalEntries.map((entry) => (
                  <div 
                    key={entry.id} 
                    className={cn(
                      "border rounded-md p-3 text-sm",
                      entry.sentiment === 'positive' && "border-l-green-500 border-l-4",
                      entry.sentiment === 'negative' && "border-l-red-500 border-l-4",
                      entry.sentiment === 'neutral' && "border-l-blue-500 border-l-4"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{entry.symbol}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(new Date(entry.date).getTime())}
                      </span>
                    </div>
                    
                    <p className="mt-2 whitespace-pre-line">{entry.content}</p>
                    
                    {entry.lessons && entry.lessons.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium">Lessons:</p>
                        <ul className="list-disc list-inside text-xs text-muted-foreground">
                          {entry.lessons.map((lesson, idx) => (
                            <li key={idx}>{lesson}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {entry.trades && entry.trades.length > 0 && (
                      <div className="mt-2 border-t pt-2">
                        <p className="text-xs font-medium">Associated Trades:</p>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs mt-1">
                          {entry.trades.map((trade, idx) => (
                            <div 
                              key={idx} 
                              className={cn(
                                "py-1 px-2 rounded",
                                trade.side === 'buy' ? "bg-green-50" : "bg-red-50"
                              )}
                            >
                              {trade.side.toUpperCase()} {trade.quantity} @ {formatCurrency(trade.price)}
                              {trade.pnl !== undefined && (
                                <span 
                                  className={cn(
                                    "ml-1",
                                    trade.pnl > 0 ? "text-green-600" : "text-red-600"
                                  )}
                                >
                                  ({formatCurrency(trade.pnl)})
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No journal entries yet</p>
                  <p className="text-xs mt-1">Record your thoughts and trading insights</p>
                </div>
              )}
            </div>
          </ScrollableContent>
        </div>
      </div>
    </PopupContainer>
  );
}