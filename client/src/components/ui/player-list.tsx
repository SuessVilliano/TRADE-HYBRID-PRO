import { useState, useEffect } from "react";
import { useMultiplayer } from "../../lib/stores/useMultiplayer";
import { format } from "date-fns";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
import { Users, MessageSquare, UserPlus, Award, VolumeX } from "lucide-react";

interface PlayerListProps {
  className?: string;
  minimized?: boolean;
  onToggleMinimize?: () => void;
}

export function PlayerList({ className, minimized = false, onToggleMinimize }: PlayerListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  
  const {
    players,
    clientId,
    sendFriendRequest,
    isPlayerFriend,
    mutePlayer,
    unmutePlayer,
    isPlayerMuted,
    sendChatMessage
  } = useMultiplayer();
  
  // Filter players based on search
  const filteredPlayers = players.filter(player => 
    player.username.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Group by friend status
  const friendPlayers = filteredPlayers.filter(player => isPlayerFriend(player.id));
  const nonFriendPlayers = filteredPlayers.filter(player => 
    !isPlayerFriend(player.id) && player.id !== clientId
  );
  const currentPlayer = filteredPlayers.find(player => player.id === clientId);
  
  // Calculate time connected
  const formatConnectedTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) {
      return `${minutes}m`;
    }
    
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };
  
  const handlePrivateMessage = (playerId: string, username: string) => {
    // Open private chat
    sendChatMessage(`/whisper ${username} Hi there!`, "private", playerId);
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
          <Users className="h-4 w-4" />
          <span className="text-md font-semibold">Online Traders ({players.length})</span>
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
      
      {/* Player list content - only visible when not minimized */}
      {!minimized && (
        <>
          {/* Search bar */}
          <div className="px-3 py-2 bg-gray-900">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search traders..."
              className="w-full bg-gray-800 text-white rounded px-3 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          {/* Players list container */}
          <div className="h-[calc(100%-96px)] px-2 py-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {/* Current player (you) */}
            {currentPlayer && (
              <div className="mb-4">
                <h3 className="text-xs uppercase text-gray-400 font-medium mb-1 px-2">You</h3>
                <div className="bg-blue-900/30 p-2 rounded-md border border-blue-800/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <span className="text-xs font-bold">{currentPlayer.username.slice(0, 2).toUpperCase()}</span>
                      </div>
                      <div>
                        <div className="font-medium">{currentPlayer.username}</div>
                        <div className="text-xs text-gray-400">
                          Connected {formatConnectedTime(currentPlayer.timestamp)}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs bg-green-700 rounded-full px-2 py-0.5">
                      Online
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Friends section */}
            {friendPlayers.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xs uppercase text-gray-400 font-medium mb-1 px-2">Friends ({friendPlayers.length})</h3>
                <div className="space-y-2">
                  {friendPlayers.map(player => (
                    <div key={player.id} className="bg-green-900/20 p-2 rounded-md border border-green-800/40">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center">
                            <span className="text-xs font-bold">{player.username.slice(0, 2).toUpperCase()}</span>
                          </div>
                          <div>
                            <div className="font-medium">{player.username}</div>
                            <div className="text-xs text-gray-400">
                              Connected {formatConnectedTime(player.timestamp)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePrivateMessage(player.id, player.username);
                                  }}
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Send message</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    isPlayerMuted(player.id) ? unmutePlayer(player.id) : mutePlayer(player.id);
                                  }}
                                >
                                  <VolumeX className={cn("h-4 w-4", isPlayerMuted(player.id) ? "text-red-500" : "text-gray-400")} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{isPlayerMuted(player.id) ? "Unmute player" : "Mute player"}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Other players section */}
            {nonFriendPlayers.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xs uppercase text-gray-400 font-medium mb-1 px-2">Other Traders ({nonFriendPlayers.length})</h3>
                <div className="space-y-2">
                  {nonFriendPlayers.map(player => (
                    <div key={player.id} className="bg-gray-800/40 p-2 rounded-md border border-gray-700/40">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                            <span className="text-xs font-bold">{player.username.slice(0, 2).toUpperCase()}</span>
                          </div>
                          <div>
                            <div className="font-medium">{player.username}</div>
                            <div className="text-xs text-gray-400">
                              Connected {formatConnectedTime(player.timestamp)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePrivateMessage(player.id, player.username);
                                  }}
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Send message</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    sendFriendRequest(player.id);
                                  }}
                                >
                                  <UserPlus className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Add friend</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    isPlayerMuted(player.id) ? unmutePlayer(player.id) : mutePlayer(player.id);
                                  }}
                                >
                                  <VolumeX className={cn("h-4 w-4", isPlayerMuted(player.id) ? "text-red-500" : "text-gray-400")} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{isPlayerMuted(player.id) ? "Unmute player" : "Mute player"}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Empty state */}
            {filteredPlayers.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-8">
                No traders found.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}