import { useState, useEffect } from "react";
import { cn } from "../../lib/utils";
import { useMultiplayer } from "../../lib/stores/useMultiplayer";
import { useIsMobile } from "../../hooks/use-is-mobile";
import { PlayerList } from "./player-list";
import { SocialActivityFeed } from "./social-activity-feed";
import { VoiceChatControls } from "./voice-chat-controls";
import { FriendRequestNotification } from "./friend-request-notification";
import { Button } from "./button";
import { Users, Activity, Mic, ChevronRight, ChevronLeft, X } from "lucide-react";

interface SocialPanelProps {
  className?: string;
}

export function SocialPanel({ className }: SocialPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTool, setActiveTool] = useState<'players' | 'activity' | 'voice' | null>(null);
  const isMobile = useIsMobile();
  
  // Get multiplayer status
  const { 
    connected, 
    clientId, 
    voiceChatEnabled, 
    activeSpeakers, 
    friendRequests 
  } = useMultiplayer();
  
  // Check if we have any pending friend requests
  const hasPendingRequests = friendRequests.length > 0;
  
  // Handle active speakers display
  const hasActiveSpeakers = activeSpeakers.length > 0;
  
  // Calculate positioning based on device type to avoid overlap with other UI elements
  const panelPosition = isMobile ? "right-4 top-20" : "right-4 top-16";

  // Minimize panels when mobile layout changes
  useEffect(() => {
    if (isMobile) {
      setIsExpanded(false);
      setActiveTool(null);
    }
  }, [isMobile]);

  return (
    <>
      {/* Friend request notifications appear at the bottom right */}
      <FriendRequestNotification />
      
      {/* Main social panel */}
      <div 
        className={cn(
          "fixed z-30 transition-all duration-300",
          panelPosition,
          className
        )}
      >
        <div className="flex items-start gap-2">
          {/* Collapsed sidebar with buttons */}
          {!isExpanded && (
            <div className="flex flex-col gap-2 bg-black/70 backdrop-blur-sm p-2 rounded-lg shadow-lg border border-gray-800/50">
              {/* Player list button */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "relative h-10 w-10 rounded-lg",
                  activeTool === 'players' && "bg-blue-600 hover:bg-blue-700"
                )}
                onClick={() => {
                  setIsExpanded(true);
                  setActiveTool('players');
                }}
                title="Player List"
              >
                <Users size={18} />
                {hasPendingRequests && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
              </Button>
              
              {/* Activity feed button */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-10 w-10 rounded-lg",
                  activeTool === 'activity' && "bg-green-600 hover:bg-green-700"
                )}
                onClick={() => {
                  setIsExpanded(true);
                  setActiveTool('activity');
                }}
                title="Activity Feed"
              >
                <Activity size={18} />
              </Button>
              
              {/* Voice chat button */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "relative h-10 w-10 rounded-lg",
                  activeTool === 'voice' && "bg-purple-600 hover:bg-purple-700",
                  voiceChatEnabled && "border-2 border-green-500"
                )}
                onClick={() => {
                  setIsExpanded(true);
                  setActiveTool('voice');
                }}
                title="Voice Chat"
              >
                <Mic size={18} />
                {voiceChatEnabled && hasActiveSpeakers && (
                  <div className="absolute -top-1 -right-1 flex items-center space-x-0.5">
                    <div className="w-1 h-3 bg-green-500 rounded-full animate-soundwave"></div>
                    <div className="w-1 h-5 bg-green-500 rounded-full animate-soundwave-2"></div>
                    <div className="w-1 h-4 bg-green-500 rounded-full animate-soundwave-3"></div>
                  </div>
                )}
              </Button>
            </div>
          )}
          
          {/* Expanded panel with content */}
          {isExpanded && (
            <div className="relative bg-transparent rounded-lg">
              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-2 -right-2 z-10 h-8 w-8 rounded-full bg-black/80 shadow-md hover:bg-gray-900/80"
                onClick={() => {
                  setIsExpanded(false);
                  setActiveTool(null);
                }}
              >
                <X size={16} />
              </Button>
              
              {/* Panel content based on active tool */}
              {activeTool === 'players' && (
                <PlayerList 
                  minimized={false} 
                  onToggleMinimize={() => {
                    setIsExpanded(false);
                    setActiveTool(null);
                  }}
                />
              )}
              
              {activeTool === 'activity' && (
                <SocialActivityFeed 
                  minimized={false} 
                  onToggleMinimize={() => {
                    setIsExpanded(false);
                    setActiveTool(null);
                  }}
                />
              )}
              
              {activeTool === 'voice' && (
                <VoiceChatControls 
                  minimized={false} 
                  onToggleMinimize={() => {
                    setIsExpanded(false);
                    setActiveTool(null);
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}