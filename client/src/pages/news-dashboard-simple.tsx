import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { PopupContainer } from '../components/ui/popup-container';
import { Button } from '../components/ui/button';
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

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/rss-feeds/news');
        
        // Process the news data to ensure proper source attribution
        const processedItems = (response.data.items || []).map(item => {
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
        setLoading(false);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Failed to load news. Please try again later.');
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Financial News</h1>
      
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
          {newsItems.map((item) => (
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
          ))}
          
          {newsItems.length === 0 && !error && (
            <Card className="p-6 text-center">
              <p className="text-slate-400">No news articles available at the moment.</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}