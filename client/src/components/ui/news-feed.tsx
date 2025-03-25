import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useNews } from "@/lib/stores/useNews";
import { AlertTriangle, BarChart2, TrendingUp, TrendingDown, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewsFeedProps {
  className?: string;
}

export function NewsFeed({ className }: NewsFeedProps) {
  const { news, fetchNews, loading } = useNews();
  
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);
  
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex justify-between items-center">
          <span>
            <Globe className="inline mr-2 h-5 w-5" />
            Market News
          </span>
          {loading && <span className="text-sm text-muted-foreground">Loading...</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {news.map((item, index) => (
            <div key={item.id} className="mb-4">
              <div className="flex items-start gap-2">
                <div>
                  {item.impact === "high" && (
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  )}
                  {item.impact === "medium" && (
                    <BarChart2 className="h-5 w-5 text-amber-500" />
                  )}
                  {item.sentiment === "bullish" && (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  )}
                  {item.sentiment === "bearish" && (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.summary}</p>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {new Date(item.published).toLocaleTimeString()}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {item.source}
                    </Badge>
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              {index < news.length - 1 && <Separator className="my-4" />}
            </div>
          ))}
          
          {news.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No news available at the moment.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
