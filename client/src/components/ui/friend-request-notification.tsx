import { useState, useEffect } from "react";
import { useMultiplayer } from "../../lib/stores/useMultiplayer";
import { Button } from "./button";
import { UserCheck, UserX, User } from "lucide-react";
import { cn } from "../../lib/utils";
import { toast } from "sonner";

export function FriendRequestNotification() {
  const { friendRequests, acceptFriendRequest, rejectFriendRequest } = useMultiplayer();
  const [showNotification, setShowNotification] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<typeof friendRequests[0] | null>(null);
  
  useEffect(() => {
    // Show notification if there are friend requests
    if (friendRequests.length > 0 && !currentRequest) {
      // Get the most recent request
      const latestRequest = friendRequests[friendRequests.length - 1];
      setCurrentRequest(latestRequest);
      setShowNotification(true);
      
      // Auto-hide after 10 seconds if no action taken
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [friendRequests, currentRequest]);
  
  const handleAccept = () => {
    if (currentRequest) {
      acceptFriendRequest(currentRequest.id);
      toast.success(`You are now friends with ${currentRequest.senderUsername}`);
      setShowNotification(false);
      setCurrentRequest(null);
    }
  };
  
  const handleReject = () => {
    if (currentRequest) {
      rejectFriendRequest(currentRequest.id);
      toast.info(`You declined ${currentRequest.senderUsername}'s friend request`);
      setShowNotification(false);
      setCurrentRequest(null);
    }
  };
  
  const handleClose = () => {
    setShowNotification(false);
    // Don't clear the current request, so it won't show again right away
  };
  
  if (!showNotification || !currentRequest) {
    return null;
  }
  
  return (
    <div 
      className={cn(
        "fixed bottom-4 right-4 bg-gray-900/90 border border-blue-500/30 text-white rounded-lg p-4 shadow-lg z-50 transition-all duration-300 w-80",
        showNotification ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
      )}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-blue-400" />
          <h3 className="font-semibold">Friend Request</h3>
        </div>
        <button 
          onClick={handleClose}
          className="text-gray-400 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      <div className="bg-gray-800/50 rounded-md p-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center">
            <span className="text-sm font-bold">{currentRequest.senderUsername.slice(0, 2).toUpperCase()}</span>
          </div>
          <div>
            <p className="font-medium">{currentRequest.senderUsername}</p>
            <p className="text-xs text-gray-400">Sent you a friend request</p>
          </div>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button
          className="flex-1 bg-green-700 hover:bg-green-800"
          onClick={handleAccept}
        >
          <UserCheck className="h-4 w-4 mr-2" />
          Accept
        </Button>
        <Button
          className="flex-1 bg-red-700 hover:bg-red-800"
          onClick={handleReject}
        >
          <UserX className="h-4 w-4 mr-2" />
          Decline
        </Button>
      </div>
    </div>
  );
}