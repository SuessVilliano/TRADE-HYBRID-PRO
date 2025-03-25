import { useEffect, useState } from "react";
import { useWebApp } from "@/lib/stores/useWebApp";
import { Card, CardContent } from "./card";
import { Button } from "./button";
import { X, Maximize2, Minimize2, ExternalLink, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function WebApp() {
  const { isOpen, url, closeWebApp } = useWebApp();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Close web app on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeWebApp();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeWebApp]);
  
  // Reset loading state when URL changes
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
    }
  }, [url, isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all",
        isFullscreen ? "p-0" : "p-4"
      )}
    >
      <Card className={cn(
        "relative w-full h-full flex flex-col overflow-hidden transition-all",
        isFullscreen ? "rounded-none" : "rounded-lg max-w-5xl max-h-[80vh]"
      )}>
        {/* Toolbar */}
        <div className="flex items-center justify-between bg-muted p-2 border-b">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium truncate">
              {url}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              asChild
            >
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={14} />
                <span className="sr-only">Open in new tab</span>
              </a>
            </Button>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              <span className="sr-only">
                {isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              </span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={closeWebApp}
            >
              <X size={14} />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </div>
        
        {/* iframe content */}
        <CardContent className="p-0 flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          
          <iframe 
            src={url} 
            className="w-full h-full border-0" 
            title="Trade Hybrid App"
            onLoad={() => setIsLoading(false)}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        </CardContent>
      </Card>
    </div>
  );
}