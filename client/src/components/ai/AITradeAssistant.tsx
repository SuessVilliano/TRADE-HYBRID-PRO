import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  MonitorSpeaker, 
  Mic, 
  MicOff, 
  Eye, 
  EyeOff, 
  Brain, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  ScreenShare,
  ScreenShareOff
} from 'lucide-react';

interface TradeAnalysis {
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
  suggestions: string[];
  tradePlanCompliance: number;
  alerts: string[];
}

interface AITradeAssistantProps {
  className?: string;
}

export function AITradeAssistant({ className = "" }: AITradeAssistantProps) {
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<TradeAnalysis | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    type: 'user' | 'ai';
    message: string;
    timestamp: Date;
  }>>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const screenStreamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Start screen sharing and AI monitoring
  const startScreenSharing = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          mediaSource: 'screen',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: true
      });

      screenStreamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Start real-time analysis
      setIsScreenSharing(true);
      setIsAnalyzing(true);
      startRealTimeAnalysis();

      // Handle stream end
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        stopScreenSharing();
      });

      // Send initial message
      addAIMessage("I'm now monitoring your screen and ready to assist with your trading decisions. I can see your charts, trades, and will help you stick to your trade plan!");

    } catch (error) {
      console.error('Screen sharing failed:', error);
      addAIMessage("Unable to start screen sharing. Please ensure you grant permission to share your screen.");
    }
  }, []);

  // Stop screen sharing
  const stopScreenSharing = useCallback(() => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    setIsScreenSharing(false);
    setIsAnalyzing(false);
    addAIMessage("Screen monitoring stopped. Feel free to restart when you need assistance!");
  }, []);

  // Start real-time screen analysis
  const startRealTimeAnalysis = useCallback(() => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const analyzeFrame = async () => {
      if (!isScreenSharing || !video.videoWidth) return;

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to base64 image
      const imageData = canvas.toDataURL('image/jpeg', 0.8);

      // Send frame for AI analysis every 5 seconds to avoid overwhelming
      if (Math.random() < 0.1) { // 10% chance each frame (roughly every 3 seconds at 30fps)
        await analyzeScreenContent(imageData);
      }

      // Continue analysis loop
      if (isScreenSharing) {
        requestAnimationFrame(analyzeFrame);
      }
    };

    // Start analysis loop
    video.addEventListener('loadedmetadata', () => {
      requestAnimationFrame(analyzeFrame);
    });
  }, [isScreenSharing]);

  // Analyze screen content with AI
  const analyzeScreenContent = async (imageData: string) => {
    try {
      const response = await fetch('/api/ai/analyze-screen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageData,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        const analysis = await response.json();
        setCurrentAnalysis(analysis.data);

        // Send proactive suggestions if needed
        if (analysis.data.alerts && analysis.data.alerts.length > 0) {
          analysis.data.alerts.forEach((alert: string) => {
            addAIMessage(`⚠️ ${alert}`);
          });
        }
      }
    } catch (error) {
      console.error('Screen analysis failed:', error);
    }
  };

  // Voice interaction
  const toggleVoice = useCallback(async () => {
    if (!isVoiceActive) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        mediaRecorderRef.current = new MediaRecorder(stream);
        const audioChunks: BlobPart[] = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          await processVoiceCommand(audioBlob);
        };

        mediaRecorderRef.current.start();
        setIsVoiceActive(true);
        addAIMessage("🎤 Listening... Speak your trading question or command.");

      } catch (error) {
        console.error('Voice activation failed:', error);
        addAIMessage("Unable to access microphone. Please check permissions.");
      }
    } else {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsVoiceActive(false);
    }
  }, [isVoiceActive]);

  // Process voice commands
  const processVoiceCommand = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('context', JSON.stringify({
        currentAnalysis,
        isTrading: isScreenSharing,
        timestamp: new Date().toISOString()
      }));

      const response = await fetch('/api/ai/voice-command', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        addAIMessage(result.response);
      }
    } catch (error) {
      console.error('Voice processing failed:', error);
      addAIMessage("Sorry, I couldn't process your voice command. Please try again.");
    }
  };

  // Send chat message
  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      message: currentMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsStreaming(true);

    try {
      const response = await fetch('/api/ai/chat-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentMessage,
          context: {
            currentAnalysis,
            isScreenSharing,
            recentMessages: chatMessages.slice(-5)
          }
        })
      });

      if (response.ok && response.body) {
        const reader = response.body.getReader();
        let aiResponseMessage = '';

        const aiMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai' as const,
          message: '',
          timestamp: new Date()
        };

        setChatMessages(prev => [...prev, aiMessage]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                setIsStreaming(false);
                return;
              }

              try {
                const parsed = JSON.parse(data);
                aiResponseMessage += parsed.chunk;
                
                setChatMessages(prev => 
                  prev.map(msg => 
                    msg.id === aiMessage.id 
                      ? { ...msg, message: aiResponseMessage }
                      : msg
                  )
                );
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      addAIMessage("Sorry, I encountered an error. Please try again.");
    } finally {
      setIsStreaming(false);
    }
  };

  // Helper to add AI messages
  const addAIMessage = (message: string) => {
    const aiMessage = {
      id: Date.now().toString(),
      type: 'ai' as const,
      message,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, aiMessage]);
  };

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-500" />
            AI Trade Assistant
            {isAnalyzing && <Badge variant="secondary" className="animate-pulse">Analyzing</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={isScreenSharing ? stopScreenSharing : startScreenSharing}
              variant={isScreenSharing ? "destructive" : "default"}
              className="flex items-center gap-2"
            >
              {isScreenSharing ? <ScreenShareOff className="h-4 w-4" /> : <ScreenShare className="h-4 w-4" />}
              {isScreenSharing ? 'Stop Monitoring' : 'Start Screen Monitoring'}
            </Button>

            <Button
              onClick={toggleVoice}
              variant={isVoiceActive ? "destructive" : "secondary"}
              className="flex items-center gap-2"
              disabled={!isScreenSharing}
            >
              {isVoiceActive ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {isVoiceActive ? 'Stop Voice' : 'Voice Commands'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Display */}
      {currentAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Real-time Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Sentiment</div>
                <Badge variant={
                  currentAnalysis.sentiment === 'bullish' ? 'default' :
                  currentAnalysis.sentiment === 'bearish' ? 'destructive' : 'secondary'
                }>
                  {currentAnalysis.sentiment}
                </Badge>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Confidence</div>
                <div className="font-semibold">{currentAnalysis.confidence}%</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Risk Level</div>
                <Badge variant={
                  currentAnalysis.riskLevel === 'low' ? 'default' :
                  currentAnalysis.riskLevel === 'medium' ? 'secondary' : 'destructive'
                }>
                  {currentAnalysis.riskLevel}
                </Badge>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Plan Compliance</div>
                <div className="font-semibold">{currentAnalysis.tradePlanCompliance}%</div>
              </div>
            </div>

            {currentAnalysis.suggestions.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">AI Suggestions:</h4>
                <ul className="space-y-1">
                  {currentAnalysis.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Chat Interface - Fixed Height and Scrolling */}
      <Card className="flex flex-col h-[500px]">
        <CardHeader className="flex-shrink-0 pb-3">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            AI Chat
            {isStreaming && <Badge variant="secondary" className="animate-pulse">Typing...</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col flex-1 overflow-hidden">
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto space-y-3 p-3 border rounded-lg bg-slate-900/50 mb-4"
            style={{ minHeight: '300px', maxHeight: '350px' }}
          >
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  <div className="text-sm">{msg.message}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask me about your trades, charts, or strategy..."
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isStreaming}
            />
            <Button onClick={sendMessage} disabled={isStreaming || !currentMessage.trim()}>
              Send
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hidden video and canvas for screen capture */}
      <div className="hidden">
        <video ref={videoRef} muted />
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}