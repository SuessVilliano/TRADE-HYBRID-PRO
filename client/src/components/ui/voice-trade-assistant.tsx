import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './card';
import { Button } from './button';
import { Switch } from './switch';
import { Label } from './label';
import { Mic, MicOff, Sparkles, Play, AlertCircle, CheckCircle2, Volume2 } from 'lucide-react';
import { toast } from '../../lib/toastify-bridge';
import { Badge } from './badge';
import { Progress } from './progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { ScrollArea } from './scroll-area';
import { cn } from '@/lib/utils';

// Define interface for trade command data
export interface TradeCommand {
  action: 'buy' | 'sell';
  symbol: string;
  quantity?: string;
  price?: string;
  stopLoss?: string;
  takeProfit?: string;
  riskPercentage?: number;
  leverage?: string;
  orderType?: 'market' | 'limit' | 'stop';
  timeInForce?: string;
  broker?: string;
  raw?: string; // Raw recognized text
}

// Define interface for assistant messages
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface VoiceTradeAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onTradeCommand?: (command: TradeCommand) => void;
  onExecuteTrade?: (command: TradeCommand) => void;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  className?: string;
}

export const VoiceTradeAssistant: React.FC<VoiceTradeAssistantProps> = ({
  isOpen,
  onClose,
  onTradeCommand,
  onExecuteTrade,
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 400, height: 600 },
  className,
}) => {
  // Panel state
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Voice recognition state
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi there, trader! I'm your voice assistant. Say something like 'Buy Bitcoin at market price with 2% risk' or 'Sell half a Bitcoin with stop loss at 40,000'.",
      timestamp: new Date()
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoExecuteEnabled, setAutoExecuteEnabled] = useState(false);
  const [pendingCommand, setPendingCommand] = useState<TradeCommand | null>(null);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [voiceCharacter, setVoiceCharacter] = useState<'playful' | 'professional' | 'cosmic'>('playful');
  
  // Speech synthesis voices
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  
  // References
  const recognitionRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Setup speech recognition
  useEffect(() => {
    // Define the SpeechRecognition type to fix TypeScript errors
    interface IWindow extends Window {
      SpeechRecognition?: any;
      webkitSpeechRecognition?: any;
    }
    
    const customWindow = window as IWindow;
    
    if ('webkitSpeechRecognition' in customWindow || 'SpeechRecognition' in customWindow) {
      const SpeechRecognition = customWindow.SpeechRecognition || customWindow.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
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
          setTranscript(prev => prev + ' ' + finalTranscript);
          
          // If we're awaiting confirmation and the user says "confirm", execute the trade
          if (awaitingConfirmation && pendingCommand && 
             (finalTranscript.toLowerCase().includes('confirm') || 
              finalTranscript.toLowerCase().includes('execute') || 
              finalTranscript.toLowerCase().includes('yes') ||
              finalTranscript.toLowerCase().includes('do it'))) {
            executePendingTrade();
          }
          
          // If we're awaiting confirmation and the user says "cancel", reset
          if (awaitingConfirmation && 
             (finalTranscript.toLowerCase().includes('cancel') || 
              finalTranscript.toLowerCase().includes('stop') || 
              finalTranscript.toLowerCase().includes('no'))) {
            setAwaitingConfirmation(false);
            speak("Trade cancelled. The parameters are still populated in your trade panel.");
          }
        }
        
        if (interimTranscript) {
          setTranscript(prev => interimTranscript);
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. Please allow microphone access to use voice commands.');
          setIsListening(false);
        }
      };
      
      recognition.onend = () => {
        // Don't stop listening unless user explicitly stops
        if (isListening) {
          try {
            recognition.start();
          } catch (e) {
            console.error('Error restarting recognition:', e);
          }
        }
      };
      
      recognitionRef.current = recognition;
    }
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error('Error stopping recognition on unmount:', e);
        }
      }
    };
  }, [isListening, awaitingConfirmation, pendingCommand]);
  
  // Setup speech synthesis voices
  useEffect(() => {
    const fetchVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
        // Try to select a good default voice
        const preferredVoice = voices.find(v => 
          v.name.includes('Google') || 
          v.name.includes('Neural') || 
          v.name.includes('Samantha')
        );
        setSelectedVoice(preferredVoice?.name || voices[0].name);
      }
    };
    
    if ('speechSynthesis' in window) {
      fetchVoices();
      
      // Chrome loads voices asynchronously
      window.speechSynthesis.onvoiceschanged = fetchVoices;
    }
  }, []);
  
  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle panel dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleDragStart = (e: React.MouseEvent) => {
    if (headerRef.current) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };
  
  // Toggle listening
  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition is not supported in your browser.');
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setTranscript('');
      } catch (e) {
        console.error('Error starting recognition:', e);
        toast.error('Could not start speech recognition. It may already be running.');
      }
    }
  };
  
  // Process voice command with OpenAI
  const processCommand = async () => {
    if (!transcript.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: transcript,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    
    try {
      // Create the system prompt based on selected voice character
      let systemPrompt = "";
      
      if (voiceCharacter === 'playful') {
        systemPrompt = `You are a playful, upbeat trading assistant named Trixie. You speak in a casual, friendly way with occasional jokes, but are always precise about trading details. Your job is to interpret voice commands for trading and extract the exact parameters.

For EVERY command, you must:
1. Extract the trading parameters in a specific JSON format
2. Respond with enthusiasm and a bit of personality
3. Provide the trade details in a human-readable summary

Only support these actions: buy, sell
Only support these order types: market, limit, stop
Only support these symbols: BTCUSD, ETHUSD, SOLUSD, AAPL, MSFT, TSLA

If any parameter is missing, use common defaults, but mention it in your response.`;
      } else if (voiceCharacter === 'professional') {
        systemPrompt = `You are a professional, efficient trading assistant named Atlas. You speak in a clear, concise, and professional manner. Your job is to interpret voice commands for trading and extract the exact parameters.

For EVERY command, you must:
1. Extract the trading parameters in a specific JSON format
2. Respond with professionalism and clarity
3. Provide the trade details in a precise summary

Only support these actions: buy, sell
Only support these order types: market, limit, stop
Only support these symbols: BTCUSD, ETHUSD, SOLUSD, AAPL, MSFT, TSLA

If any parameter is missing, use common defaults, but state it clearly in your response.`;
      } else if (voiceCharacter === 'cosmic') {
        systemPrompt = `You are a cosmic, mystical trading assistant named Nebula who speaks in space metaphors and cosmic references. You interpret voice commands for trading and extract the exact parameters.

For EVERY command, you must:
1. Extract the trading parameters in a specific JSON format
2. Respond with cosmic metaphors and space references
3. Provide the trade details in a mystic yet understandable summary

Only support these actions: buy, sell
Only support these order types: market, limit, stop
Only support these symbols: BTCUSD, ETHUSD, SOLUSD, AAPL, MSFT, TSLA

If any parameter is missing, use cosmic defaults, but reveal this cosmic choice in your response.`;
      }
      
      // Example response format to include in the system prompt
      systemPrompt += `\n\nFor ANY trading command, you MUST extract a JSON object in exactly this format:
\`\`\`json
{
  "action": "buy", // or "sell"
  "symbol": "BTCUSD", // or other supported symbol
  "quantity": "0.1", // amount to trade
  "price": "43000", // for limit or stop orders
  "stopLoss": "42000", // optional
  "takeProfit": "45000", // optional
  "riskPercentage": 1, // risk percentage (default: 1)
  "leverage": "1", // leverage (default: "1")
  "orderType": "market" // "market", "limit", or "stop"
}
\`\`\`
ALWAYS include this JSON block at the end of your response, surrounded by the \`\`\`json tags.`;
      
      // Make request to OpenAI API
      const response = await fetch('/api/openai-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Trade command: "${transcript}"` }
          ],
          temperature: 0.7,
          max_tokens: 700
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      
      // Extract the JSON from the response
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);
      let tradeCommand: TradeCommand | null = null;
      
      if (jsonMatch && jsonMatch[1]) {
        try {
          tradeCommand = JSON.parse(jsonMatch[1]);
          if (tradeCommand) {
            tradeCommand.raw = transcript;
          }
        } catch (e) {
          console.error('Error parsing JSON from AI response:', e);
        }
      }
      
      // Create the assistant message without the JSON block
      const cleanResponse = aiResponse.replace(/```json\n[\s\S]*?\n```/g, '');
      
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: cleanResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Speak the response
      speak(cleanResponse);
      
      // Process the trade command
      if (tradeCommand) {
        setPendingCommand(tradeCommand);
        
        // If auto-execute is enabled, ask for confirmation
        if (autoExecuteEnabled) {
          setAwaitingConfirmation(true);
          speak(`Do you want me to execute this ${tradeCommand.action} order for ${tradeCommand.symbol}? Say "confirm" to execute or "cancel" to just populate the panel.`);
        } else {
          // Just populate the panel without executing
          if (onTradeCommand) {
            onTradeCommand(tradeCommand);
          }
        }
      }
    } catch (error) {
      console.error('Error processing command:', error);
      toast.error('Failed to process voice command');
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I had trouble processing that command. Could you try again?',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      speak('Sorry, I had trouble processing that command. Could you try again?');
    } finally {
      setIsProcessing(false);
      setTranscript('');
    }
  };
  
  // Execute the pending trade
  const executePendingTrade = () => {
    if (!pendingCommand) return;
    
    if (onExecuteTrade) {
      onExecuteTrade(pendingCommand);
    }
    
    // Store command details before resetting state
    const { action, quantity, symbol, price } = pendingCommand;
    
    setAwaitingConfirmation(false);
    setPendingCommand(null);
    
    // Add confirmation message
    const confirmMessage: Message = {
      id: `system-${Date.now()}`,
      role: 'system',
      content: `Trade executed: ${action.toUpperCase()} ${quantity || ''} ${symbol} @ ${price || 'market price'}`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, confirmMessage]);
    speak('Trade confirmed and executed!');
  };
  
  // Text-to-speech function
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set the voice if one is selected
      if (selectedVoice) {
        const voice = availableVoices.find(v => v.name === selectedVoice);
        if (voice) {
          utterance.voice = voice;
        }
      }
      
      // Adjust speech parameters based on character
      if (voiceCharacter === 'playful') {
        utterance.rate = 1.1; // Slightly faster
        utterance.pitch = 1.2; // Higher pitch
      } else if (voiceCharacter === 'professional') {
        utterance.rate = 1.0; // Normal speed
        utterance.pitch = 1.0; // Normal pitch
      } else if (voiceCharacter === 'cosmic') {
        utterance.rate = 0.9; // Slightly slower
        utterance.pitch = 0.9; // Lower pitch
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div 
      ref={containerRef}
      className={cn("fixed z-50 shadow-xl rounded-lg overflow-hidden bg-slate-900 border border-slate-700", className)}
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
      }}
    >
      <div 
        ref={headerRef}
        className="bg-slate-800 px-4 py-3 cursor-move flex items-center justify-between border-b border-slate-700"
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-indigo-400" />
          <div>
            <h3 className="text-sm font-semibold text-white">Voice Trade Assistant</h3>
            <p className="text-xs text-slate-400">
              {
                voiceCharacter === 'playful' ? 'Trixie' : 
                voiceCharacter === 'professional' ? 'Atlas' : 'Nebula'
              }
              {isListening ? ' is listening...' : ''}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleListening}
            className={cn(
              "h-8 w-8",
              isListening ? "text-red-500 animate-pulse" : "text-slate-400"
            )}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="w-full grid grid-cols-2 bg-slate-800 p-0 h-10">
          <TabsTrigger 
            value="chat" 
            className="text-xs rounded-none data-[state=active]:bg-indigo-600"
          >
            Assistant Chat
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="text-xs rounded-none data-[state=active]:bg-indigo-600"
          >
            Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="p-0 m-0">
          <div className="flex flex-col h-[calc(100%-2.5rem)]">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map(message => (
                  <div 
                    key={message.id} 
                    className={cn(
                      "flex gap-3",
                      message.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role !== 'user' && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={message.role === 'system' 
                            ? "/tradehybrid-logo.png" 
                            : voiceCharacter === 'playful' 
                              ? "https://api.dicebear.com/7.x/bottts/svg?seed=Trixie&backgroundColor=b6e3f4" 
                              : voiceCharacter === 'professional'
                                ? "https://api.dicebear.com/7.x/bottts/svg?seed=Atlas&backgroundColor=d1d4f9"
                                : "https://api.dicebear.com/7.x/bottts/svg?seed=Nebula&backgroundColor=c0aede"
                          } 
                          alt="AI" 
                        />
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div 
                      className={cn(
                        "rounded-lg p-3 text-sm max-w-[80%]",
                        message.role === 'user' 
                          ? "bg-indigo-600 text-white" 
                          : message.role === 'system'
                            ? "bg-slate-700 text-white"
                            : "bg-slate-800 text-white"
                      )}
                    >
                      {message.content}
                    </div>
                    
                    {message.role === 'user' && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/avatar-placeholder.png" alt="You" />
                        <AvatarFallback>You</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            <div className="mt-auto p-4 border-t border-slate-700 space-y-2">
              {transcript && (
                <div className="relative">
                  <div className="text-sm text-slate-300 bg-slate-800 p-2 rounded-lg mb-2">
                    {transcript}
                  </div>
                  {isListening && (
                    <div className="flex justify-center space-x-1">
                      <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={toggleListening}
                  className={cn(
                    "flex-1",
                    isListening 
                      ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400" 
                      : "bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-400"
                  )}
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-4 w-4 mr-2" />
                      Stop Listening
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 mr-2" />
                      Start Listening
                    </>
                  )}
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={processCommand}
                  disabled={!transcript || isProcessing}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Process
                </Button>
              </div>
              
              {awaitingConfirmation && (
                <div className="flex items-center justify-center mt-2 space-x-2">
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={executePendingTrade}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Confirm Trade
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setAwaitingConfirmation(false);
                      speak("Trade cancelled. The parameters are still populated in your trade panel.");
                    }}
                  >
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="auto-execute" 
                    checked={autoExecuteEnabled}
                    onCheckedChange={setAutoExecuteEnabled}
                  />
                  <Label htmlFor="auto-execute">Auto-execute (with confirmation)</Label>
                </div>
                
                <Badge variant="outline" className="text-xs">
                  {
                    voiceCharacter === 'playful' ? 'Trixie' : 
                    voiceCharacter === 'professional' ? 'Atlas' : 'Nebula'
                  }
                </Badge>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="p-4 space-y-4">
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Assistant Personality</h3>
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant={voiceCharacter === 'playful' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setVoiceCharacter('playful')}
                className={voiceCharacter === 'playful' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                Trixie
                <span className="block text-xs mt-1 opacity-70">Playful</span>
              </Button>
              <Button 
                variant={voiceCharacter === 'professional' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setVoiceCharacter('professional')}
                className={voiceCharacter === 'professional' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                Atlas
                <span className="block text-xs mt-1 opacity-70">Professional</span>
              </Button>
              <Button 
                variant={voiceCharacter === 'cosmic' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setVoiceCharacter('cosmic')}
                className={voiceCharacter === 'cosmic' ? 'bg-purple-600 hover:bg-purple-700' : ''}
              >
                Nebula
                <span className="block text-xs mt-1 opacity-70">Cosmic</span>
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Voice Settings</h3>
            <div className="space-y-2">
              <Label htmlFor="voice-select">Voice</Label>
              <select 
                id="voice-select" 
                value={selectedVoice || ''}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full bg-slate-800 text-white border border-slate-700 rounded-md p-2 text-sm"
              >
                {availableVoices.map(voice => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => speak("Hi there! This is how I'll sound when giving you trading information. Is this voice clear and pleasant for you?")}
                className="w-full mt-2"
              >
                <Volume2 className="h-4 w-4 mr-2" />
                Test Voice
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Example Commands</h3>
            <div className="bg-slate-800 p-3 rounded-lg text-xs text-slate-300 space-y-2">
              <p>• "Buy 0.1 Bitcoin at market price"</p>
              <p>• "Sell Solana with 2% stop loss and 5% take profit"</p>
              <p>• "Place a limit order to buy MSFT at $330 with 1% risk"</p>
              <p>• "Short TSLA with 5x leverage and 2% risk"</p>
            </div>
          </div>
          
          <div className="pt-2">
            <Button 
              variant="default" 
              size="sm"
              onClick={() => {
                setMessages([{
                  id: 'welcome',
                  role: 'assistant',
                  content: "Hi there, trader! I'm your voice assistant. Say something like 'Buy Bitcoin at market price with 2% risk' or 'Sell half a Bitcoin with stop loss at 40,000'.",
                  timestamp: new Date()
                }]);
              }}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Clear Chat History
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};