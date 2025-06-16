import { useState, useEffect } from "react";
import { useMultiplayer } from "../../lib/stores/useMultiplayer";
import { cn } from "../../lib/utils";
import { Activity, MessageSquare, UserPlus, Award, DollarSign, BarChart2, Zap } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface SocialActivityFeedProps {
  className?: string;
  minimized?: boolean;
  onToggleMinimize?: () => void;
}

interface ActivityItem {
  id: string;
  type: 'chat' | 'friend' | 'trade' | 'achievement' | 'signal' | 'join' | 'leave';
  timestamp: number;
  content: string;
  user?: {
    id: string;
    username: string;
  };
  metadata?: any;
}

// Activity feed component for displaying social activities within the metaverse
export function SocialActivityFeed({ className, minimized = false, onToggleMinimize }: SocialActivityFeedProps) {
  const [expanded, setExpanded] = useState(false);
  const [activityFilter, setActivityFilter] = useState<ActivityItem['type'] | 'all'>('all');
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  
  // HIDDEN: Multiplayer dependencies broken - keeping code alive but commented
  // const { messages, players, friendRequests, socialActivities } = useMultiplayer();
  
  // Combine all social activities into a single feed
  useEffect(() => {
    // HIDDEN: Broken multiplayer chat activities - keeping code alive but commented
    // const chatActivities = messages.slice(-10).map(msg => ({
    //   id: msg.id,
    //   type: 'chat' as const,
    //   timestamp: msg.timestamp,
    //   content: msg.message,
    //   user: {
    //     id: msg.sender,
    //     username: players.find(p => p.id === msg.sender)?.username || 'Unknown',
    //   },
      metadata: {
        type: msg.type
      }
    }));
    
    // Get the latest activities
    const allActivities = [...chatActivities, ...socialActivities]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 30); // Limit to last 30 activities
    
    setActivities(allActivities);
  }, [messages, players, friendRequests, socialActivities]);
  
  // Filter activities based on selected type
  const filteredActivities = activityFilter === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === activityFilter);
  
  // Get icon for activity type
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'chat':
        return <MessageSquare className="h-4 w-4 text-blue-400" />;
      case 'friend':
        return <UserPlus className="h-4 w-4 text-green-400" />;
      case 'trade':
        return <DollarSign className="h-4 w-4 text-yellow-400" />;
      case 'achievement':
        return <Award className="h-4 w-4 text-purple-400" />;
      case 'signal':
        return <BarChart2 className="h-4 w-4 text-amber-400" />;
      case 'join':
      case 'leave':
        return <Zap className="h-4 w-4 text-emerald-400" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };
  
  // Format timestamp for display
  const formatTimestamp = (timestamp: number) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };
  
  return (
    <div 
      className={cn(
        "bg-black/70 text-white rounded-lg overflow-hidden transition-all duration-300",
        minimized ? "w-60 h-10" : "w-80 h-96",
        expanded && !minimized ? "w-96" : "",
        className
      )}
    >
      {/* Header */}
      <div 
        className="bg-gray-800 px-3 py-2 flex justify-between items-center cursor-pointer"
        onClick={onToggleMinimize}
      >
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          <span className="text-md font-semibold">Activity Feed</span>
        </div>
        
        {!minimized && (
          <div className="flex items-center space-x-1">
            <button 
              onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
              className="text-gray-400 hover:text-gray-200"
            >
              {expanded ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onToggleMinimize?.(); }}
              className="text-gray-400 hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
      
      {/* Activity content - only visible when not minimized */}
      {!minimized && (
        <>
          {/* Filters */}
          <div className="px-3 py-2 bg-gray-800/50 flex overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
            <button
              onClick={() => setActivityFilter('all')}
              className={cn(
                "px-2 py-1 text-xs rounded-full whitespace-nowrap mr-1",
                activityFilter === 'all' ? "bg-gray-700" : "bg-gray-800 hover:bg-gray-700/50"
              )}
            >
              All
            </button>
            <button
              onClick={() => setActivityFilter('chat')}
              className={cn(
                "px-2 py-1 text-xs rounded-full whitespace-nowrap mr-1",
                activityFilter === 'chat' ? "bg-blue-900/70" : "bg-gray-800 hover:bg-gray-700/50"
              )}
            >
              <MessageSquare className="h-3 w-3 inline-block mr-1" />
              Chat
            </button>
            <button
              onClick={() => setActivityFilter('friend')}
              className={cn(
                "px-2 py-1 text-xs rounded-full whitespace-nowrap mr-1",
                activityFilter === 'friend' ? "bg-green-900/70" : "bg-gray-800 hover:bg-gray-700/50"
              )}
            >
              <UserPlus className="h-3 w-3 inline-block mr-1" />
              Friends
            </button>
            <button
              onClick={() => setActivityFilter('trade')}
              className={cn(
                "px-2 py-1 text-xs rounded-full whitespace-nowrap mr-1",
                activityFilter === 'trade' ? "bg-yellow-900/70" : "bg-gray-800 hover:bg-gray-700/50"
              )}
            >
              <DollarSign className="h-3 w-3 inline-block mr-1" />
              Trades
            </button>
            <button
              onClick={() => setActivityFilter('signal')}
              className={cn(
                "px-2 py-1 text-xs rounded-full whitespace-nowrap mr-1",
                activityFilter === 'signal' ? "bg-amber-900/70" : "bg-gray-800 hover:bg-gray-700/50"
              )}
            >
              <BarChart2 className="h-3 w-3 inline-block mr-1" />
              Signals
            </button>
            <button
              onClick={() => setActivityFilter('achievement')}
              className={cn(
                "px-2 py-1 text-xs rounded-full whitespace-nowrap",
                activityFilter === 'achievement' ? "bg-purple-900/70" : "bg-gray-800 hover:bg-gray-700/50"
              )}
            >
              <Award className="h-3 w-3 inline-block mr-1" />
              Achievements
            </button>
          </div>
          
          {/* Activity list */}
          <div className="h-[calc(100%-80px)] px-2 py-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {filteredActivities.length > 0 ? (
              <div className="space-y-2">
                {filteredActivities.map((activity) => (
                  <div key={activity.id} className="bg-gray-800/30 p-2 rounded-md border border-gray-700/40">
                    <div className="flex gap-2">
                      <div className="mt-0.5">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div className="font-medium text-sm">
                            {activity.user?.username || 'System'}
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatTimestamp(activity.timestamp)}
                          </div>
                        </div>
                        <div className="text-sm mt-1">{activity.content}</div>
                        
                        {/* Type-specific additional content */}
                        {activity.type === 'chat' && activity.metadata?.type === 'private' && (
                          <div className="mt-1 text-xs text-blue-400 bg-blue-900/20 inline-block px-2 py-0.5 rounded">
                            Private message
                          </div>
                        )}
                        {activity.type === 'signal' && (
                          <div className="mt-1 text-xs bg-amber-900/20 inline-block px-2 py-0.5 rounded">
                            Trading signal
                          </div>
                        )}
                        {activity.type === 'trade' && (
                          <div className="mt-1 text-xs bg-green-900/20 inline-block px-2 py-0.5 rounded">
                            Trade executed
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 text-sm py-8">
                No {activityFilter === 'all' ? 'activities' : activityFilter} found.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}