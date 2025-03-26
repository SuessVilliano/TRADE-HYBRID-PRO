import { useState, useRef, useEffect } from "react";
import { useMultiplayer } from "../../lib/stores/useMultiplayer";
import { format } from "date-fns";
import { cn } from "../../lib/utils";

interface ChatProps {
  className?: string;
  minimized?: boolean;
  onToggleMinimize?: () => void;
}

export function Chat({ className, minimized = false, onToggleMinimize }: ChatProps) {
  const [message, setMessage] = useState("");
  const [chatType, setChatType] = useState<"global" | "zone" | "private">("global");
  const [target, setTarget] = useState("");
  const [expanded, setExpanded] = useState(false);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  
  const { chatMessages, sendChatMessage, players } = useMultiplayer();
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages, minimized]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    // Send the message based on the selected type
    sendChatMessage(message, chatType, chatType === "private" ? target : undefined);
    
    // Clear the input
    setMessage("");
  };
  
  const formatTimestamp = (timestamp: number) => {
    return format(new Date(timestamp), "HH:mm");
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
      {/* Chat header */}
      <div className="bg-gray-800 px-3 py-2 flex justify-between items-center cursor-pointer"
        onClick={onToggleMinimize}
      >
        <div className="flex items-center gap-2">
          <span className="text-md font-semibold">Trade Hybrid Chat</span>
          {!minimized && (
            <div className="flex space-x-1">
              <button 
                onClick={(e) => { e.stopPropagation(); setChatType("global"); }} 
                className={cn(
                  "px-2 py-0.5 rounded text-xs",
                  chatType === "global" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
                )}
              >
                Global
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setChatType("zone"); }}
                className={cn(
                  "px-2 py-0.5 rounded text-xs",
                  chatType === "zone" ? "bg-green-600" : "bg-gray-700 hover:bg-gray-600"
                )}
              >
                Zone
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setChatType("private"); }}
                className={cn(
                  "px-2 py-0.5 rounded text-xs",
                  chatType === "private" ? "bg-purple-600" : "bg-gray-700 hover:bg-gray-600"
                )}
              >
                Private
              </button>
            </div>
          )}
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
      
      {/* Chat content - only visible when not minimized */}
      {!minimized && (
        <>
          {/* Messages container */}
          <div 
            ref={chatMessagesRef}
            className="h-[calc(100%-96px)] px-3 py-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
          >
            {chatMessages.map((msg) => (
              <div 
                key={msg.id} 
                className={cn(
                  "mb-2 p-2 rounded",
                  msg.sender === "System" ? "bg-gray-700/40" : 
                  msg.type === "global" ? "bg-gray-800/40" :
                  msg.type === "zone" ? "bg-green-900/40" : "bg-purple-900/40"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={cn(
                    "font-semibold text-sm",
                    msg.sender === "System" ? "text-yellow-300" :
                    "text-blue-300"
                  )}>
                    {msg.sender}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {formatTimestamp(msg.timestamp)}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap break-words">
                  {msg.message}
                </p>
              </div>
            ))}
            
            {chatMessages.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-4">
                No messages yet. Start the conversation!
              </div>
            )}
          </div>
          
          {/* Private chat target selector - only visible for private chat */}
          {chatType === "private" && (
            <div className="px-3 py-2 bg-gray-800/70">
              <select 
                className="w-full bg-gray-900 text-white rounded px-2 py-1 text-sm"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              >
                <option value="">Select a player</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.username}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Chat input */}
          <form onSubmit={handleSendMessage} className="px-3 py-2 bg-gray-900">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Type your message...${chatType === "private" && !target ? " (Select a player first)" : ""}`}
                className="flex-1 bg-gray-800 text-white rounded px-3 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={chatType === "private" && !target}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:text-gray-300"
              >
                Send
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}