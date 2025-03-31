import React, { useState } from 'react';
import PageLayout from '@/components/layout/page-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Podcast, PlayCircle, Clock, Calendar, Share2, Bookmark, Heart, Download } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

// Sample podcast episodes data
const podcastEpisodes = [
  {
    id: 'ep50',
    number: 50,
    title: 'Mastering Risk Management in Volatile Markets',
    description: 'Learn advanced risk management strategies to protect your capital during extreme market volatility and uncertainty.',
    date: 'Mar 28, 2025',
    duration: '52 min',
    image: '/assets/podcast/episode50.jpg',
    embedUrl: 'https://wattbaa.profit-vibe.com/album/17695/meta-sv/trading-for-freedom-podcast-series/embed',
    tags: ['risk-management', 'volatility', 'trading-psychology'],
    featured: true
  },
  {
    id: 'ep49',
    number: 49,
    title: 'Solana Ecosystem: The Future of DeFi Trading',
    description: 'Explore the rapidly growing Solana ecosystem and discover the trading opportunities in its decentralized finance landscape.',
    date: 'Mar 21, 2025',
    duration: '48 min',
    image: '/assets/podcast/episode49.jpg',
    embedUrl: 'https://wattbaa.profit-vibe.com/album/17695/meta-sv/trading-for-freedom-podcast-series/embed',
    tags: ['solana', 'defi', 'crypto'],
    featured: true
  },
  {
    id: 'ep48',
    number: 48,
    title: 'Trading Habits of Six-Figure Traders',
    description: 'Discover the daily habits, routines, and mindsets that separate successful six-figure traders from the rest.',
    date: 'Mar 14, 2025',
    duration: '61 min',
    image: '/assets/podcast/episode48.jpg',
    embedUrl: 'https://wattbaa.profit-vibe.com/album/17695/meta-sv/trading-for-freedom-podcast-series/embed',
    tags: ['trading-psychology', 'success-habits', 'professional-trading'],
    featured: false
  },
  {
    id: 'ep47',
    number: 47,
    title: 'Technical Analysis Masterclass: Advanced Patterns',
    description: 'An in-depth look at advanced technical analysis patterns and how to incorporate them into your trading strategy.',
    date: 'Mar 7, 2025',
    duration: '55 min',
    image: '/assets/podcast/episode47.jpg',
    embedUrl: 'https://wattbaa.profit-vibe.com/album/17695/meta-sv/trading-for-freedom-podcast-series/embed',
    tags: ['technical-analysis', 'chart-patterns', 'trading-strategy'],
    featured: false
  },
  {
    id: 'ep46',
    number: 46,
    title: 'From Retail to Prop: The Journey to Professional Trading',
    description: 'Follow the journey of traders who successfully transitioned from retail trading to professional proprietary trading.',
    date: 'Feb 28, 2025',
    duration: '47 min',
    image: '/assets/podcast/episode46.jpg',
    embedUrl: 'https://wattbaa.profit-vibe.com/album/17695/meta-sv/trading-for-freedom-podcast-series/embed',
    tags: ['prop-trading', 'career-development', 'professional-trading'],
    featured: false
  }
];

const TradingFreedomPodcast: React.FC = () => {
  const [selectedEpisode, setSelectedEpisode] = useState(podcastEpisodes[0]);
  
  return (
    <PageLayout title="Trading for Freedom Podcast">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="col-span-1 md:col-span-2">
            <Card className="w-full">
              <CardHeader className="pb-0">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                  <div className="flex items-center gap-2 mb-4 md:mb-0">
                    <Podcast className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Trading for Freedom</span>
                    <Badge variant="outline">Ep {selectedEpisode.number}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" title="Share">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Save">
                      <Bookmark className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Like">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Download">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-2xl md:text-3xl">{selectedEpisode.title}</CardTitle>
                <CardDescription className="mt-2 text-base">{selectedEpisode.description}</CardDescription>
                <div className="flex flex-wrap gap-2 mt-4">
                  {selectedEpisode.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{selectedEpisode.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{selectedEpisode.duration}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="rounded-md overflow-hidden border bg-card">
                  <iframe 
                    src={selectedEpisode.embedUrl}
                    width="100%" 
                    height="450" 
                    scrolling="no"
                    frameBorder="no" 
                    allow="autoplay" 
                    loading="lazy"
                    title={`Trading for Freedom - Episode ${selectedEpisode.number}`}
                    className="w-full"
                  ></iframe>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Show Notes</h3>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p>
                      In episode {selectedEpisode.number} of Trading for Freedom, we explore {selectedEpisode.title.toLowerCase()}. 
                      This episode dives deep into the strategies, mindsets, and approaches that can transform your trading journey.
                    </p>
                    <p>
                      Key highlights from this episode:
                    </p>
                    <ul>
                      <li>Understanding the core principles behind successful trading approaches</li>
                      <li>Implementing proven strategies from top-performing traders</li>
                      <li>Developing the right mindset to overcome common challenges</li>
                      <li>Practical tips you can apply to your trading immediately</li>
                      <li>Resources and tools mentioned throughout the episode</li>
                    </ul>
                    <p>
                      Whether you're a beginner looking to start your trading journey or an experienced trader aiming 
                      to refine your edge, this episode provides valuable insights to help you reach your financial goals.
                    </p>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Meet the Host</h3>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src="/assets/host-profile.jpg" alt="Alex Thompson" />
                      <AvatarFallback>AT</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">Alex Thompson</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Professional trader with over 15 years of experience in financial markets. 
                        Founder of Trading Hybrid and host of the Trading for Freedom podcast, 
                        helping traders worldwide achieve financial independence through smart trading strategies.
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" size="sm">Follow</Button>
                        <Button variant="secondary" size="sm">Learn More</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Episode List */}
          <div className="col-span-1">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Recent Episodes</CardTitle>
                <CardDescription>Explore our latest trading insights</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="recent" className="w-full">
                  <TabsList className="w-full mb-4">
                    <TabsTrigger value="recent" className="flex-1">Recent</TabsTrigger>
                    <TabsTrigger value="popular" className="flex-1">Popular</TabsTrigger>
                    <TabsTrigger value="topics" className="flex-1">Topics</TabsTrigger>
                  </TabsList>
                  <TabsContent value="recent" className="m-0">
                    <div className="space-y-4">
                      {podcastEpisodes.map((episode) => (
                        <div 
                          key={episode.id} 
                          className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-accent ${selectedEpisode.id === episode.id ? 'bg-accent' : ''}`}
                          onClick={() => setSelectedEpisode(episode)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="relative min-w-[60px] h-[60px] rounded-md overflow-hidden bg-muted">
                              <img 
                                src={episode.image} 
                                alt={episode.title} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://placehold.co/60x60/374151/e5e7eb?text=TF';
                                }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                                <PlayCircle className="h-8 w-8 text-white" />
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium">Ep {episode.number}</span>
                                {episode.featured && (
                                  <Badge variant="secondary" className="text-[10px] px-1 py-0">Featured</Badge>
                                )}
                              </div>
                              <h4 className="font-medium text-sm line-clamp-2">{episode.title}</h4>
                              <div className="flex items-center text-xs text-muted-foreground mt-1">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>{episode.duration}</span>
                                <span className="mx-2">•</span>
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>{episode.date}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                      Load More Episodes
                    </Button>
                  </TabsContent>
                  <TabsContent value="popular" className="m-0">
                    <div className="p-6 text-center">
                      <Podcast className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium">Popular Episodes</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        Discover our most listened to episodes based on user engagement and feedback.
                      </p>
                      <Button variant="outline" className="mt-4">Browse All Episodes</Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="topics" className="m-0">
                    <div className="p-6 text-center">
                      <Podcast className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium">Episode Topics</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        Browse episodes by topic categories like Technical Analysis, Psychology, Risk Management, and more.
                      </p>
                      <Button variant="outline" className="mt-4">View Topic Categories</Button>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-3">Listen On</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="2"/>
                        <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/>
                      </svg>
                      Apple Podcasts
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                      </svg>
                      Spotify
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
                        <path d="m9 17 8-5-8-5z"/>
                      </svg>
                      Google Podcasts
                    </Button>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-3">Subscribe</h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <Button size="sm">Subscribe</Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Get notified when new episodes are released. No spam, unsubscribe anytime.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default TradingFreedomPodcast;