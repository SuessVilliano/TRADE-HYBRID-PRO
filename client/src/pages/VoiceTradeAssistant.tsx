import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Settings, Activity, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TradeCommand {
  id: string;
  command: string;
  parsed: {
    action: 'buy' | 'sell' | 'short' | 'limit';
    symbol: string;
    quantity?: number;
    price?: number;
    stopLoss?: number;
    takeProfit?: number;
    risk?: number;
    leverage?: number;
  };
  confidence: number;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'executed' | 'cancelled';
}

interface PropFirmPlatform {
  id: string;
  name: string;
  url: string;
  status: 'connected' | 'disconnected' | 'error';
  apiKey?: string;
  supportsAutomation: boolean;
}

export function VoiceTradeAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentCommand, setCurrentCommand] = useState('');
  const [tradeCommands, setTradeCommands] = useState<TradeCommand[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('dxtrade');
  const [autoExecute, setAutoExecute] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<any>(null);

  const propFirmPlatforms: PropFirmPlatform[] = [
    {
      id: 'dxtrade',
      name: 'DX Trade',
      url: 'https://demo.dx.trade',
      status: 'connected',
      supportsAutomation: true
    },
    {
      id: 'matchtrader',
      name: 'Match Trader',
      url: 'https://www.matchtrader.com',
      status: 'connected',
      supportsAutomation: true
    },
    {
      id: 'ctrader',
      name: 'cTrader',
      url: 'https://ctrader.com',
      status: 'connected',
      supportsAutomation: false
    },
    {
      id: 'rithmic',
      name: 'Rithmic',
      url: 'https://rithmic.com',
      status: 'disconnected',
      supportsAutomation: true
    }
  ];

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setCurrentCommand(transcript);
        
        if (event.results[event.results.length - 1].isFinal) {
          processVoiceCommand(transcript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
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
      setCurrentCommand('');
      recognitionRef.current.start();
      speak("Voice assistant activated. What would you like to trade?");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      setIsListening(false);
      recognitionRef.current.stop();
      speak("Voice assistant deactivated.");
    }
  };

  const speak = (text: string) => {
    if (!voiceEnabled || !synthRef.current) return;
    
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    synthRef.current.speak(utterance);
  };

  const processVoiceCommand = async (command: string) => {
    try {
      // Parse the voice command using AI
      const response = await fetch('/api/ai/parse-trade-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, platform: selectedPlatform })
      });

      if (!response.ok) throw new Error('Failed to parse command');
      
      const parsed = await response.json();
      
      const tradeCommand: TradeCommand = {
        id: Date.now().toString(),
        command,
        parsed: parsed.trade,
        confidence: parsed.confidence,
        timestamp: new Date(),
        status: 'pending'
      };

      setTradeCommands(prev => [tradeCommand, ...prev]);

      // Confirm the parsed command
      const confirmationText = `I understood: ${parsed.trade.action} ${parsed.trade.quantity || ''} ${parsed.trade.symbol} ${parsed.trade.price ? `at $${parsed.trade.price}` : 'at market price'}. ${parsed.trade.stopLoss ? `Stop loss at $${parsed.trade.stopLoss}.` : ''} ${parsed.trade.takeProfit ? `Take profit at $${parsed.trade.takeProfit}.` : ''} Should I execute this trade?`;
      
      speak(confirmationText);

      if (autoExecute && parsed.confidence > 0.8) {
        setTimeout(() => executeTrade(tradeCommand.id), 2000);
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
      speak("I couldn't understand that command. Please try again.");
    }
  };

  const executeTrade = async (commandId: string) => {
    const command = tradeCommands.find(cmd => cmd.id === commandId);
    if (!command) return;

    try {
      setTradeCommands(prev => 
        prev.map(cmd => 
          cmd.id === commandId ? { ...cmd, status: 'confirmed' } : cmd
        )
      );

      // Execute the trade through the selected platform
      const response = await fetch('/api/trading/execute-trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: selectedPlatform,
          trade: command.parsed,
          commandId
        })
      });

      if (response.ok) {
        setTradeCommands(prev => 
          prev.map(cmd => 
            cmd.id === commandId ? { ...cmd, status: 'executed' } : cmd
          )
        );
        speak(`Trade executed successfully on ${propFirmPlatforms.find(p => p.id === selectedPlatform)?.name}.`);
        
        // Copy trade details to clipboard for manual pasting if needed
        const tradeText = formatTradeForClipboard(command);
        navigator.clipboard.writeText(tradeText);
      } else {
        throw new Error('Trade execution failed');
      }
    } catch (error) {
      console.error('Error executing trade:', error);
      setTradeCommands(prev => 
        prev.map(cmd => 
          cmd.id === commandId ? { ...cmd, status: 'cancelled' } : cmd
        )
      );
      speak("Trade execution failed. Please check your platform connection.");
    }
  };

  const formatTradeForClipboard = (command: TradeCommand) => {
    const { parsed } = command;
    return `Symbol: ${parsed.symbol}
Action: ${parsed.action.toUpperCase()}
Quantity: ${parsed.quantity || 'Market'}
Price: ${parsed.price || 'Market Price'}
Stop Loss: ${parsed.stopLoss || 'None'}
Take Profit: ${parsed.takeProfit || 'None'}
Risk: ${parsed.risk ? `${parsed.risk}%` : 'Default'}
Platform: ${propFirmPlatforms.find(p => p.id === selectedPlatform)?.name}
Timestamp: ${command.timestamp.toLocaleString()}`;
  };

  const cancelTrade = (commandId: string) => {
    setTradeCommands(prev => 
      prev.map(cmd => 
        cmd.id === commandId ? { ...cmd, status: 'cancelled' } : cmd
      )
    );
    speak("Trade cancelled.");
  };

  const openTradingPlatform = (platformId: string) => {
    const platform = propFirmPlatforms.find(p => p.id === platformId);
    if (platform) {
      window.open(platform.url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Volume2 className="h-10 w-10 text-blue-400" />
            Voice Trading Assistant
          </h1>
          <p className="text-blue-200 text-lg">
            Execute trades using voice commands with direct prop firm platform integration
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Voice Control Panel */}
          <Card className="lg:col-span-1 bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Voice Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3">
                <Button
                  size="lg"
                  onClick={isListening ? stopListening : startListening}
                  className={`${
                    isListening 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-5 w-5 mr-2" />
                      Stop Listening
                    </>
                  ) : (
                    <>
                      <Mic className="h-5 w-5 mr-2" />
                      Launch Voice Assistant
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  {voiceEnabled ? (
                    <>
                      <Volume2 className="h-4 w-4 mr-2" />
                      Voice On
                    </>
                  ) : (
                    <>
                      <VolumeX className="h-4 w-4 mr-2" />
                      Voice Off
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-300">Platform</label>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded text-white"
                >
                  {propFirmPlatforms.map(platform => (
                    <option key={platform.id} value={platform.id} className="bg-gray-800">
                      {platform.name} {platform.status === 'connected' ? '✓' : '✗'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoExecute"
                  checked={autoExecute}
                  onChange={(e) => setAutoExecute(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="autoExecute" className="text-sm text-gray-300">
                  Auto-execute high confidence trades
                </label>
              </div>

              {isListening && (
                <div className="p-3 bg-blue-600/20 rounded border border-blue-500/30">
                  <p className="text-sm text-blue-200">Listening...</p>
                  <p className="text-white font-mono text-sm mt-1">
                    {currentCommand || 'Say something...'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Platform Status */}
          <Card className="lg:col-span-2 bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Prop Firm Platforms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {propFirmPlatforms.map(platform => (
                  <div
                    key={platform.id}
                    className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-semibold">{platform.name}</h3>
                      <Badge
                        variant={platform.status === 'connected' ? 'default' : 'destructive'}
                        className={platform.status === 'connected' ? 'bg-green-600' : 'bg-red-600'}
                      >
                        {platform.status}
                      </Badge>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">
                      {platform.supportsAutomation ? 'Supports automation' : 'Manual trading only'}
                    </p>
                    <Button
                      size="sm"
                      onClick={() => openTradingPlatform(platform.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Open Platform
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="commands" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="commands">Voice Commands</TabsTrigger>
            <TabsTrigger value="history">Trade History</TabsTrigger>
          </TabsList>

          <TabsContent value="commands">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Voice Command Examples</CardTitle>
                <CardDescription className="text-gray-300">
                  Try these voice commands to execute trades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="text-white font-semibold">Basic Commands</h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-blue-300">"Buy 0.1 Bitcoin at market price"</p>
                      <p className="text-blue-300">"Sell Solana with 2% stop loss and 5% take profit"</p>
                      <p className="text-blue-300">"Place a limit order to buy MSFT at $330 with 1% risk"</p>
                      <p className="text-blue-300">"Short TSLA with 5x leverage and 2% risk"</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-white font-semibold">Confirmation Commands</h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-green-300">To confirm: "Confirm", "Execute", "Yes", "Do it"</p>
                      <p className="text-red-300">To cancel: "Cancel", "Stop", "No"</p>
                      <p className="text-gray-300">
                        With auto-execute enabled, you'll be asked to verbally confirm before the trade is submitted.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Recent Trade Commands</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tradeCommands.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">
                      No trade commands yet. Start by using voice commands above.
                    </p>
                  ) : (
                    tradeCommands.map(command => (
                      <div
                        key={command.id}
                        className="p-4 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                command.status === 'executed' ? 'default' :
                                command.status === 'cancelled' ? 'destructive' :
                                'secondary'
                              }
                              className={
                                command.status === 'executed' ? 'bg-green-600' :
                                command.status === 'cancelled' ? 'bg-red-600' :
                                'bg-yellow-600'
                              }
                            >
                              {command.status}
                            </Badge>
                            <span className="text-sm text-gray-300">
                              {command.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {command.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => executeTrade(command.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Execute
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => cancelTrade(command.id)}
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                        <p className="text-white mb-2">"{command.command}"</p>
                        <div className="text-sm text-gray-300 space-y-1">
                          <p>Action: {command.parsed.action.toUpperCase()} {command.parsed.symbol}</p>
                          {command.parsed.quantity && <p>Quantity: {command.parsed.quantity}</p>}
                          {command.parsed.price && <p>Price: ${command.parsed.price}</p>}
                          {command.parsed.stopLoss && <p>Stop Loss: ${command.parsed.stopLoss}</p>}
                          {command.parsed.takeProfit && <p>Take Profit: ${command.parsed.takeProfit}</p>}
                          <p>Confidence: {Math.round(command.confidence * 100)}%</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}