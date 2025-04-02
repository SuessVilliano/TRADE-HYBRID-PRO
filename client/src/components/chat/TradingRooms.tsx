import { useState } from "react";
import { useMultiplayer } from "../../lib/stores/useMultiplayer";
import { cn } from "../../lib/utils";

interface TradingRoomsProps {
  className?: string;
  onSelectRoom: (roomId: string) => void;
}

export default function TradingRooms({ className, onSelectRoom }: TradingRoomsProps) {
  const { tradingRooms, currentRoomId } = useMultiplayer();
  const [filter, setFilter] = useState("");
  
  const filteredRooms = filter 
    ? tradingRooms.filter(room => 
        room.name.toLowerCase().includes(filter.toLowerCase()) || 
        (room.description && room.description.toLowerCase().includes(filter.toLowerCase()))
      )
    : tradingRooms;
  
  return (
    <div className={cn("bg-gray-900 rounded-lg border border-gray-700 overflow-hidden", className)}>
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Trading Rooms</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search rooms..."
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
      
      <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600">
        {filteredRooms.length > 0 ? (
          filteredRooms.map((room) => (
            <div 
              key={room.id}
              onClick={() => onSelectRoom(room.id)}
              className={cn(
                "p-3 rounded-md cursor-pointer transition-colors",
                currentRoomId === room.id 
                  ? "bg-blue-600/20 border border-blue-500/50" 
                  : "bg-gray-800 hover:bg-gray-700 border border-gray-700"
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-medium text-white">{room.name}</h3>
                <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                  {room.members} online
                </span>
              </div>
              {room.description && (
                <p className="text-sm text-gray-400 mb-2">
                  {room.description}
                </p>
              )}
              <div className="flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectRoom(room.id);
                  }}
                  className={cn(
                    "text-xs px-3 py-1 rounded-md",
                    currentRoomId === room.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  )}
                >
                  {currentRoomId === room.id ? "Currently in" : "Join room"}
                </button>
              </div>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
            <p className="text-lg font-medium">No rooms found</p>
            <p className="text-sm">Try a different search term</p>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-700">
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2 font-medium transition-colors"
        >
          Create new room
        </button>
      </div>
    </div>
  );
}