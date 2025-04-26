import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/context/AuthContext';
import { Info, PlayCircle, MoveRight } from 'lucide-react';

/**
 * TH TV (Trade Hybrid TV) Component
 * 
 * This component displays the livestream and video content for Trade Hybrid members.
 * It includes both live and on-demand content with membership-based access control.
 */
const THTV: React.FC = () => {
  const { isPaidUser, membershipLevel } = useAuth();
  const [currentStream, setCurrentStream] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [isLive, setIsLive] = useState(false);

  // Check if there's a live stream active
  useEffect(() => {
    const checkLiveStatus = async () => {
      try {
        // In a real implementation, you would fetch live status from an API
        // For now, we'll simulate a live stream during business hours
        const now = new Date();
        const hour = now.getHours();
        const isBusinessHours = hour >= 9 && hour < 16;
        const dayOfWeek = now.getDay();
        const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
        
        setIsLive(isBusinessHours && isWeekday);

        // Set the default stream URL based on live status
        if (isBusinessHours && isWeekday) {
          setCurrentStream('https://www.youtube.com/embed/live_stream?channel=UCWb32EuqwXfZZhQMLRl_-PQ');
        } else {
          setCurrentStream('https://www.youtube.com/embed/videoseries?list=PLWIcRrPLCdUeAC1-s6mTBZrRBk5wIWmQK');
        }
      } catch (error) {
        console.error("Error checking live status:", error);
        setIsLive(false);
      }
    };

    checkLiveStatus();
    
    // Check live status every 5 minutes
    const interval = setInterval(checkLiveStatus, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Get video access based on membership level
  const hasFullAccess = membershipLevel === 'pro' || membershipLevel === 'admin' || membershipLevel === 'demo';
  const hasBasicAccess = isPaidUser || hasFullAccess;

  // Render access-restricted message if user doesn't have access
  if (!hasBasicAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] bg-gray-900 p-6">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Premium Content</h2>
          <p className="text-gray-300 mb-6">
            TH TV livestreams and videos are available to paid members only.
          </p>
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-6">
            <p className="text-blue-300">
              Upgrade your membership to access live trading sessions, educational content, and market analysis videos.
            </p>
          </div>
          <a 
            href="/membership"
            className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Upgrade Membership
            <MoveRight className="ml-2 h-4 w-4" />
          </a>
        </div>
      </div>
    );
  }

  // List of available video content based on access level
  const videoContent = [
    {
      id: 'live',
      title: 'Live Trading Session',
      description: 'Watch our traders live as they analyze markets and execute trades.',
      url: 'https://www.youtube.com/embed/live_stream?channel=UCWb32EuqwXfZZhQMLRl_-PQ',
      requiresPro: false,
      isLive: true,
    },
    {
      id: 'education',
      title: 'Educational Series',
      description: 'Learn trading fundamentals and advanced strategies.',
      url: 'https://www.youtube.com/embed/videoseries?list=PLWIcRrPLCdUeAC1-s6mTBZrRBk5wIWmQK',
      requiresPro: false,
      isLive: false,
    },
    {
      id: 'market-analysis',
      title: 'Weekly Market Analysis',
      description: 'In-depth analysis of current market conditions and trends.',
      url: 'https://www.youtube.com/embed/videoseries?list=PLWIcRrPLCdUeAC1-s6mTBZrRBk5wIWmQK',
      requiresPro: false,
      isLive: false,
    },
    {
      id: 'pro-strategies',
      title: 'Pro Trading Strategies',
      description: 'Advanced techniques and strategies for experienced traders.',
      url: 'https://www.youtube.com/embed/videoseries?list=PLWIcRrPLCdUeAC1-s6mTBZrRBk5wIWmQK',
      requiresPro: true,
      isLive: false,
    },
  ];

  // Filter videos based on user access level
  const accessibleVideos = videoContent.filter(video => {
    if (video.requiresPro) {
      return hasFullAccess;
    }
    return true;
  });

  // Function to switch streams
  const switchStream = (url: string) => {
    setCurrentStream(url);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="flex flex-col lg:flex-row h-full">
        {/* Main Video Area */}
        <div className="lg:w-3/4 h-[50vh] lg:h-auto bg-black relative">
          {currentStream ? (
            <iframe 
              src={currentStream} 
              className="w-full h-full border-0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen
              title="Trade Hybrid TV Stream"
            ></iframe>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          {/* Live Indicator */}
          {isLive && currentStream?.includes('live_stream') && (
            <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md flex items-center">
              <span className="relative flex h-3 w-3 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              LIVE
            </div>
          )}
        </div>
        
        {/* Video Selection Sidebar */}
        <div className="lg:w-1/4 bg-gray-800 p-4 overflow-y-auto">
          <h3 className="text-lg font-semibold text-white mb-4">Available Content</h3>
          
          <div className="space-y-3">
            {accessibleVideos.map((video) => (
              <button
                key={video.id}
                onClick={() => switchStream(video.url)}
                className={`w-full text-left p-3 rounded-lg flex items-start space-x-3 hover:bg-gray-700 transition-colors ${
                  currentStream === video.url ? 'bg-blue-900/30 border border-blue-700' : 'bg-gray-700/50'
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {video.isLive && isLive ? (
                    <div className="relative">
                      <PlayCircle className="h-6 w-6 text-red-500" />
                      <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
                    </div>
                  ) : (
                    <PlayCircle className="h-6 w-6 text-blue-400" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-white text-sm">
                    {video.title}
                    {video.isLive && isLive && (
                      <span className="ml-2 text-xs bg-red-600 text-white px-1 py-0.5 rounded">LIVE</span>
                    )}
                    {video.requiresPro && (
                      <span className="ml-2 text-xs bg-purple-600 text-white px-1 py-0.5 rounded">PRO</span>
                    )}
                  </h4>
                  <p className="text-gray-300 text-xs mt-1">{video.description}</p>
                </div>
              </button>
            ))}
          </div>
          
          {/* Membership upgrade prompt for non-pro users */}
          {!hasFullAccess && (
            <div className="mt-6 p-3 bg-gradient-to-r from-purple-900/40 to-blue-900/40 rounded-lg border border-purple-700">
              <h4 className="font-medium text-white text-sm">Upgrade to Pro</h4>
              <p className="text-gray-300 text-xs mt-1">
                Get access to all premium content and exclusive trading strategies.
              </p>
              <a 
                href="/membership?plan=pro"
                className="mt-2 text-xs inline-flex items-center text-purple-300 hover:text-purple-200"
              >
                Learn more about Pro membership
                <MoveRight className="ml-1 h-3 w-3" />
              </a>
            </div>
          )}
        </div>
      </div>
      
      {/* Information Banner */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0 mr-2" />
          <div>
            <h4 className="font-medium text-white text-sm">About TH TV</h4>
            <p className="text-gray-300 text-xs mt-1">
              Trade Hybrid TV provides live trading sessions, educational content, and market analysis videos. 
              Our expert traders share their insights and strategies to help you improve your trading skills.
              {!showInfo && (
                <button 
                  onClick={() => setShowInfo(true)}
                  className="ml-1 text-blue-400 hover:text-blue-300"
                >
                  Read more...
                </button>
              )}
            </p>
            
            {showInfo && (
              <div className="mt-2 text-xs text-gray-300">
                <p className="mb-1">Live trading sessions are typically held Monday through Friday from 9:00 AM to 4:00 PM Eastern Time.</p>
                <p>Educational content and recorded sessions are available 24/7 for all paid members, with additional premium content available for Pro members.</p>
                <button 
                  onClick={() => setShowInfo(false)}
                  className="mt-2 text-blue-400 hover:text-blue-300"
                >
                  Show less
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default THTV;