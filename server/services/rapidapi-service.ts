import axios from 'axios';

// RapidAPI providers and their endpoints
export const RAPIDAPI_PROVIDERS = {
  twelve_data: {
    host: 'twelve-data1.p.rapidapi.com',
    baseUrl: 'https://twelve-data1.p.rapidapi.com',
    endpoints: {
      quote: '/quote',
      time_series: '/time_series',
      price: '/price',
      mutual_funds_ratings: '/mutual_funds/world/ratings',
      forex_pairs: '/forex_pairs',
      stocks_list: '/stocks/list'
    }
  },
  binance: {
    host: 'binance43.p.rapidapi.com',
    baseUrl: 'https://binance43.p.rapidapi.com',
    endpoints: {
      ticker24hr: '/ticker/24hr',
      klines: '/klines'
    }
  },
  coinranking: {
    host: 'coinranking1.p.rapidapi.com',
    baseUrl: 'https://coinranking1.p.rapidapi.com',
    endpoints: {
      stats: '/stats',
      coins: '/coins'
    }
  },
  fidelity: {
    host: 'fidelity-investments.p.rapidapi.com',
    baseUrl: 'https://fidelity-investments.p.rapidapi.com',
    endpoints: {
      auto_complete: '/auto-complete'
    }
  },
  real_time_news: {
    host: 'real-time-news-data.p.rapidapi.com',
    baseUrl: 'https://real-time-news-data.p.rapidapi.com',
    endpoints: {
      topic_news_by_section: '/topic-news-by-section'
    }
  },
  yh_finance: {
    host: 'yh-finance.p.rapidapi.com',
    baseUrl: 'https://yh-finance.p.rapidapi.com',
    endpoints: {
      esg_scores: '/stock/get-esg-scores',
      quote: '/stock/v2/get-summary'
    }
  },
  quotient: {
    host: 'quotient.p.rapidapi.com',
    baseUrl: 'https://quotient.p.rapidapi.com',
    endpoints: {
      options_prices: '/options/prices'
    }
  },
  alpha_vantage: {
    host: 'alpha-vantage.p.rapidapi.com',
    baseUrl: 'https://alpha-vantage.p.rapidapi.com',
    endpoints: {
      query: '/query'
    }
  },
  stock_options: {
    host: 'stock-and-options-trading-data-provider.p.rapidapi.com',
    baseUrl: 'https://stock-and-options-trading-data-provider.p.rapidapi.com',
    endpoints: {
      options: '/options'
    }
  },
  iex: {
    host: 'investors-exchange-iex-trading.p.rapidapi.com',
    baseUrl: 'https://investors-exchange-iex-trading.p.rapidapi.com',
    endpoints: {
      short_interest: '/stock/{symbol}/short-interest'
    }
  },
  tradingview: {
    host: 'trading-view.p.rapidapi.com',
    baseUrl: 'https://trading-view.p.rapidapi.com',
    endpoints: {
      market_movers: '/market/get-movers'
    }
  }
};

export class RapidAPIService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Generic method to make request to any RapidAPI endpoint
  async makeRequest(
    provider: keyof typeof RAPIDAPI_PROVIDERS,
    endpoint: string,
    params: Record<string, any> = {},
    method: 'GET' | 'POST' = 'GET'
  ): Promise<any> {
    const providerInfo = RAPIDAPI_PROVIDERS[provider];
    
    if (!providerInfo) {
      throw new Error(`Unsupported RapidAPI provider: ${provider}`);
    }

    const baseUrl = providerInfo.baseUrl;
    const host = providerInfo.host;
    
    let url = `${baseUrl}${endpoint}`;

    // Replace path parameters in URL
    Object.keys(params).forEach(key => {
      if (url.includes(`{${key}}`)) {
        url = url.replace(`{${key}}`, params[key]);
        delete params[key]; // Remove the path parameter from query params
      }
    });

    const requestConfig = {
      method,
      url,
      params: method === 'GET' ? params : undefined,
      data: method === 'POST' ? params : undefined,
      headers: {
        'x-rapidapi-host': host,
        'x-rapidapi-key': this.apiKey
      }
    };

    try {
      const response = await axios(requestConfig);
      return response.data;
    } catch (error) {
      console.error(`RapidAPI request failed for ${provider}:`, error);
      throw error;
    }
  }

  // Helper methods for common requests

  // Twelve Data API
  async getTwelveDataQuote(symbol: string): Promise<any> {
    return this.makeRequest('twelve_data', RAPIDAPI_PROVIDERS.twelve_data.endpoints.quote, { symbol });
  }

  async getTwelveDataTimeSeries(symbol: string, interval: string, outputsize: number = 30): Promise<any> {
    return this.makeRequest('twelve_data', RAPIDAPI_PROVIDERS.twelve_data.endpoints.time_series, {
      symbol,
      interval,
      outputsize
    });
  }

  // Binance API
  async getBinanceTicker24hr(symbol?: string): Promise<any> {
    return this.makeRequest('binance', RAPIDAPI_PROVIDERS.binance.endpoints.ticker24hr, { symbol });
  }

  async getBinanceKlines(symbol: string, interval: string, limit: number = 500): Promise<any> {
    return this.makeRequest('binance', RAPIDAPI_PROVIDERS.binance.endpoints.klines, {
      symbol,
      interval,
      limit
    });
  }

  // Coinranking API
  async getCoinrankingStats(referenceCurrencyUuid: string = 'yhjMzLPhuIDl'): Promise<any> {
    return this.makeRequest('coinranking', RAPIDAPI_PROVIDERS.coinranking.endpoints.stats, {
      referenceCurrencyUuid
    });
  }

  async getCoinrankingCoins(referenceCurrencyUuid: string = 'yhjMzLPhuIDl', limit: number = 50): Promise<any> {
    return this.makeRequest('coinranking', RAPIDAPI_PROVIDERS.coinranking.endpoints.coins, {
      referenceCurrencyUuid,
      limit
    });
  }

  // Yahoo Finance API
  async getYahooFinanceQuote(symbol: string, region: string = 'US'): Promise<any> {
    return this.makeRequest('yh_finance', RAPIDAPI_PROVIDERS.yh_finance.endpoints.quote, {
      symbol,
      region
    });
  }

  // Alpha Vantage API
  async getAlphaVantageTimeSeries(symbol: string, outputsize: string = 'compact'): Promise<any> {
    return this.makeRequest('alpha_vantage', RAPIDAPI_PROVIDERS.alpha_vantage.endpoints.query, {
      function: 'TIME_SERIES_DAILY',
      symbol,
      outputsize,
      datatype: 'json'
    });
  }

  // Trading View API
  async getTradingViewMarketMovers(exchange: string = 'US', name: string = 'volume_gainers'): Promise<any> {
    return this.makeRequest('tradingview', RAPIDAPI_PROVIDERS.tradingview.endpoints.market_movers, {
      exchange,
      name,
      locale: 'en'
    });
  }
}

// Create a singleton instance
let rapidAPIServiceInstance: RapidAPIService | null = null;

// Get or create the RapidAPI service instance
export function getRapidAPIService(apiKey?: string): RapidAPIService {
  if (!rapidAPIServiceInstance && apiKey) {
    rapidAPIServiceInstance = new RapidAPIService(apiKey);
  } else if (!rapidAPIServiceInstance && !apiKey) {
    throw new Error('RapidAPI key is required to initialize the service');
  }
  
  return rapidAPIServiceInstance as RapidAPIService;
}

// Reset the service instance (useful for testing or changing API keys)
export function resetRapidAPIService(): void {
  rapidAPIServiceInstance = null;
}