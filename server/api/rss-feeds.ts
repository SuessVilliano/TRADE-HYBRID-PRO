import { Request, Response } from 'express';
import axios from 'axios';
import Parser from 'rss-parser';

// Initialize RSS parser
const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media'],
      ['media:thumbnail', 'thumbnail'],
      ['description', 'description'],
      ['content:encoded', 'content']
    ]
  }
});

interface NewsSource {
  id: string;
  name: string;
  rssUrls: string[];
}

// Available RSS news sources
const newsSources: NewsSource[] = [
  {
    id: 'forexfactory',
    name: 'Forex Factory',
    rssUrls: ['http://www.forexfactory.com/rss.php']
  },
  {
    id: 'fxstreet',
    name: 'FXStreet',
    rssUrls: ['http://www.fxstreet.com/syndicate/rss/']
  },
  {
    id: 'dailyforex',
    name: 'DailyForex',
    rssUrls: ['https://www.dailyforex.com/forex-rss']
  },
  {
    id: 'cmegroup',
    name: 'CME Group',
    rssUrls: ['https://www.cmegroup.com/rss.html']
  },
  {
    id: 'investing',
    name: 'Investing.com Futures',
    rssUrls: ['https://www.investing.com/rss/news.rss']
  },
  {
    id: 'cointelegraph',
    name: 'CoinTelegraph',
    rssUrls: ['https://cointelegraph.com/rss']
  },
  {
    id: 'coindesk',
    name: 'CoinDesk',
    rssUrls: ['https://www.coindesk.com/arc/outboundfeeds/rss/']
  },
  {
    id: 'marketwatch',
    name: 'MarketWatch',
    rssUrls: ['https://www.marketwatch.com/rss/topstories']
  },
  {
    id: 'nasdaq',
    name: 'Nasdaq',
    rssUrls: ['https://www.nasdaq.com/feed/rssoutbound']
  },
  {
    id: 'yahoo_finance',
    name: 'Yahoo Finance',
    rssUrls: ['https://finance.yahoo.com/news/rssindex']
  },
  {
    id: 'cnbc',
    name: 'CNBC',
    rssUrls: [
      'https://www.cnbc.com/id/10000664/device/rss/rss.html', // Top News
      'https://www.cnbc.com/id/15837362/device/rss/rss.html'  // Economy
    ]
  }
];

// Function to fetch and parse RSS feed with timeout
async function fetchRssFeed(url: string, limit: number = 10) {
  try {
    // Create a promise that times out after 3 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout fetching RSS feed from ${url}`)), 3000);
    });
    
    // Create the feed parsing promise
    const feedPromise = parser.parseURL(url);
    
    // Race between timeout and feed parsing
    const feed = await Promise.race([feedPromise, timeoutPromise]) as any;
    
    console.log(`Successfully fetched ${feed.items?.length || 0} items from ${url}`);
    return feed.items?.slice(0, limit) || [];
  } catch (error) {
    console.error(`Error fetching RSS feed from ${url}:`, error);
    return [];
  }
}

// Get RSS feed for a specific source
export const getRssFeed = async (req: Request, res: Response) => {
  try {
    const sourceId = req.params.sourceId;
    const limit = parseInt(req.query.limit as string) || 20;

    // Find the requested source
    const source = newsSources.find(s => s.id === sourceId);
    if (!source) {
      return res.status(404).json({ error: `RSS source with ID '${sourceId}' not found` });
    }

    let allItems: any[] = [];

    // Fetch from all URLs for this source
    for (const url of source.rssUrls) {
      try {
        const items = await fetchRssFeed(url, limit);
        allItems = [...allItems, ...items];
      } catch (error) {
        console.error(`Error fetching from ${url}:`, error);
      }
    }

    // Sort by date (most recent first) and limit
    allItems.sort((a, b) => {
      const dateA = a.isoDate ? new Date(a.isoDate) : new Date(a.pubDate || 0);
      const dateB = b.isoDate ? new Date(b.isoDate) : new Date(b.pubDate || 0);
      return dateB.getTime() - dateA.getTime();
    });

    // Format the response
    const formattedItems = allItems.slice(0, limit).map((item, index) => {
      // Extract image URL from media content if available
      let imageUrl = '';
      if (item.media && item.media.$ && item.media.$.url) {
        imageUrl = item.media.$.url;
      } else if (item.thumbnail && item.thumbnail.$ && item.thumbnail.$.url) {
        imageUrl = item.thumbnail.$.url;
      } else if (item.enclosure && item.enclosure.url) {
        imageUrl = item.enclosure.url;
      }

      // Extract tags/categories
      let categories: string[] = [];
      if (item.categories && Array.isArray(item.categories)) {
        categories = item.categories;
      }

      // Simple sentiment analysis
      const sentiment = determineSentiment(item.title + ' ' + (item.contentSnippet || ''));
      const impact = determineImpact(item.title + ' ' + (item.contentSnippet || ''));

      return {
        id: `${sourceId}-${index}`,
        title: item.title,
        description: item.contentSnippet || item.description || '',
        link: item.link,
        pubDate: item.isoDate || item.pubDate,
        source: source.name,
        sourceId: sourceId,
        image: imageUrl,
        categories,
        sentiment,
        impact
      };
    });

    res.json({ items: formattedItems });
  } catch (error) {
    console.error('Error in getRssFeed:', error);
    res.status(500).json({ error: 'Failed to fetch RSS feed' });
  }
};

// Get available news sources
export const getAvailableSources = (_req: Request, res: Response) => {
  const sources = newsSources.map(source => ({
    id: source.id,
    name: source.name
  }));

  res.json({ sources });
};

// Economic calendar event interface
interface ForexFactoryEvent {
  title: string;
  country: string;
  date: string;
  time: string;
  impact: string;
  forecast: string;
  previous: string;
  actual?: string;
}

// Get economic calendar events
export const getEconomicCalendar = async (req: Request, res: Response) => {
  try {
    const fromDate = req.query.fromDate as string || new Date().toISOString().split('T')[0];
    const toDate = req.query.toDate as string;
    const countries = (req.query.countries as string || '').split(',').filter(Boolean);

    // In a real implementation, you would fetch from a proper API
    // For now, we'll generate some mock data based on parameters
    const events: any[] = [];
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
    const filteredCountries = countries.length > 0 ? countries : countryCodes;
    const impacts = ['high', 'medium', 'low'];
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
          const randomCountry = filteredCountries[Math.floor(Math.random() * filteredCountries.length)];
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

    // For next steps: In production, you should replace this with a real implementation
    // that fetches from an economic calendar API or scrapes data from financial sites

    res.json({ events });
  } catch (error) {
    console.error('Error in getEconomicCalendar:', error);
    res.status(500).json({ error: 'Failed to fetch economic calendar data' });
  }
};

// Simple sentiment analysis
function determineSentiment(text: string): 'bullish' | 'bearish' | 'neutral' {
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

// Determine impact based on keywords
function determineImpact(text: string): 'high' | 'medium' | 'low' {
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

// Map impact level from ForexFactory format to our format
function mapImpact(impact: string): 'high' | 'medium' | 'low' {
  impact = impact.toLowerCase();
  if (impact.includes('high') || impact.includes('3')) {
    return 'high';
  } else if (impact.includes('medium') || impact.includes('2')) {
    return 'medium';
  }
  return 'low';
}