import React, { useState, useEffect } from 'react';
import { PopupContainer } from '../components/ui/popup-container';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { DiscordEmbed } from '../components/ui/discord-embed';
import THTV from '../components/ui/th-tv'; // Import the new TH TV component

function LiveStream() {
  // Keep these variables for backward compatibility
  const viloudEmbedCode = '<div style="position: relative; padding-bottom: 56.25%; height: 0;"><iframe src="https://player.viloud.tv/embed/channel/6b3e6d6696fb33d051c1ca4b341d21cf?autoplay=1&volume=1&controls=1&title=1&share=1&open_playlist=0&random=0" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" frameborder="0" allow="autoplay" allowfullscreen></iframe></div>';
  const viloudStreamUrl = 'https://app.viloud.tv/hls/channel/6b3e6d6696fb33d051c1ca4b341d21cf.m3u8';
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [activeTab, setActiveTab] = useState('livestream');

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
        <h1 className="text-4xl font-bold mb-4">TH TV</h1>
        <p className="text-xl text-slate-300 max-w-3xl mx-auto">
          Watch our live trading sessions, market analysis, and educational content.
        </p>
      </div>

      <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="livestream">Live Stream</TabsTrigger>
              <TabsTrigger value="discord">Discord Community</TabsTrigger>
            </TabsList>
            
            {activeTab === 'livestream' && !isFullscreen && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={toggleChat}>
                  {showChat ? 'Hide Chat' : 'Show Chat'}
                </Button>
                <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                  {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                </Button>
              </div>
            )}
          </div>
          
          <TabsContent value="livestream" className="m-0">
            {/* Use our new THTV component */}
            <div className="rounded-lg overflow-hidden">
              <THTV />
            </div>
          </TabsContent>
          
          <TabsContent value="discord" className="m-0">
            <PopupContainer padding className="h-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Discord Community - Live Trade Rooms</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://discord.gg/tradehybrid', '_blank')}
                >
                  Open in Discord App
                </Button>
              </div>
              
              <div className="h-[600px] rounded-lg overflow-hidden">
                <DiscordEmbed serverId="1097524401769037947" theme="dark" />
              </div>
              
              <div className="mt-4">
                <h3 className="font-semibold">Join Our Discord Community</h3>
                <p className="mt-2 text-slate-300">
                  Connect with other traders, get live signals, and join our trade rooms for real-time market discussions. 
                  Our Discord community is the perfect place to collaborate and learn from fellow traders.
                </p>
              </div>
            </PopupContainer>
          </TabsContent>
        </Tabs>
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