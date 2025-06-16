import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ParsedTrade {
  action: 'buy' | 'sell' | 'short' | 'limit';
  symbol: string;
  quantity?: number;
  price?: number;
  stopLoss?: number;
  takeProfit?: number;
  risk?: number;
  leverage?: number;
}

interface TradeParseResult {
  trade: ParsedTrade;
  confidence: number;
  errors?: string[];
}

export class AITradingService {
  
  static async parseTradeCommand(command: string, platform: string): Promise<TradeParseResult> {
    try {
      const prompt = `Parse this voice trading command and extract trading parameters. Return a JSON response with the following structure:

{
  "trade": {
    "action": "buy|sell|short|limit",
    "symbol": "trading symbol (e.g., BTCUSDT, EURUSD, AAPL)",
    "quantity": number or null,
    "price": number or null (null for market orders),
    "stopLoss": number or null,
    "takeProfit": number or null,
    "risk": number or null (percentage),
    "leverage": number or null
  },
  "confidence": number between 0 and 1,
  "errors": ["array of any parsing errors"]
}

Command: "${command}"
Platform: ${platform}

Rules:
- Extract numeric values accurately
- Convert common terms (e.g., "at market" = null price)
- Default to market orders if no price specified
- Risk percentages should be numbers (2% = 2)
- Confidence should reflect parsing certainty
- Symbol should match platform format (crypto: BTCUSDT, forex: EURUSD, stocks: AAPL)`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert trading command parser. Parse voice commands into structured trading data with high accuracy."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      // Validate the result
      if (!result.trade || !result.trade.action || !result.trade.symbol) {
        throw new Error('Invalid trade command structure');
      }

      return result;
    } catch (error) {
      console.error('Error parsing trade command:', error);
      return {
        trade: {
          action: 'buy',
          symbol: 'UNKNOWN'
        },
        confidence: 0,
        errors: ['Failed to parse command']
      };
    }
  }

  static async generateTradeAnalysis(trade: ParsedTrade, marketData?: any): Promise<string> {
    try {
      const prompt = `Provide a brief analysis of this trade setup:

Trade: ${trade.action.toUpperCase()} ${trade.symbol}
Quantity: ${trade.quantity || 'Market'}
Entry: ${trade.price || 'Market Price'}
Stop Loss: ${trade.stopLoss || 'None'}
Take Profit: ${trade.takeProfit || 'None'}
Risk: ${trade.risk ? `${trade.risk}%` : 'Default'}

Provide a 2-3 sentence analysis focusing on:
1. Risk assessment
2. Entry timing
3. Risk/reward ratio if stops are set

Keep it concise and actionable.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a professional trading analyst. Provide clear, concise trade analysis."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 200
      });

      return response.choices[0].message.content || 'Analysis unavailable';
    } catch (error) {
      console.error('Error generating trade analysis:', error);
      return 'Unable to generate analysis at this time.';
    }
  }

  static async validateTradeParameters(trade: ParsedTrade, platform: string): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Validate action
    if (!['buy', 'sell', 'short', 'limit'].includes(trade.action)) {
      errors.push('Invalid trade action');
    }

    // Validate symbol format based on platform
    if (platform === 'dxtrade' || platform === 'matchtrader') {
      // Forex pairs should be 6-7 characters
      if (trade.symbol.length < 6 || trade.symbol.length > 7) {
        // Could be crypto or stock, validate differently
        if (!trade.symbol.includes('USD') && !trade.symbol.match(/^[A-Z]{2,5}$/)) {
          errors.push('Invalid symbol format for platform');
        }
      }
    }

    // Validate risk percentage
    if (trade.risk && (trade.risk < 0.1 || trade.risk > 10)) {
      errors.push('Risk should be between 0.1% and 10%');
    }

    // Validate stop loss vs entry price relationship
    if (trade.price && trade.stopLoss) {
      if (trade.action === 'buy' && trade.stopLoss >= trade.price) {
        errors.push('Stop loss should be below entry price for buy orders');
      }
      if (trade.action === 'sell' && trade.stopLoss <= trade.price) {
        errors.push('Stop loss should be above entry price for sell orders');
      }
    }

    // Validate take profit vs entry price relationship
    if (trade.price && trade.takeProfit) {
      if (trade.action === 'buy' && trade.takeProfit <= trade.price) {
        errors.push('Take profit should be above entry price for buy orders');
      }
      if (trade.action === 'sell' && trade.takeProfit >= trade.price) {
        errors.push('Take profit should be below entry price for sell orders');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static formatTradeForPlatform(trade: ParsedTrade, platform: string): string {
    switch (platform) {
      case 'dxtrade':
        return `Symbol: ${trade.symbol}
Side: ${trade.action.toUpperCase()}
Quantity: ${trade.quantity || 'Market'}
Order Type: ${trade.price ? 'Limit' : 'Market'}
${trade.price ? `Price: ${trade.price}` : ''}
${trade.stopLoss ? `Stop Loss: ${trade.stopLoss}` : ''}
${trade.takeProfit ? `Take Profit: ${trade.takeProfit}` : ''}`;

      case 'matchtrader':
        return `${trade.action.toUpperCase()} ${trade.symbol}
Lot Size: ${trade.quantity || '0.01'}
${trade.price ? `@ ${trade.price}` : '@ Market'}
${trade.stopLoss ? `SL: ${trade.stopLoss}` : ''}
${trade.takeProfit ? `TP: ${trade.takeProfit}` : ''}`;

      case 'ctrader':
        return `Instrument: ${trade.symbol}
Volume: ${trade.quantity || '0.01'}
Direction: ${trade.action.toUpperCase()}
${trade.price ? `Entry: ${trade.price}` : 'Entry: Market'}
${trade.stopLoss ? `Stop Loss: ${trade.stopLoss}` : ''}
${trade.takeProfit ? `Take Profit: ${trade.takeProfit}` : ''}`;

      default:
        return `${trade.action.toUpperCase()} ${trade.quantity || ''} ${trade.symbol} ${trade.price ? `@ ${trade.price}` : '@ Market'}`;
    }
  }
}