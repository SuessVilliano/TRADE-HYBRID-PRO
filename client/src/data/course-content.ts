
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

          <h2>Market Hours and Sessions</h2>
          <p>Different markets operate at different times:</p>
          <ul>
            <li>Stock Market: Usually 9:30 AM - 4:00 PM local time</li>
            <li>Forex Market: 24 hours, with major sessions:
              <ul>
                <li>Asian Session: 23:00-08:00 GMT</li>
                <li>London Session: 08:00-16:00 GMT</li>
                <li>New York Session: 13:00-22:00 GMT</li>
              </ul>
            </li>
            <li>Crypto Market: 24/7 trading</li>
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
    description: 'Learn to analyze price charts and identify trading opportunities',
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
    title: 'Risk Management Essentials',
    description: 'Learn to protect your capital and manage trades effectively',
    category: 'trading',
    level: 'intermediate',
    duration: 150,
    points: 200,
    lessons: [
      {
        id: 'position-sizing',
        title: 'Position Sizing and Risk Control',
        content: `
          <h2>Position Sizing Fundamentals</h2>
          <p>Proper position sizing is crucial for long-term survival:</p>
          
          <h3>Risk Per Trade</h3>
          <ul>
            <li>1-2% risk per trade rule</li>
            <li>Fixed dollar risk vs. percentage risk</li>
            <li>Account volatility considerations</li>
          </ul>

          <h3>Position Size Calculation</h3>
          <p>Formula: Position Size = (Account * Risk%) / (Entry - Stop)</p>
          
          <h2>Risk-Reward Ratio</h2>
          <p>Understanding trade expectations:</p>
          <ul>
            <li>Minimum 1:2 risk-reward ratio</li>
            <li>Win rate considerations</li>
            <li>Expectancy calculation</li>
          </ul>

          <h2>Risk Management Tools</h2>
          <ul>
            <li>Stop-loss placement</li>
            <li>Position scaling</li>
            <li>Correlation management</li>
            <li>Portfolio heat</li>
          </ul>
        `,
        videoUrl: 'https://example.com/position-sizing',
        duration: 45
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
  }
];
