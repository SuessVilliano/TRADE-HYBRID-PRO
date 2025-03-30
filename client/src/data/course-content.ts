import { Course, Lesson, Quiz } from '../types/learning';

export const courseContent: Course[] = [
  {
    id: 'fundamentals-101',
    title: 'Trading Fundamentals',
    description: 'Master the essential concepts of trading and market analysis',
    category: 'basics',
    level: 'beginner',
    duration: 120,
    points: 100,
    lessons: [
      {
        id: 'market-basics',
        title: 'Understanding Markets',
        content: `
          <h2>Introduction to Financial Markets</h2>
          <p>Financial markets are where traders buy and sell assets like stocks, bonds, currencies, and commodities. These markets serve several key functions:</p>
          <ul>
            <li>Price Discovery - Markets help determine the fair value of assets</li>
            <li>Liquidity - Markets allow assets to be quickly bought and sold</li>
            <li>Capital Formation - Companies can raise money through markets</li>
          </ul>

          <h2>Market Participants</h2>
          <p>Different types of traders and investors participate in markets:</p>
          <ul>
            <li>Retail Traders - Individual traders like yourself</li>
            <li>Institutional Investors - Banks, hedge funds, pension funds</li>
            <li>Market Makers - Provide liquidity and match orders</li>
            <li>Brokers - Execute trades on behalf of clients</li>
          </ul>
        `,
        videoUrl: 'https://example.com/market-basics',
        duration: 30
      },
      {
        id: 'order-types',
        title: 'Order Types and Execution',
        content: `
          <h2>Basic Order Types</h2>
          <p>Understanding different order types is crucial for effective trading:</p>
          
          <h3>Market Orders</h3>
          <p>A market order is executed immediately at the best available price. Key points:</p>
          <ul>
            <li>Guaranteed execution</li>
            <li>No price guarantee</li>
            <li>Best for highly liquid markets</li>
          </ul>
          <h3>Limit Orders</h3>
          <p>A limit order is executed only at your specified price or better:</p>
          <ul>
            <li>Price guarantee</li>
            <li>No execution guarantee</li>
            <li>Good for getting specific entry points</li>
          </ul>
          <h3>Stop Orders</h3>
          <p>Stop orders become market orders when a trigger price is reached:</p>
          <ul>
            <li>Used for limiting losses (stop-loss)</li>
            <li>Can be used for breakout trades</li>
            <li>No price guarantee after triggering</li>
          </ul>
          <h2>Advanced Order Types</h2>
          <ul>
            <li>Stop-Limit Orders</li>
            <li>Trailing Stops</li>
            <li>OCO (One-Cancels-Other)</li>
            <li>Bracket Orders</li>
          </ul>
        `,
        videoUrl: 'https://example.com/order-types',
        duration: 45
      }
    ],
    quizzes: [
      {
        id: 'fundamentals-quiz-1',
        title: 'Market Basics Quiz',
        questions: [
          {
            id: 'q1',
            question: 'What is the main function of financial markets?',
            options: [
              'Price discovery and liquidity',
              'Entertainment',
              'Social networking',
              'Data storage'
            ],
            correctAnswer: 0
          },
          {
            id: 'q2',
            question: 'Which market is open 24/7?',
            options: [
              'Stock market',
              'Bond market',
              'Cryptocurrency market',
              'Commodity market'
            ],
            correctAnswer: 2
          }
        ],
        passingScore: 70
      }
    ]
  },
  {
    id: 'technical-analysis',
    title: 'Technical Analysis Mastery',
    description: 'Learn to analyze price action and chart patterns',
    category: 'analysis',
    level: 'intermediate',
    duration: 180,
    points: 150,
    lessons: [
      {
        id: 'chart-patterns',
        title: 'Chart Patterns and Price Action',
        content: `
          <h2>Common Chart Patterns</h2>
          <p>Chart patterns are visual representations of market psychology:</p>
          
          <h3>Reversal Patterns</h3>
          <ul>
            <li>Head and Shoulders</li>
            <li>Double Top/Bottom</li>
            <li>Triple Top/Bottom</li>
          </ul>
          <h3>Continuation Patterns</h3>
          <ul>
            <li>Flags and Pennants</li>
            <li>Triangles (Ascending, Descending, Symmetric)</li>
            <li>Rectangle Patterns</li>
          </ul>
          <h2>Candlestick Patterns</h2>
          <p>Key candlestick formations and their meanings:</p>
          <ul>
            <li>Doji - Market indecision</li>
            <li>Hammer - Potential reversal</li>
            <li>Engulfing Patterns - Strong reversal signal</li>
            <li>Morning/Evening Star - Complex reversal pattern</li>
          </ul>
          <h2>Support and Resistance</h2>
          <p>Key concepts in price levels:</p>
          <ul>
            <li>Horizontal Support/Resistance</li>
            <li>Trendlines</li>
            <li>Dynamic Support/Resistance</li>
            <li>Psychological Levels</li>
          </ul>
        `,
        videoUrl: 'https://example.com/chart-patterns',
        duration: 60
      },
      {
        id: 'candlestick-patterns',
        title: 'Advanced Candlestick Patterns',
        content: `
          <h2>Japanese Candlestick Patterns</h2>
          <p>Master the art of reading candlestick patterns for market psychology insights:</p>
          <ul>
            <li>Doji Formations and Their Meanings</li>
            <li>Hammer and Shooting Star Patterns</li>
            <li>Engulfing Patterns - Bullish and Bearish</li>
            <li>Multiple Candlestick Patterns</li>
          </ul>
        `,
        videoUrl: 'https://example.com/advanced-candlestick-patterns',
        duration: 75
      }
    ],
    quizzes: [
      {
        id: 'ta-quiz-1',
        title: 'Technical Analysis Quiz',
        questions: [
          {
            id: 'q1',
            question: 'What does a Doji candlestick indicate?',
            options: [
              'Strong uptrend',
              'Market indecision',
              'Guaranteed reversal',
              'Market crash'
            ],
            correctAnswer: 1
          }
        ],
        passingScore: 80
      }
    ]
  },
  {
    id: 'risk-management',
    title: 'Professional Risk Management',
    description: 'Learn institutional-grade risk management techniques',
    category: 'essential',
    level: 'all',
    duration: 150,
    points: 175,
    lessons: [
      {
        id: 'position-sizing',
        title: 'Advanced Position Sizing',
        content: `
          <h2>Position Sizing Strategies</h2>
          <p>Master position sizing for consistent returns:</p>
          <ul>
            <li>Fixed Risk Position Sizing</li>
            <li>Volatility-Based Position Sizing</li>
            <li>Portfolio Heat Management</li>
            <li>Risk:Reward Optimization</li>
          </ul>
        `,
        videoUrl: 'https://example.com/advanced-position-sizing',
        duration: 60
      }
    ],
    quizzes: [
      {
        id: 'risk-quiz-1',
        title: 'Risk Management Quiz',
        questions: [
          {
            id: 'q1',
            question: 'What is the recommended maximum risk per trade?',
            options: [
              '10% of account',
              '5% of account',
              '2% of account',
              '25% of account'
            ],
            correctAnswer: 2
          }
        ],
        passingScore: 85
      }
    ]
  },
  {
    id: 'prop-firm-trading',
    title: 'Prop Firm Success Path',
    description: 'Complete guide to passing prop firm challenges and trading funded accounts',
    category: 'advanced',
    level: 'advanced',
    duration: 240,
    points: 200,
    lessons: [
      {
        id: 'challenge-prep',
        title: 'Prop Firm Challenge Preparation',
        content: `
          <h2>Mastering Prop Firm Challenges</h2>
          <p>Learn proven strategies for passing prop firm evaluations:</p>
          <ul>
            <li>Risk Management Rules for Challenges</li>
            <li>Daily/Overall Drawdown Management</li>
            <li>Profit Target Strategies</li>
            <li>Trading Psychology During Evaluation</li>
          </ul>
        `,
        videoUrl: 'https://example.com/prop-firm-prep',
        duration: 90
      }
    ]
  },
  {
    id: 'algorithmic-trading',
    title: 'Algorithmic Trading Foundation',
    description: 'Introduction to automated trading strategies',
    category: 'technology',
    level: 'advanced',
    duration: 300,
    points: 250,
    lessons: [
      {
        id: 'algo-basics',
        title: 'Algorithmic Trading Fundamentals',
        content: `
          <h2>Introduction to Algo Trading</h2>
          <p>Learn the basics of algorithmic trading:</p>
          <ul>
            <li>Strategy Automation Principles</li>
            <li>Backtesting Fundamentals</li>
            <li>Risk Management in Algo Trading</li>
            <li>API Integration Basics</li>
          </ul>
        `,
        videoUrl: 'https://example.com/algo-basics',
        duration: 120
      }
    ]
  },
  {
    id: 'options-trading',
    title: 'Options Trading Mastery',
    description: 'Comprehensive guide to options trading strategies',
    category: 'derivatives',
    level: 'advanced',
    duration: 270,
    points: 225,
    lessons: [
      {
        id: 'options-strategies',
        title: 'Advanced Options Strategies',
        content: `
          <h2>Complex Options Strategies</h2>
          <p>Master advanced options trading techniques:</p>
          <ul>
            <li>Vertical Spreads</li>
            <li>Iron Condors and Butterflies</li>
            <li>Calendar Spreads</li>
            <li>Volatility Trading Strategies</li>
          </ul>
        `,
        videoUrl: 'https://example.com/options-strategies',
        duration: 100
      }
    ]
  },
  {
    id: 'trading-psychology',
    title: 'Master Trading Psychology',
    description: 'Develop the mindset of successful traders',
    category: 'psychology',
    level: 'all',
    duration: 160,
    points: 150,
    lessons: [
      {
        id: 'psychology-basics',
        title: 'Trading Psychology Fundamentals',
        content: `
          <h2>Trading Psychology Principles</h2>
          <p>Build a resilient trading mindset:</p>
          <ul>
            <li>Emotional Control in Trading</li>
            <li>Handling Losses and Drawdowns</li>
            <li>Building Trading Confidence</li>
            <li>Maintaining Trading Discipline</li>
          </ul>
        `,
        videoUrl: 'https://example.com/trading-psychology',
        duration: 80
      }
    ]
  }
];