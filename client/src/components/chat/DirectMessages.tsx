import { useState } from "react";
import { useMultiplayer, Player } from "../../lib/stores/useMultiplayer";
import { cn } from "../../lib/utils";
import { formatDistanceToNow } from "date-fns";

interface DirectMessagesProps {
  className?: string;
  onSelectUser: (userId: string) => void;
}

export default function DirectMessages({ className, onSelectUser }: DirectMessagesProps) {
  const { players, currentUser } = useMultiplayer();
  const [filter, setFilter] = useState("");
  
  // Filter out current user and apply search filter
  const filteredPlayers = players
    .filter(player => player.id !== currentUser?.id)
    .filter(player => 
      filter 
        ? player.username.toLowerCase().includes(filter.toLowerCase()) 
        : true
    );
  
  const formatLastSeen = (lastSeen?: Date) => {
    if (!lastSeen) return "";
    return formatDistanceToNow(lastSeen, { addSuffix: true });
  };
  
  return (
    <div className={cn("bg-gray-900 rounded-lg border border-gray-700 overflow-hidden", className)}>
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Direct Messages</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search traders..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 pl-9"
          />
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 text-gray-400 absolute left-3 top-3" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      
      <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600">
        {filteredPlayers.length > 0 ? (
          filteredPlayers.map((player) => (
            <div 
              key={player.id}
              onClick={() => onSelectUser(player.id)}
              className="flex items-center p-3 rounded-md cursor-pointer transition-colors bg-gray-800 hover:bg-gray-700"
            >
              <div className="relative mr-3">
                {player.avatarUrl ? (
                  <img 
                    src={player.avatarUrl} 
                    alt={player.username}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-xl font-semibold text-white">
                    {player.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className={cn(
                  "absolute bottom-0 right-0 w-3 h-3 rounded-full border border-gray-900",
                  player.isOnline ? "bg-green-500" : "bg-gray-500"
                )}></div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white truncate">{player.username}</h3>
                <p className="text-xs text-gray-400 truncate">
                  {player.isOnline ? (
                    <span className="text-green-400">Online</span>
                  ) : (
                    <span>Last seen {formatLastSeen(player.lastSeen)}</span>
                  )}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectUser(player.id);
                }}
                className="ml-3 text-xs bg-gray-700 text-gray-300 hover:bg-gray-600 px-3 py-1 rounded-md"
              >
                Message
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-12 w-12 mx-auto mb-3 opacity-50"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p className="text-lg font-medium">No traders found</p>
            <p className="text-sm">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
}