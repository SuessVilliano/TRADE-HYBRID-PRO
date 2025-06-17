import React from 'react';
import { AITradeAssistant } from '../components/ai/AITradeAssistant';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Brain, Eye, Mic, TrendingUp, Shield, Zap } from 'lucide-react';

export default function AITradeAssistantPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Brain className="h-8 w-8 text-blue-500" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Trade Assistant
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your personal AI trading companion with real-time screen monitoring, voice commands, and intelligent market analysis
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            Screen Monitoring
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Mic className="h-3 w-3" />
            Voice Commands
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Market Analysis
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Brain className="h-3 w-3" />
            Hybrid AI
          </Badge>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-500" />
              Real-time Screen Analysis
            </CardTitle>
            <CardDescription>
              AI watches your trading screens and analyzes charts, patterns, and trade setups in real-time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Chart pattern recognition</li>
              <li>• Risk assessment alerts</li>
              <li>• Trade plan compliance</li>
              <li>• Entry/exit suggestions</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-green-500" />
              Voice Trading Commands
            </CardTitle>
            <CardDescription>
              Speak naturally to get market insights, execute trades, or ask questions about your strategy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Natural language processing</li>
              <li>• Voice-to-trade execution</li>
              <li>• Instant market queries</li>
              <li>• Strategy discussions</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-500" />
              Hybrid AI Intelligence
            </CardTitle>
            <CardDescription>
              Combines Google Genkit and OpenAI for comprehensive analysis and personalized trading support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Multi-model analysis</li>
              <li>• Personalized insights</li>
              <li>• Streaming responses</li>
              <li>• Continuous learning</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Main AI Assistant Interface */}
      <AITradeAssistant />

      {/* How It Works Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-500" />
            How It Works
          </CardTitle>
          <CardDescription>
            Your AI assistant helps you become a better trader through real-time guidance and analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Real-time Monitoring</h4>
              <ol className="space-y-2 text-sm">
                <li>1. Start screen sharing to let AI see your trading setup</li>
                <li>2. AI analyzes charts, indicators, and market conditions</li>
                <li>3. Receive proactive alerts about risks and opportunities</li>
                <li>4. Get suggestions to improve trade plan compliance</li>
              </ol>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Interactive Assistance</h4>
              <ol className="space-y-2 text-sm">
                <li>1. Chat with AI about your trading strategy and decisions</li>
                <li>2. Use voice commands for hands-free market analysis</li>
                <li>3. Get personalized education based on your trading style</li>
                <li>4. Receive continuous feedback to improve performance</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security Note */}
      <Card className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950 dark:border-emerald-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-emerald-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-emerald-800 dark:text-emerald-200">Privacy & Security</h4>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                Your screen sharing data is processed in real-time and not stored permanently. All AI analysis 
                happens securely and your trading data remains private. You have full control over when to 
                start and stop monitoring.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}