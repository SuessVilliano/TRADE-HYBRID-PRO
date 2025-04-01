import { BrokerService, MarketData, AccountBalance, BrokerPosition, OrderHistory } from './broker-service';
import crypto from 'crypto';

/**
 * Implementation of BrokerService for Kraken cryptocurrency exchange
 */
export class KrakenService implements BrokerService {
  private apiKey: string;
  private secretKey: string;
  private passphrase?: string;
  private baseUrl: string = 'https://api.kraken.com';
  private wsUrl: string = 'wss://ws.kraken.com';
  private authenticated: boolean = false;
  private webSocketConnections: Map<string, WebSocket> = new Map();
  
  constructor(apiKey: string = '', secretKey: string = '', passphrase?: string) {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
    this.passphrase = passphrase;
  }
  
  async connect(): Promise<void> {
    if (!this.apiKey || !this.secretKey) {
      throw new Error('Kraken API key and secret key are required');
    }
    
    try {
      // Test the connection by getting account balance
      await this.privateRequest('/0/private/Balance');
      this.authenticated = true;
      console.log('Connected to Kraken API successfully');
    } catch (error) {
      console.error('Failed to connect to Kraken:', error);
      throw new Error(`Failed to connect to Kraken: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private async publicRequest(endpoint: string, params: Record<string, any> = {}): Promise<any> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value.toString());
    });
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Kraken API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    // Check for Kraken API errors
    if (data.error && data.error.length > 0) {
      throw new Error(`Kraken API error: ${data.error.join(', ')}`);
    }
    
    return data.result;
  }
  
  private async privateRequest(endpoint: string, params: Record<string, any> = {}): Promise<any> {
    if (!this.apiKey || !this.secretKey) {
      throw new Error('API key and secret key are required for private requests');
    }
    
    // Add nonce for API request
    const nonce = Date.now().toString();
    const postData = new URLSearchParams({
      ...params,
      nonce
    });
    
    // Create signature
    const path = endpoint;
    const message = postData.toString();
    const secret = Buffer.from(this.secretKey, 'base64');
    
    // SHA256 of (path + SHA256(nonce + message))
    const hashNonce = crypto
      .createHash('sha256')
      .update(nonce + message)
      .digest('binary');
    
    const hmac = crypto
      .createHmac('sha512', secret)
      .update(path + hashNonce, 'binary')
      .digest('base64');
    
    const headers: HeadersInit = {
      'API-Key': this.apiKey,
      'API-Sign': hmac,
      'Content-Type': 'application/x-www-form-urlencoded'
    };
    
    // Add passphrase header if available
    if (this.passphrase) {
      headers['API-Passphrase'] = this.passphrase;
    }
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: postData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Kraken API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    // Check for Kraken API errors
    if (data.error && data.error.length > 0) {
      throw new Error(`Kraken API error: ${data.error.join(', ')}`);
    }
    
    return data.result;
  }
  
  async getBalance(): Promise<AccountBalance> {
    if (!this.authenticated) {
      await this.connect();
    }
    
    // Get balance
    const balances = await this.privateRequest('/0/private/Balance');
    
    // Get ticker info to convert to USD
    const tickers = await this.publicRequest('/0/public/Ticker', {
      pair: 'XBTUSD,ETHUSD' // Add more pairs as needed
    });
    
    let totalBalance = 0;
    let totalPositions = 0;
    
    for (const [asset, balance] of Object.entries(balances)) {
      const amount = parseFloat(balance as string);
      
      // Skip zero balances
      if (amount <= 0) continue;
      
      let valueInUsd = 0;
      
      if (asset === 'ZUSD') {
        // USD directly
        valueInUsd = amount;
      } else if (asset === 'XXBT') {
        // Bitcoin
        valueInUsd = amount * parseFloat(tickers.XXBTZUSD.c[0]);
      } else if (asset === 'XETH') {
        // Ethereum
        valueInUsd = amount * parseFloat(tickers.XETHZUSD.c[0]);
      } else {
        // For other assets, we would need their USD pairs
        // For simplicity, we'll just use the asset amount
        valueInUsd = amount;
      }
      
      totalBalance += valueInUsd;
      
      // For simplicity, we'll consider all non-USD as positions
      if (asset !== 'ZUSD') {
        totalPositions += valueInUsd;
      }
    }
    
    return {
      total: totalBalance,
      cash: totalBalance - totalPositions,
      positions: totalPositions
    };
  }
  
  async getPositions(): Promise<BrokerPosition[]> {
    if (!this.authenticated) {
      await this.connect();
    }
    
    // Get open positions
    const openPositions = await this.privateRequest('/0/private/OpenPositions');
    
    // Get balance
    const balances = await this.privateRequest('/0/private/Balance');
    
    // Get ticker info for pricing
    const assetList = Object.keys(balances).filter(asset => parseFloat(balances[asset] as string) > 0);
    const tickerPairs: string[] = [];
    
    // Create pairs for ticker (e.g., XXBTZUSD)
    assetList.forEach(asset => {
      if (asset !== 'ZUSD') {
        tickerPairs.push(`${asset}ZUSD`);
      }
    });
    
    const tickers = await this.publicRequest('/0/public/Ticker', {
      pair: tickerPairs.join(',')
    });
    
    const positions: BrokerPosition[] = [];
    
    // Convert balances to positions
    for (const [asset, balance] of Object.entries(balances)) {
      const amount = parseFloat(balance as string);
      
      // Skip zero balances and USD
      if (amount <= 0 || asset === 'ZUSD') continue;
      
      let currentPrice = 0;
      let pnl = 0;
      
      // Get current price if available
      const tickerPair = `${asset}ZUSD`;
      if (tickers[tickerPair]) {
        currentPrice = parseFloat(tickers[tickerPair].c[0]);
      }
      
      positions.push({
        symbol: this.formatAssetName(asset),
        quantity: amount,
        averagePrice: currentPrice, // We don't have historical data for avg price
        currentPrice,
        pnl
      });
    }
    
    return positions;
  }
  
  async placeOrder(order: {
    symbol: string;
    side: 'buy' | 'sell';
    quantity: number;
    type: 'market' | 'limit';
    limitPrice?: number;
  }): Promise<string> {
    if (!this.authenticated) {
      await this.connect();
    }
    
    // Format Kraken pair (e.g., BTC/USD -> XXBTZUSD)
    const krakenPair = this.formatKrakenPair(order.symbol);
    
    // Prepare order parameters
    const params: Record<string, any> = {
      pair: krakenPair,
      type: order.side,
      ordertype: order.type,
      volume: order.quantity.toString()
    };
    
    // Add price for limit orders
    if (order.type === 'limit' && order.limitPrice) {
      params.price = order.limitPrice.toString();
    }
    
    // Place the order
    const response = await this.privateRequest('/0/private/AddOrder', params);
    
    // Return the first transaction ID
    return response.txid[0];
  }
  
  async getOrderHistory(): Promise<OrderHistory[]> {
    if (!this.authenticated) {
      await this.connect();
    }
    
    // Get closed orders
    const closedOrders = await this.privateRequest('/0/private/ClosedOrders');
    
    return Object.entries(closedOrders.closed).map(([orderId, orderData]: [string, any]) => {
      const pair = orderData.descr.pair;
      const formattedSymbol = this.formatKrakenPairToStandard(pair);
      
      return {
        orderId,
        symbol: formattedSymbol,
        side: orderData.descr.type as 'buy' | 'sell',
        quantity: parseFloat(orderData.vol),
        price: parseFloat(orderData.price),
        status: this.mapOrderStatus(orderData.status),
        timestamp: orderData.closetm * 1000, // Convert to milliseconds
        broker: 'KRAKEN'
      };
    });
  }
  
  private mapOrderStatus(krakenStatus: string): 'filled' | 'pending' | 'cancelled' {
    switch (krakenStatus) {
      case 'closed':
        return 'filled';
      case 'canceled':
      case 'expired':
        return 'cancelled';
      default:
        return 'pending';
    }
  }
  
  async getQuote(symbol: string): Promise<{ bid: number; ask: number } | null> {
    try {
      // Format Kraken pair (e.g., BTC/USD -> XXBTZUSD)
      const krakenPair = this.formatKrakenPair(symbol);
      
      // Get ticker
      const ticker = await this.publicRequest('/0/public/Ticker', {
        pair: krakenPair
      });
      
      if (!ticker || !ticker[krakenPair]) {
        return null;
      }
      
      return {
        bid: parseFloat(ticker[krakenPair].b[0]),
        ask: parseFloat(ticker[krakenPair].a[0])
      };
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      return null;
    }
  }
  
  subscribeToMarketData(symbol: string, callback: (data: MarketData) => void): void {
    // Close existing connection if any
    this.unsubscribeFromMarketData(symbol);
    
    // Format Kraken pair (e.g., BTC/USD -> XBT/USD)
    const formattedPair = this.formatKrakenPairToStandard(symbol);
    
    // Create WebSocket connection
    const ws = new WebSocket(this.wsUrl);
    
    ws.onopen = () => {
      // Subscribe to ticker
      ws.send(JSON.stringify({
        name: 'subscribe',
        reqid: 1,
        pair: [formattedPair],
        subscription: {
          name: 'ticker'
        }
      }));
      
      console.log(`Subscribed to ${symbol} market data`);
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Check if it's a ticker update
        if (Array.isArray(data) && data.length >= 2 && data[1] && data[1].c) {
          // Extract price data
          const price = parseFloat(data[1].c[0]);
          const volume = parseFloat(data[1].v[1]);
          
          callback({
            symbol,
            price,
            timestamp: Date.now(),
            volume
          });
        }
      } catch (error) {
        console.error(`Error processing WebSocket message for ${symbol}:`, error);
      }
    };
    
    ws.onerror = (error) => {
      console.error(`WebSocket error for ${symbol}:`, error);
    };
    
    ws.onclose = () => {
      console.log(`WebSocket connection closed for ${symbol}`);
    };
    
    // Store the WebSocket connection
    this.webSocketConnections.set(symbol, ws);
  }
  
  unsubscribeFromMarketData(symbol: string): void {
    const ws = this.webSocketConnections.get(symbol);
    if (ws) {
      // Unsubscribe before closing
      if (ws.readyState === WebSocket.OPEN) {
        // Format Kraken pair (e.g., BTC/USD -> XBT/USD)
        const formattedPair = this.formatKrakenPairToStandard(symbol);
        
        ws.send(JSON.stringify({
          name: 'unsubscribe',
          pair: [formattedPair],
          subscription: {
            name: 'ticker'
          }
        }));
      }
      
      ws.close();
      this.webSocketConnections.delete(symbol);
      console.log(`Unsubscribed from ${symbol} market data`);
    }
  }
  
  // Helper to format asset names
  private formatAssetName(krakenAsset: string): string {
    // Convert Kraken asset codes to standard symbols
    // Examples: XXBT -> BTC, ZEUR -> EUR
    const assetMap: Record<string, string> = {
      'XXBT': 'BTC/USD',
      'XETH': 'ETH/USD',
      'XLTC': 'LTC/USD',
      'XXRP': 'XRP/USD',
      'XZEC': 'ZEC/USD',
      'XXMR': 'XMR/USD',
      'XXDG': 'DOGE/USD',
      'XADA': 'ADA/USD',
      'XXLM': 'XLM/USD',
      'XXTZ': 'XTZ/USD'
    };
    
    return assetMap[krakenAsset] || `${krakenAsset}/USD`;
  }
  
  // Helper to format trading pairs for Kraken API
  private formatKrakenPair(standardPair: string): string {
    // Convert standard trading pairs to Kraken format
    // Example: BTC/USD -> XXBTZUSD
    const [base, quote] = standardPair.split('/');
    
    const baseMap: Record<string, string> = {
      'BTC': 'XXBT',
      'ETH': 'XETH',
      'LTC': 'XLTC',
      'USD': 'ZUSD',
      'EUR': 'ZEUR',
      'JPY': 'ZJPY',
      'GBP': 'ZGBP',
      'CAD': 'ZCAD'
      // Add more as needed
    };
    
    const quoteMap: Record<string, string> = {
      'USD': 'ZUSD',
      'EUR': 'ZEUR',
      'JPY': 'ZJPY',
      'GBP': 'ZGBP',
      'CAD': 'ZCAD'
      // Add more as needed
    };
    
    const krakenBase = baseMap[base] || base;
    const krakenQuote = quoteMap[quote] || quote;
    
    return `${krakenBase}${krakenQuote}`;
  }
  
  // Helper to format Kraken pairs to standard format
  private formatKrakenPairToStandard(krakenPair: string): string {
    // Convert Kraken pairs to standard format
    // Example: XXBTZUSD -> XBT/USD (Kraken uses XBT instead of BTC in WebSocket API)
    
    // For WebSocket API
    if (krakenPair.includes('/')) {
      return krakenPair;
    }
    
    // For REST API
    const assetMap: Record<string, string> = {
      'XXBT': 'XBT',
      'XETH': 'ETH',
      'XLTC': 'LTC',
      'ZUSD': 'USD',
      'ZEUR': 'EUR',
      'ZJPY': 'JPY',
      'ZGBP': 'GBP',
      'ZCAD': 'CAD'
      // Add more as needed
    };
    
    // Try to extract the base and quote assets
    let base = '';
    let quote = '';
    
    // Common patterns: XXBTZUSD, XETHXXBT
    for (const [code, symbol] of Object.entries(assetMap)) {
      if (krakenPair.startsWith(code)) {
        base = symbol;
        quote = krakenPair.substring(code.length);
        break;
      }
    }
    
    // If we've extracted the base but quote is still in Kraken format
    if (base && quote) {
      for (const [code, symbol] of Object.entries(assetMap)) {
        if (quote === code) {
          quote = symbol;
          break;
        }
      }
    }
    
    // If we couldn't parse it, return as is
    if (!base || !quote) {
      return krakenPair;
    }
    
    return `${base}/${quote}`;
  }
}