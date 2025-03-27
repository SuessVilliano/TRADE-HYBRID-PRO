import React from 'react';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { useMultiplayer } from '@/lib/stores/useMultiplayer';
import { X, User, Clock, BellOff, Wifi, WifiOff } from 'lucide-react';

export function UserStatusManager({ className = '' }: { className?: string }) {
  const { updateUserStatus, userStatuses, clientId } = useMultiplayer();
  
  // Get current user's status, default to 'online'
  const currentStatus = clientId 
    ? userStatuses.get(clientId)?.status || 'online' 
    : 'online';
  
  // Status options
  const statusOptions = [
    { value: 'online', label: 'Online', icon: Wifi, color: 'text-green-500' },
    { value: 'away', label: 'Away', icon: Clock, color: 'text-yellow-500' },
    { value: 'busy', label: 'Busy', icon: BellOff, color: 'text-red-500' },
    { value: 'offline', label: 'Appear Offline', icon: WifiOff, color: 'text-gray-500' },
  ];
  
  const getCurrentStatusIcon = () => {
    const status = statusOptions.find(opt => opt.value === currentStatus);
    if (!status) return null;
    
    const Icon = status.icon;
    return <Icon className={`w-4 h-4 ${status.color}`} />;
  };
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`relative gap-2 p-2 h-8 ${className}`}
        >
          {getCurrentStatusIcon()}
          <span className="text-xs">
            {statusOptions.find(opt => opt.value === currentStatus)?.label || 'Online'}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2">
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium mb-2">Set Status</p>
          {statusOptions.map((status) => {
            const Icon = status.icon;
            return (
              <Button
                key={status.value}
                variant={currentStatus === status.value ? "default" : "ghost"}
                size="sm"
                className="justify-start gap-2"
                onClick={() => {
                  updateUserStatus(status.value as 'online' | 'away' | 'busy' | 'offline');
                }}
              >
                <Icon className={`w-4 h-4 ${status.color}`} />
                <span>{status.label}</span>
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}