import React, { useState } from 'react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Separator } from './separator';
import { Tv } from 'lucide-react';

interface LivestreamTVProps {
  className?: string;
}

export function LivestreamTV({ className }: LivestreamTVProps) {
  const [showTVPopup, setShowTVPopup] = useState(false);

  const openTVPopup = () => {
    setShowTVPopup(true);
  };

  const closeTVPopup = () => {
    setShowTVPopup(false);
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className={`flex items-center gap-2 ${className}`}
        onClick={openTVPopup}
      >
        <Tv className="h-4 w-4" />
        <span>Live TV</span>
      </Button>

      {showTVPopup && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <Card className="w-full max-w-4xl animate-in fade-in-50 zoom-in-95 duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Trade Hybrid TV</CardTitle>
                <CardDescription>
                  Watch live trading streams and educational content
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={closeTVPopup}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="h-5 w-5"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-hidden rounded-md">
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                  <iframe 
                    src="https://player.viloud.tv/embed/channel/6b3e6d6696fb33d051c1ca4b341d21cf?autoplay=0&volume=1&controls=1&title=1&share=1&open_playlist=0&random=0" 
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} 
                    frameBorder="0"
                    allow="autoplay"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                tv.tradehybrid.club - Live Trading Channel
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.open('https://tv.tradehybrid.club', '_blank')}
              >
                Visit Full Site
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
}