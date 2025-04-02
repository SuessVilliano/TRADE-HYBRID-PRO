import { useState, useEffect } from "react";
import { useMultiplayer } from "../../lib/stores/useMultiplayer";
import { cn } from "../../lib/utils";
import { Search, UserPlus, MessageSquare, UserCheck } from "lucide-react";
import { toast } from "sonner";

interface UserSearchProps {
  className?: string;
  onSelectUser?: (userId: string) => void;
}

export default function UserSearch({ className, onSelectUser }: UserSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const { 
    players, 
    currentUser, 
    sendFriendRequest,
    isPlayerFriend
  } = useMultiplayer();
  
  // Search players by username
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    // Search logic (in a real app, this would be a backend API call)
    // For now we're using the mock players list
    setTimeout(() => {
      const results = players.filter(player => 
        player.id !== currentUser?.id && // Don't show current user
        player.username.toLowerCase().includes(query.toLowerCase())
      );
      
      setSearchResults(results);
      setIsSearching(false);
    }, 300); // Simulate network delay
  };
  
  // Send friend request
  const handleSendFriendRequest = (playerId: string) => {
    sendFriendRequest(playerId);
    toast.success("Friend request sent!");
  };
  
  // Format the last seen time
  const formatLastSeen = (lastSeen?: Date) => {
    if (!lastSeen) return "Unknown";
    
    const now = new Date();
    const diff = now.getTime() - lastSeen.getTime();
    
    // Less than a minute
    if (diff < 60000) return "Just now";
    
    // Less than an hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
    
    // Less than a day
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    
    // Format as date
    return lastSeen.toLocaleDateString();
  };
  
  return (
    <div className={cn("bg-gray-900 rounded-lg border border-gray-700 overflow-hidden", className)}>
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Find Traders</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by username..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-md px-10 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          {isSearching && (
            <div className="absolute right-3 top-2.5">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Search for traders by username to add them as friends or start a direct message.
        </p>
      </div>
      
      <div className="divide-y divide-gray-800">
        {searchResults.length > 0 ? (
          searchResults.map((player) => (
            <div 
              key={player.id}
              className="p-4 hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
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
                  <div>
                    <h3 className="font-medium text-white">{player.username}</h3>
                    <p className="text-xs text-gray-400">
                      {player.isOnline ? (
                        <span className="text-green-400">Online</span>
                      ) : (
                        <span>Last seen {formatLastSeen(player.lastSeen)}</span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {isPlayerFriend(player.id) ? (
                    <button
                      className="flex items-center gap-1 text-xs bg-green-800/30 text-green-400 px-3 py-1.5 rounded-md border border-green-800"
                      disabled
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>Friend</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSendFriendRequest(player.id)}
                      className="flex items-center gap-1 text-xs bg-gray-700 text-gray-300 hover:bg-gray-600 px-3 py-1.5 rounded-md"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      <span>Add Friend</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => onSelectUser && onSelectUser(player.id)}
                    className="flex items-center gap-1 text-xs bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded-md"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Message</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : searchQuery ? (
          <div className="p-8 text-center text-gray-400">
            <div className="w-16 h-16 mx-auto bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-gray-500" />
            </div>
            <p className="text-lg font-medium">No traders found</p>
            <p className="text-sm mt-1">Try a different search term</p>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400">
            <div className="w-16 h-16 mx-auto bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-gray-500" />
            </div>
            <p className="text-lg font-medium">Search for traders</p>
            <p className="text-sm mt-1">Find and connect with other traders</p>
          </div>
        )}
      </div>
    </div>
  );
}