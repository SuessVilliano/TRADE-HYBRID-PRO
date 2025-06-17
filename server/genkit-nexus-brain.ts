import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { logger } from 'genkit/logging';

// Initialize Genkit with Google AI
const ai = genkit({
  plugins: [googleAI()],
  logLevel: 'debug'
});

interface WebhookData {
  id: string;
  source: string;
  timestamp: Date;
  data: any;
  processed: boolean;
  analysis?: string;
  actions?: string[];
}

interface TradeSignal {
  id: string;
  symbol: string;
  direction: 'BUY' | 'SELL';
  price: number;
  stopLoss?: number;
  takeProfit?: number;
  provider: string;
  confidence: number;
  timestamp: Date;
  analysis?: string;
}

interface SystemError {
  id: string;
  type: string;
  message: string;
  stack?: string;
  timestamp: Date;
  component: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolution?: string;
}

export class GenkitNexusBrain {
  private static instance: GenkitNexusBrain;
  private webhookHistory: WebhookData[] = [];
  private tradeSignalHistory: TradeSignal[] = [];
  private errorHistory: SystemError[] = [];
  
  private constructor() {
    logger.info('Genkit Nexus Brain initialized - AI-powered webhook processing and error analysis');
  }

  static getInstance(): GenkitNexusBrain {
    if (!GenkitNexusBrain.instance) {
      GenkitNexusBrain.instance = new GenkitNexusBrain();
    }
    return GenkitNexusBrain.instance;
  }

  // Process incoming webhooks with AI analysis
  async processWebhook(webhookData: any, source: string): Promise<WebhookData> {
    const webhookId = `webhook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    logger.info(`🧠 Genkit Brain processing webhook from ${source}`, { webhookId });

    try {
      // AI analysis of webhook content
      const analysisPrompt = `
        As an advanced trading AI, analyze this webhook data:
        Source: ${source}
        Data: ${JSON.stringify(webhookData, null, 2)}
        
        Provide:
        1. What type of trading signal or data this represents
        2. Key insights and market implications
        3. Recommended actions for traders
        4. Risk assessment and confidence level
        5. Any anomalies or concerns
        
        Respond in JSON format with: {
          "signalType": "buy/sell/alert/data",
          "analysis": "detailed analysis",
          "confidence": 0.85,
          "actions": ["action1", "action2"],
          "riskLevel": "low/medium/high",
          "marketImpact": "analysis of market impact"
        }
      `;

      const aiAnalysis = await ai.generate({
        model: 'gemini-1.5-flash',
        prompt: analysisPrompt
      });

      let parsedAnalysis;
      try {
        parsedAnalysis = JSON.parse(aiAnalysis.text());
      } catch (parseError) {
        logger.warn('Failed to parse AI analysis JSON, using raw response');
        parsedAnalysis = { analysis: aiAnalysis.text(), confidence: 0.7 };
      }

      const processedWebhook: WebhookData = {
        id: webhookId,
        source,
        timestamp: new Date(),
        data: webhookData,
        processed: true,
        analysis: parsedAnalysis.analysis || 'AI analysis completed',
        actions: parsedAnalysis.actions || []
      };

      // Store in history (keep last 100)
      this.webhookHistory.unshift(processedWebhook);
      if (this.webhookHistory.length > 100) {
        this.webhookHistory = this.webhookHistory.slice(0, 100);
      }

      // If this is a trade signal, process it separately
      if (this.isTradeSignal(webhookData)) {
        await this.processTradeSignal(webhookData, source, parsedAnalysis);
      }

      logger.info('🎯 Webhook processed successfully', {
        webhookId,
        signalType: parsedAnalysis.signalType,
        confidence: parsedAnalysis.confidence
      });

      return processedWebhook;

    } catch (error) {
      logger.error('❌ Error processing webhook with Genkit Brain', error);
      
      const errorWebhook: WebhookData = {
        id: webhookId,
        source,
        timestamp: new Date(),
        data: webhookData,
        processed: false,
        analysis: `Error processing webhook: ${error.message}`,
        actions: ['retry_processing', 'manual_review']
      };

      this.webhookHistory.unshift(errorWebhook);
      await this.logSystemError('webhook_processing', error.message, 'high', 'genkit-brain');
      
      return errorWebhook;
    }
  }

  // Process trade signals with enhanced AI analysis
  async processTradeSignal(signalData: any, provider: string, aiAnalysis?: any): Promise<TradeSignal> {
    const signalId = `signal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    logger.info(`📊 Processing trade signal from ${provider}`, { signalId });

    try {
      const enhancedAnalysisPrompt = `
        Analyze this trade signal with deep market intelligence:
        Provider: ${provider}
        Signal: ${JSON.stringify(signalData, null, 2)}
        
        Provide comprehensive analysis including:
        1. Signal quality and reliability assessment
        2. Market context and timing analysis
        3. Risk/reward ratio evaluation
        4. Entry/exit strategy recommendations
        5. Potential market catalysts affecting this trade
        
        Return JSON: {
          "quality": "excellent/good/fair/poor",
          "confidence": 0.85,
          "analysis": "detailed analysis",
          "riskReward": 2.5,
          "timing": "excellent/good/fair/poor",
          "recommendations": ["rec1", "rec2"]
        }
      `;

      const signalAnalysis = await ai.generate({
        model: 'gemini-1.5-flash',
        prompt: enhancedAnalysisPrompt
      });

      let parsedSignalAnalysis;
      try {
        parsedSignalAnalysis = JSON.parse(signalAnalysis.text());
      } catch (parseError) {
        parsedSignalAnalysis = { analysis: signalAnalysis.text(), confidence: 0.7 };
      }

      const processedSignal: TradeSignal = {
        id: signalId,
        symbol: signalData.symbol || signalData.Symbol || 'UNKNOWN',
        direction: signalData.direction || signalData.Direction || 'BUY',
        price: signalData.price || signalData['Entry Price'] || 0,
        stopLoss: signalData.stopLoss || signalData['Stop Loss'],
        takeProfit: signalData.takeProfit || signalData['Take Profit'],
        provider,
        confidence: parsedSignalAnalysis.confidence || 0.7,
        timestamp: new Date(),
        analysis: parsedSignalAnalysis.analysis || 'AI signal analysis completed'
      };

      // Store in history (keep last 200 signals)
      this.tradeSignalHistory.unshift(processedSignal);
      if (this.tradeSignalHistory.length > 200) {
        this.tradeSignalHistory = this.tradeSignalHistory.slice(0, 200);
      }

      logger.info('✅ Trade signal processed and analyzed', {
        signalId,
        symbol: processedSignal.symbol,
        quality: parsedSignalAnalysis.quality,
        confidence: processedSignal.confidence
      });

      return processedSignal;

    } catch (error) {
      logger.error('❌ Error processing trade signal', error);
      await this.logSystemError('signal_processing', error.message, 'medium', 'genkit-brain');
      throw error;
    }
  }

  // AI-powered error analysis and troubleshooting
  async analyzeSystemError(error: Error, component: string, context?: any): Promise<SystemError> {
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    logger.error(`🔧 Genkit Brain analyzing system error in ${component}`, { errorId, error: error.message });

    try {
      const errorAnalysisPrompt = `
        As an expert system administrator and debugging AI, analyze this error:
        
        Component: ${component}
        Error Message: ${error.message}
        Stack Trace: ${error.stack || 'No stack trace available'}
        Context: ${JSON.stringify(context || {}, null, 2)}
        
        Provide:
        1. Root cause analysis
        2. Severity assessment (low/medium/high/critical)
        3. Step-by-step troubleshooting guide
        4. Immediate actions to resolve
        5. Prevention strategies
        6. Similar issues and solutions
        
        Return JSON: {
          "rootCause": "detailed root cause",
          "severity": "medium",
          "resolution": "step by step solution",
          "immediateActions": ["action1", "action2"],
          "prevention": "how to prevent this",
          "relatedIssues": ["similar issue patterns"]
        }
      `;

      const errorAnalysis = await ai.generate({
        model: 'gemini-1.5-flash',
        prompt: errorAnalysisPrompt
      });

      let parsedErrorAnalysis;
      try {
        parsedErrorAnalysis = JSON.parse(errorAnalysis.text());
      } catch (parseError) {
        parsedErrorAnalysis = { 
          rootCause: errorAnalysis.text(),
          severity: 'medium',
          resolution: 'AI analysis available in logs'
        };
      }

      const systemError: SystemError = {
        id: errorId,
        type: error.name || 'UnknownError',
        message: error.message,
        stack: error.stack,
        timestamp: new Date(),
        component,
        severity: parsedErrorAnalysis.severity as any || 'medium',
        resolution: parsedErrorAnalysis.resolution || 'AI troubleshooting in progress'
      };

      // Store in error history (keep last 50 errors)
      this.errorHistory.unshift(systemError);
      if (this.errorHistory.length > 50) {
        this.errorHistory = this.errorHistory.slice(0, 50);
      }

      logger.info('🎯 Error analyzed and resolution provided', {
        errorId,
        severity: systemError.severity,
        rootCause: parsedErrorAnalysis.rootCause
      });

      // Log detailed troubleshooting information
      logger.info('🔧 AI Troubleshooting Guide', {
        errorId,
        immediateActions: parsedErrorAnalysis.immediateActions,
        prevention: parsedErrorAnalysis.prevention,
        relatedIssues: parsedErrorAnalysis.relatedIssues
      });

      return systemError;

    } catch (analysisError) {
      logger.error('❌ Failed to analyze error with AI', analysisError);
      
      const fallbackError: SystemError = {
        id: errorId,
        type: error.name || 'UnknownError',
        message: error.message,
        stack: error.stack,
        timestamp: new Date(),
        component,
        severity: 'medium',
        resolution: 'Manual troubleshooting required - AI analysis failed'
      };

      this.errorHistory.unshift(fallbackError);
      return fallbackError;
    }
  }

  // Log system errors for Nexus monitoring
  async logSystemError(type: string, message: string, severity: SystemError['severity'], component: string): Promise<void> {
    const error = new Error(message);
    error.name = type;
    await this.analyzeSystemError(error, component);
  }

  // Get comprehensive system status for Nexus dashboard
  getSystemStatus(): {
    webhooks: { total: number; recent: WebhookData[] };
    signals: { total: number; recent: TradeSignal[] };
    errors: { total: number; recent: SystemError[] };
    health: 'excellent' | 'good' | 'warning' | 'critical';
  } {
    const recentWebhooks = this.webhookHistory.slice(0, 10);
    const recentSignals = this.tradeSignalHistory.slice(0, 10);
    const recentErrors = this.errorHistory.filter(e => 
      Date.now() - e.timestamp.getTime() < 3600000 // Last hour
    );

    let health: 'excellent' | 'good' | 'warning' | 'critical' = 'excellent';
    if (recentErrors.some(e => e.severity === 'critical')) health = 'critical';
    else if (recentErrors.some(e => e.severity === 'high')) health = 'warning';
    else if (recentErrors.length > 5) health = 'good';

    return {
      webhooks: { total: this.webhookHistory.length, recent: recentWebhooks },
      signals: { total: this.tradeSignalHistory.length, recent: recentSignals },
      errors: { total: this.errorHistory.length, recent: recentErrors },
      health
    };
  }

  // Helper method to identify trade signals
  private isTradeSignal(data: any): boolean {
    const signalFields = ['symbol', 'Symbol', 'direction', 'Direction', 'price', 'Entry Price'];
    return signalFields.some(field => data.hasOwnProperty(field));
  }

  // Get detailed logs for Nexus debugging
  getDetailedLogs(component?: string, timeframe?: number): any[] {
    const since = timeframe ? Date.now() - timeframe : 0;
    
    const allLogs = [
      ...this.webhookHistory.map(w => ({ ...w, logType: 'webhook' })),
      ...this.tradeSignalHistory.map(s => ({ ...s, logType: 'signal' })),
      ...this.errorHistory.map(e => ({ ...e, logType: 'error' }))
    ].filter(log => log.timestamp.getTime() > since);

    if (component) {
      return allLogs.filter(log => 
        log.logType === 'error' ? log.component === component : 
        log.source?.includes(component) || log.provider?.includes(component)
      );
    }

    return allLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}

// Export singleton instance
export const genkitNexusBrain = GenkitNexusBrain.getInstance();