import axios from 'axios';

export interface NewsSource {
  id: string;
  name: string;
  category: string;
  url: string;
  iconUrl?: string;
  active: boolean;
}

export interface FinancialNewsItem {
  id: string;
  title: string;
  summary: string;
  content?: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  source: string;
  sourceId: string;
  category: string[];
  tags: string[];
  sentiment?: 'bullish' | 'bearish' | 'neutral';
  impact?: 'high' | 'medium' | 'low';
  symbols?: string[];
}

export interface EconomicCalendarEvent {
  id: string;
  title: string;
  country: string;
  date: string;
  time?: string;
  impact: 'high' | 'medium' | 'low';
  forecast?: string;
  previous?: string;
  actual?: string;
  unit?: string;
  category: string;
}

export interface NewsSearchParams {
  query?: string;
  category?: string;
  source?: string;
  fromDate?: string;
  toDate?: string;
  limit?: number;
  symbols?: string[];
}

export class FinancialNewsService {
  private initialized = false;
  private newsSources: NewsSource[] = [
    {
      id: 'bloomberg',
      name: 'Bloomberg',
      category: 'financial',
      url: 'https://www.bloomberg.com/',
      iconUrl: 'https://www.bloomberg.com/favicon.ico',
      active: true
    },
    {
      id: 'reuters',
      name: 'Reuters',
      category: 'financial',
      url: 'https://www.reuters.com/',
      iconUrl: 'https://www.reuters.com/favicon.ico',
      active: true
    },
    {
      id: 'ft',
      name: 'Financial Times',
      category: 'financial',
      url: 'https://www.ft.com/',
      iconUrl: 'https://www.ft.com/favicon.ico',
      active: true
    },
    {
      id: 'wsj',
      name: 'Wall Street Journal',
      category: 'financial',
      url: 'https://www.wsj.com/',
      iconUrl: 'https://www.wsj.com/favicon.ico',
      active: true
    },
    {
      id: 'cnbc',
      name: 'CNBC',
      category: 'financial',
      url: 'https://www.cnbc.com/',
      iconUrl: 'https://www.cnbc.com/favicon.ico',
      active: true
    },
    {
      id: 'forexfactory',
      name: 'Forex Factory',
      category: 'forex',
      url: 'https://www.forexfactory.com/',
      iconUrl: 'https://www.forexfactory.com/favicon.ico',
      active: true
    },
    {
      id: 'investing',
      name: 'Investing.com',
      category: 'financial',
      url: 'https://www.investing.com/',
      iconUrl: 'https://www.investing.com/favicon.ico',
      active: true
    },
    {
      id: 'yahoo_finance',
      name: 'Yahoo Finance',
      category: 'financial',
      url: 'https://finance.yahoo.com/',
      iconUrl: 'https://finance.yahoo.com/favicon.ico',
      active: true
    },
    {
      id: 'crypto_news',
      name: 'CoinDesk',
      category: 'crypto',
      url: 'https://www.coindesk.com/',
      iconUrl: 'https://www.coindesk.com/favicon.ico',
      active: true
    },
    {
      id: 'cointelegraph',
      name: 'CoinTelegraph',
      category: 'crypto',
      url: 'https://cointelegraph.com/',
      iconUrl: 'https://cointelegraph.com/favicon.ico',
      active: true
    }
  ];

  constructor() {}

  /**
   * Initialize the news service
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }
    
    try {
      // Fetch available news sources from the server
      await this.ensureInitialized();
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize news service:', error);
      return false;
    }
  }

  private async ensureInitialized() {
    if (!this.initialized) {
      try {
        const response = await axios.get('/api/rss-feeds/sources');
        // Only update if we have server-side sources
        if (response.data && response.data.sources && response.data.sources.length > 0) {
          // Merge with our local sources based on IDs
          const serverSources = response.data.sources;
          
          // Create a map of existing sources by ID
          const sourceMap = new Map<string, NewsSource>();
          this.newsSources.forEach(source => sourceMap.set(source.id, source));
          
          // Add or update with server sources
          serverSources.forEach((serverSource: any) => {
            if (sourceMap.has(serverSource.id)) {
              // Update existing source
              const existingSource = sourceMap.get(serverSource.id)!;
              existingSource.name = serverSource.name || existingSource.name;
              existingSource.url = serverSource.url || existingSource.url;
              existingSource.category = serverSource.category || existingSource.category;
              existingSource.iconUrl = serverSource.iconUrl || existingSource.iconUrl;
            } else {
              // Add new source
              this.newsSources.push({
                id: serverSource.id,
                name: serverSource.name,
                category: serverSource.category || 'financial',
                url: serverSource.url,
                iconUrl: serverSource.iconUrl,
                active: true
              });
            }
          });
        }
      } catch (error) {
        console.error('Error fetching news sources:', error);
        // Continue with local sources
      }
    }
  }

  /**
   * Get available news sources
   */
  getNewsSources(): NewsSource[] {
    return [...this.newsSources];
  }

  /**
   * Update news source activity status
   */
  updateNewsSourceActivity(sourceId: string, active: boolean): void {
    const sourceIndex = this.newsSources.findIndex(source => source.id === sourceId);
    if (sourceIndex !== -1) {
      this.newsSources[sourceIndex].active = active;
    }
  }

  /**
   * Get financial news from multiple sources
   */
  async getNews(params: NewsSearchParams = {}): Promise<FinancialNewsItem[]> {
    try {
      await this.ensureInitialized();
      
      // Default values
      const limit = params.limit || 20;
      
      // For mock/development purposes, generate some news items
      // In production, this would call your server API
      const mockItems: FinancialNewsItem[] = [];
      const today = new Date();
      
      const categories = ['market', 'economy', 'stocks', 'forex', 'crypto', 'commodities'];
      const sentiments = ['bullish', 'bearish', 'neutral'] as const;
      const impacts = ['high', 'medium', 'low'] as const;
      
      const activeSources = this.newsSources.filter(source => source.active);
      
      // Generate random news items
      for (let i = 0; i < limit; i++) {
        const randomSource = activeSources[Math.floor(Math.random() * activeSources.length)];
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const randomSentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
        const randomImpact = impacts[Math.floor(Math.random() * impacts.length)];
        
        // Adjust time to be within the last 24 hours
        const publishedAt = new Date(today);
        publishedAt.setHours(publishedAt.getHours() - Math.floor(Math.random() * 24));
        
        mockItems.push({
          id: `news-${i}`,
          title: `Example financial news item ${i + 1}`,
          summary: `This is a summary of a financial news item related to ${randomCategory}.`,
          url: randomSource.url,
          publishedAt: publishedAt.toISOString(),
          source: randomSource.name,
          sourceId: randomSource.id,
          category: [randomCategory],
          tags: [randomCategory, 'finance'],
          sentiment: randomSentiment,
          impact: randomImpact
        });
      }
      
      // Try to fetch real news from the server
      try {
        const response = await axios.get('/api/rss-feeds/news', {
          params: {
            limit,
            category: params.category,
            source: params.source,
            symbols: params.symbols?.join(',')
          }
        });
        
        if (response.data && response.data.items && response.data.items.length > 0) {
          // Transform server response to match our interface
          const serverItems = response.data.items.map((item: any) => {
            // Analyze sentiment and impact if not provided
            const sentiment = item.sentiment || this.determineSentiment(item.title + ' ' + (item.summary || ''));
            const impact = item.impact || this.determineImpact(item.title + ' ' + (item.summary || ''));
            
            return {
              id: item.id || `server-news-${Math.random().toString(36).substring(2, 9)}`,
              title: item.title,
              summary: item.summary || item.description || '',
              content: item.content,
              url: item.url || item.link,
              imageUrl: item.imageUrl || item.image,
              publishedAt: item.publishedAt || item.pubDate || new Date().toISOString(),
              source: item.source,
              sourceId: item.sourceId || '',
              category: item.categories || item.category ? 
                (Array.isArray(item.categories) ? item.categories : [item.category]) : 
                ['financial'],
              tags: item.tags || [],
              sentiment,
              impact,
              symbols: item.symbols || []
            };
          });
          
          return serverItems;
        }
      } catch (error) {
        console.error('Error fetching news from server:', error);
        // Fall back to mock data
      }
      
      return mockItems;
    } catch (error) {
      console.error('Error getting news:', error);
      return [];
    }
  }

  /**
   * Get news for specific symbols/tickers
   */
  async getNewsForSymbols(symbols: string[], limit: number = 10): Promise<FinancialNewsItem[]> {
    return this.getNews({
      symbols,
      limit
    });
  }

  /**
   * Get news from specific sources
   */
  async getNewsFromSource(sourceId: string, limit: number = 10): Promise<FinancialNewsItem[]> {
    return this.getNews({
      source: sourceId,
      limit
    });
  }

  /**
   * Get economic calendar events
   */
  async getEconomicCalendar(
    fromDate: string = new Date().toISOString().split('T')[0], 
    toDate?: string,
    countries: string[] = []
  ): Promise<EconomicCalendarEvent[]> {
    try {
      await this.ensureInitialized();
      
      // Try to fetch from server
      try {
        const response = await axios.get('/api/rss-feeds/economic-calendar', {
          params: {
            fromDate,
            toDate,
            countries: countries.join(',')
          }
        });
        
        if (response.data && response.data.events && response.data.events.length > 0) {
          // Transform server response to match our interface
          return response.data.events.map((event: any) => ({
            id: event.id || `event-${Math.random().toString(36).substring(2, 9)}`,
            title: event.title,
            country: event.country,
            date: event.date,
            time: event.time,
            impact: event.impact,
            forecast: event.forecast,
            previous: event.previous,
            actual: event.actual,
            unit: event.unit,
            category: event.category || 'economic'
          }));
        }
      } catch (error) {
        console.error('Error fetching economic calendar from server:', error);
        // Fall back to mock data
      }
      
      // For mock/development purposes, generate calendar events
      // In production, this would call your server API
      const events: EconomicCalendarEvent[] = [];
      const startDate = new Date(fromDate);
      const endDate = toDate ? new Date(toDate) : new Date(startDate);
      endDate.setDate(endDate.getDate() + 14); // Default to 2 weeks out if no end date
      
      const eventTitles = [
        'Non-Farm Payrolls',
        'GDP Report',
        'Interest Rate Decision',
        'CPI Data Release',
        'Unemployment Rate',
        'Retail Sales',
        'Manufacturing PMI',
        'Services PMI',
        'Trade Balance',
        'Consumer Confidence'
      ];
      
      const countryCodes = ['US', 'EU', 'UK', 'JP', 'AU', 'CA', 'CN', 'CH'];
      const impacts = ['high', 'medium', 'low'] as const;
      const categories = ['economic', 'central-bank', 'employment', 'inflation', 'consumer'];
      
      // Generate event for each day in range
      let currentDate = new Date(startDate);
      let id = 1;
      
      while (currentDate <= endDate) {
        // Skip weekends
        if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
          // Add 1-3 events per day
          const eventsPerDay = Math.floor(Math.random() * 3) + 1;
          
          for (let i = 0; i < eventsPerDay; i++) {
            const randomTitle = eventTitles[Math.floor(Math.random() * eventTitles.length)];
            const randomCountry = countries.length > 0 
              ? countries[Math.floor(Math.random() * countries.length)]
              : countryCodes[Math.floor(Math.random() * countryCodes.length)];
            const randomImpact = impacts[Math.floor(Math.random() * impacts.length)];
            const randomCategory = categories[Math.floor(Math.random() * categories.length)];
            
            // Random time during market hours
            const hours = 8 + Math.floor(Math.random() * 9); // 8 AM to 5 PM
            const minutes = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, or 45 minutes
            const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            
            // Format date as YYYY-MM-DD
            const dateString = currentDate.toISOString().split('T')[0];
            
            // Random values for forecast/previous
            const value = (Math.random() * 10).toFixed(1);
            const prevValue = (Math.random() * 10).toFixed(1);
            
            events.push({
              id: `cal-${id++}`,
              title: randomTitle,
              country: randomCountry,
              date: dateString,
              time: timeString,
              impact: randomImpact,
              forecast: value + '%',
              previous: prevValue + '%',
              actual: Math.random() > 0.7 ? (Math.random() * 10).toFixed(1) + '%' : undefined,
              unit: '%',
              category: randomCategory
            });
          }
        }
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return events;
    } catch (error) {
      console.error('Error getting economic calendar:', error);
      return [];
    }
  }

  /**
   * Get RSS feed content from a financial news source
   */
  async getRssFeed(sourceId: string, limit: number = 20): Promise<FinancialNewsItem[]> {
    try {
      await this.ensureInitialized();
      
      // Find the source
      const source = this.newsSources.find(s => s.id === sourceId);
      if (!source) {
        throw new Error(`News source with ID ${sourceId} not found`);
      }
      
      // Try to fetch from server
      try {
        const response = await axios.get(`/api/rss-feeds/feed/${sourceId}`, {
          params: { limit }
        });
        
        if (response.data && response.data.items && response.data.items.length > 0) {
          // Transform server response to match our interface
          return response.data.items.map((item: any, index: number) => {
            // Analyze sentiment and impact if not provided
            const sentiment = item.sentiment || this.determineSentiment(item.title + ' ' + (item.description || ''));
            const impact = item.impact || this.determineImpact(item.title + ' ' + (item.description || ''));
            
            return {
              id: item.id || `rss-${sourceId}-${index}`,
              title: item.title,
              summary: item.summary || item.description || '',
              url: item.url || item.link,
              imageUrl: item.imageUrl || item.image,
              publishedAt: item.publishedAt || item.pubDate || item.isoDate || new Date().toISOString(),
              source: source.name,
              sourceId: sourceId,
              category: item.categories || ['financial'],
              tags: item.tags || [],
              sentiment,
              impact,
              symbols: item.symbols || []
            };
          });
        }
      } catch (error) {
        console.error(`Error fetching RSS feed for ${sourceId}:`, error);
        // Fall back to mock data
      }
      
      // Mock RSS feed items for development
      const mockItems: FinancialNewsItem[] = [];
      const today = new Date();
      
      for (let i = 0; i < limit; i++) {
        // Adjust time to be within the last 24 hours
        const publishedAt = new Date(today);
        publishedAt.setHours(publishedAt.getHours() - Math.floor(Math.random() * 24));
        
        mockItems.push({
          id: `rss-${sourceId}-${i}`,
          title: `${source.name} RSS Feed Item ${i + 1}`,
          summary: `This is a summary of an RSS feed item from ${source.name}.`,
          url: source.url,
          publishedAt: publishedAt.toISOString(),
          source: source.name,
          sourceId: sourceId,
          category: ['financial'],
          tags: ['rss', 'financial'],
          sentiment: Math.random() > 0.66 ? 'bullish' : (Math.random() > 0.5 ? 'bearish' : 'neutral'),
          impact: Math.random() > 0.7 ? 'high' : (Math.random() > 0.4 ? 'medium' : 'low')
        });
      }
      
      return mockItems;
    } catch (error) {
      console.error(`Error getting RSS feed for ${sourceId}:`, error);
      return [];
    }
  }

  /**
   * A simple sentiment analysis based on keywords
   */
  private determineSentiment(text: string): 'bullish' | 'bearish' | 'neutral' {
    text = text.toLowerCase();
    
    const bullishKeywords = [
      'gain', 'gains', 'rise', 'rises', 'rising', 'rose', 'rally', 'rallies', 'rallied', 
      'jump', 'jumps', 'jumped', 'surge', 'surges', 'surged', 'soar', 'soars', 'soared',
      'higher', 'uptrend', 'uptick', 'positive', 'optimistic', 'optimism', 'bull', 'bullish',
      'outperform', 'outperformed', 'strong', 'stronger', 'strength', 'opportunity', 'profit',
      'green', 'upside', 'buy', 'buying', 'growth', 'growing', 'expand', 'expanding'
    ];
    
    const bearishKeywords = [
      'loss', 'losses', 'fall', 'falls', 'falling', 'fell', 'plunge', 'plunges', 'plunged',
      'drop', 'drops', 'dropped', 'dive', 'dives', 'dived', 'sink', 'sinks', 'sunk',
      'lower', 'downtrend', 'downtick', 'negative', 'pessimistic', 'pessimism', 'bear', 'bearish',
      'underperform', 'underperformed', 'weak', 'weaker', 'weakness', 'risk', 'losses',
      'red', 'downside', 'sell', 'selling', 'shrink', 'shrinking', 'contract', 'contracting'
    ];
    
    let bullishCount = 0;
    let bearishCount = 0;
    
    bullishKeywords.forEach(keyword => {
      if (text.includes(keyword)) bullishCount++;
    });
    
    bearishKeywords.forEach(keyword => {
      if (text.includes(keyword)) bearishCount++;
    });
    
    if (bullishCount > bearishCount) return 'bullish';
    if (bearishCount > bullishCount) return 'bearish';
    return 'neutral';
  }

  /**
   * Determine impact based on keywords
   */
  private determineImpact(text: string): 'high' | 'medium' | 'low' {
    text = text.toLowerCase();
    
    const highImpactKeywords = [
      'critical', 'crucial', 'emergency', 'urgent', 'major', 'significant', 'substantial',
      'dramatic', 'drastic', 'massive', 'enormous', 'huge', 'severe', 'extreme', 'intense',
      'crisis', 'crash', 'collapse', 'plummet', 'skyrocket', 'recession', 'depression',
      'policy', 'fed', 'federal reserve', 'central bank', 'rate decision', 'interest rate',
      'inflation', 'employment', 'gdp', 'global', 'worldwide', 'international', 'war', 'conflict'
    ];
    
    const mediumImpactKeywords = [
      'important', 'notable', 'moderate', 'considerable', 'respectable', 'decent',
      'report', 'reported', 'announces', 'announced', 'statement', 'update', 'revised',
      'data', 'figures', 'statistics', 'quarterly', 'annual', 'earnings', 'profit',
      'revenue', 'sales', 'outlook', 'forecast', 'prediction', 'estimate', 'expectation'
    ];
    
    let highCount = 0;
    let mediumCount = 0;
    
    highImpactKeywords.forEach(keyword => {
      if (text.includes(keyword)) highCount++;
    });
    
    mediumImpactKeywords.forEach(keyword => {
      if (text.includes(keyword)) mediumCount++;
    });
    
    if (highCount > 0) return 'high';
    if (mediumCount > 0) return 'medium';
    return 'low';
  }
}

export const financialNewsService = new FinancialNewsService();