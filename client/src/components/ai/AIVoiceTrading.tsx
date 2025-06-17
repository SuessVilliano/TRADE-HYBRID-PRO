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
      
      const command: VoiceCommand = {
        id: `cmd_${Date.now()}`,
        text,
        timestamp: new Date(),
        intent: result.intent || 'unknown',
        confidence: result.confidence || 0.7,
        action: result.action
      };
      
      setCommands(prev => [command, ...prev.slice(0, 4)]);
      setAiResponse(result.response || 'Command processed');
      
      // Execute trade command if detected
      if (result.tradeCommand && onTradeCommand) {
        onTradeCommand(result.tradeCommand);
      }
      
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
      case 'price': return 'text-yellow-400';
      default: return 'text-slate-400';
    }
  };

  const sampleCommands = [
    "Buy 0.1 Bitcoin at market price",
    "What's the current price of Ethereum?",
    "Analyze SOLUSDT chart pattern",
    "Set stop loss at $67,000 for my Bitcoin position",
    "Show me the daily trading volume for AVAX"
  ];

  return (
    <Card className={`bg-slate-800 border-slate-700 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-400" />
          <CardTitle className="text-lg text-white">AI Voice Trading</CardTitle>
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
            <p className="text-sm text-slate-300">
              {isListening ? 'Listening...' : isProcessing ? 'Processing...' : 'Click to start voice trading'}
            </p>
            {transcript && (
              <p className="text-xs text-blue-400 mt-1 italic">"{transcript}"</p>
            )}
          </div>
        </div>

        {/* AI Response */}
        {aiResponse && (
          <div className="p-3 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg border border-purple-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Volume2 className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-white">AI Assistant</span>
            </div>
            <p className="text-sm text-slate-300">{aiResponse}</p>
          </div>
        )}

        {/* Recent Commands */}
        {commands.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-white flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Recent Commands
            </h4>
            {commands.map((command) => (
              <div key={command.id} className="p-2 bg-slate-900/50 rounded border border-slate-700">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-medium ${getIntentColor(command.intent)}`}>
                    {command.intent.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-400">
                    {command.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{command.text}</p>
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
          <h4 className="text-sm font-medium text-white">Try saying:</h4>
          <div className="space-y-1">
            {sampleCommands.map((cmd, index) => (
              <button
                key={index}
                onClick={() => processVoiceCommand(cmd)}
                className="w-full text-left p-2 text-xs text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
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