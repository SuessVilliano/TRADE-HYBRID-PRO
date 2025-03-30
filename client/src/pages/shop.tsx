import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ShopPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for iframe
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="border-slate-700 bg-slate-800/60 overflow-hidden">
        <CardHeader className="border-b border-slate-700 bg-slate-800/80 backdrop-blur-sm">
          <CardTitle>Trade Hybrid Shop</CardTitle>
          <CardDescription>
            Discover exclusive Trade Hybrid merchandise, items, and more.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 relative" style={{ height: 'calc(100vh - 220px)', minHeight: '600px' }}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10">
              <div className="text-center">
                <div className="inline-block w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-300">Loading Trade Hybrid Shop...</p>
              </div>
            </div>
          )}
          <iframe 
            src="https://sqr.co/TradeHybridShop/"
            className="w-full h-full border-0"
            title="Trade Hybrid Shop"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            referrerPolicy="origin"
          />
        </CardContent>
      </Card>
    </div>
  );
}