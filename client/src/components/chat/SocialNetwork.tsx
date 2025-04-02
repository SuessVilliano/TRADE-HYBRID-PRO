import { useState, useEffect } from "react";
import { cn } from "../../lib/utils";
import { useMultiplayer } from "../../lib/stores/useMultiplayer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import ChatRoom from "./ChatRoom";
import TradingRooms from "./TradingRooms";
import DirectMessages from "./DirectMessages";
import DirectMessageConversation from "./DirectMessageConversation";

interface SocialNetworkProps {
  className?: string;
}

export default function SocialNetwork({ className }: SocialNetworkProps) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
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
        <h1 className="text-2xl font-bold mb-6">Social Network</h1>
        
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