import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Mic, MicOff, Volume2, Brain, Zap, MessageSquare, TrendingUp } from 'lucide-react';

interface VoiceCommand {
  id: string;
  text: string;
  timestamp: Date;
  intent: string;
  confidence: number;
  action?: string;
}

interface AIVoiceTradingProps {
  className?: string;
  onTradeCommand?: (command: any) => void;
}

export function AIVoiceTrading({ className = '', onTradeCommand }: AIVoiceTradingProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [commands, setCommands] = useState<VoiceCommand[]>([]);
  const [aiResponse, setAiResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript);
          processVoiceCommand(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const processVoiceCommand = async (text: string) => {
    setIsProcessing(true);
    
    try {
      // Send to AI for processing
      const response = await fetch('/api/ai/voice-trading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          command: text,
          context: { currentSymbol: 'BTCUSDT' }
        })
      });
      
      const result = await response.json();
      if (!response.ok || result?.success === false) {
        throw new Error(result?.error || 'Market Buddy voice request failed');
      }
      
      const command: VoiceCommand = {
        id: `cmd_${Date.now()}`,
        text,
        timestamp: new Date(),
        intent: result.intent || 'unknown',
        confidence: result.confidence || 0.7,
        action: result.action
      };
      
      setCommands(prev => [command, ...prev.slice(0, 4)]);
      setAiResponse(result.response || 'I heard you. What would you like to work through?');
      
      // Voice is an assistant surface, not an execution shortcut. Any actual
      // order still requires the explicit Trade flow and its confirmations.
      
      // Text-to-speech response
      if (result.response && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(result.response);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
      }
      
    } catch (error) {
      console.error('Error processing voice command:', error);
      setAiResponse('Sorry, I couldn\'t process that command.');
    }
    
    setIsProcessing(false);
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'buy': return 'text-green-400';
      case 'sell': return 'text-red-400';
      case 'analysis': return 'text-blue-400';
      case 'price': return 'text-amber-600 dark:text-yellow-400';
      case 'trade_request': return 'text-violet-600 dark:text-violet-300';
      case 'assistant': return 'text-blue-600 dark:text-blue-300';
      default: return 'text-slate-400';
    }
  };

  const sampleCommands = [
    "Can you hear what I'm saying?",
    "Review the setup I'm looking at",
    "How does this fit my trading plan?",
    "Walk me through the risk on this idea",
    "What should I review before I use the Trade button?"
  ];

  return (
    <Card className={`border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-400" />
          <CardTitle className="text-lg text-slate-950 dark:text-white">Market Buddy Voice</CardTitle>
          <Zap className="h-4 w-4 text-yellow-400 animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Voice Control */}
        <div className="text-center space-y-3">
          <Button
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing}
            className={`h-16 w-16 rounded-full ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
            }`}
          >
            {isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {isListening ? 'Listening...' : isProcessing ? 'Processing...' : 'Tap to talk to Market Buddy'}
            </p>
            {transcript && (
              <p className="text-xs text-blue-400 mt-1 italic">"{transcript}"</p>
            )}
          </div>
        </div>

        {/* AI Response */}
        {aiResponse && (
          <div className="rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 p-3 dark:border-purple-500/30 dark:from-purple-900/30 dark:to-blue-900/30">
            <div className="flex items-center gap-2 mb-2">
              <Volume2 className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-slate-950 dark:text-white">Market Buddy</span>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300">{aiResponse}</p>
          </div>
        )}

        {/* Recent Commands */}
        {commands.length > 0 && (
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-sm font-medium text-slate-950 dark:text-white">
              <MessageSquare className="h-4 w-4" />
              Recent Commands
            </h4>
            {commands.map((command) => (
              <div key={command.id} className="rounded border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-950/50">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-medium ${getIntentColor(command.intent)}`}>
                    {command.intent.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-400">
                    {command.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300">{command.text}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-blue-400">
                    Confidence: {(command.confidence * 100).toFixed(0)}%
                  </span>
                  {command.action && (
                    <span className="text-xs text-green-400">
                      Action: {command.action}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sample Commands */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-950 dark:text-white">Try saying:</h4>
          <div className="space-y-1">
            {sampleCommands.map((cmd, index) => (
              <button
                key={index}
                onClick={() => processVoiceCommand(cmd)}
                className="w-full rounded p-2 text-left text-xs text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
              >
                "{cmd}"
              </button>
            ))}
          </div>
        </div>

        {/* Web Speech API Notice */}
        {!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) && (
          <div className="p-3 bg-yellow-900/30 border border-yellow-500/30 rounded-lg">
            <p className="text-xs text-yellow-400">
              Voice recognition not supported in this browser. Please use Chrome or Edge for voice trading.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}