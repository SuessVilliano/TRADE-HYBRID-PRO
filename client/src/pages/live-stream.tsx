import React, { useState, useEffect } from 'react';
import { PopupContainer } from '../components/ui/popup-container';
import { Button } from '../components/ui/button';

function LiveStream() {
  const [streamUrl, setStreamUrl] = useState<string>('https://www.youtube.com/embed/live_stream?channel=UC8LPf8DcwLB3QYuSlS9gg9A');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showChat, setShowChat] = useState(true);

  // Function to handle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Function to toggle chat visibility
  const toggleChat = () => {
    setShowChat(!showChat);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Live Trading Stream</h1>
        <p className="text-xl text-slate-300 max-w-3xl mx-auto">
          Watch our live trading sessions, market analysis, and educational content.
        </p>
      </div>

      <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
        <div className={`${isFullscreen ? 'h-full flex flex-col' : 'grid grid-cols-1 lg:grid-cols-3 gap-4'}`}>
          <div className={`${isFullscreen ? 'flex-grow' : 'lg:col-span-2'}`}>
            <PopupContainer padding className="h-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Live Stream</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={toggleChat}>
                    {showChat ? 'Hide Chat' : 'Show Chat'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                    {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                  </Button>
                </div>
              </div>
              
              <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg">
                <iframe 
                  src={streamUrl}
                  className="absolute top-0 left-0 w-full h-full border-0"
                  title="Live Trading Stream"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                ></iframe>
              </div>

              <div className="mt-4">
                <h3 className="font-semibold">Stream Schedule</h3>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Monday 10:00 AM - Market Opening Analysis</li>
                  <li>Wednesday 2:00 PM - Midweek Market Review</li>
                  <li>Friday 3:30 PM - Weekly Wrap-up and Strategy Session</li>
                </ul>
              </div>
            </PopupContainer>
          </div>
          
          {(showChat && !isFullscreen) && (
            <div className="lg:col-span-1">
              <PopupContainer padding className="h-full">
                <h3 className="font-semibold mb-4">Live Chat</h3>
                <div className="bg-slate-800 rounded-lg p-4 h-[500px]">
                  <iframe 
                    src="https://www.youtube.com/live_chat?v=live_stream&embed_domain=trade-hybrid.replit.app"
                    className="w-full h-full border-0"
                    title="Live Chat"
                  ></iframe>
                </div>
              </PopupContainer>
            </div>
          )}
          
          {(showChat && isFullscreen) && (
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-black p-4">
              <h3 className="font-semibold mb-4 text-white">Live Chat</h3>
              <iframe 
                src="https://www.youtube.com/live_chat?v=live_stream&embed_domain=trade-hybrid.replit.app"
                className="w-full h-[calc(100%-40px)] border-0"
                title="Live Chat"
              ></iframe>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <PopupContainer padding>
          <h2 className="text-2xl font-bold mb-4">Upcoming Streams</h2>
          <div className="space-y-4">
            <div className="border-b border-slate-700 pb-4">
              <div className="flex justify-between">
                <h3 className="font-semibold">Advanced Chart Patterns Workshop</h3>
                <span className="bg-blue-600 text-xs px-2 py-1 rounded">TOMORROW</span>
              </div>
              <p className="text-slate-300 text-sm mt-1">Learn how to identify and trade complex chart patterns with our expert analysts.</p>
              <div className="text-xs text-slate-400 mt-2">June 15, 2:00 PM EST</div>
            </div>
            
            <div className="border-b border-slate-700 pb-4">
              <div className="flex justify-between">
                <h3 className="font-semibold">Cryptocurrency Market Analysis</h3>
                <span className="bg-slate-600 text-xs px-2 py-1 rounded">IN 3 DAYS</span>
              </div>
              <p className="text-slate-300 text-sm mt-1">Deep dive into current crypto market trends, major coin analysis and altcoin opportunities.</p>
              <div className="text-xs text-slate-400 mt-2">June 18, 1:00 PM EST</div>
            </div>
            
            <div>
              <div className="flex justify-between">
                <h3 className="font-semibold">Trade Psychology Masterclass</h3>
                <span className="bg-slate-600 text-xs px-2 py-1 rounded">NEXT WEEK</span>
              </div>
              <p className="text-slate-300 text-sm mt-1">Overcome emotional trading and develop a disciplined trading mindset with our psychology expert.</p>
              <div className="text-xs text-slate-400 mt-2">June 22, 11:00 AM EST</div>
            </div>
          </div>
        </PopupContainer>
        
        <PopupContainer padding>
          <h2 className="text-2xl font-bold mb-4">Past Streams</h2>
          <div className="space-y-4">
            <div className="border-b border-slate-700 pb-4">
              <h3 className="font-semibold">Mastering Risk Management</h3>
              <p className="text-slate-300 text-sm mt-1">Essential techniques to protect your capital and maximize returns through proper position sizing.</p>
              <div className="flex justify-between items-center mt-2">
                <div className="text-xs text-slate-400">June 8, 2023</div>
                <Button variant="outline" size="sm">Watch Recording</Button>
              </div>
            </div>
            
            <div className="border-b border-slate-700 pb-4">
              <h3 className="font-semibold">Technical Analysis Fundamentals</h3>
              <p className="text-slate-300 text-sm mt-1">The essential indicators and chart patterns every trader should know and how to use them.</p>
              <div className="flex justify-between items-center mt-2">
                <div className="text-xs text-slate-400">June 1, 2023</div>
                <Button variant="outline" size="sm">Watch Recording</Button>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold">Market Order Flow Analysis</h3>
              <p className="text-slate-300 text-sm mt-1">Advanced techniques to read market order flow and predict price movements.</p>
              <div className="flex justify-between items-center mt-2">
                <div className="text-xs text-slate-400">May 25, 2023</div>
                <Button variant="outline" size="sm">Watch Recording</Button>
              </div>
            </div>
          </div>
        </PopupContainer>
      </div>
    </div>
  );
}

export default LiveStream;