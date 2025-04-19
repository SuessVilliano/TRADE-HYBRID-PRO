import { useState, useEffect, useRef } from 'react';
import { ScrollArea } from './scroll-area';
import { Button } from './button';
import { X, Send, Smile, Users, User, Clock, Settings, Bell, BellOff } from 'lucide-react';
import { useMultiplayer, Friend } from '@/lib/stores/useMultiplayer';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Input } from './input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils/formatters';

/**
 * Community Chat Popup Component
 * - Displays a global chat for all traders in the metaverse
 * - Provides private messaging with friends
 * - Supports chat history and real-time updates
 * - Includes online status indicators
 */
export function ChatPopup({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { 
    chatMessages, 
    sendChatMessage, 
    players, 
    friends, 
    username, 
    mutePlayer, 
    unmutePlayer, 
    isPlayerMuted 
  } = useMultiplayer();
  
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'global' | 'private' | 'settings'>('global');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // Handle sending a message
  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    if (activeTab === 'global') {
      sendChatMessage(message, 'global');
    } else if (activeTab === 'private' && selectedUser) {
      sendChatMessage(message, 'private', selectedUser);
    }
    
    setMessage('');
  };

  // Handle pressing Enter to send message
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Filter messages based on the active tab
  const filteredMessages = () => {
    if (activeTab === 'global') {
      return chatMessages.filter(msg => msg.type === 'global');
    } else if (activeTab === 'private' && selectedUser) {
      return chatMessages.filter(msg => 
        (msg.type === 'private' && 
         ((msg.sender === selectedUser && msg.target === username) || 
          (msg.sender === username && msg.target === selectedUser)))
      );
    }
    return [];
  };

  // Get online players
  const onlinePlayers = () => {
    return players.filter(player => player.id !== clientId);
  };

  // Get client ID
  const clientId = useMultiplayer(state => state.getClientId()) || '';

  // Toggle player mute status
  const toggleMute = (playerId: string) => {
    if (isPlayerMuted(playerId)) {
      unmutePlayer(playerId);
    } else {
      mutePlayer(playerId);
    }
  };

  // Get user display name
  const getUserName = (userId: string): string => {
    const player = players.find(p => p.id === userId);
    return player ? player.username : userId;
  };

  // Check if user is online
  const isUserOnline = (userId: string): boolean => {
    return players.some(p => p.id === userId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-3xl h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Community Chat</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <div className="border-b px-4">
            <TabsList className="px-0">
              <TabsTrigger value="global" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>Global</span>
              </TabsTrigger>
              <TabsTrigger value="private" className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>Private</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-1">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex flex-1 overflow-hidden">
            <TabsContent value="global" className="flex flex-col flex-1 p-0 m-0 relative">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {filteredMessages().map((msg) => (
                    <div 
                      key={msg.id} 
                      className={cn(
                        "max-w-[80%] rounded-lg p-3",
                        msg.sender === username 
                          ? "ml-auto bg-primary text-primary-foreground" 
                          : "bg-muted"
                      )}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{msg.sender}</span>
                        <span className="text-xs opacity-70">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="private" className="flex flex-1 p-0 m-0 overflow-hidden">
              <div className="w-1/3 border-r">
                <div className="p-3 border-b">
                  <h3 className="font-medium text-sm">Friends & Players</h3>
                </div>
                <ScrollArea className="h-[calc(100vh-230px)]">
                  <div className="p-2 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground px-2 py-1">FRIENDS</p>
                    {friends.length > 0 ? (
                      friends.map((friend) => (
                        <Button
                          key={friend.id}
                          variant="ghost"
                          className={cn(
                            "w-full justify-start", 
                            selectedUser === friend.id && "bg-muted"
                          )}
                          onClick={() => setSelectedUser(friend.id)}
                        >
                          <div className="flex items-center">
                            <div className="relative">
                              <Avatar className="h-6 w-6 mr-2">
                                <AvatarFallback>
                                  {friend.username.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div 
                                className={cn(
                                  "absolute bottom-0 right-0 h-2 w-2 rounded-full",
                                  isUserOnline(friend.id) ? "bg-green-500" : "bg-slate-300"
                                )}
                              />
                            </div>
                            <span>{friend.username}</span>
                          </div>
                        </Button>
                      ))
                    ) : (
                      <p className="text-xs text-center text-muted-foreground px-2 py-4">
                        No friends yet. Add traders from the leaderboard!
                      </p>
                    )}
                    
                    <p className="text-xs font-medium text-muted-foreground px-2 py-1 mt-4">NEARBY PLAYERS</p>
                    {onlinePlayers().length > 0 ? (
                      onlinePlayers().map((player) => (
                        <Button
                          key={player.id}
                          variant="ghost"
                          className={cn(
                            "w-full justify-start", 
                            selectedUser === player.id && "bg-muted"
                          )}
                          onClick={() => setSelectedUser(player.id)}
                        >
                          <div className="flex items-center">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarFallback>
                                {player.username.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span>{player.username}</span>
                          </div>
                        </Button>
                      ))
                    ) : (
                      <p className="text-xs text-center text-muted-foreground px-2 py-4">
                        No other players nearby
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </div>
              
              <div className="w-2/3 flex flex-col">
                {selectedUser ? (
                  <>
                    <div className="p-3 border-b flex items-center justify-between">
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarFallback>
                            {getUserName(selectedUser).substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="font-medium text-sm">{getUserName(selectedUser)}</h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleMute(selectedUser)}
                      >
                        {isPlayerMuted(selectedUser) ? (
                          <><BellOff className="h-4 w-4 mr-1" /> Unmute</>
                        ) : (
                          <><Bell className="h-4 w-4 mr-1" /> Mute</>
                        )}
                      </Button>
                    </div>
                    
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {filteredMessages().length > 0 ? (
                          filteredMessages().map((msg) => (
                            <div 
                              key={msg.id} 
                              className={cn(
                                "max-w-[80%] rounded-lg p-3",
                                msg.sender === username 
                                  ? "ml-auto bg-primary text-primary-foreground" 
                                  : "bg-muted"
                              )}
                            >
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold">{msg.sender}</span>
                                <span className="text-xs opacity-70">
                                  {new Date(msg.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="mt-1 whitespace-pre-wrap">{msg.message}</p>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <Clock className="h-8 w-8 mx-auto mb-2 opacity-20" />
                            <p>No message history</p>
                            <p className="text-xs mt-1">Send your first message to start chatting</p>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>
                    
                    <div className="p-4 border-t">
                      <div className="flex gap-2">
                        <Input
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyDown={handleKeyPress}
                          placeholder={`Message to ${getUserName(selectedUser)}...`}
                          className="flex-1"
                        />
                        <Button 
                          onClick={handleSendMessage}
                          disabled={!message.trim()}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                    <div className="mb-4">
                      <User className="h-12 w-12 mb-2 opacity-20" />
                      <h3 className="text-lg font-medium">No Conversation Selected</h3>
                    </div>
                    <p className="max-w-md">
                      Select a friend or nearby player from the list to start a private conversation.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="p-4 m-0">
              <h3 className="font-medium mb-4">Chat Settings</h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Chat Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications for new messages
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  >
                    {notificationsEnabled ? (
                      <><Bell className="h-4 w-4 mr-2" /> Enabled</>
                    ) : (
                      <><BellOff className="h-4 w-4 mr-2" /> Disabled</>
                    )}
                  </Button>
                </div>
                
                <div>
                  <p className="font-medium mb-2">Muted Users</p>
                  <div className="border rounded-md">
                    <ScrollArea className="h-48">
                      {players.filter(player => isPlayerMuted(player.id)).length > 0 ? (
                        <div className="p-3 space-y-2">
                          {players.filter(player => isPlayerMuted(player.id)).map(player => (
                            <div key={player.id} className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Avatar className="h-6 w-6 mr-2">
                                  <AvatarFallback>
                                    {player.username.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{player.username}</span>
                              </div>
                              <Button size="sm" variant="ghost" onClick={() => unmutePlayer(player.id)}>
                                Unmute
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full p-4">
                          <p className="text-sm text-muted-foreground">No muted users</p>
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </div>
                
                <div>
                  <p className="font-medium mb-2">Message History</p>
                  <Button variant="outline">Clear Chat History</Button>
                </div>
                
                <div>
                  <p className="font-medium mb-2">Privacy</p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="allow_dms" defaultChecked />
                      <label htmlFor="allow_dms" className="text-sm">
                        Allow direct messages from anyone
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="show_status" defaultChecked />
                      <label htmlFor="show_status" className="text-sm">
                        Show my online status to others
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}