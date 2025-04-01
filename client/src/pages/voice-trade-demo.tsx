import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { SmartTradePanel } from '../components/ui/smart-trade-panel';
import { VoiceTradeAssistant, TradeCommand } from '../components/ui/voice-trade-assistant';
import { Mic, Volume2 } from 'lucide-react';
import { toast } from '../lib/toastify-bridge';

export default function VoiceTradeDemoPage() {
  const [isSmartTradePanelOpen, setIsSmartTradePanelOpen] = useState(false);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [currentTradeCommand, setCurrentTradeCommand] = useState<TradeCommand | undefined>(undefined);
  
  // Handle received trade commands from voice assistant
  const handleTradeCommand = (command: TradeCommand) => {
    console.log('Received trade command from voice assistant:', command);
    setCurrentTradeCommand(command);
    
    // Ensure the trade panel is open to display the command
    if (!isSmartTradePanelOpen) {
      setIsSmartTradePanelOpen(true);
    }
  };
  
  // Handle trade execution from voice assistant
  const handleExecuteTrade = (command: TradeCommand) => {
    console.log('Executing trade command:', command);
    setCurrentTradeCommand(command);
    
    // Ensure the trade panel is open
    if (!isSmartTradePanelOpen) {
      setIsSmartTradePanelOpen(true);
    }
    
    // Auto-submit the trade after a short delay
    setTimeout(() => {
      toast.success(`Executed ${command.action.toUpperCase()} order for ${command.symbol}`);
    }, 1000);
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-slate-800 border-slate-700 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Volume2 className="h-6 w-6 text-blue-400" />
              Voice Trading Assistant Demo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-slate-300">
              This demo showcases the integration between the AI-powered Voice Trading Assistant and the Smart Trade Panel. 
              You can use voice commands to create and execute trades without touching your keyboard.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                <h3 className="text-lg font-medium mb-3">Voice Command Examples</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>"Buy 0.1 Bitcoin at market price"</li>
                  <li>"Sell Solana with 2% stop loss and 5% take profit"</li>
                  <li>"Place a limit order to buy MSFT at $330 with 1% risk"</li>
                  <li>"Short TSLA with 5x leverage and 2% risk"</li>
                </ul>
              </div>
              
              <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                <h3 className="text-lg font-medium mb-3">Confirmation Commands</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>To confirm: "Confirm", "Execute", "Yes", "Do it"</li>
                  <li>To cancel: "Cancel", "Stop", "No"</li>
                </ul>
                <p className="mt-3 text-xs text-slate-400">
                  With auto-execute enabled, you'll be asked to verbally confirm before the trade is submitted.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-6 justify-center">
              <Button 
                variant="default" 
                size="lg" 
                onClick={() => setIsVoiceAssistantOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Mic className="h-5 w-5 mr-2" />
                Launch Voice Assistant
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => setIsSmartTradePanelOpen(true)}
              >
                Open Trade Panel
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Include both components but control visibility with state */}
        <SmartTradePanel 
          isOpen={isSmartTradePanelOpen} 
          onClose={() => setIsSmartTradePanelOpen(false)}
          receivedCommand={currentTradeCommand}
          initialPosition={{ x: window.innerWidth - 550, y: 100 }}
        />
        
        <VoiceTradeAssistant 
          isOpen={isVoiceAssistantOpen} 
          onClose={() => setIsVoiceAssistantOpen(false)}
          onTradeCommand={handleTradeCommand}
          onExecuteTrade={handleExecuteTrade}
          initialPosition={{ x: 50, y: 100 }}
        />
      </div>
    </div>
  );
}