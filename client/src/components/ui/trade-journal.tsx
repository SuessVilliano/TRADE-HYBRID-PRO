import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { ScrollArea } from './scroll-area';
import { Button } from './button';
import { Mic, MicOff, Download, LineChart, BrainCircuit } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { useTrader } from '@/lib/stores/useTrader';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface JournalEntry {
  id: string;
  date: Date;
  content: string;
  audioUrl?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  aiAnalysis?: string;
  tradeStats?: {
    pnl: number;
    winRate: number;
    tradesCount: number;
  };
}

export function TradeJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { trades, stats } = useTrader();

  // Performance chart data
  const performanceData: ChartData<'line'> = {
    labels: trades.map(t => new Date(t.timestamp).toLocaleDateString()),
    datasets: [{
      label: 'P&L',
      data: trades.map(t => t.profit),
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };

  // Win rate chart data
  const winRateData: ChartData<'bar'> = {
    labels: ['Wins', 'Losses'],
    datasets: [{
      label: 'Trade Outcomes',
      data: [stats.winRate * 100, (1 - stats.winRate) * 100],
      backgroundColor: ['rgba(75, 192, 192, 0.5)', 'rgba(255, 99, 132, 0.5)']
    }]
  };

  // Handle voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        // Here you would typically upload the audio for transcription
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Performance Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-[300px]">
              <Line data={performanceData} options={{ maintainAspectRatio: false }} />
            </div>
            <div className="h-[200px]">
              <Bar data={winRateData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trading Journal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? "destructive" : "default"}
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-4 w-4 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Record Note
                  </>
                )}
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Journal
              </Button>
            </div>

            <ScrollArea className="h-[400px]">
              {entries.map((entry) => (
                <div key={entry.id} className="mb-4 p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium">
                      {entry.date.toLocaleDateString()}
                    </div>
                    {entry.sentiment && (
                      <div className={`text-sm px-2 py-1 rounded ${
                        entry.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                        entry.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {entry.sentiment}
                      </div>
                    )}
                  </div>
                  <p className="text-sm mb-2">{entry.content}</p>
                  {entry.audioUrl && (
                    <audio controls src={entry.audioUrl} className="w-full mb-2" />
                  )}
                  {entry.aiAnalysis && (
                    <div className="bg-secondary/20 p-2 rounded-lg text-xs">
                      <div className="flex items-center gap-1 mb-1">
                        <BrainCircuit className="h-3 w-3" />
                        <span className="font-medium">AI Analysis</span>
                      </div>
                      {entry.aiAnalysis}
                    </div>
                  )}
                </div>
              ))}
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}