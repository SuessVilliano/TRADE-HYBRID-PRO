import { useState, useRef, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Button } from './button';
import { Input } from './input';
import { Textarea } from './textarea';
import { Card } from './card';
import { ScrollArea } from './scroll-area';
import { Download, Mic, MicOff, Upload } from 'lucide-react';
import { useTrader } from '@/lib/stores/useTrader';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface JournalEntry {
  id: string;
  date: Date;
  content: string;
  audioUrl?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  aiAnalysis?: string;
  hybridScore?: number;
  tradeStats?: {
    pnl: number;
    winRate: number;
    tradesCount: number;
  };
}

export function TradeJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [hybridScore, setHybridScore] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { trades, stats } = useTrader();

  // Calculate Hybrid Score based on multiple factors
  const calculateHybridScore = () => {
    const winRateWeight = 0.3;
    const profitFactorWeight = 0.3;
    const riskRewardWeight = 0.2;
    const consistencyWeight = 0.2;

    const winRateScore = stats.winRate * 100;
    const profitFactorScore = Math.min(stats.profitFactor * 20, 100);
    const riskRewardScore = Math.min((stats.avgWin / stats.avgLoss) * 25, 100);
    const consistencyScore = 100 - (Math.abs(stats.variance) * 100);

    return (
      (winRateScore * winRateWeight) +
      (profitFactorScore * profitFactorWeight) +
      (riskRewardScore * riskRewardWeight) +
      (consistencyScore * consistencyWeight)
    );
  };

  // Generate PDF Report
  const generatePDFReport = async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    // Add report content
    page.drawText('Trading Performance Report', {
      x: 50,
      y: height - 50,
      size: 20,
      font: await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    });

    page.drawText(`Hybrid Score: ${hybridScore.toFixed(2)}`, {
      x: 50,
      y: height - 100,
      size: 14,
    });

    // Add performance metrics
    const metrics = [
      `Win Rate: ${(stats.winRate * 100).toFixed(2)}%`,
      `Profit Factor: ${stats.profitFactor.toFixed(2)}`,
      `Total Trades: ${stats.totalTrades}`,
      `Net P&L: $${stats.netPnL.toFixed(2)}`,
    ];

    metrics.forEach((metric, index) => {
      page.drawText(metric, {
        x: 50,
        y: height - 150 - (index * 30),
        size: 12,
      });
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'trading-report.pdf';
    link.click();
  };

  // Save journal entry with performance data
  const saveJournalEntry = async (content: string) => {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date(),
      content,
      hybridScore: hybridScore,
      tradeStats: {
        pnl: stats.netPnL,
        winRate: stats.winRate,
        tradesCount: stats.totalTrades
      }
    };

    // Save to database
    try {
      const response = await fetch('/api/journal/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry)
      });

      if (response.ok) {
        setEntries([newEntry, ...entries]);
      }
    } catch (error) {
      console.error('Error saving journal entry:', error);
    }
  };

  useEffect(() => {
    setHybridScore(calculateHybridScore());
  }, [stats]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      <Card className="p-4">
        <h2 className="text-xl font-bold mb-4">Performance Metrics</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Hybrid Score</span>
            <span className="text-2xl font-bold">{hybridScore.toFixed(2)}</span>
          </div>
          <Button onClick={generatePDFReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="text-xl font-bold mb-4">Journal Entries</h2>
        <ScrollArea className="h-[400px]">
          {entries.map((entry) => (
            <div key={entry.id} className="border-b p-4">
              <div className="flex justify-between">
                <span>{new Date(entry.date).toLocaleDateString()}</span>
                <span>Score: {entry.hybridScore?.toFixed(2)}</span>
              </div>
              <p className="mt-2">{entry.content}</p>
            </div>
          ))}
        </ScrollArea>
      </Card>
    </div>
  );
}