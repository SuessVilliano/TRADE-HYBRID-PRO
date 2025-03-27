import React, { useState, useRef } from 'react';
import { X, ArrowRight, GraduationCap, Award, CheckCircle2, Book, BarChart, Globe, Bitcoin, Lightbulb, Clock, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Separator } from './separator';
import { Progress } from './progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Badge } from './badge';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion';
import { ScrollArea } from './scroll-area';

// Course section types
type CourseSection = {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  completed: boolean;
  progress: number; // 0-100
};

// Course module types
type CourseModule = {
  id: string;
  title: string;
  description: string;
  sections: CourseSection[];
  badge?: {
    name: string;
    icon: React.ReactNode;
    description: string;
  };
  completed: boolean;
  progress: number; // 0-100
};

// Create the course content
const tradeHybridCourse: CourseModule[] = [
  {
    id: 'introduction',
    title: 'Introduction to Forex Trading',
    description: 'Learn the basics of forex trading and the benefits of hybrid trading strategies.',
    sections: [
      {
        id: 'intro-forex',
        title: 'Definition of Forex Trading',
        description: 'Understanding the global foreign exchange market.',
        content: (
          <div className="space-y-4">
            <p>
              Forex trading, also known as foreign exchange trading, is the buying and selling of currencies in the global market. 
              The Forex market is the largest financial market in the world, with a daily trading volume of over $5 trillion, 
              making it an attractive option for traders looking to make a profit.
            </p>
            <p>
              In this highly liquid market, traders can buy and sell currency pairs 24 hours a day, 5 days a week. The main 
              goal is to profit from changes in the value of one currency against another.
            </p>
            <h3 className="text-lg font-medium mt-4">Key Benefits of Forex Trading:</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>24-hour market - trade anytime during the week</li>
              <li>High liquidity - easy to enter and exit positions</li>
              <li>Low transaction costs compared to other markets</li>
              <li>Ability to profit in both rising and falling markets</li>
              <li>Leverage options to maximize potential profits</li>
            </ul>
          </div>
        ),
        completed: false,
        progress: 0
      },
      {
        id: 'hybrid-benefits',
        title: 'Benefits of Hybrid Trading',
        description: 'Explore the advantages of combining different trading methods.',
        content: (
          <div className="space-y-4">
            <p>
              Hybrid trading combines different trading methods, such as technical analysis, fundamental analysis, and automated trading, 
              to create a more efficient and effective trading system.
            </p>
            <h3 className="text-lg font-medium mt-4">Why Hybrid Trading Works:</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Diversification of Approach:</strong> By combining multiple strategies, you're not reliant on just one method, 
                reducing risk and increasing opportunities.
              </li>
              <li>
                <strong>Balancing Strengths and Weaknesses:</strong> Each trading method has pros and cons. Technical analysis may 
                miss macro trends, while fundamental analysis might be too slow. A hybrid approach compensates for these weaknesses.
              </li>
              <li>
                <strong>Adaptability to Market Conditions:</strong> Different strategies perform better in different market conditions. 
                A hybrid approach allows you to adapt to changing markets.
              </li>
              <li>
                <strong>Automation + Human Judgment:</strong> Combining algorithmic precision with human intuition and adaptability 
                creates a powerful trading system.
              </li>
            </ul>
            <p className="mt-4">
              The Trade Hybrid method is about getting the best of all worlds - the precision of automation, the depth of fundamental 
              analysis, and the pattern recognition of technical analysis - all working together to maximize your trading success.
            </p>
          </div>
        ),
        completed: false,
        progress: 0
      },
      {
        id: 'hybrid-strategies',
        title: 'Hybrid Trading Strategies',
        description: 'Different approaches to hybrid trading in the forex market.',
        content: (
          <div className="space-y-4">
            <p>
              There are several ways to implement a hybrid trading approach in the forex market. 
              Here are some of the most effective strategies:
            </p>
            <h3 className="text-lg font-medium mt-4">Popular Hybrid Trading Strategies:</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">1. Technical + Fundamental Hybrid</h4>
                <p>
                  Use fundamental analysis to determine the overall market direction and technical analysis 
                  for precise entry and exit points. For example, if economic data suggests the EUR will strengthen 
                  against the USD, use technical indicators to find optimal entry points for a EUR/USD long position.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium">2. Manual + Automated Hybrid</h4>
                <p>
                  Let algorithms handle routine aspects of trading (scanning for setups, position sizing, etc.) while 
                  maintaining human oversight for final decisions and adaptations to unusual market conditions.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium">3. Multi-Timeframe Hybrid</h4>
                <p>
                  Analyze higher timeframes for the overall trend direction, then use lower timeframes for precise 
                  entry and exit execution, combining the reliability of long-term trends with the precision of 
                  short-term opportunities.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium">4. Correlation-Based Hybrid</h4>
                <p>
                  Trade related currency pairs or markets with awareness of their correlations. For example, understanding how 
                  commodity currencies (AUD, CAD) relate to their underlying commodities can provide additional confirmation signals.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium">5. Sentiment + Technical Hybrid</h4>
                <p>
                  Combine market sentiment data (COT reports, positioning data) with technical analysis to identify potential 
                  market reversals when sentiment reaches extremes and technical patterns confirm.
                </p>
              </div>
            </div>
          </div>
        ),
        completed: false,
        progress: 0
      }
    ],
    completed: false,
    progress: 0
  },
  {
    id: 'technical-analysis',
    title: 'Technical Analysis',
    description: 'Learn how to analyze charts and use technical indicators for your trading.',
    sections: [
      {
        id: 'intro-charting',
        title: 'Introduction to Charting',
        description: 'Understanding different chart types and their applications.',
        content: (
          <div className="space-y-4">
            <p>
              Technical analysis begins with understanding how to read and interpret price charts. Charts provide a visual 
              representation of price movements over time, helping traders identify patterns and potential trading opportunities.
            </p>
            <h3 className="text-lg font-medium mt-4">Common Chart Types:</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">1. Line Charts</h4>
                <p>
                  The simplest chart type showing only closing prices connected by lines. Useful for viewing the overall 
                  trend without the noise of intraday price movements.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium">2. Bar Charts</h4>
                <p>
                  Each bar represents a time period (minute, hour, day) and shows the open, high, low, and close prices. 
                  Provides more information than line charts while remaining relatively clean.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium">3. Candlestick Charts</h4>
                <p>
                  Similar to bar charts but with a "body" between open and close prices. The body is filled or colored 
                  differently depending on whether the close was higher (bullish) or lower (bearish) than the open. 
                  Offers the most visual information about price action and sentiment.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium">4. Heiken Ashi Charts</h4>
                <p>
                  A modified candlestick chart that uses average price data to filter out market noise and better 
                  identify trends. Particularly useful in the hybrid trading approach for confirming trend direction.
                </p>
              </div>
            </div>
            
            <h3 className="text-lg font-medium mt-4">Timeframes in Charting:</h3>
            <p>
              Charts can display different timeframes, from 1-minute to monthly charts. The hybrid approach often 
              involves analyzing multiple timeframes:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Higher timeframes (daily, weekly) for overall trend direction</li>
              <li>Medium timeframes (4H, 1H) for trade setups</li>
              <li>Lower timeframes (15M, 5M) for precise entries and exits</li>
            </ul>
          </div>
        ),
        completed: false,
        progress: 0
      },
      {
        id: 'technical-indicators',
        title: 'Technical Indicators',
        description: 'Using mathematical calculations to identify trading opportunities.',
        content: (
          <div className="space-y-4">
            <p>
              Technical indicators are mathematical calculations based on price, volume, or open interest of a security. 
              They help traders identify trends, momentum, volatility, and potential reversal points.
            </p>
            
            <h3 className="text-lg font-medium mt-4">Essential Technical Indicators:</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">1. Trend Indicators</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <strong>Moving Averages:</strong> Show the average price over a specified period, smoothing out price action 
                    to identify the direction of the trend.
                  </li>
                  <li>
                    <strong>MACD (Moving Average Convergence Divergence):</strong> Shows the relationship between two moving 
                    averages, helping identify momentum and potential trend changes.
                  </li>
                  <li>
                    <strong>ADX (Average Directional Index):</strong> Measures the strength of a trend, regardless of its direction.
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium">2. Momentum Indicators</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <strong>RSI (Relative Strength Index):</strong> Measures the speed and change of price movements, 
                    identifying overbought or oversold conditions.
                  </li>
                  <li>
                    <strong>Stochastic Oscillator:</strong> Compares a closing price to its price range over a given time period, 
                    generating overbought/oversold signals.
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium">3. Volatility Indicators</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <strong>Bollinger Bands:</strong> Consist of a middle band (SMA) with upper and lower bands that expand and 
                    contract based on volatility, helping identify potential breakouts.
                  </li>
                  <li>
                    <strong>ATR (Average True Range):</strong> Measures market volatility by decomposing the entire range of a 
                    price bar, useful for setting stop-loss levels.
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium">4. Volume Indicators</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <strong>OBV (On-Balance Volume):</strong> Relates volume to price change, confirming price movements 
                    or warning of potential reversals.
                  </li>
                  <li>
                    <strong>Volume Profile:</strong> Shows the amount of volume traded at specific price levels, identifying 
                    areas of support and resistance.
                  </li>
                </ul>
              </div>
            </div>
            
            <h3 className="text-lg font-medium mt-4">Hybrid Indicator Approach:</h3>
            <p>
              In hybrid trading, we combine different types of indicators rather than relying on multiple indicators of the same type:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Use trend indicators to confirm the overall direction</li>
              <li>Use momentum indicators to time entries and exits</li>
              <li>Use volatility indicators to adjust position sizing and set stops</li>
              <li>Use volume indicators to confirm the strength of price movements</li>
            </ul>
          </div>
        ),
        completed: false,
        progress: 0
      },
      {
        id: 'support-resistance',
        title: 'Support and Resistance',
        description: 'Identifying key price levels for trading decisions.',
        content: (
          <div className="space-y-4">
            <p>
              Support and resistance are foundational concepts in technical analysis that help traders identify price 
              levels where a currency pair is likely to reverse or pause its movement. These levels are critical for 
              determining entry points, exit targets, and stop-loss placement.
            </p>
            
            <h3 className="text-lg font-medium mt-4">Understanding Support and Resistance:</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Support Levels</h4>
                <p>
                  Price levels where a currency pair tends to stop falling and bounce upward. These represent areas where buying 
                  interest is strong enough to overcome selling pressure. Think of support as a "floor" under the price.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium">Resistance Levels</h4>
                <p>
                  Price levels where a currency pair tends to stop rising and reverse downward. These represent areas where selling 
                  interest overcomes buying pressure. Think of resistance as a "ceiling" above the price.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium">Role Reversal</h4>
                <p>
                  Once a support level is broken, it often becomes a resistance level. Similarly, when a resistance level is broken, 
                  it often becomes a support level. This concept is known as "role reversal" and is crucial for identifying potential 
                  trading opportunities.
                </p>
              </div>
            </div>
            
            <h3 className="text-lg font-medium mt-4">Types of Support and Resistance:</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">1. Horizontal Support and Resistance</h4>
                <p>
                  Straight horizontal lines drawn at price levels where the market has previously reversed multiple times. 
                  These are the most basic and often most reliable levels.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium">2. Diagonal Support and Resistance (Trend Lines)</h4>
                <p>
                  Diagonal lines that connect a series of higher lows (in an uptrend) or lower highs (in a downtrend). 
                  These dynamic levels move with the trend and help identify the trend's strength.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium">3. Psychological Levels</h4>
                <p>
                  Round numbers (like 1.2000 in EUR/USD) that often act as support or resistance due to the tendency 
                  of traders to place orders at these levels.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium">4. Dynamic Support and Resistance</h4>
                <p>
                  Moving averages and other technical indicators that can act as support or resistance levels that change over time.
                </p>
              </div>
            </div>
            
            <h3 className="text-lg font-medium mt-4">Hybrid Approach to Support and Resistance:</h3>
            <p>
              In the Trade Hybrid methodology, we combine multiple forms of support and resistance:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Use higher timeframe levels to identify major support and resistance zones
              </li>
              <li>
                Look for confluence where multiple types of support/resistance align (horizontal, diagonal, dynamic)
              </li>
              <li>
                Integrate volume profile to confirm the significance of price levels
              </li>
              <li>
                Combine with fundamental analysis to identify levels of special importance (central bank intervention levels, etc.)
              </li>
            </ul>
          </div>
        ),
        completed: false,
        progress: 0
      },
      {
        id: 'moving-averages',
        title: 'Moving Averages',
        description: 'Using moving averages to identify trends and potential trade signals.',
        content: (
          <div className="space-y-4">
            <p>
              Moving averages are among the most versatile and widely used technical indicators. They smooth out price data to create 
              a single flowing line, making it easier to identify the direction of the trend.
            </p>
            
            <h3 className="text-lg font-medium mt-4">Types of Moving Averages:</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">1. Simple Moving Average (SMA)</h4>
                <p>
                  Calculates the average price over a specific number of periods. Each price in the calculation is equally weighted.
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <em>Example: A 10-period SMA adds the closing prices of the last 10 periods and divides by 10.</em>
                </p>
              </div>
              
              <div>
                <h4 className="font-medium">2. Exponential Moving Average (EMA)</h4>
                <p>
                  Similar to the SMA but gives more weight to recent prices, making it more responsive to new information.
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <em>EMAs react faster to price changes and are often preferred in the hybrid trading approach for their responsiveness.</em>
                </p>
              </div>
              
              <div>
                <h4 className="font-medium">3. Weighted Moving Average (WMA)</h4>
                <p>
                  Assigns a weight to each price, with the most recent prices getting more weight in a linear fashion.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium">4. Hull Moving Average (HMA)</h4>
                <p>
                  Reduces lag significantly while maintaining smoothness, making it valuable for identifying trend changes more quickly.
                </p>
              </div>
            </div>
            
            <h3 className="text-lg font-medium mt-4">Using Moving Averages in Trading:</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">1. Trend Identification</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Price above MA = Uptrend</li>
                  <li>Price below MA = Downtrend</li>
                  <li>Steeper MA slope = Stronger trend</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium">2. Support and Resistance</h4>
                <p>
                  Moving averages often act as dynamic support (in uptrends) or resistance (in downtrends). The 200-day MA is 
                  particularly significant as a long-term support/resistance level.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium">3. Moving Average Crossovers</h4>
                <p>
                  When a shorter-term MA crosses above a longer-term MA, it generates a bullish signal. When it crosses below, 
                  it generates a bearish signal. Common combinations include:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Fast crossover: 5 EMA and 10 EMA</li>
                  <li>Medium crossover: 20 EMA and 50 EMA</li>
                  <li>Slow crossover: 50 SMA and 200 SMA (the "Golden Cross" and "Death Cross")</li>
                </ul>
              </div>
            </div>
            
            <h3 className="text-lg font-medium mt-4">Hybrid Moving Average Strategy:</h3>
            <p>
              In the Trade Hybrid methodology, we combine multiple moving averages across different timeframes:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Multi-MA Approach:</strong> Use different types of MAs for different purposes (EMAs for entries, SMAs for trend)
              </li>
              <li>
                <strong>Multiple Timeframe Analysis:</strong> Confirm trends across different timeframes for more reliable signals
              </li>
              <li>
                <strong>Confluence Trading:</strong> Look for trades where price interacts with multiple MAs simultaneously
              </li>
              <li>
                <strong>MA with Volume:</strong> Confirm MA crossovers with volume analysis for better reliability
              </li>
            </ul>
            <p className="mt-4">
              When properly incorporated into a hybrid system, moving averages provide a solid foundation for trend identification 
              while other components of your system can help with precise entries and exits.
            </p>
          </div>
        ),
        completed: false,
        progress: 0
      }
    ],
    completed: false,
    progress: 0
  },
  {
    id: 'trade-hybrid-method',
    title: 'Trade Hybrid Method',
    description: 'Learn the exclusive Trade Hybrid methodology for consistent trading results.',
    badge: {
      name: 'Trade Hybrid Master',
      icon: <Award className="h-4 w-4" />,
      description: 'Mastered the exclusive Trade Hybrid methodology'
    },
    sections: [
      {
        id: 'hybrid-overview',
        title: 'Overview of Trade Hybrid',
        description: 'Understanding the core principles of the Trade Hybrid approach.',
        content: (
          <div className="space-y-4">
            <p>
              The Trade Hybrid method is a unique approach that combines automation and human confirmation. Unlike 
              traditional trading methods that rely solely on either technical indicators, fundamental analysis, or algorithmic trading, 
              Trade Hybrid integrates multiple approaches into a cohesive, powerful system.
            </p>
            
            <h3 className="text-lg font-medium mt-4">Core Principles of Trade Hybrid:</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">1. Multi-Dimensional Analysis</h4>
                <p>
                  Trade Hybrid doesn't rely on a single perspective. It combines technical analysis, fundamental analysis, algorithmic signals, 
                  and sentiment indicators to create a comprehensive view of the market. This multi-dimensional approach reduces blind spots 
                  and provides more reliable trading signals.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium">2. Human + Machine Collaboration</h4>
                <p>
                  Rather than choosing between human judgment or algorithmic precision, Trade Hybrid leverages both. Algorithms handle 
                  data processing, pattern recognition, and signal generation, while human traders provide contextual understanding, 
                  adaptability, and final decision-making. This collaboration leads to more intelligent, adaptable trading.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium">3. Adaptive Trading Framework</h4>
                <p>
                  Markets change, and so should your approach. The Trade Hybrid method includes built-in mechanisms to adapt to different 
                  market conditions. Whether in trending, ranging, or volatile markets, the Trade Hybrid approach adjusts its parameters 
                  and signals accordingly.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium">4. Risk-First Methodology</h4>
                <p>
                  Trade Hybrid places risk management at the core of its approach. Every trading decision is evaluated first from a risk 
                  perspective, ensuring that capital preservation remains the primary focus, with profit generation as a consequence of 
                  disciplined, risk-controlled trading.
                </p>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-md border border-blue-200 dark:border-blue-800 mt-6">
              <h3 className="text-blue-800 dark:text-blue-300 font-medium">Why Trade Hybrid Works When Other Methods Fail</h3>
              <p className="mt-2 text-blue-700 dark:text-blue-400">
                Most trading methods fail because they take a one-dimensional approach to a multi-dimensional market. Technical 
                analysts miss fundamental shifts, fundamental traders miss short-term opportunities, and algorithmic traders get 
                caught in changing market conditions. Trade Hybrid eliminates these weaknesses by integrating all approaches while 
                emphasizing human oversight for adaptability.
              </p>
            </div>
          </div>
        ),
        completed: false,
        progress: 0
      },
      {
        id: 'hybrid-strategies',
        title: 'Trade Hybrid Strategies',
        description: 'Practical strategies used in the Trade Hybrid method.',
        content: (
          <div className="space-y-4">
            <p>
              The Trade Hybrid method encompasses several specific strategies that can be applied to different market conditions. 
              Here, we'll explore the core strategies that form the foundation of the Trade Hybrid approach.
            </p>
            
            <h3 className="text-lg font-medium mt-4">Core Trade Hybrid Strategies:</h3>
            <div className="space-y-6">
              <div className="border rounded-md p-4 bg-gray-50 dark:bg-gray-900/50">
                <h4 className="font-medium text-primary">1. Trend Confirmation Hybrid Strategy</h4>
                <div className="space-y-2 mt-2">
                  <p><strong>Components:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Multiple timeframe trend analysis using EMAs and price action</li>
                    <li>Volume confirmation through OBV and volume profile</li>
                    <li>Momentum verification using RSI and MACD</li>
                    <li>Fundamental confirmation from economic indicators and news</li>
                  </ul>
                  
                  <p className="mt-3"><strong>Application:</strong></p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Identify overall trend direction on higher timeframes (daily/4H)</li>
                    <li>Confirm trend strength with volume indicators</li>
                    <li>Look for pullbacks or consolidations on lower timeframes (1H/15M)</li>
                    <li>Enter when price resumes the main trend direction with momentum confirmation</li>
                    <li>Place stops beyond recent swing points with trailing stops as profit develops</li>
                  </ol>
                  
                  <p className="mt-3 text-sm text-muted-foreground">
                    <em>Best for: Trending markets across all currency pairs, particularly effective during sessions with clear directional bias.</em>
                  </p>
                </div>
              </div>
              
              <div className="border rounded-md p-4 bg-gray-50 dark:bg-gray-900/50">
                <h4 className="font-medium text-green-600 dark:text-green-500">2. Reversal Detection Hybrid Strategy</h4>
                <div className="space-y-2 mt-2">
                  <p><strong>Components:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Price action reversal patterns (engulfing, pinbars, etc.)</li>
                    <li>Divergence signals from oscillators (RSI, MACD, Stochastic)</li>
                    <li>Support/resistance zone identification with volume analysis</li>
                    <li>Sentiment extremes from positioning data and COT reports</li>
                    <li>Volatility expansion indicators (ATR, Bollinger Bands)</li>
                  </ul>
                  
                  <p className="mt-3"><strong>Application:</strong></p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Identify overextended markets using oscillators and sentiment data</li>
                    <li>Locate key support/resistance zones with multiple confirmations</li>
                    <li>Wait for reversal price action patterns at these zones</li>
                    <li>Confirm with divergence between price and momentum indicators</li>
                    <li>Enter with tight stops beyond the reversal pattern</li>
                    <li>Take profit at next significant support/resistance level</li>
                  </ol>
                  
                  <p className="mt-3 text-sm text-muted-foreground">
                    <em>Best for: Market turning points, overbought/oversold conditions, and counter-trend opportunities when risk/reward is favorable.</em>
                  </p>
                </div>
              </div>
              
              <div className="border rounded-md p-4 bg-gray-50 dark:bg-gray-900/50">
                <h4 className="font-medium text-blue-600 dark:text-blue-500">3. Breakout Hybrid Strategy</h4>
                <div className="space-y-2 mt-2">
                  <p><strong>Components:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Chart pattern identification (triangles, flags, rectangles)</li>
                    <li>Key level breakouts with volume confirmation</li>
                    <li>Volatility contraction followed by expansion</li>
                    <li>Momentum acceleration indicators</li>
                    <li>Fundamental catalysts (economic releases, central bank decisions)</li>
                  </ul>
                  
                  <p className="mt-3"><strong>Application:</strong></p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Identify periods of consolidation and contracting volatility</li>
                    <li>Map key levels that contain the price action</li>
                    <li>Wait for increased volume and momentum as price approaches boundaries</li>
                    <li>Enter on confirmed breakouts with stop below/above the broken level</li>
                    <li>Use measured move targets based on pattern projections</li>
                    <li>Trail stops to lock in profits as the move extends</li>
                  </ol>
                  
                  <p className="mt-3 text-sm text-muted-foreground">
                    <em>Best for: Consolidation breakouts, range breakouts, and volatile market conditions following news events.</em>
                  </p>
                </div>
              </div>
            </div>
            
            <h3 className="text-lg font-medium mt-6">The Smart Panel Integration:</h3>
            <p>
              All Trade Hybrid strategies are designed to work seamlessly with the Smart Trade Panel, which provides:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Real-time signal generation based on strategy parameters</li>
              <li>Multi-broker execution for optimal pricing and minimal slippage</li>
              <li>Automated risk management with predefined risk percentages</li>
              <li>AI-assisted trade recommendations and market analysis</li>
              <li>Trade journal integration for performance tracking and improvement</li>
            </ul>
          </div>
        ),
        completed: false,
        progress: 0
      }
    ],
    completed: false,
    progress: 0
  }
];

// Course Explorer Component
export function TradingCourse() {
  const [activeModule, setActiveModule] = useState<CourseModule | null>(tradeHybridCourse[0]);
  const [activeSection, setActiveSection] = useState<CourseSection | null>(tradeHybridCourse[0].sections[0]);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleModuleSelect = (module: CourseModule) => {
    setActiveModule(module);
    setActiveSection(module.sections[0]);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  };

  const handleSectionSelect = (section: CourseSection) => {
    setActiveSection(section);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  };

  const markSectionComplete = (moduleId: string, sectionId: string) => {
    // Deep clone the course data
    const updatedCourse = JSON.parse(JSON.stringify(tradeHybridCourse));
    
    // Find and update the section
    const moduleIndex = updatedCourse.findIndex((m: CourseModule) => m.id === moduleId);
    if (moduleIndex !== -1) {
      const sectionIndex = updatedCourse[moduleIndex].sections.findIndex(
        (s: CourseSection) => s.id === sectionId
      );
      
      if (sectionIndex !== -1) {
        updatedCourse[moduleIndex].sections[sectionIndex].completed = true;
        updatedCourse[moduleIndex].sections[sectionIndex].progress = 100;
        
        // Update module progress
        const totalSections = updatedCourse[moduleIndex].sections.length;
        const completedSections = updatedCourse[moduleIndex].sections.filter(
          (s: CourseSection) => s.completed
        ).length;
        
        updatedCourse[moduleIndex].progress = Math.round((completedSections / totalSections) * 100);
        updatedCourse[moduleIndex].completed = completedSections === totalSections;
        
        // Update state with new data
        const newActiveModule = updatedCourse[moduleIndex];
        setActiveModule(newActiveModule);
        
        // Move to next section if available
        if (sectionIndex < totalSections - 1) {
          setActiveSection(newActiveModule.sections[sectionIndex + 1]);
        } else if (moduleIndex < updatedCourse.length - 1) {
          // Move to next module
          setActiveModule(updatedCourse[moduleIndex + 1]);
          setActiveSection(updatedCourse[moduleIndex + 1].sections[0]);
        }
      }
    }
  };

  // Calculate overall course progress
  const calculateOverallProgress = () => {
    const totalSections = tradeHybridCourse.reduce(
      (total, module) => total + module.sections.length, 
      0
    );
    
    const completedSections = tradeHybridCourse.reduce(
      (total, module) => total + module.sections.filter(s => s.completed).length, 
      0
    );
    
    return Math.round((completedSections / totalSections) * 100);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <h2 className="text-xl font-bold flex items-center">
          <GraduationCap className="mr-2 h-5 w-5" />
          Trade Hybrid Course
        </h2>
        <p className="text-sm text-blue-100">Master the art of hybrid trading in forex markets</p>
        <div className="mt-2">
          <div className="flex justify-between text-xs mb-1">
            <span>Progress</span>
            <span>{calculateOverallProgress()}%</span>
          </div>
          <Progress value={calculateOverallProgress()} className="h-2 bg-blue-800" />
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r bg-gray-50 dark:bg-gray-900 overflow-auto">
          <div className="p-4">
            <h3 className="font-medium mb-2">Course Modules</h3>
            <div className="space-y-2">
              {tradeHybridCourse.map((module) => (
                <button
                  key={module.id}
                  className={cn(
                    "w-full text-left p-2 rounded flex items-center text-sm",
                    activeModule?.id === module.id
                      ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                  onClick={() => handleModuleSelect(module)}
                >
                  {module.completed ? (
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                  ) : (
                    <span className="mr-2 h-4 w-4 rounded-full bg-gray-200 dark:bg-gray-700 text-xs flex items-center justify-center">
                      {module.progress}%
                    </span>
                  )}
                  <span>{module.title}</span>
                </button>
              ))}
            </div>
          </div>
          
          {activeModule && (
            <div className="px-4 pb-4">
              <h3 className="font-medium mb-2 text-sm">Module Sections</h3>
              <div className="space-y-1">
                {activeModule.sections.map((section) => (
                  <button
                    key={section.id}
                    className={cn(
                      "w-full text-left p-2 rounded flex items-center text-xs",
                      activeSection?.id === section.id
                        ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                    onClick={() => handleSectionSelect(section)}
                  >
                    {section.completed ? (
                      <CheckCircle2 className="mr-2 h-3 w-3 text-green-500 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="mr-2 h-3 w-3 flex-shrink-0" />
                    )}
                    <span className="truncate">{section.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {activeSection && (
            <>
              <div className="p-4 border-b">
                <h2 className="text-xl font-bold">{activeSection.title}</h2>
                <p className="text-sm text-muted-foreground">{activeSection.description}</p>
              </div>
              
              <ScrollArea className="flex-1" ref={contentRef}>
                <div className="p-6">
                  {activeSection.content}
                  
                  <div className="mt-8">
                    <Button
                      onClick={() => activeModule && markSectionComplete(activeModule.id, activeSection.id)}
                      disabled={activeSection.completed}
                      className="mt-4"
                    >
                      {activeSection.completed ? (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Completed
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Mark as Complete
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// This button can be used to show the Trading Course
export function ShowTradingCourseButton({ onClick }: { onClick: () => void }) {
  return (
    <Button 
      onClick={onClick}
      variant="outline"
      className="flex items-center gap-1"
      size="sm"
    >
      <Book className="h-4 w-4 text-primary" />
      <span>Trade Hybrid Course</span>
    </Button>
  );
}