import { useState, useEffect } from 'react';
import { TradingDashboardLayout } from '@/components/ui/trading-dashboard-layout';
import { SimpleNewsFeed } from '@/components/ui/simple-news-feed';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import axios from 'axios';
import { Globe } from "lucide-react";

interface NewsSource {
  id: string;
  name: string;
}

export default function NewsView() {
  const [selectedSource, setSelectedSource] = useState<string>('investing');
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch available news sources
  useEffect(() => {
    async function fetchSources() {
      try {
        const response = await axios.get('/api/rss-feeds/sources');
        if (response.data && response.data.sources) {
          setSources(response.data.sources);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching news sources:', error);
        setIsLoading(false);
      }
    }

    fetchSources();
  }, []);

  return (
    <TradingDashboardLayout>
      <div className="px-6 py-4 overflow-y-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Financial News</h1>
            <p className="text-muted-foreground">
              Real-time market news from top financial sources
            </p>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <div className="flex items-center space-x-2">
              <Label htmlFor="source">Source:</Label>
              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger id="source" className="w-48">
                  <SelectValue placeholder="Select news source" />
                </SelectTrigger>
                <SelectContent>
                  {sources.map((source) => (
                    <SelectItem key={source.id} value={source.id}>
                      {source.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Card className="w-full">
          <CardHeader className="pb-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {sources.find(s => s.id === selectedSource)?.name || 'News Feed'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <SimpleNewsFeed sourceId={selectedSource} />
            )}
          </CardContent>
        </Card>
      </div>
    </TradingDashboardLayout>
  );
}