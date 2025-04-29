/**
 * Broker Connection Service
 * 
 * Central service for managing different broker connections
 * Registers and maintains connections to various brokers
 */

import { BrokerConnection } from './broker-interface';
import { createAlpacaAdapter } from './alpaca-broker-adapter';
import { createTradeHybridAdapter } from './tradehybrid-broker-adapter';
import { createTradovateAdapter } from './tradovate-broker-adapter';
import { createNinjaTraderAdapter } from './ninjatrader-broker-adapter';
import { createInteractiveBrokersAdapter } from './interactive-brokers-adapter';
import { createOandaAdapter } from './oanda-broker-adapter';
import { createBinanceAdapter } from './binance-broker-adapter';
import { createCTraderAdapter } from './ctrader-broker-adapter';
import { createMatchTraderAdapter } from './matchtrader-broker-adapter';
import { createMT4Adapter, createMT5Adapter, MetaTraderVersion } from './metatrader-broker-adapter';
import { MCPServer } from '../core/mcp-server';
import { TradeExecutionProcessor } from '../processors/trade-execution-processor';

export class BrokerConnectionService {
  private static instance: BrokerConnectionService;
  private brokers: Map<string, BrokerConnection> = new Map();
  private mcp: MCPServer;
  private tradeProcessor: TradeExecutionProcessor | null = null;

  private constructor(mcp: MCPServer) {
    this.mcp = mcp;
    console.log('Broker Connection Service initialized');
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(mcp: MCPServer): BrokerConnectionService {
    if (!BrokerConnectionService.instance) {
      BrokerConnectionService.instance = new BrokerConnectionService(mcp);
    }
    return BrokerConnectionService.instance;
  }

  /**
   * Initialize the service with default connections
   */
  public async initialize(): Promise<void> {
    // Get trade execution processor from MCP
    this.tradeProcessor = this.mcp.getProcessor('trade-execution') as TradeExecutionProcessor;
    
    if (!this.tradeProcessor) {
      console.error('Trade Execution Processor not found in MCP');
      return;
    }
    
    // Initialize default broker connections if needed
    await this.initializeDefaultConnections();
    
    console.log('Broker Connection Service initialized with default connections');
  }

  /**
   * Initialize default broker connections (if env vars are set)
   */
  private async initializeDefaultConnections(): Promise<void> {
    try {
      // Check for Alpaca API credentials
      const alpacaApiKey = process.env.ALPACA_API_KEY;
      const alpacaApiSecret = process.env.ALPACA_API_SECRET;
      
      if (alpacaApiKey && alpacaApiSecret) {
        // Create Alpaca connection
        await this.registerAlpacaBroker(alpacaApiKey, alpacaApiSecret, true);
      }
      
      // Check for Tradovate credentials
      const tradovateUsername = process.env.TRADOVATE_USERNAME;
      const tradovatePassword = process.env.TRADOVATE_PASSWORD;
      
      if (tradovateUsername && tradovatePassword) {
        // Create Tradovate connection
        await this.registerTradovateBroker(tradovateUsername, tradovatePassword, true);
      }
      
      // Check for NinjaTrader credentials
      const ninjaTraderToken = process.env.NINJATRADER_TOKEN;
      const ninjaTraderMachineID = process.env.NINJATRADER_MACHINE_ID;
      
      if (ninjaTraderToken && ninjaTraderMachineID) {
        // Create NinjaTrader connection
        await this.registerNinjaTraderBroker(ninjaTraderToken, ninjaTraderMachineID);
      }
      
      // Check for Interactive Brokers credentials
      const ibkrSessionId = process.env.IBKR_SESSION_ID;
      
      if (ibkrSessionId) {
        // Create Interactive Brokers connection
        await this.registerInteractiveBrokersBroker(ibkrSessionId);
      }
      
      // Check for Oanda credentials
      const oandaApiToken = process.env.OANDA_API_TOKEN;
      const oandaAccountId = process.env.OANDA_ACCOUNT_ID;
      
      if (oandaApiToken) {
        // Create Oanda connection
        await this.registerOandaBroker(oandaApiToken, oandaAccountId, true);
      }
      
      // Check for Binance US credentials
      const binanceApiKey = process.env.BINANCE_API_KEY;
      const binanceApiSecret = process.env.BINANCE_API_SECRET;
      const binanceUsGlobal = process.env.BINANCE_US_GLOBAL as 'us' | 'global' || 'us';
      
      if (binanceApiKey && binanceApiSecret) {
        // Create Binance connection
        await this.registerBinanceBroker(binanceApiKey, binanceApiSecret, binanceUsGlobal);
      }
      
      // Check for cTrader credentials
      const cTraderClientId = process.env.CTRADER_CLIENT_ID;
      const cTraderClientSecret = process.env.CTRADER_CLIENT_SECRET;
      const cTraderAccessToken = process.env.CTRADER_ACCESS_TOKEN;
      const cTraderRefreshToken = process.env.CTRADER_REFRESH_TOKEN;
      const cTraderAccountId = process.env.CTRADER_ACCOUNT_ID;
      
      if (cTraderClientId && cTraderClientSecret) {
        // Create cTrader connection
        await this.registerCTraderBroker(
          cTraderClientId,
          cTraderClientSecret,
          cTraderAccessToken,
          cTraderRefreshToken,
          cTraderAccountId
        );
      }
      
      // Check for Match Trader credentials
      const matchTraderApiKey = process.env.MATCHTRADER_API_KEY;
      const matchTraderUsername = process.env.MATCHTRADER_USERNAME;
      const matchTraderPassword = process.env.MATCHTRADER_PASSWORD;
      
      if (matchTraderApiKey && matchTraderUsername && matchTraderPassword) {
        // Create Match Trader connection
        await this.registerMatchTraderBroker(
          matchTraderApiKey,
          matchTraderUsername,
          matchTraderPassword
        );
      }
      
      // Check for MetaTrader 4 credentials
      const mt4ApiToken = process.env.MT4_API_TOKEN;
      const mt4AccountNumber = process.env.MT4_ACCOUNT_NUMBER;
      const mt4Password = process.env.MT4_PASSWORD;
      const mt4Server = process.env.MT4_SERVER;
      
      if (mt4ApiToken && mt4AccountNumber && mt4Password && mt4Server) {
        // Create MetaTrader 4 connection
        await this.registerMetaTrader4Broker(
          mt4ApiToken,
          mt4AccountNumber,
          mt4Password,
          mt4Server
        );
      }
      
      // Check for MetaTrader 5 credentials
      const mt5ApiToken = process.env.MT5_API_TOKEN;
      const mt5AccountNumber = process.env.MT5_ACCOUNT_NUMBER;
      const mt5Password = process.env.MT5_PASSWORD;
      const mt5Server = process.env.MT5_SERVER;
      
      if (mt5ApiToken && mt5AccountNumber && mt5Password && mt5Server) {
        // Create MetaTrader 5 connection
        await this.registerMetaTrader5Broker(
          mt5ApiToken,
          mt5AccountNumber,
          mt5Password,
          mt5Server
        );
      }
      
      // Register TradeHybrid as the default internal broker
      // Note: This doesn't need external credentials as it's our internal system
      this.registerTradeHybridBroker('system');
      
      console.log('Default broker connections registered');
    } catch (error) {
      console.error('Error initializing default broker connections:', error);
    }
  }

  /**
   * Register an Alpaca broker connection
   */
  public async registerAlpacaBroker(
    apiKey: string, 
    apiSecret: string, 
    paper: boolean = true
  ): Promise<boolean> {
    try {
      // Create adapter
      const alpacaAdapter = createAlpacaAdapter(apiKey, apiSecret, paper);
      
      // Test connection
      const connected = await alpacaAdapter.testConnection();
      if (!connected) {
        console.error('Failed to connect to Alpaca broker');
        return false;
      }
      
      // Register with service
      this.brokers.set('alpaca', alpacaAdapter);
      
      // Register with trade processor
      if (this.tradeProcessor) {
        this.tradeProcessor.registerBroker('alpaca', alpacaAdapter);
      }
      
      console.log('Alpaca broker registered successfully');
      return true;
    } catch (error) {
      console.error('Error registering Alpaca broker:', error);
      return false;
    }
  }

  /**
   * Register a Trade Hybrid broker connection
   */
  public registerTradeHybridBroker(userId: string): boolean {
    try {
      // Create adapter
      const tradeHybridAdapter = createTradeHybridAdapter(userId);
      
      // Register with service
      this.brokers.set(`tradehybrid_${userId}`, tradeHybridAdapter);
      
      // Register with trade processor
      if (this.tradeProcessor) {
        this.tradeProcessor.registerBroker(`tradehybrid_${userId}`, tradeHybridAdapter);
      }
      
      console.log(`Trade Hybrid broker registered for user: ${userId}`);
      return true;
    } catch (error) {
      console.error('Error registering Trade Hybrid broker:', error);
      return false;
    }
  }

  /**
   * Register an external broker connection
   */
  public registerBroker(brokerId: string, broker: BrokerConnection): boolean {
    try {
      // Register with service
      this.brokers.set(brokerId, broker);
      
      // Register with trade processor
      if (this.tradeProcessor) {
        this.tradeProcessor.registerBroker(brokerId, broker);
      }
      
      console.log(`Broker registered: ${brokerId}`);
      return true;
    } catch (error) {
      console.error(`Error registering broker ${brokerId}:`, error);
      return false;
    }
  }

  /**
   * Get a broker connection by ID
   */
  public getBroker(brokerId: string): BrokerConnection | undefined {
    return this.brokers.get(brokerId);
  }

  /**
   * Get all registered broker connections
   */
  public getAllBrokers(): Map<string, BrokerConnection> {
    return this.brokers;
  }

  /**
   * Test a broker connection
   */
  public async testBrokerConnection(brokerId: string): Promise<boolean> {
    const broker = this.brokers.get(brokerId);
    if (!broker) {
      console.error(`Broker not found: ${brokerId}`);
      return false;
    }
    
    try {
      return await broker.testConnection();
    } catch (error) {
      console.error(`Error testing broker connection ${brokerId}:`, error);
      return false;
    }
  }
  
  /**
   * Register a Tradovate broker connection
   */
  public async registerTradovateBroker(
    username: string,
    password: string,
    demo: boolean = true
  ): Promise<boolean> {
    try {
      // Create adapter
      const tradovateAdapter = createTradovateAdapter(username, password, demo);
      
      // Test connection
      const connected = await tradovateAdapter.testConnection();
      if (!connected) {
        console.error('Failed to connect to Tradovate broker');
        return false;
      }
      
      // Register with service
      this.brokers.set('tradovate', tradovateAdapter);
      
      // Register with trade processor
      if (this.tradeProcessor) {
        this.tradeProcessor.registerBroker('tradovate', tradovateAdapter);
      }
      
      console.log('Tradovate broker registered successfully');
      return true;
    } catch (error) {
      console.error('Error registering Tradovate broker:', error);
      return false;
    }
  }
  
  /**
   * Register a NinjaTrader broker connection
   */
  public async registerNinjaTraderBroker(
    connectionToken: string,
    machineID: string,
    serverUrl?: string
  ): Promise<boolean> {
    try {
      // Create adapter
      const ninjaTraderAdapter = createNinjaTraderAdapter(connectionToken, machineID, serverUrl);
      
      // Test connection
      const connected = await ninjaTraderAdapter.testConnection();
      if (!connected) {
        console.error('Failed to connect to NinjaTrader broker');
        return false;
      }
      
      // Register with service
      this.brokers.set('ninjatrader', ninjaTraderAdapter);
      
      // Register with trade processor
      if (this.tradeProcessor) {
        this.tradeProcessor.registerBroker('ninjatrader', ninjaTraderAdapter);
      }
      
      console.log('NinjaTrader broker registered successfully');
      return true;
    } catch (error) {
      console.error('Error registering NinjaTrader broker:', error);
      return false;
    }
  }
  
  /**
   * Register an Interactive Brokers connection
   */
  public async registerInteractiveBrokersBroker(
    sessionId: string,
    clientPortalUrl?: string,
    demo?: boolean
  ): Promise<boolean> {
    try {
      // Create adapter
      const ibkrAdapter = createInteractiveBrokersAdapter(sessionId, clientPortalUrl, demo);
      
      // Test connection
      const connected = await ibkrAdapter.testConnection();
      if (!connected) {
        console.error('Failed to connect to Interactive Brokers');
        return false;
      }
      
      // Register with service
      this.brokers.set('ibkr', ibkrAdapter);
      
      // Register with trade processor
      if (this.tradeProcessor) {
        this.tradeProcessor.registerBroker('ibkr', ibkrAdapter);
      }
      
      console.log('Interactive Brokers broker registered successfully');
      return true;
    } catch (error) {
      console.error('Error registering Interactive Brokers broker:', error);
      return false;
    }
  }
  
  /**
   * Register an Oanda broker connection
   */
  public async registerOandaBroker(
    apiToken: string,
    accountId?: string,
    demo: boolean = true
  ): Promise<boolean> {
    try {
      // Create adapter
      const oandaAdapter = createOandaAdapter(apiToken, accountId, demo);
      
      // Test connection
      const connected = await oandaAdapter.testConnection();
      if (!connected) {
        console.error('Failed to connect to Oanda broker');
        return false;
      }
      
      // Register with service
      this.brokers.set('oanda', oandaAdapter);
      
      // Register with trade processor
      if (this.tradeProcessor) {
        this.tradeProcessor.registerBroker('oanda', oandaAdapter);
      }
      
      console.log('Oanda broker registered successfully');
      return true;
    } catch (error) {
      console.error('Error registering Oanda broker:', error);
      return false;
    }
  }
  
  /**
   * Register a Binance broker connection
   */
  public async registerBinanceBroker(
    apiKey: string,
    apiSecret: string,
    usGlobal: 'us' | 'global' = 'us'
  ): Promise<boolean> {
    try {
      // Create adapter
      const binanceAdapter = createBinanceAdapter(apiKey, apiSecret, usGlobal);
      
      // Test connection
      const connected = await binanceAdapter.testConnection();
      if (!connected) {
        console.error('Failed to connect to Binance broker');
        return false;
      }
      
      // Register with service
      this.brokers.set(usGlobal === 'us' ? 'binance_us' : 'binance', binanceAdapter);
      
      // Register with trade processor
      if (this.tradeProcessor) {
        this.tradeProcessor.registerBroker(
          usGlobal === 'us' ? 'binance_us' : 'binance', 
          binanceAdapter
        );
      }
      
      console.log(`Binance ${usGlobal.toUpperCase()} broker registered successfully`);
      return true;
    } catch (error) {
      console.error('Error registering Binance broker:', error);
      return false;
    }
  }
  
  /**
   * Register a cTrader broker connection
   */
  public async registerCTraderBroker(
    clientId: string,
    clientSecret: string,
    accessToken?: string,
    refreshToken?: string,
    accountId?: string,
    cTraderUrl?: string
  ): Promise<boolean> {
    try {
      // Create adapter
      const cTraderAdapter = createCTraderAdapter(
        clientId, 
        clientSecret, 
        accessToken, 
        refreshToken, 
        accountId, 
        cTraderUrl
      );
      
      // Test connection
      const connected = await cTraderAdapter.testConnection();
      if (!connected) {
        console.error('Failed to connect to cTrader broker');
        return false;
      }
      
      // Register with service
      this.brokers.set('ctrader', cTraderAdapter);
      
      // Register with trade processor
      if (this.tradeProcessor) {
        this.tradeProcessor.registerBroker('ctrader', cTraderAdapter);
      }
      
      console.log('cTrader broker registered successfully');
      return true;
    } catch (error) {
      console.error('Error registering cTrader broker:', error);
      return false;
    }
  }
  
  /**
   * Register a Match Trader broker connection
   */
  public async registerMatchTraderBroker(
    apiKey: string,
    username: string,
    password: string,
    baseUrl?: string,
    brokerId?: string
  ): Promise<boolean> {
    try {
      // Create adapter
      const matchTraderAdapter = createMatchTraderAdapter(
        apiKey,
        username,
        password,
        baseUrl,
        brokerId
      );
      
      // Test connection
      const connected = await matchTraderAdapter.testConnection();
      if (!connected) {
        console.error('Failed to connect to Match Trader broker');
        return false;
      }
      
      // Register with service
      this.brokers.set(brokerId || 'matchtrader', matchTraderAdapter);
      
      // Register with trade processor
      if (this.tradeProcessor) {
        this.tradeProcessor.registerBroker(brokerId || 'matchtrader', matchTraderAdapter);
      }
      
      console.log(`Match Trader broker registered successfully (${brokerId || 'matchtrader'})`);
      return true;
    } catch (error) {
      console.error('Error registering Match Trader broker:', error);
      return false;
    }
  }
  
  /**
   * Register a MetaTrader 4 broker connection
   */
  public async registerMetaTrader4Broker(
    apiToken: string,
    accountNumber: string,
    password: string,
    server: string,
    baseUrl?: string
  ): Promise<boolean> {
    try {
      // Create adapter
      const mt4Adapter = createMT4Adapter(
        apiToken,
        accountNumber,
        password,
        server,
        baseUrl
      );
      
      // Test connection
      const connected = await mt4Adapter.testConnection();
      if (!connected) {
        console.error('Failed to connect to MetaTrader 4 broker');
        return false;
      }
      
      // Register with service
      this.brokers.set('mt4', mt4Adapter);
      
      // Register with trade processor
      if (this.tradeProcessor) {
        this.tradeProcessor.registerBroker('mt4', mt4Adapter);
      }
      
      console.log('MetaTrader 4 broker registered successfully');
      return true;
    } catch (error) {
      console.error('Error registering MetaTrader 4 broker:', error);
      return false;
    }
  }
  
  /**
   * Register a MetaTrader 5 broker connection
   */
  public async registerMetaTrader5Broker(
    apiToken: string,
    accountNumber: string,
    password: string,
    server: string,
    baseUrl?: string
  ): Promise<boolean> {
    try {
      // Create adapter
      const mt5Adapter = createMT5Adapter(
        apiToken,
        accountNumber,
        password,
        server,
        baseUrl
      );
      
      // Test connection
      const connected = await mt5Adapter.testConnection();
      if (!connected) {
        console.error('Failed to connect to MetaTrader 5 broker');
        return false;
      }
      
      // Register with service
      this.brokers.set('mt5', mt5Adapter);
      
      // Register with trade processor
      if (this.tradeProcessor) {
        this.tradeProcessor.registerBroker('mt5', mt5Adapter);
      }
      
      console.log('MetaTrader 5 broker registered successfully');
      return true;
    } catch (error) {
      console.error('Error registering MetaTrader 5 broker:', error);
      return false;
    }
  }
  
  /**
   * Get account information for a broker
   */
  public async getAccountInfo(brokerId: string): Promise<any> {
    const broker = this.brokers.get(brokerId);
    if (!broker) {
      throw new Error(`Broker not found: ${brokerId}`);
    }
    
    if (!broker.isConnected()) {
      await broker.connect();
    }
    
    return await broker.getAccountInfo();
  }
}

/**
 * Initialize the broker connection service with the MCP server
 */
export function initializeBrokerConnectionService(mcp: MCPServer): BrokerConnectionService {
  const service = BrokerConnectionService.getInstance(mcp);
  service.initialize().catch(err => 
    console.error('Error initializing broker connection service:', err)
  );
  return service;
}