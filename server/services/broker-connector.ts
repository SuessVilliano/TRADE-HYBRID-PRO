import axios from 'axios';
import crypto from 'crypto';
import { 
  WebhookConfig, 
  AlpacaWebhookPayload, 
  OandaWebhookPayload, 
  NinjaTraderWebhookPayload,
  WebhookResponse,
  BrokerType
} from '../../shared/models/webhook';

// Mock getUserBrokerCredentials function until we have a full implementation
// This will be replaced by an actual DB call in production
const getUserBrokerCredentials = async (userId: string, broker: string): Promise<any> => {
  // For development/testing, return mock credentials
  if (broker === 'alpaca') {
    return {
      apiKey: process.env.ALPACA_API_KEY || '',
      apiSecret: process.env.ALPACA_API_SECRET || '',
      isPaper: true
    };
  } else if (broker === 'oanda') {
    return {
      apiToken: process.env.OANDA_API_TOKEN || '',
      accountId: process.env.OANDA_ACCOUNT_ID || '',
      isPractice: true
    };
  } else if (broker === 'ninjaTrader') {
    return {
      machineID: process.env.NINJATRADER_MACHINE_ID || '',
      connectionPort: process.env.NINJATRADER_PORT || '8000'
    };
  }
  
  return null;
};

// Interface for broker connectors
interface BrokerConnector {
  executeTrade(
    userId: string, 
    webhookConfig: WebhookConfig, 
    payload: any
  ): Promise<WebhookResponse>;
  testConnection(
    userId: string,
    credentials: any
  ): Promise<{ success: boolean; message?: string; accountInfo?: any }>;
}

// Broker connector for Alpaca
class AlpacaConnector implements BrokerConnector {
  private getApiEndpoint(isPaper: boolean = true): string {
    return isPaper 
      ? 'https://paper-api.alpaca.markets' 
      : 'https://api.alpaca.markets';
  }
  
  async executeTrade(
    userId: string, 
    webhookConfig: WebhookConfig, 
    payload: AlpacaWebhookPayload
  ): Promise<WebhookResponse> {
    try {
      // Get user's broker credentials
      const credentials = await getUserBrokerCredentials(userId, 'alpaca');
      
      if (!credentials || !credentials.apiKey || !credentials.apiSecret) {
        return {
          success: false,
          message: 'Missing Alpaca API credentials',
          errors: ['API credentials not found for this account']
        };
      }
      
      const isPaper = credentials.isPaper !== false;
      const apiEndpoint = this.getApiEndpoint(isPaper);
      
      // Determine order parameters
      const side = payload.side || payload.action;
      
      if (!payload.symbol) {
        return {
          success: false,
          message: 'Missing required parameter: symbol',
          errors: ['Symbol is required for trade execution']
        };
      }
      
      // Apply trade settings from webhook config if available
      const brokerConfig = webhookConfig.brokerConfig || {};
      const qty = payload.qty || brokerConfig.defaultQuantity || 1;
      
      // Build the order request
      const orderRequest = {
        symbol: payload.symbol,
        qty: qty.toString(),
        side: side || 'buy',
        type: payload.type || 'market',
        time_in_force: payload.time_in_force || 'day',
        limit_price: payload.limit_price,
        stop_price: payload.stop_price,
        extended_hours: payload.extended_hours,
        client_order_id: payload.client_order_id,
      };
      
      // Execute the trade via Alpaca API
      const response = await axios.post(
        `${apiEndpoint}/v2/orders`, 
        orderRequest,
        {
          headers: {
            'APCA-API-KEY-ID': credentials.apiKey,
            'APCA-API-SECRET-KEY': credentials.apiSecret,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Handle stop loss and take profit if specified
      let stopLossOrder = null;
      let takeProfitOrder = null;
      
      if (response.data && response.data.id) {
        // If order was filled and stop loss/take profit are specified
        if ((payload.stop_loss || payload.take_profit) && 
            response.data.filled_at) {
          
          const filledPrice = parseFloat(response.data.filled_avg_price);
          
          // Place stop loss order if specified
          if (payload.stop_loss) {
            const stopLossPrice = side === 'buy' 
              ? filledPrice - parseFloat(payload.stop_loss.toString()) 
              : filledPrice + parseFloat(payload.stop_loss.toString());
              
            const stopLossRequest = {
              symbol: payload.symbol,
              qty: qty.toString(),
              side: side === 'buy' ? 'sell' : 'buy', // Opposite side for stop loss
              type: 'stop',
              time_in_force: 'gtc',
              stop_price: stopLossPrice,
              order_class: 'bracket',
              parent_id: response.data.id,
            };
            
            stopLossOrder = await axios.post(
              `${apiEndpoint}/v2/orders`, 
              stopLossRequest,
              {
                headers: {
                  'APCA-API-KEY-ID': credentials.apiKey,
                  'APCA-API-SECRET-KEY': credentials.apiSecret,
                  'Content-Type': 'application/json'
                }
              }
            );
          }
          
          // Place take profit order if specified
          if (payload.take_profit) {
            const takeProfitPrice = side === 'buy' 
              ? filledPrice + parseFloat(payload.take_profit.toString()) 
              : filledPrice - parseFloat(payload.take_profit.toString());
              
            const takeProfitRequest = {
              symbol: payload.symbol,
              qty: qty.toString(),
              side: side === 'buy' ? 'sell' : 'buy', // Opposite side for take profit
              type: 'limit',
              time_in_force: 'gtc',
              limit_price: takeProfitPrice,
              order_class: 'bracket',
              parent_id: response.data.id,
            };
            
            takeProfitOrder = await axios.post(
              `${apiEndpoint}/v2/orders`, 
              takeProfitRequest,
              {
                headers: {
                  'APCA-API-KEY-ID': credentials.apiKey,
                  'APCA-API-SECRET-KEY': credentials.apiSecret,
                  'Content-Type': 'application/json'
                }
              }
            );
          }
        }
      }
      
      return {
        success: true,
        message: 'Order executed successfully',
        orderId: response.data.id,
        details: {
          order: response.data,
          stopLoss: stopLossOrder?.data,
          takeProfit: takeProfitOrder?.data
        }
      };
    } catch (error: any) {
      console.error('Error executing Alpaca trade:', error.response?.data || error.message);
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to execute trade',
        errors: [error.response?.data?.message || error.message],
        details: error.response?.data
      };
    }
  }
  
  async testConnection(
    userId: string,
    credentials: any
  ): Promise<{ success: boolean; message?: string; accountInfo?: any }> {
    try {
      const isPaper = credentials.isPaper !== false;
      const apiEndpoint = this.getApiEndpoint(isPaper);
      
      // Test the API connection by fetching account info
      const response = await axios.get(
        `${apiEndpoint}/v2/account`,
        {
          headers: {
            'APCA-API-KEY-ID': credentials.apiKey,
            'APCA-API-SECRET-KEY': credentials.apiSecret,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return {
        success: true,
        message: 'Successfully connected to Alpaca',
        accountInfo: {
          id: response.data.id,
          accountNumber: response.data.account_number,
          status: response.data.status,
          equity: response.data.equity,
          cash: response.data.cash,
          buyingPower: response.data.buying_power,
          isPaper: isPaper
        }
      };
    } catch (error: any) {
      console.error('Error testing Alpaca connection:', error.response?.data || error.message);
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to connect to Alpaca'
      };
    }
  }
}

// Broker connector for Oanda
class OandaConnector implements BrokerConnector {
  private getApiEndpoint(isPractice: boolean = true): string {
    return isPractice 
      ? 'https://api-fxpractice.oanda.com' 
      : 'https://api-fxtrade.oanda.com';
  }
  
  async executeTrade(
    userId: string, 
    webhookConfig: WebhookConfig, 
    payload: OandaWebhookPayload
  ): Promise<WebhookResponse> {
    try {
      // Get user's broker credentials
      const credentials = await getUserBrokerCredentials(userId, 'oanda');
      
      if (!credentials || !credentials.apiToken || !credentials.accountId) {
        return {
          success: false,
          message: 'Missing Oanda API credentials',
          errors: ['API credentials not found for this account']
        };
      }
      
      const isPractice = credentials.isPractice !== false;
      const apiEndpoint = this.getApiEndpoint(isPractice);
      
      if (!payload.instrument) {
        return {
          success: false,
          message: 'Missing required parameter: instrument',
          errors: ['Instrument is required for trade execution']
        };
      }
      
      // Apply trade settings from webhook config if available
      const brokerConfig = webhookConfig.brokerConfig || {};
      
      // Determine units (positive for buy, negative for sell)
      let units = payload.units;
      if (typeof units === 'string') {
        units = parseInt(units);
      }
      
      if (payload.side === 'sell' && units > 0) {
        units = -units;
      }
      
      // Build the order request
      const orderRequest: any = {
        order: {
          instrument: payload.instrument,
          units: units,
          type: payload.type || 'MARKET',
          timeInForce: payload.timeInForce || 'GTC',
          positionFill: payload.positionFill || 'DEFAULT'
        }
      };
      
      // Add stop loss if specified
      if (payload.stopLossOnFill) {
        orderRequest.order.stopLossOnFill = payload.stopLossOnFill;
      }
      
      // Add take profit if specified
      if (payload.takeProfitOnFill) {
        orderRequest.order.takeProfitOnFill = payload.takeProfitOnFill;
      }
      
      // Add trailing stop if specified
      if (payload.trailingStopLossOnFill) {
        orderRequest.order.trailingStopLossOnFill = payload.trailingStopLossOnFill;
      }
      
      // Execute the trade via Oanda API
      const response = await axios.post(
        `${apiEndpoint}/v3/accounts/${credentials.accountId}/orders`, 
        orderRequest,
        {
          headers: {
            'Authorization': `Bearer ${credentials.apiToken}`,
            'Content-Type': 'application/json',
            'Accept-Datetime-Format': 'RFC3339'
          }
        }
      );
      
      return {
        success: true,
        message: 'Order executed successfully',
        orderId: response.data.orderCreateTransaction?.id,
        details: response.data
      };
    } catch (error: any) {
      console.error('Error executing Oanda trade:', error.response?.data || error.message);
      
      return {
        success: false,
        message: error.response?.data?.errorMessage || error.message || 'Failed to execute trade',
        errors: [error.response?.data?.errorMessage || error.message],
        details: error.response?.data
      };
    }
  }
  
  async testConnection(
    userId: string,
    credentials: any
  ): Promise<{ success: boolean; message?: string; accountInfo?: any }> {
    try {
      const isPractice = credentials.isPractice !== false;
      const apiEndpoint = this.getApiEndpoint(isPractice);
      
      // Test the API connection by fetching account info
      const response = await axios.get(
        `${apiEndpoint}/v3/accounts/${credentials.accountId}`,
        {
          headers: {
            'Authorization': `Bearer ${credentials.apiToken}`,
            'Content-Type': 'application/json',
            'Accept-Datetime-Format': 'RFC3339'
          }
        }
      );
      
      return {
        success: true,
        message: 'Successfully connected to Oanda',
        accountInfo: {
          id: response.data.account.id,
          name: response.data.account.alias,
          currency: response.data.account.currency,
          balance: response.data.account.balance,
          marginAvailable: response.data.account.marginAvailable,
          isPractice: isPractice
        }
      };
    } catch (error: any) {
      console.error('Error testing Oanda connection:', error.response?.data || error.message);
      
      return {
        success: false,
        message: error.response?.data?.errorMessage || error.message || 'Failed to connect to Oanda'
      };
    }
  }
}

// Broker connector for NinjaTrader
// This requires a desktop companion app running on the user's machine
class NinjaTraderConnector implements BrokerConnector {
  async executeTrade(
    userId: string, 
    webhookConfig: WebhookConfig, 
    payload: NinjaTraderWebhookPayload
  ): Promise<WebhookResponse> {
    try {
      // Get user's broker credentials
      const credentials = await getUserBrokerCredentials(userId, 'ninjaTrader');
      
      if (!credentials || !credentials.machineID || !credentials.connectionPort) {
        return {
          success: false,
          message: 'Missing NinjaTrader connection details',
          errors: ['Connection details not found for NinjaTrader']
        };
      }
      
      if (!payload.symbol) {
        return {
          success: false,
          message: 'Missing required parameter: symbol',
          errors: ['Symbol is required for trade execution']
        };
      }
      
      if (!payload.action) {
        return {
          success: false,
          message: 'Missing required parameter: action',
          errors: ['Action (BUY/SELL/FLATTEN) is required for trade execution']
        };
      }
      
      // Apply trade settings from webhook config if available
      const brokerConfig = webhookConfig.brokerConfig || {};
      
      // Convert quantity to proper format
      let quantity = payload.quantity;
      if (typeof quantity === 'string') {
        quantity = parseInt(quantity);
      }
      
      // Build the order request
      const orderRequest = {
        machineID: credentials.machineID,
        action: payload.action,
        symbol: payload.symbol,
        quantity: quantity || brokerConfig.defaultQuantity || 1,
        orderType: payload.orderType || 'MARKET',
        limitPrice: payload.limitPrice,
        stopPrice: payload.stopPrice,
        account: payload.account,
        template: payload.template,
        duration: payload.duration || 'DAY',
        stopLoss: payload.stopLoss,
        takeProfit: payload.takeProfit,
        comment: payload.comment || 'Trade Hybrid webhook'
      };
      
      // Send the trade to the NinjaTrader Desktop Connector
      // Note: The desktop connector runs a local web server that receives these requests
      const connectorUrl = `http://localhost:${credentials.connectionPort}/execute-trade`;
      
      // Create a signature for authentication
      const timestamp = Date.now().toString();
      const signature = crypto
        .createHmac('sha256', credentials.machineID)
        .update(`${timestamp}:${JSON.stringify(orderRequest)}`)
        .digest('hex');
      
      const response = await axios.post(
        connectorUrl, 
        orderRequest,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Machine-ID': credentials.machineID,
            'X-Timestamp': timestamp,
            'X-Signature': signature
          },
          timeout: 10000 // 10 second timeout for local connection
        }
      );
      
      return {
        success: true,
        message: 'Order sent to NinjaTrader',
        orderId: response.data.orderId,
        details: response.data
      };
    } catch (error: any) {
      console.error('Error executing NinjaTrader trade:', error.response?.data || error.message);
      
      const isConnectionError = 
        error.code === 'ECONNREFUSED' || 
        error.code === 'ETIMEDOUT' ||
        error.message.includes('connect');
      
      const errorMessage = isConnectionError
        ? 'Could not connect to NinjaTrader Desktop Connector. Please ensure it is running.'
        : error.response?.data?.message || error.message || 'Failed to execute trade';
      
      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage],
        details: error.response?.data
      };
    }
  }
  
  async testConnection(
    userId: string,
    credentials: any
  ): Promise<{ success: boolean; message?: string; accountInfo?: any }> {
    try {
      if (!credentials.machineID || !credentials.connectionPort) {
        return {
          success: false,
          message: 'Missing machineID or connectionPort'
        };
      }
      
      // Create a signature for authentication
      const timestamp = Date.now().toString();
      const signature = crypto
        .createHmac('sha256', credentials.machineID)
        .update(`${timestamp}:test-connection`)
        .digest('hex');
      
      // Test the connection to the NinjaTrader Desktop Connector
      const connectorUrl = `http://localhost:${credentials.connectionPort}/test-connection`;
      
      const response = await axios.get(
        connectorUrl,
        {
          headers: {
            'X-Machine-ID': credentials.machineID,
            'X-Timestamp': timestamp,
            'X-Signature': signature
          },
          timeout: 5000 // 5 second timeout for local connection
        }
      );
      
      return {
        success: true,
        message: 'Successfully connected to NinjaTrader Desktop Connector',
        accountInfo: response.data
      };
    } catch (error: any) {
      console.error('Error testing NinjaTrader connection:', error.message);
      
      const isConnectionError = 
        error.code === 'ECONNREFUSED' || 
        error.code === 'ETIMEDOUT' ||
        error.message.includes('connect');
      
      return {
        success: false,
        message: isConnectionError
          ? 'Could not connect to NinjaTrader Desktop Connector. Please ensure it is running.'
          : error.response?.data?.message || error.message
      };
    }
  }
}

// Main broker connector factory
class BrokerConnectorFactory {
  static getConnector(broker: string): BrokerConnector {
    switch (broker.toLowerCase()) {
      case BrokerType.ALPACA:
        return new AlpacaConnector();
      case BrokerType.OANDA:
        return new OandaConnector();
      case BrokerType.NINJATRADER:
        return new NinjaTraderConnector();
      default:
        throw new Error(`Unsupported broker: ${broker}`);
    }
  }
  
  static async executeTrade(
    userId: string, 
    webhookConfig: WebhookConfig, 
    payload: any
  ): Promise<WebhookResponse> {
    try {
      const connector = this.getConnector(webhookConfig.broker);
      return await connector.executeTrade(userId, webhookConfig, payload);
    } catch (error: any) {
      console.error('Error in BrokerConnectorFactory.executeTrade:', error);
      return {
        success: false,
        message: error.message || 'Failed to execute trade',
        errors: [error.message]
      };
    }
  }
  
  static async testConnection(
    userId: string,
    broker: string,
    credentials: any
  ): Promise<{ success: boolean; message?: string; accountInfo?: any }> {
    try {
      const connector = this.getConnector(broker);
      return await connector.testConnection(userId, credentials);
    } catch (error: any) {
      console.error('Error in BrokerConnectorFactory.testConnection:', error);
      return {
        success: false,
        message: error.message || 'Failed to test connection'
      };
    }
  }
}

export default BrokerConnectorFactory;