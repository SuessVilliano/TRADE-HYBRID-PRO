import { db } from "../server/db";
import { courses, modules, lessons, quizzes } from "../shared/schema";

async function main() {
  console.log('Seeding learning center content...');
  
  // First, clear existing content to avoid duplicates
  try {
    console.log('Clearing existing quiz data...');
    await db.delete(quizzes);
    
    console.log('Clearing existing lesson data...');
    await db.delete(lessons);
    
    console.log('Clearing existing module data...');
    await db.delete(modules);
    
    console.log('Clearing existing course data...');
    await db.delete(courses);
    
    console.log('All learning center tables cleared.');
  } catch (error) {
    console.error('Error clearing existing data:', error);
    // Continue anyway since this might be the first run
  }
  
  // ===========================================================================
  // PRO TRADER CERTIFICATION TRACK COURSES
  // ===========================================================================

  // MODULE 1: FOUNDATIONS OF FINANCIAL MARKETS & TRADER SETUP
  console.log('Creating HCT-1 Foundation course...');
  const [foundationCourse] = await db.insert(courses).values({
    title: "Foundations of Financial Markets & Trader Setup",
    description: "Master essential market concepts, trading infrastructure, and execution mechanics to build a solid trading foundation",
    category: "foundations",
    level: "beginner",
    duration: 840, // 14 hours (2 weeks)
    points: 1000,
    imageUrl: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    featured: true,
    prerequisites: [],
    learningOutcomes: [
      "Understand different asset classes and market participants",
      "Set up professional trading infrastructure and platforms",
      "Master order types, execution mechanics, and fee structures",
      "Navigate regulatory frameworks and comply with best practices",
      "Create your first comprehensive trade plan"
    ],
    certification: true,
    certificateImageUrl: "/images/certificates/hct-1.png"
  }).returning();

  // MODULE 2: MARKET STRUCTURE & PRICE ACTION
  console.log('Creating Market Structure course...');
  const [marketStructureCourse] = await db.insert(courses).values({
    title: "Market Structure & Price Action",
    description: "Learn to analyze market structure, identify support/resistance zones, and interpret price action patterns",
    category: "technical",
    level: "beginner",
    duration: 420, // 7 hours (1 week)
    points: 1000,
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    featured: true,
    prerequisites: [foundationCourse.id],
    learningOutcomes: [
      "Identify and analyze key market structure components",
      "Locate significant support/resistance and liquidity zones",
      "Recognize break of structure and change of character signals",
      "Perform effective multi-timeframe analysis",
      "Develop a structured trade setup workflow"
    ],
    certification: true,
    certificateImageUrl: "/images/certificates/hct-1-advanced.png"
  }).returning();

  // MODULE 3: INDICATORS & TECHNICAL ANALYSIS
  console.log('Creating Indicators & Technical Analysis course...');
  const [technicalAnalysisCourse] = await db.insert(courses).values({
    title: "Indicators & Technical Analysis",
    description: "Master technical indicators, understand their applications, and learn how to combine them effectively",
    category: "technical",
    level: "intermediate",
    duration: 420, // 7 hours (1 week)
    points: 1200,
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    featured: true,
    prerequisites: [foundationCourse.id, marketStructureCourse.id],
    learningOutcomes: [
      "Apply and interpret momentum oscillators",
      "Utilize trend indicators for directional bias",
      "Incorporate volatility and volume analysis",
      "Build custom indicator combinations",
      "Introduce Pine Script for indicator customization"
    ],
    certification: true,
    certificateImageUrl: "/images/certificates/hct-2.png"
  }).returning();

  // MODULE 4: RISK MANAGEMENT & TRADER PSYCHOLOGY
  console.log('Creating Risk Management & Psychology course...');
  const [riskPsychologyCourse] = await db.insert(courses).values({
    title: "Risk Management & Trader Psychology",
    description: "Develop robust risk management practices and cultivate the psychological mindset for consistent trading",
    category: "psychology",
    level: "intermediate",
    duration: 420, // 7 hours (1 week)
    points: 1200,
    imageUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    featured: true,
    prerequisites: [foundationCourse.id],
    learningOutcomes: [
      "Implement position sizing and risk allocation techniques",
      "Develop effective drawdown control methods",
      "Identify and overcome common behavioral biases",
      "Create a personalized mental conditioning routine",
      "Build a complete risk management system"
    ],
    certification: true,
    certificateImageUrl: "/images/certificates/hct-2-advanced.png"
  }).returning();

  // MODULE 5: STRATEGY ENGINEERING & TESTING
  console.log('Creating Strategy Engineering course...');
  const [strategyEngineeringCourse] = await db.insert(courses).values({
    title: "Strategy Engineering & Testing",
    description: "Learn to design, test, and optimize systematic trading strategies for consistent performance",
    category: "strategy",
    level: "intermediate",
    duration: 420, // 7 hours (1 week)
    points: 1200,
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    featured: true,
    prerequisites: [foundationCourse.id, technicalAnalysisCourse.id],
    learningOutcomes: [
      "Design structured strategy frameworks",
      "Perform thorough backtesting and forward testing",
      "Optimize strategies without overfitting",
      "Evaluate performance metrics properly",
      "Create a comprehensive trading playbook"
    ],
    certification: true,
    certificateImageUrl: "/images/certificates/hct-2-pro.png"
  }).returning();

  // MODULE 6A: FOREX MASTERY
  console.log('Creating Forex Mastery course...');
  const [forexMasteryCourse] = await db.insert(courses).values({
    title: "Forex Mastery",
    description: "Master currency pair trading, macro fundamentals, and specialized forex strategies",
    category: "forex",
    level: "advanced",
    duration: 420, // 7 hours
    points: 1500,
    imageUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    featured: true,
    prerequisites: [foundationCourse.id, marketStructureCourse.id, technicalAnalysisCourse.id, riskPsychologyCourse.id],
    learningOutcomes: [
      "Analyze global currency markets and intermarket relationships",
      "Apply specialized forex price action methods",
      "Interpret economic data and central bank policies",
      "Execute professional forex risk management",
      "Develop swing and intraday forex strategies"
    ],
    certification: true,
    certificateImageUrl: "/images/certificates/hct-3-forex.png"
  }).returning();

  // MODULE 6B: CRYPTO PROFICIENCY
  console.log('Creating Cryptocurrency Trading course...');
  const [cryptoCourse] = await db.insert(courses).values({
    title: "Crypto Proficiency",
    description: "Master cryptocurrency trading from fundamentals to advanced on-chain analysis and DeFi strategies",
    category: "crypto",
    level: "advanced",
    duration: 420, // 7 hours
    points: 1500,
    imageUrl: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    featured: true,
    prerequisites: [foundationCourse.id, marketStructureCourse.id, technicalAnalysisCourse.id, riskPsychologyCourse.id],
    learningOutcomes: [
      "Understand blockchain technology and tokenomics",
      "Master CEX and DEX trading mechanics",
      "Perform on-chain analysis and interpret metrics",
      "Develop specialized crypto trading strategies",
      "Navigate DeFi protocols efficiently"
    ],
    certification: true,
    certificateImageUrl: "https://images.unsplash.com/photo-1569098644584-210bcd375b59?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80",
  }).returning();
  
  console.log('Creating forex trading course...');
  const [forexCourse] = await db.insert(courses).values({
    title: "Advanced Forex Trading",
    description: "Develop professional-level skills in forex market analysis and trading execution.",
    category: "forex",
    level: "advanced",
    duration: 600, // 10 hours
    points: 1500,
    imageUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    featured: true,
    prerequisites: [],
    learningOutcomes: [
      "Apply advanced technical analysis to forex pairs",
      "Execute multi-timeframe trading strategies",
      "Implement effective risk management techniques",
      "Analyze economic indicators and their impact on currencies",
      "Develop a personalized forex trading system"
    ],
    certification: true,
    certificateImageUrl: "https://images.unsplash.com/photo-1569098644584-210bcd375b59?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80",
  }).returning();
  
  console.log('Creating trading psychology course...');
  const [psychologyCourse] = await db.insert(courses).values({
    title: "Trading Psychology Mastery",
    description: "Overcome psychological barriers and develop the mindset of successful traders.",
    category: "general",
    level: "intermediate",
    duration: 300, // 5 hours
    points: 800,
    imageUrl: "https://images.unsplash.com/photo-1579227114347-15d08fc37cae?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    featured: false,
    prerequisites: [],
    learningOutcomes: [
      "Identify and manage trading emotions",
      "Develop discipline and patience",
      "Create and stick to trading plans",
      "Overcome common psychological biases",
      "Build resilience after trading losses"
    ],
    certification: true,
    certificateImageUrl: "https://images.unsplash.com/photo-1569098644584-210bcd375b59?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80",
  }).returning();
  
  // ===========================================================================
  // MODULES FOR FOUNDATION COURSE (MODULE 1)
  // ===========================================================================
  console.log('Creating modules for Foundation course...');
  const [foundationModule1] = await db.insert(modules).values({
    courseId: foundationCourse.id,
    title: "Introduction to Financial Markets",
    description: "Understand the core principles of financial markets and different asset classes",
    orderNum: 1
  }).returning();
  
  const [foundationModule2] = await db.insert(modules).values({
    courseId: foundationCourse.id,
    title: "Trading Infrastructure & Setup",
    description: "Learn to set up a professional trading environment with the right tools and platforms",
    orderNum: 2
  }).returning();
  
  const [foundationModule3] = await db.insert(modules).values({
    courseId: foundationCourse.id,
    title: "Order Types & Execution",
    description: "Master various order types and execution mechanics across different market structures",
    orderNum: 3
  }).returning();
  
  const [foundationModule4] = await db.insert(modules).values({
    courseId: foundationCourse.id,
    title: "Regulatory Frameworks & Compliance",
    description: "Navigate legal requirements and best practices for trading activities",
    orderNum: 4
  }).returning();
  
  // ===========================================================================
  // MODULES FOR MARKET STRUCTURE COURSE (MODULE 2)
  // ===========================================================================
  console.log('Creating modules for Market Structure course...');
  const [marketStructureModule1] = await db.insert(modules).values({
    courseId: marketStructureCourse.id,
    title: "Market Structure Concepts",
    description: "Understand the foundational concepts of market structure analysis",
    orderNum: 1
  }).returning();
  
  const [marketStructureModule2] = await db.insert(modules).values({
    courseId: marketStructureCourse.id,
    title: "Support & Resistance Zones",
    description: "Identify and utilize key price levels for trading decisions",
    orderNum: 2
  }).returning();
  
  const [marketStructureModule3] = await db.insert(modules).values({
    courseId: marketStructureCourse.id,
    title: "Break of Structure Analysis",
    description: "Recognize and capitalize on structural shifts in market behavior",
    orderNum: 3
  }).returning();
  
  const [marketStructureModule4] = await db.insert(modules).values({
    courseId: marketStructureCourse.id,
    title: "Multi-Timeframe Analysis",
    description: "Integrate multiple timeframes for comprehensive market understanding",
    orderNum: 4
  }).returning();
  
  // ===========================================================================
  // MODULES FOR TECHNICAL ANALYSIS COURSE (MODULE 3)
  // ===========================================================================
  console.log('Creating modules for Technical Analysis course...');
  const [technicalModule1] = await db.insert(modules).values({
    courseId: technicalAnalysisCourse.id,
    title: "Momentum Indicators",
    description: "Utilize oscillators and momentum tools to identify market conditions",
    orderNum: 1
  }).returning();
  
  const [technicalModule2] = await db.insert(modules).values({
    courseId: technicalAnalysisCourse.id,
    title: "Trend Indicators",
    description: "Apply trend-following indicators for directional bias",
    orderNum: 2
  }).returning();
  
  const [technicalModule3] = await db.insert(modules).values({
    courseId: technicalAnalysisCourse.id,
    title: "Volatility & Volume Analysis",
    description: "Incorporate volatility and volume metrics into trading decisions",
    orderNum: 3
  }).returning();
  
  const [technicalModule4] = await db.insert(modules).values({
    courseId: technicalAnalysisCourse.id,
    title: "Custom Indicator Combinations",
    description: "Build personalized indicator systems for trading edge",
    orderNum: 4
  }).returning();
  
  // ===========================================================================
  // MODULES FOR RISK & PSYCHOLOGY COURSE (MODULE 4)
  // ===========================================================================
  console.log('Creating modules for Risk & Psychology course...');
  const [riskModule1] = await db.insert(modules).values({
    courseId: riskPsychologyCourse.id,
    title: "Position Sizing & Risk Allocation",
    description: "Master mathematical approaches to position sizing and capital allocation",
    orderNum: 1
  }).returning();
  
  const [riskModule2] = await db.insert(modules).values({
    courseId: riskPsychologyCourse.id,
    title: "Drawdown Control Methods",
    description: "Implement robust drawdown management techniques for account preservation",
    orderNum: 2
  }).returning();
  
  const [riskModule3] = await db.insert(modules).values({
    courseId: riskPsychologyCourse.id,
    title: "Trading Psychology Fundamentals",
    description: "Understand cognitive biases and emotional patterns in trading",
    orderNum: 3
  }).returning();
  
  const [riskModule4] = await db.insert(modules).values({
    courseId: riskPsychologyCourse.id,
    title: "Mental Conditioning System",
    description: "Develop a personalized routine for peak trading performance",
    orderNum: 4
  }).returning();
  
  // ===========================================================================
  // MODULES FOR STRATEGY ENGINEERING COURSE (MODULE 5)
  // ===========================================================================
  console.log('Creating modules for Strategy Engineering course...');
  const [strategyModule1] = await db.insert(modules).values({
    courseId: strategyEngineeringCourse.id,
    title: "Strategy Framework Design",
    description: "Create structured frameworks for systematic trading approaches",
    orderNum: 1
  }).returning();
  
  const [strategyModule2] = await db.insert(modules).values({
    courseId: strategyEngineeringCourse.id,
    title: "Backtesting & Forward Testing",
    description: "Master the principles of robust strategy testing methodologies",
    orderNum: 2
  }).returning();
  
  const [strategyModule3] = await db.insert(modules).values({
    courseId: strategyEngineeringCourse.id,
    title: "Strategy Optimization",
    description: "Refine strategy parameters without overfitting to historical data",
    orderNum: 3
  }).returning();
  
  const [strategyModule4] = await db.insert(modules).values({
    courseId: strategyEngineeringCourse.id,
    title: "Trading Playbook Development",
    description: "Compile a comprehensive trading system documentation",
    orderNum: 4
  }).returning();
  
  // ===========================================================================
  // MODULES FOR CRYPTO PROFICIENCY COURSE (MODULE 6B)
  // ===========================================================================
  console.log('Creating modules for Crypto Proficiency course...');
  const [cryptoModule1] = await db.insert(modules).values({
    courseId: cryptoCourse.id,
    title: "Blockchain Technology & Tokenomics",
    description: "Understanding the foundational technology behind cryptocurrencies and token economics",
    orderNum: 1
  }).returning();
  
  const [cryptoModule2] = await db.insert(modules).values({
    courseId: cryptoCourse.id,
    title: "CEX & DEX Trading Mechanics",
    description: "Master trading techniques for both centralized and decentralized exchanges",
    orderNum: 2
  }).returning();
  
  const [cryptoModule3] = await db.insert(modules).values({
    courseId: cryptoCourse.id,
    title: "On-Chain Analysis & Metrics",
    description: "Utilize blockchain data for informed trading decisions",
    orderNum: 3
  }).returning();
  
  const [cryptoModule4] = await db.insert(modules).values({
    courseId: cryptoCourse.id,
    title: "Specialized Crypto Trading Strategies",
    description: "Implement advanced strategies specifically designed for cryptocurrency markets",
    orderNum: 4
  }).returning();
  
  // ===========================================================================
  // MODULES FOR FOREX MASTERY COURSE (MODULE 6A)
  // ===========================================================================
  console.log('Creating modules for Forex Mastery course...');
  const [forexModule1] = await db.insert(modules).values({
    courseId: forexMasteryCourse.id,
    title: "Global Currency Markets & Intermarket Analysis",
    description: "Understand currency pair relationships and macro market correlations",
    orderNum: 1
  }).returning();
  
  const [forexModule2] = await db.insert(modules).values({
    courseId: forexMasteryCourse.id,
    title: "Forex-Specific Price Action Methods",
    description: "Apply specialized price action techniques for currency pairs",
    orderNum: 2
  }).returning();
  
  const [forexModule3] = await db.insert(modules).values({
    courseId: forexMasteryCourse.id,
    title: "Economic Data & Central Bank Policy",
    description: "Interpret economic releases and monetary policy for forex trading",
    orderNum: 3
  }).returning();
  
  const [forexModule4] = await db.insert(modules).values({
    courseId: forexMasteryCourse.id,
    title: "Professional Forex Strategies",
    description: "Implement comprehensive forex trading systems for various timeframes",
    orderNum: 4
  }).returning();
  
  const [legacyForexModule3] = await db.insert(modules).values({
    courseId: forexCourse.id,
    title: "Multi-Timeframe Trading",
    description: "Strategies combining different timeframes for optimal trading.",
    orderNum: 3
  }).returning();
  
  // Add modules to Psychology course
  console.log('Creating modules for trading psychology course...');
  const [psychModule1] = await db.insert(modules).values({
    courseId: psychologyCourse.id,
    title: "Understanding Trading Psychology",
    description: "The psychological foundations of successful trading.",
    orderNum: 1
  }).returning();
  
  const [psychModule2] = await db.insert(modules).values({
    courseId: psychologyCourse.id,
    title: "Emotional Control",
    description: "Techniques to master emotions during trading.",
    orderNum: 2
  }).returning();
  
  const [psychModule3] = await db.insert(modules).values({
    courseId: psychologyCourse.id,
    title: "Building Trading Discipline",
    description: "Developing consistency and discipline in your trading practice.",
    orderNum: 3
  }).returning();
  
  // Add lessons to Crypto Module 1
  console.log('Creating lessons for cryptocurrency modules...');
  const [cryptoLesson1] = await db.insert(lessons).values({
    moduleId: cryptoModule1.id,
    title: "What is Blockchain Technology?",
    description: "An introduction to the core concepts of blockchain.",
    content: `
      <h2>Understanding Blockchain Technology</h2>
      <p>Blockchain is a distributed, decentralized, public ledger technology that serves as the foundation for cryptocurrencies like Bitcoin and Ethereum.</p>
      <h3>Key Components of Blockchain</h3>
      <ul>
        <li><strong>Blocks</strong>: Collections of data that record transactions and other information</li>
        <li><strong>Chain</strong>: The cryptographic linking of blocks in chronological order</li>
        <li><strong>Nodes</strong>: Computers that validate and relay transactions</li>
        <li><strong>Consensus Mechanisms</strong>: Rules for validating transactions (e.g., Proof of Work, Proof of Stake)</li>
      </ul>
      <h3>Why Blockchain Matters for Traders</h3>
      <p>Understanding blockchain technology helps traders:</p>
      <ul>
        <li>Evaluate the fundamental value of cryptocurrencies</li>
        <li>Anticipate market reactions to technological developments</li>
        <li>Identify promising projects with strong technological foundations</li>
        <li>Understand network effects and adoption metrics</li>
      </ul>
      <p>In the next lesson, we'll explore the different types of blockchains and their implications for cryptocurrency markets.</p>
    `,
    orderNum: 1,
    duration: 30,
    videoUrl: "https://www.youtube.com/embed/SSo_EIwHSd4",
    resources: [
      {
        title: "Bitcoin Whitepaper",
        url: "https://bitcoin.org/bitcoin.pdf",
        type: "PDF"
      },
      {
        title: "Blockchain Explorer",
        url: "https://www.blockchain.com/explorer",
        type: "Tool"
      }
    ]
  }).returning();
  
  const [cryptoLesson2] = await db.insert(lessons).values({
    moduleId: cryptoModule1.id,
    title: "Cryptocurrency Wallets and Security",
    description: "Understanding wallet types and security best practices.",
    content: `
      <h2>Cryptocurrency Wallets and Security</h2>
      <p>A cryptocurrency wallet is a digital tool that allows you to store, send, and receive cryptocurrencies securely.</p>
      
      <h3>Types of Wallets</h3>
      <ul>
        <li><strong>Hot Wallets</strong>: Connected to the internet (mobile apps, desktop software, web wallets)</li>
        <li><strong>Cold Wallets</strong>: Offline storage devices (hardware wallets, paper wallets)</li>
        <li><strong>Custodial Wallets</strong>: Third-party services that hold your private keys</li>
        <li><strong>Non-custodial Wallets</strong>: You control your private keys</li>
      </ul>
      
      <h3>Security Best Practices</h3>
      <ol>
        <li>Use hardware wallets for long-term storage</li>
        <li>Enable two-factor authentication when available</li>
        <li>Create secure backups of your recovery phrases</li>
        <li>Never share your private keys or recovery phrases</li>
        <li>Use unique passwords for exchange accounts</li>
        <li>Verify addresses before sending transactions</li>
      </ol>
      
      <h3>Private Keys vs. Public Keys</h3>
      <p>Understanding the relationship between private keys (your secret) and public keys (your address) is fundamental to cryptocurrency security.</p>
      
      <p>In the next lesson, we'll explore the different types of cryptocurrencies and their unique characteristics.</p>
    `,
    orderNum: 2,
    duration: 45,
    videoUrl: "https://www.youtube.com/embed/d8IBpfs9bf4",
    resources: [
      {
        title: "Hardware Wallet Comparison",
        url: "https://www.ledger.com/academy/hardwarewallet/best-hardware-wallets",
        type: "Guide"
      }
    ]
  }).returning();
  
  // Add quiz for the first crypto lesson
  console.log('Creating quizzes for cryptocurrency lessons...');
  await db.insert(quizzes).values({
    lessonId: cryptoLesson1.id,
    title: "Blockchain Fundamentals Quiz",
    description: "Test your understanding of blockchain technology concepts.",
    questions: [
      {
        id: 1,
        question: "What is the primary function of blockchain technology?",
        options: [
          "To enable fast internet connections",
          "To create a decentralized, distributed ledger",
          "To hack computer systems",
          "To generate random passwords"
        ],
        correctAnswer: 1,
        explanation: "Blockchain technology creates a decentralized, distributed ledger that records transactions across many computers."
      },
      {
        id: 2,
        question: "Which of the following is NOT a component of blockchain?",
        options: [
          "Blocks",
          "Nodes",
          "Central authority",
          "Consensus mechanism"
        ],
        correctAnswer: 2,
        explanation: "A central authority is precisely what blockchain technology eliminates. It operates in a decentralized manner without a central authority."
      },
      {
        id: 3,
        question: "Why is blockchain technology considered secure?",
        options: [
          "Because only government agencies can access it",
          "Because it uses complex passwords",
          "Because it employs cryptographic techniques and distributed consensus",
          "Because it's only available to large companies"
        ],
        correctAnswer: 2,
        explanation: "Blockchain technology is secure due to its use of cryptographic techniques and distributed consensus mechanisms that make it very difficult to alter recorded data."
      },
      {
        id: 4,
        question: "What does 'consensus mechanism' refer to in blockchain technology?",
        options: [
          "A voting system for blockchain developers",
          "The rules for validating transactions and adding blocks",
          "A legal agreement between cryptocurrency users",
          "The encryption algorithm used in transactions"
        ],
        correctAnswer: 1,
        explanation: "A consensus mechanism refers to the rules and processes by which a blockchain network agrees on which transactions are valid and should be added to the blockchain."
      },
      {
        id: 5,
        question: "Why is understanding blockchain important for cryptocurrency traders?",
        options: [
          "It's not important for traders, only for developers",
          "It helps evaluate the fundamental value of cryptocurrencies",
          "It helps predict daily price fluctuations with accuracy",
          "It guarantees trading profits"
        ],
        correctAnswer: 1,
        explanation: "Understanding blockchain technology helps traders evaluate the fundamental value of cryptocurrencies, which contributes to better investment decisions."
      }
    ],
    passingScore: 70,
    timeLimit: 10 // 10 minutes
  });
  
  // Add a quiz for the second crypto lesson
  await db.insert(quizzes).values({
    lessonId: cryptoLesson2.id,
    title: "Cryptocurrency Wallets and Security Quiz",
    description: "Test your knowledge of wallet types and security practices.",
    questions: [
      {
        id: 1,
        question: "What is a 'cold wallet' in cryptocurrency?",
        options: [
          "A wallet that holds only stable coins",
          "A wallet that hasn't been used for a long time",
          "An offline storage device not connected to the internet",
          "A wallet with a very small balance"
        ],
        correctAnswer: 2,
        explanation: "A cold wallet is an offline storage device that isn't connected to the internet, providing better security against online threats."
      },
      {
        id: 2,
        question: "Which of the following is considered a best practice for cryptocurrency security?",
        options: [
          "Sharing your private keys with trusted friends for backup",
          "Storing your recovery phrase in your email account",
          "Using the same password across multiple exchanges",
          "Using hardware wallets for long-term storage"
        ],
        correctAnswer: 3,
        explanation: "Using hardware wallets for long-term storage is a security best practice as they keep private keys offline and protected from malware."
      },
      {
        id: 3,
        question: "What is the relationship between private keys and public keys?",
        options: [
          "They are identical and can be used interchangeably",
          "Public keys can be derived from private keys, but not vice versa",
          "Private keys can be derived from public keys easily",
          "They have no relationship and are generated separately"
        ],
        correctAnswer: 1,
        explanation: "Public keys can be mathematically derived from private keys, but it's computationally infeasible to derive a private key from a public key."
      },
      {
        id: 4,
        question: "What distinguishes a 'custodial wallet' from a 'non-custodial wallet'?",
        options: [
          "Custodial wallets can only hold Bitcoin",
          "Non-custodial wallets are always hardware devices",
          "In custodial wallets, a third party holds your private keys",
          "Custodial wallets don't require internet access"
        ],
        correctAnswer: 2,
        explanation: "In custodial wallets, a third party (like an exchange) holds your private keys, while in non-custodial wallets, you maintain control of your private keys."
      },
      {
        id: 5,
        question: "Why is it important to verify addresses before sending cryptocurrency transactions?",
        options: [
          "It's not important; transactions can always be reversed",
          "To prevent sending to incorrect or fraudulent addresses",
          "To avoid transaction fees",
          "To speed up the transaction process"
        ],
        correctAnswer: 1,
        explanation: "Verifying addresses before sending is crucial because cryptocurrency transactions are generally irreversible, and sending to an incorrect address can result in permanent loss of funds."
      }
    ],
    passingScore: 80,
    timeLimit: 10 // 10 minutes
  });
  
  // Add lessons to Forex Module 1
  console.log('Creating lessons for forex modules...');
  const [forexLesson1] = await db.insert(lessons).values({
    moduleId: forexModule1.id,
    title: "Advanced Chart Patterns",
    description: "Recognizing and trading complex chart patterns in forex markets.",
    content: `
      <h2>Advanced Chart Patterns in Forex Trading</h2>
      
      <p>Chart patterns are specific formations on price charts that can help predict future price movements. Advanced traders recognize these patterns to time their entries and exits.</p>
      
      <h3>Harmonic Patterns</h3>
      <p>Harmonic patterns use Fibonacci ratios to identify potential reversal points:</p>
      <ul>
        <li><strong>Gartley Pattern</strong>: The classic "M" or "W" shaped pattern with specific Fibonacci ratios</li>
        <li><strong>Bat Pattern</strong>: Similar to Gartley but with different Fibonacci measurements</li>
        <li><strong>Butterfly Pattern</strong>: Features an extended final leg with precise measurements</li>
        <li><strong>Crab Pattern</strong>: Known for its extreme final leg movement</li>
      </ul>
      
      <h3>Complex Continuation Patterns</h3>
      <p>These patterns suggest the current trend will continue after a brief consolidation:</p>
      <ul>
        <li><strong>Flags and Pennants</strong>: Short-term consolidation patterns that form after a strong price move</li>
        <li><strong>Bullish/Bearish Rectangles</strong>: Trading ranges that resolve in the direction of the prior trend</li>
        <li><strong>Cup and Handle</strong>: A U-shaped pattern followed by a small downward drift</li>
      </ul>
      
      <h3>Multi-Timeframe Pattern Confirmation</h3>
      <p>Confirming patterns across multiple timeframes can increase reliability:</p>
      <ol>
        <li>Identify the pattern on your primary trading timeframe</li>
        <li>Check if the pattern aligns with the trend on a higher timeframe</li>
        <li>Look for entry signals on a lower timeframe for precision</li>
        <li>Confirm with volume and momentum indicators</li>
      </ol>
      
      <p>In the next lesson, we'll explore how to combine these patterns with other technical indicators for high-probability trade setups.</p>
    `,
    orderNum: 1,
    duration: 60,
    videoUrl: "https://www.youtube.com/embed/rlZRtQkfK04",
    resources: [
      {
        title: "Harmonic Pattern Trading Guide",
        url: "https://www.babypips.com/learn/forex/harmonic-patterns",
        type: "Guide"
      },
      {
        title: "Multi-Timeframe Analysis Cheat Sheet",
        url: "https://www.tradingview.com/scripts/multitimeframe/",
        type: "Tool"
      }
    ]
  }).returning();
  
  // Add quiz for the forex lesson
  console.log('Creating quizzes for forex lessons...');
  await db.insert(quizzes).values({
    lessonId: forexLesson1.id,
    title: "Advanced Chart Patterns Quiz",
    description: "Test your knowledge of complex forex chart patterns.",
    questions: [
      {
        id: 1,
        question: "Which of the following is a harmonic pattern?",
        options: [
          "Head and Shoulders",
          "Gartley Pattern",
          "Double Top",
          "Wedge"
        ],
        correctAnswer: 1,
        explanation: "The Gartley Pattern is a harmonic pattern that uses Fibonacci ratios to identify potential reversal points in the market."
      },
      {
        id: 2,
        question: "What distinguishes harmonic patterns from other chart patterns?",
        options: [
          "They only appear on daily charts",
          "They use specific Fibonacci ratios to define their structure",
          "They only work in trending markets",
          "They require at least 100 candles to form"
        ],
        correctAnswer: 1,
        explanation: "Harmonic patterns are distinguished by their use of specific Fibonacci ratios to define the relationships between different legs of the pattern."
      },
      {
        id: 3,
        question: "What is a Cup and Handle pattern?",
        options: [
          "A reversal pattern that looks like a teacup with a handle",
          "A continuation pattern with a U-shaped bowl and a slight downward drift",
          "A pattern exclusively used in commodity markets",
          "A pattern that signals immediate market crashes"
        ],
        correctAnswer: 1,
        explanation: "The Cup and Handle is a continuation pattern characterized by a U-shaped bowl (the cup) followed by a slight downward drift (the handle), typically leading to an upward breakout."
      },
      {
        id: 4,
        question: "In multi-timeframe pattern analysis, why do traders check higher timeframes?",
        options: [
          "To find faster trades",
          "To identify more patterns",
          "To confirm if the pattern aligns with the larger trend",
          "Because higher timeframes always override lower timeframes"
        ],
        correctAnswer: 2,
        explanation: "Traders check higher timeframes to confirm if the pattern aligns with the larger trend, which can increase the reliability of the pattern on the primary trading timeframe."
      },
      {
        id: 5,
        question: "Which of these patterns is typically considered a continuation pattern?",
        options: [
          "Head and Shoulders",
          "Double Top",
          "Flag Pattern",
          "Diamond Pattern"
        ],
        correctAnswer: 2,
        explanation: "The Flag Pattern is a continuation pattern that forms after a strong price move (the pole) and represents a brief consolidation period before the price continues in the original direction."
      }
    ],
    passingScore: 80,
    timeLimit: 10 // 10 minutes
  });
  
  // Add lessons to Psychology Module 1
  console.log('Creating lessons for psychology modules...');
  const [psychLesson1] = await db.insert(lessons).values({
    moduleId: psychModule1.id,
    title: "Why Psychology Matters in Trading",
    description: "Understanding the impact of psychological factors on trading performance.",
    content: `
      <h2>The Critical Role of Psychology in Trading Success</h2>
      
      <p>While technical and fundamental analysis are important, psychological factors often determine the difference between successful and unsuccessful traders.</p>
      
      <h3>The Psychological Challenges of Trading</h3>
      <ul>
        <li><strong>Dealing with Uncertainty</strong>: Markets are inherently unpredictable, creating anxiety and stress</li>
        <li><strong>Managing Risk</strong>: The psychological challenge of accepting potential losses</li>
        <li><strong>Emotional Responses</strong>: Fear, greed, hope, and regret can overwhelm rational decision-making</li>
        <li><strong>Performance Pressure</strong>: Self-imposed pressure to succeed can lead to poor decisions</li>
      </ul>
      
      <h3>The 80/20 Rule in Trading</h3>
      <p>Many experienced traders believe that trading success is:</p>
      <ul>
        <li>80% psychology and risk management</li>
        <li>20% trading strategy and analysis</li>
      </ul>
      
      <h3>Common Psychological Pitfalls</h3>
      <ol>
        <li><strong>Overtrading</strong>: Trading too frequently due to excitement or boredom</li>
        <li><strong>Analysis Paralysis</strong>: Overthinking decisions and missing opportunities</li>
        <li><strong>Revenge Trading</strong>: Attempting to recover losses immediately after a losing trade</li>
        <li><strong>Confirmation Bias</strong>: Seeking information that confirms existing beliefs</li>
        <li><strong>Disposition Effect</strong>: Selling winners too early and holding losers too long</li>
      </ol>
      
      <h3>The Mindset of Successful Traders</h3>
      <p>Successful traders develop specific psychological traits:</p>
      <ul>
        <li>Patience and discipline</li>
        <li>Emotional control</li>
        <li>Adaptability to changing market conditions</li>
        <li>Probabilistic thinking</li>
        <li>Resilience in the face of losses</li>
      </ul>
      
      <p>In the next lesson, we'll explore specific techniques to develop better emotional awareness and control during trading.</p>
    `,
    orderNum: 1,
    duration: 40,
    videoUrl: "https://www.youtube.com/embed/QgaTlTfQnZI",
    resources: [
      {
        title: "Trading in the Zone by Mark Douglas",
        url: "https://www.goodreads.com/book/show/148886.Trading_in_the_Zone",
        type: "Book"
      },
      {
        title: "Trading Psychology Self-Assessment",
        url: "https://www.tradingpsychologyedge.com/trading-psychology-quiz/",
        type: "Assessment"
      }
    ]
  }).returning();
  
  // Add quiz for the psychology lesson
  console.log('Creating quizzes for psychology lessons...');
  await db.insert(quizzes).values({
    lessonId: psychLesson1.id,
    title: "Trading Psychology Quiz",
    description: "Test your understanding of psychological factors in trading.",
    questions: [
      {
        id: 1,
        question: "According to the '80/20 Rule' mentioned in the lesson, what percentage of trading success is attributed to psychology and risk management?",
        options: [
          "20%",
          "50%",
          "80%",
          "100%"
        ],
        correctAnswer: 2,
        explanation: "According to many experienced traders, 80% of trading success is attributed to psychology and risk management, while only 20% is related to trading strategy and analysis."
      },
      {
        id: 2,
        question: "What is 'revenge trading'?",
        options: [
          "Trading specifically to compete with other traders",
          "Attempting to recover losses immediately after a losing trade",
          "Trading during volatile market conditions",
          "Using aggressive trading strategies"
        ],
        correctAnswer: 1,
        explanation: "Revenge trading is the dangerous practice of attempting to recover losses immediately after a losing trade, often leading to emotional decisions and further losses."
      },
      {
        id: 3,
        question: "Which of the following is NOT mentioned as a psychological trait of successful traders?",
        options: [
          "Patience and discipline",
          "Emotional control",
          "Aggressive risk-taking",
          "Probabilistic thinking"
        ],
        correctAnswer: 2,
        explanation: "Aggressive risk-taking is not mentioned as a trait of successful traders. Instead, successful traders typically demonstrate discipline, emotional control, adaptability, probabilistic thinking, and resilience."
      },
      {
        id: 4,
        question: "What is the 'disposition effect' in trading?",
        options: [
          "The tendency to trade based on one's personal disposition or mood",
          "The impact of market conditions on trading decisions",
          "Selling winners too early and holding losers too long",
          "The relationship between trader personality types and preferred strategies"
        ],
        correctAnswer: 2,
        explanation: "The disposition effect is the psychological tendency to sell winning positions too early (to lock in gains) while holding losing positions too long (hoping they'll recover), which often leads to suboptimal results."
      },
      {
        id: 5,
        question: "Which psychological challenge is related to the inherent unpredictability of markets?",
        options: [
          "Performance pressure",
          "Dealing with uncertainty",
          "Managing risk",
          "Emotional responses"
        ],
        correctAnswer: 1,
        explanation: "Dealing with uncertainty is the psychological challenge directly related to the inherent unpredictability of markets, which can create anxiety and stress for traders."
      }
    ],
    passingScore: 80,
    timeLimit: 10 // 10 minutes
  });
  
  console.log('Learning center data seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    console.log('Seeding process complete. Disconnecting from database...');
    process.exit(0);
  });