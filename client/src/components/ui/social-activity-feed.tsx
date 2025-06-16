import { useState, useEffect } from "react";
import { useMultiplayer } from "../../lib/stores/useMultiplayer";
import { cn } from "../../lib/utils";
import { Activity, MessageSquare, UserPlus, Award, DollarSign, BarChart2, Zap } from "lucide-react";

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

export function SocialActivityFeed({ className, minimized = false, onToggleMinimize }: SocialActivityFeedProps) {
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [activityFilter, setActivityFilter] = useState<ActivityItem['type'] | 'all'>('all');
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  
  // Connect to real multiplayer data
  const { messages, players, friendRequests, socialActivities } = useMultiplayer();
  
  // Process real multiplayer data into activity feed
  useEffect(() => {
    const realActivities: ActivityItem[] = [];
    
    // Add recent chat messages
    if (messages && messages.length > 0) {
      const chatActivities = messages.slice(-5).map(msg => ({
        id: `chat-${msg.id}`,
        type: 'chat' as const,
        timestamp: msg.timestamp,
        content: msg.message,
        user: {
          id: msg.sender,
          username: players?.find(p => p.id === msg.sender)?.username || msg.sender
        }
      }));
      realActivities.push(...chatActivities);
    }
    
    // Add friend requests
    if (friendRequests && friendRequests.length > 0) {
      const friendActivities = friendRequests.slice(-3).map(req => ({
        id: `friend-${req.id}`,
        type: 'friend' as const,
        timestamp: req.timestamp || Date.now(),
        content: `New friend request from ${req.from}`,
        user: { id: req.from, username: req.from }
      }));
      realActivities.push(...friendActivities);
    }
    
    // Add social activities
    if (socialActivities && socialActivities.length > 0) {
      const activities = socialActivities.slice(-3).map(activity => ({
        id: `social-${activity.id}`,
        type: activity.type,
        timestamp: activity.timestamp,
        content: activity.content,
        user: activity.user
      }));
      realActivities.push(...activities);
    }
    
    // Sort by timestamp (newest first)
    realActivities.sort((a, b) => b.timestamp - a.timestamp);
    
    setActivities(realActivities);
  }, [messages, players, friendRequests, socialActivities]);

  const filteredActivities = activityFilter === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === activityFilter);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'chat':
        return <MessageSquare className="h-4 w-4" />;
      case 'friend':
        return <UserPlus className="h-4 w-4" />;
      case 'trade':
        return <DollarSign className="h-4 w-4" />;
      case 'achievement':
        return <Award className="h-4 w-4" />;
      case 'signal':
        return <BarChart2 className="h-4 w-4" />;
      case 'join':
      case 'leave':
        return <Activity className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (minimized) {
    return (
      <div className={cn("bg-white border rounded-lg shadow-sm p-2 cursor-pointer", className)} onClick={onToggleMinimize}>
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium">Activity</span>
          <div className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-auto">
            {activities.length}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white border rounded-lg shadow-sm", className)}>
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold">Social Activity</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {expanded ? 'Collapse' : 'Expand'}
          </button>
          {onToggleMinimize && (
            <button
              onClick={onToggleMinimize}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Minimize
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        {/* Activity Filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {(['all', 'chat', 'trade', 'friend', 'achievement', 'signal'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActivityFilter(filter)}
              className={cn(
                "px-3 py-1 rounded-full text-sm whitespace-nowrap",
                activityFilter === filter
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {/* Activity List */}
        <div className={cn("space-y-3", !expanded && "max-h-48 overflow-y-auto")}>
          {filteredActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
            </div>
          ) : (
            filteredActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {activity.user && (
                      <span className="font-medium text-sm">{activity.user.username}</span>
                    )}
                    <span className="text-xs text-gray-500">{formatTime(activity.timestamp)}</span>
                  </div>
                  <p className="text-sm text-gray-700">{activity.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}