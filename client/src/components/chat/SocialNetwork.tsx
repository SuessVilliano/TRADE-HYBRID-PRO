import { useState, useEffect } from "react";
import { cn } from "../../lib/utils";
import { useMultiplayer } from "../../lib/stores/useMultiplayer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import ChatRoom from "./ChatRoom";
import TradingRooms from "./TradingRooms";
import DirectMessages from "./DirectMessages";
import DirectMessageConversation from "./DirectMessageConversation";
import UserSearch from "./UserSearch";

interface SocialNetworkProps {
  className?: string;
}

export default function SocialNetwork({ className }: SocialNetworkProps) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const { setCurrentUser, currentUser } = useMultiplayer();
  
  // Set a mock current user if not set
  useEffect(() => {
    if (!currentUser) {
      setCurrentUser({
        id: "current-user",
        username: "Current User",
        isOnline: true,
      });
    }
  }, [currentUser, setCurrentUser]);
  
  return (
    <div className={cn("flex flex-col", className)}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Social Network</h1>
          <button 
            onClick={() => setShowUserSearch(!showUserSearch)}
            className={cn(
              "px-4 py-2 rounded-md font-medium text-sm transition-colors",
              showUserSearch 
                ? "bg-blue-600 text-white hover:bg-blue-700" 
                : "bg-blue-600/10 text-blue-500 hover:bg-blue-600/20"
            )}
          >
            {showUserSearch ? "Close Search" : "Find Traders"}
          </button>
        </div>
        
        {showUserSearch ? (
          <UserSearch 
            className="mb-6" 
            onSelectUser={(userId) => {
              setSelectedUserId(userId);
              setShowUserSearch(false);
              setSelectedTab(2); // Switch to Messages tab
            }} 
          />
        ) : null}
        
        <Tabs 
          defaultValue="chat" 
          onValueChange={(value) => {
            setSelectedTab(value === "chat" ? 0 : value === "trading" ? 1 : 2);
          }}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 w-full mb-4">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="trading">Trading Rooms</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat">
            {/* Global Chat */}
            <div className="flex justify-center">
              <ChatRoom />
            </div>
          </TabsContent>
          
          <TabsContent value="trading">
            {/* Trading Rooms */}
            {currentRoomId ? (
              <div className="flex justify-center">
                <ChatRoom 
                  roomId={currentRoomId} 
                  onToggleMinimize={() => setCurrentRoomId(null)}
                />
              </div>
            ) : (
              <TradingRooms onSelectRoom={setCurrentRoomId} />
            )}
          </TabsContent>
          
          <TabsContent value="messages">
            {/* Direct Messages */}
            {selectedUserId ? (
              <div className="flex justify-center">
                <DirectMessageConversation 
                  userId={selectedUserId} 
                  onBack={() => setSelectedUserId(null)}
                />
              </div>
            ) : (
              <DirectMessages onSelectUser={setSelectedUserId} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}