import { useState, useRef, useEffect } from "react";
import { useMultiplayer, TradeSignal } from "../../lib/stores/useMultiplayer";
import { formatDistanceToNow } from "date-fns";
import { cn } from "../../lib/utils";
import TradeSignalMessage from "./TradeSignalMessage";

interface DirectMessageConversationProps {
  className?: string;
  userId: string;
  onBack: () => void;
}

export default function DirectMessageConversation({ 
  className, 
  userId,
  onBack
}: DirectMessageConversationProps) {
  const [message, setMessage] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const [attachingTradeSignal, setAttachingTradeSignal] = useState(false);
  const [tradeSignal, setTradeSignal] = useState<TradeSignal>({
    symbol: "",
    side: "buy",
    entryPrice: undefined,
    takeProfit: undefined,
    stopLoss: undefined,
    timeframe: "1h",
    description: ""
  });
  
  const { chatMessages, sendChatMessage, currentUser, players } = useMultiplayer();
  const recipientUser = players.find(player => player.id === userId);
  
  const messageInputRef = useRef<HTMLInputElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages]);
  
  // Filter messages for this conversation
  const filteredMessages = chatMessages.filter(msg => 
    (msg.type === "private" && 
      ((msg.senderId === currentUser?.id && msg.target === userId) || 
       (msg.senderId === userId && msg.target === currentUser?.id))
    )
  );
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() && !attachingTradeSignal) return;
    if (!currentUser) return;
    
    const messageToSend = message.trim() || (attachingTradeSignal ? "Sharing a trade signal" : "");
    
    // Send the private message
    sendChatMessage(
      messageToSend, 
      "private", 
      userId,
      attachingTradeSignal ? tradeSignal : undefined
    );
    
    // Clear the input and trade signal
    setMessage("");
    if (attachingTradeSignal) {
      setAttachingTradeSignal(false);
      setTradeSignal({
        symbol: "",
        side: "buy",
        entryPrice: undefined,
        takeProfit: undefined,
        stopLoss: undefined,
        timeframe: "1h",
        description: ""
      });
    }
    
    // Focus back on the input
    messageInputRef.current?.focus();
  };
  
  const formatTimestamp = (timestamp: number) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };
  
  return (
    <div className={cn("bg-gray-900 text-white rounded-lg overflow-hidden border border-gray-700 shadow-xl", className)}>
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 flex items-center border-b border-gray-700">
        <button 
          onClick={onBack}
          className="mr-2 text-gray-400 hover:text-gray-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
        
        <div className="flex items-center">
          <div className="relative mr-3">
            {recipientUser?.avatarUrl ? (
              <img 
                src={recipientUser.avatarUrl} 
                alt={recipientUser.username}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-semibold">
                {recipientUser?.username.charAt(0).toUpperCase()}
              </div>
            )}
            <div className={cn(
              "absolute bottom-0 right-0 w-2 h-2 rounded-full border border-gray-900",
              recipientUser?.isOnline ? "bg-green-500" : "bg-gray-500"
            )}></div>
          </div>
          <div>
            <h3 className="font-medium">{recipientUser?.username}</h3>
            <p className="text-xs text-gray-400">
              {recipientUser?.isOnline ? (
                <span className="text-green-400">Online</span>
              ) : (
                <span>Last seen {formatDistanceToNow(recipientUser?.lastSeen || new Date(), { addSuffix: true })}</span>
              )}
            </p>
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div 
        ref={chatMessagesRef}
        className="h-[400px] px-4 py-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent space-y-4"
      >
        {filteredMessages.length > 0 ? (
          filteredMessages.map((msg) => (
            <div 
              key={msg.id} 
              className={cn(
                "group",
                msg.senderId === currentUser?.id ? "text-right" : "text-left"
              )}
            >
              <div className={cn(
                "inline-block max-w-[85%] rounded-lg p-3",
                msg.senderId === currentUser?.id ? "bg-blue-600" : "bg-gray-800"
              )}>
                <div className="flex items-center gap-2 mb-1 justify-end">
                  <span className="text-xs text-gray-300">
                    {formatTimestamp(msg.timestamp)}
                  </span>
                </div>
                
                {msg.isDeleted ? (
                  <p className="text-sm italic text-gray-400">This message has been deleted</p>
                ) : (
                  <>
                    <p className="text-sm whitespace-pre-wrap break-words text-left">
                      {msg.message}
                    </p>
                    
                    {msg.tradeSignal && (
                      <div className="mt-2 border-t border-gray-700 pt-2">
                        <TradeSignalMessage signal={msg.tradeSignal} />
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {/* Message actions */}
              {msg.senderId === currentUser?.id && !msg.isDeleted && (
                <div className="mt-1 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    className="text-xs text-gray-400 hover:text-gray-200"
                    title="Edit message"
                  >
                    Edit
                  </button>
                  <button 
                    className="text-xs text-gray-400 hover:text-red-400"
                    title="Delete message"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>No messages yet with {recipientUser?.username}.</p>
            <p>Start the conversation!</p>
          </div>
        )}
      </div>
      
      {/* Trade signal form - only visible when attaching a signal */}
      {attachingTradeSignal && (
        <div className="px-4 py-3 bg-gray-800 border-t border-b border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-semibold">Attach Trade Signal</h4>
            <button 
              onClick={() => setAttachingTradeSignal(false)}
              className="text-gray-400 hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Symbol</label>
              <input 
                type="text" 
                value={tradeSignal.symbol}
                onChange={(e) => setTradeSignal({...tradeSignal, symbol: e.target.value.toUpperCase()})}
                placeholder="e.g. BTCUSD"
                className="w-full bg-gray-900 text-white text-sm rounded px-2 py-1 border border-gray-700 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Side</label>
              <select
                value={tradeSignal.side}
                onChange={(e) => setTradeSignal({...tradeSignal, side: e.target.value as "buy" | "sell"})}
                className="w-full bg-gray-900 text-white text-sm rounded px-2 py-1 border border-gray-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-2">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Entry</label>
              <input 
                type="number" 
                value={tradeSignal.entryPrice || ""}
                onChange={(e) => setTradeSignal({...tradeSignal, entryPrice: parseFloat(e.target.value) || undefined})}
                placeholder="Entry"
                className="w-full bg-gray-900 text-white text-sm rounded px-2 py-1 border border-gray-700 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">TP</label>
              <input 
                type="number" 
                value={tradeSignal.takeProfit || ""}
                onChange={(e) => setTradeSignal({...tradeSignal, takeProfit: parseFloat(e.target.value) || undefined})}
                placeholder="Take Profit"
                className="w-full bg-gray-900 text-white text-sm rounded px-2 py-1 border border-gray-700 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">SL</label>
              <input 
                type="number" 
                value={tradeSignal.stopLoss || ""}
                onChange={(e) => setTradeSignal({...tradeSignal, stopLoss: parseFloat(e.target.value) || undefined})}
                placeholder="Stop Loss"
                className="w-full bg-gray-900 text-white text-sm rounded px-2 py-1 border border-gray-700 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          
          <div className="mb-2">
            <label className="block text-xs text-gray-400 mb-1">Timeframe</label>
            <select
              value={tradeSignal.timeframe}
              onChange={(e) => setTradeSignal({...tradeSignal, timeframe: e.target.value})}
              className="w-full bg-gray-900 text-white text-sm rounded px-2 py-1 border border-gray-700 focus:border-blue-500 focus:outline-none"
            >
              <option value="1m">1 minute</option>
              <option value="5m">5 minutes</option>
              <option value="15m">15 minutes</option>
              <option value="30m">30 minutes</option>
              <option value="1h">1 hour</option>
              <option value="4h">4 hours</option>
              <option value="1d">1 day</option>
              <option value="1w">1 week</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 mb-1">Description</label>
            <textarea 
              value={tradeSignal.description}
              onChange={(e) => setTradeSignal({...tradeSignal, description: e.target.value})}
              placeholder="Add some details about this trade setup..."
              className="w-full bg-gray-900 text-white text-sm rounded px-2 py-1 border border-gray-700 focus:border-blue-500 focus:outline-none"
              rows={2}
            />
          </div>
        </div>
      )}
      
      {/* Message input */}
      <form onSubmit={handleSendMessage} className="px-4 py-3 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAttachingTradeSignal(!attachingTradeSignal)}
            className={cn(
              "text-gray-400 hover:text-gray-200 p-1",
              attachingTradeSignal && "text-blue-500"
            )}
            title="Attach trade signal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </button>
          
          <button
            type="button"
            onClick={() => setShowEmojis(!showEmojis)}
            className={cn(
              "text-gray-400 hover:text-gray-200 p-1",
              showEmojis && "text-yellow-500"
            )}
            title="Insert emoji"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          
          <input
            ref={messageInputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-gray-900 text-white text-sm rounded-full px-4 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
          />
          
          <button
            type="submit"
            className={cn(
              "rounded-full w-9 h-9 flex items-center justify-center",
              message.trim() || attachingTradeSignal 
                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                : "bg-gray-700 text-gray-400"
            )}
            disabled={!message.trim() && !attachingTradeSignal}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}