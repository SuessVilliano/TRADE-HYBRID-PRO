import { Request, Response } from "express";
import * as crypto from "crypto";
// Define news sources directly in the server module
const NEWS_SOURCES = [
  "TradingView",
  "Bloomberg",
  "Wall Street Journal",
  "CNBC",
  "Reuters",
  "Financial Times",
  "MarketWatch",
  "Coindesk",
  "The Economist",
  "Trade Hybrid Insights",
  "Barron's",
  "Seeking Alpha"
];

// News topics related to finance
const newsTopics = [
  { topic: "Central Bank", subtopics: ["Interest Rates", "Monetary Policy", "Federal Reserve", "ECB", "Bank of Japan"] },
  { topic: "Markets", subtopics: ["Stock Market", "Bond Market", "Forex", "Commodities", "Volatility"] },
  { topic: "Crypto", subtopics: ["Bitcoin", "Ethereum", "Regulation", "Mining", "DeFi"] },
  { topic: "Economy", subtopics: ["Inflation", "GDP", "Unemployment", "Trade", "Housing"] },
  { topic: "Corporate", subtopics: ["Earnings", "Mergers", "IPOs", "Tech Giants", "Startups"] },
  { topic: "Global", subtopics: ["Trade War", "Brexit", "Geopolitical Tensions", "OPEC", "Supply Chain"] }
];

// Generate a news item with a deterministic but random-seeming result
function generateNewsItem(seed: string, index: number) {
  // Create a deterministic seed for this news item
  const itemSeed = crypto.createHash('md5').update(`${seed}-${index}`).digest('hex');
  
  // Select a topic and subtopic based on the seed
  const topicIndex = parseInt(itemSeed.substring(0, 2), 16) % newsTopics.length;
  const topic = newsTopics[topicIndex];
  const subtopicIndex = parseInt(itemSeed.substring(2, 4), 16) % topic.subtopics.length;
  const subtopic = topic.subtopics[subtopicIndex];
  
  // Select a source based on the seed
  const sourceIndex = parseInt(itemSeed.substring(4, 6), 16) % NEWS_SOURCES.length;
  const source = NEWS_SOURCES[sourceIndex];
  
  // Determine news sentiment
  const sentimentValue = parseInt(itemSeed.substring(6, 8), 16);
  let sentiment: "bullish" | "bearish" | "neutral";
  if (sentimentValue < 85) sentiment = "neutral";
  else if (sentimentValue < 170) sentiment = "bullish";
  else sentiment = "bearish";
  
  // Determine news impact
  const impactValue = parseInt(itemSeed.substring(8, 10), 16);
  let impact: "low" | "medium" | "high";
  if (impactValue < 85) impact = "low";
  else if (impactValue < 220) impact = "medium";
  else impact = "high";
  
  // Generate a published date/time (within the last 24 hours)
  const now = new Date();
  const hourOffset = parseInt(itemSeed.substring(10, 12), 16) % 24;
  const minuteOffset = parseInt(itemSeed.substring(12, 14), 16) % 60;
  const publishedDate = new Date(now.getTime() - (hourOffset * 3600000 + minuteOffset * 60000));
  
  // Generate title and summary based on topic, subtopic, and sentiment
  const title = generateTitle(topic.topic, subtopic, sentiment);
  const summary = generateSummary(topic.topic, subtopic, sentiment, impact);
  
  // Create tags
  const tags = [topic.topic, subtopic];
  
  // Add some context-dependent tags
  if (impact === "high") tags.push("Breaking");
  if (sentiment === "bullish") tags.push("Bullish");
  if (sentiment === "bearish") tags.push("Bearish");
  
  return {
    id: itemSeed.substring(0, 8),
    title,
    summary,
    source,
    published: publishedDate.toISOString(),
    url: "#", // Placeholder URL
    tags: tags.slice(0, 4), // Limit to 4 tags
    impact,
    sentiment
  };
}

// Generate a title for a news item
function generateTitle(topic: string, subtopic: string, sentiment: string) {
  // Positive news titles
  const bullishTitles = [
    `${subtopic} Rally: ${topic} Sector Shows Strong Growth`,
    `${subtopic} Soars on Positive ${topic} Outlook`,
    `${topic} Markets Advance as ${subtopic} Exceeds Expectations`,
    `Investors Bullish on ${subtopic} as ${topic} Trends Improve`,
    `${subtopic} Leads ${topic} Market Gains`
  ];
  
  // Negative news titles
  const bearishTitles = [
    `${subtopic} Plunges Amid ${topic} Uncertainty`,
    `${topic} Markets Down as ${subtopic} Concerns Grow`,
    `${subtopic} Faces Headwinds in Challenging ${topic} Environment`,
    `Investors Cautious on ${subtopic} as ${topic} Risks Emerge`,
    `${subtopic} Pressured by ${topic} Concerns`
  ];
  
  // Neutral news titles
  const neutralTitles = [
    `${subtopic}: A Closer Look at Recent ${topic} Developments`,
    `${topic} Update: What's Next for ${subtopic}`,
    `${subtopic} in Focus as ${topic} Markets Assess Data`,
    `${topic} Analysis: The State of ${subtopic}`,
    `${subtopic} Fluctuates as ${topic} Factors Weigh`
  ];
  
  // Select a title template based on sentiment
  let titles;
  if (sentiment === "bullish") titles = bullishTitles;
  else if (sentiment === "bearish") titles = bearishTitles;
  else titles = neutralTitles;
  
  // Select a random title from the appropriate list
  const randomIndex = Math.floor(Math.random() * titles.length);
  return titles[randomIndex];
}

// Generate a summary for a news item
function generateSummary(topic: string, subtopic: string, sentiment: string, impact: string) {
  // Base summary structure with variables
  let summary = "";
  
  // Add context based on impact
  if (impact === "high") {
    summary += `Breaking: `;
  }
  
  // Add main content based on sentiment
  if (sentiment === "bullish") {
    summary += `${subtopic} is showing positive momentum in the ${topic} sector, `;
    
    // Add detail based on topic
    if (topic === "Crypto") {
      summary += `with increased adoption and institutional investment driving prices higher. `;
    } else if (topic === "Markets") {
      summary += `as investor confidence rises amid favorable economic indicators. `;
    } else if (topic === "Economy") {
      summary += `following better-than-expected data that suggests strong growth ahead. `;
    } else if (topic === "Central Bank") {
      summary += `after policymakers signaled a more accommodative stance on monetary policy. `;
    } else {
      summary += `as recent developments point to improving conditions and growth opportunities. `;
    }
    
    // Add conclusion
    summary += `Analysts are revising forecasts upward in response to these developments.`;
  } 
  else if (sentiment === "bearish") {
    summary += `${subtopic} is facing challenges in the ${topic} landscape, `;
    
    // Add detail based on topic
    if (topic === "Crypto") {
      summary += `with regulatory concerns and selling pressure weighing on market sentiment. `;
    } else if (topic === "Markets") {
      summary += `as uncertainty grows and profit-taking accelerates in key sectors. `;
    } else if (topic === "Economy") {
      summary += `with indicators suggesting weaker growth and potential headwinds. `;
    } else if (topic === "Central Bank") {
      summary += `following hawkish comments that signal a potential tightening of monetary conditions. `;
    } else {
      summary += `as multiple factors contribute to a deteriorating outlook. `;
    }
    
    // Add conclusion
    summary += `Market participants are adjusting positions in anticipation of continued volatility.`;
  }
  else { // neutral
    summary += `${subtopic} remains a focal point in ${topic} discussions, `;
    
    // Add detail based on topic
    if (topic === "Crypto") {
      summary += `with market participants carefully analyzing both bullish and bearish factors. `;
    } else if (topic === "Markets") {
      summary += `as traders weigh multiple indicators to determine future direction. `;
    } else if (topic === "Economy") {
      summary += `with mixed data presenting a complex picture for forecasters. `;
    } else if (topic === "Central Bank") {
      summary += `as policy decisions hang in the balance amid conflicting economic signals. `;
    } else {
      summary += `with experts divided on the implications of recent developments. `;
    }
    
    // Add conclusion
    summary += `The situation remains fluid as new information continues to emerge.`;
  }
  
  return summary;
}

// Get latest financial news
export const getNews = (req: Request, res: Response) => {
  try {
    const count = parseInt(req.query.count as string || '10');
    const validCount = Math.min(Math.max(1, count), 50); // Limit between 1 and 50
    
    // Create a seed based on the current day to keep news stable for a day
    const today = new Date().toISOString().split('T')[0];
    const seed = crypto.createHash('md5').update(today).digest('hex');
    
    // Generate news items
    const newsItems = [];
    for (let i = 0; i < validCount; i++) {
      newsItems.push(generateNewsItem(seed, i));
    }
    
    // Sort by published date (most recent first)
    newsItems.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());
    
    res.json(newsItems);
  } catch (error) {
    console.error("Error generating news:", error);
    res.status(500).json({ error: "Failed to generate news" });
  }
};

// Get news for a specific topic
export const getTopicNews = (req: Request, res: Response) => {
  try {
    const topic = req.params.topic;
    const count = parseInt(req.query.count as string || '10');
    const validCount = Math.min(Math.max(1, count), 50);
    
    // Validate topic
    const validTopic = newsTopics.find(t => t.topic.toLowerCase() === topic.toLowerCase());
    if (!validTopic) {
      return res.status(400).json({ error: `Topic ${topic} not found` });
    }
    
    // Create a seed based on the current day and topic
    const today = new Date().toISOString().split('T')[0];
    const seed = crypto.createHash('md5').update(`${today}-${topic}`).digest('hex');
    
    // Generate news items for this topic
    const newsItems = [];
    for (let i = 0; i < validCount * 2; i++) { // Generate more and filter
      const item = generateNewsItem(seed, i);
      if (item.tags.some(tag => tag.toLowerCase() === topic.toLowerCase())) {
        newsItems.push(item);
        if (newsItems.length >= validCount) break;
      }
    }
    
    // Sort by published date (most recent first)
    newsItems.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());
    
    res.json(newsItems);
  } catch (error) {
    console.error("Error generating topic news:", error);
    res.status(500).json({ error: "Failed to generate topic news" });
  }
};
