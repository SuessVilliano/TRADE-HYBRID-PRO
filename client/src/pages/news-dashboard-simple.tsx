import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { PopupContainer } from '../components/ui/popup-container';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search, RefreshCw, Filter } from 'lucide-react';
import axios from 'axios';

interface NewsItem {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  source: string;
  summary?: string;
}

export default function NewsDashboardSimple() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState<string>('');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(''); // Clear any previous errors
        
        // Now using our server-side API which has proper fallbacks
        const response = await axios.get('/api/rss-feeds/news');
        
        if (!response.data || !response.data.items || response.data.items.length === 0) {
          throw new Error('No news items received from the server');
        }
        
        // Process the news data to ensure proper source attribution
        const processedItems = response.data.items.map((item: any) => {
          // Extract the domain name from the item link to use as a fallback source
          let source = item.source;
          if (!source || source === 'Bloomberg') {
            try {
              const url = new URL(item.link);
              source = url.hostname.replace('www.', '').split('.')[0];
              // Capitalize the first letter
              source = source.charAt(0).toUpperCase() + source.slice(1);
            } catch (e) {
              source = 'Financial News';
            }
          }
          
          return {
            ...item,
            source: source
          };
        });
        
        setNewsItems(processedItems);
      } catch (err) {
        console.error('Error fetching news:', err);
        
        // Fall back to the server-side mock news endpoint
        try {
          const mockResponse = await axios.get('/api/news');
          
          if (mockResponse.data && Array.isArray(mockResponse.data)) {
            const mockItems = mockResponse.data.map((item, index) => ({
              id: `mock-${index}`,
              title: item.title,
              link: item.url || '#',
              pubDate: item.published,
              source: item.source,
              summary: item.summary
            }));
            
            setNewsItems(mockItems);
          } else {
            setError('Unable to load news at this time. Please try again later.');
          }
        } catch (mockErr) {
          console.error('Mock news fetch failed:', mockErr);
          setError('Failed to load financial news. Please try again later or check your internet connection.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  // Extract unique sources for the filter dropdown
  const uniqueSources = useMemo(() => {
    const sources = newsItems.map(item => item.source);
    return ['All Sources', ...Array.from(new Set(sources))];
  }, [newsItems]);
  
  // Filter news items based on search term and source filter
  const filteredNewsItems = useMemo(() => {
    return newsItems.filter(item => {
      const matchesSearch = searchTerm === '' || 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (item.summary && item.summary.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesSource = filterSource === '' || filterSource === 'All Sources' || 
        item.source === filterSource;
      
      return matchesSearch && matchesSource;
    });
  }, [newsItems, searchTerm, filterSource]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Financial News</h1>
        
        <div className="flex flex-col md:flex-row gap-4 mt-4 md:mt-0 w-full md:w-auto">
          {/* Search box */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search news..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          
          {/* Source filter */}
          <div className="w-full md:w-48">
            <select 
              className="w-full p-2 rounded-md bg-slate-800 border border-slate-700 text-slate-200"
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
            >
              {uniqueSources.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </div>
          
          {/* Reset filters button */}
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm('');
              setFilterSource('');
            }}
            disabled={!searchTerm && !filterSource}
            className="w-full md:w-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Filters
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <Card className="p-6 text-center text-red-500">
          <p>{error}</p>
          <Button 
            className="mt-4" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredNewsItems.length > 0 ? (
            filteredNewsItems.map((item) => (
              <PopupContainer key={item.id} padding>
                <h2 className="text-xl font-semibold mb-2">
                  <a 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-blue-400 transition-colors"
                  >
                    {item.title}
                  </a>
                </h2>
                <div className="flex items-center text-sm text-slate-400 mb-3">
                  <span className="font-medium text-blue-400">{item.source}</span>
                  <span className="mx-2">•</span>
                  <span>{formatDate(item.pubDate)}</span>
                </div>
                {item.summary && (
                  <p className="text-slate-300 mb-2">{item.summary}</p>
                )}
                <Separator className="my-4" />
                <div className="flex justify-end">
                  <a 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:underline"
                  >
                    Read full article
                  </a>
                </div>
              </PopupContainer>
            ))
          ) : (
            <Card className="p-6 text-center">
              <p className="text-slate-400">
                {newsItems.length > 0 
                  ? "No news articles match your search filters." 
                  : "No news articles available at the moment."}
              </p>
              {(searchTerm || filterSource) && (
                <Button 
                  className="mt-4" 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterSource('');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}