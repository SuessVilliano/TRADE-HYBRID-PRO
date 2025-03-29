import React from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Clock, MapPin, Users, ExternalLink, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { EventType } from '@/lib/stores/useEventStore';
import { useUserStore } from '@/lib/stores/useUserStore';

interface EventCardProps {
  event: EventType;
  onRegister: (eventId: string) => void;
  onUnregister: (eventId: string) => void;
  onViewDetails: (eventId: string) => void;
  compact?: boolean;
}

export function EventCard({ event, onRegister, onUnregister, onViewDetails, compact = false }: EventCardProps) {
  const { user } = useUserStore();
  const isRegistered = user && user.id && event.attendees.includes(user.id);
  const isPastEvent = new Date(event.endDate) < new Date();
  const isOrganizer = user && user.id === event.organizer;
  
  const formatDateRange = () => {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    
    // Same day event
    if (start.toDateString() === end.toDateString()) {
      return `${format(start, 'MMM d, yyyy')} · ${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
    }
    
    // Multi-day event
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
  };

  const getAccessTypeLabel = () => {
    switch (event.accessType) {
      case 'free':
        return 'Free';
      case 'paid':
        return `${event.price} ${event.currency || 'THC'}`;
      case 'nft-gated':
        return 'NFT Required';
      default:
        return 'Free';
    }
  };

  const getAccessTypeColor = () => {
    switch (event.accessType) {
      case 'free':
        return 'bg-green-500';
      case 'paid':
        return 'bg-blue-500';
      case 'nft-gated':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (compact) {
    return (
      <Card className="h-full hover:shadow-md transition-shadow overflow-hidden flex flex-col">
        <div className="relative pb-[40%] bg-slate-800">
          {event.image ? (
            <img 
              src={event.image} 
              alt={event.title} 
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
              <CalendarIcon className="h-12 w-12 text-slate-400" />
            </div>
          )}
          <Badge 
            className={`absolute top-2 right-2 ${getAccessTypeColor()} text-white`}
          >
            {getAccessTypeLabel()}
          </Badge>
        </div>
        
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-lg line-clamp-1">{event.title}</CardTitle>
          <CardDescription className="flex items-center gap-1 mt-1">
            <CalendarIcon className="h-3 w-3" /> {format(new Date(event.startDate), 'MMM d, yyyy')}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-4 pt-2 flex-grow">
          <p className="text-sm text-slate-400 line-clamp-2">{event.description}</p>
        </CardContent>
        
        <CardFooter className="p-4 pt-0">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => onViewDetails(event.id)}
          >
            View Details
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="h-full hover:shadow-md transition-shadow overflow-hidden">
      <div className="relative pb-[40%] bg-slate-800">
        {event.image ? (
          <img 
            src={event.image} 
            alt={event.title} 
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
            <CalendarIcon className="h-16 w-16 text-slate-400" />
          </div>
        )}
        <Badge 
          className={`absolute top-3 right-3 ${getAccessTypeColor()} text-white`}
        >
          {getAccessTypeLabel()}
        </Badge>
      </div>
      
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle>{event.title}</CardTitle>
          {isPastEvent && (
            <Badge variant="outline" className="bg-slate-800 text-slate-200">
              Past Event
            </Badge>
          )}
        </div>
        <CardDescription className="flex items-center gap-1 mt-1.5">
          <CalendarIcon className="h-4 w-4" /> {formatDateRange()}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <p className="text-slate-300">{event.description}</p>
        
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-400" />
            <span>{event.isVirtual ? 'Virtual Event' : event.location}</span>
            {event.isVirtual && event.meetingUrl && (
              <a 
                href={event.meetingUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-auto text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                Join <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          
          {event.capacity && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-400" />
              <span>
                {event.attendees.length} / {event.capacity} attendees
              </span>
            </div>
          )}
          
          {event.accessType === 'nft-gated' && event.nftRequirement && (
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-slate-400" />
              <span>Requires {event.nftRequirement} NFT</span>
            </div>
          )}
        </div>
        
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2">
            {event.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex gap-2">
        <Button 
          variant="secondary" 
          className="flex-1"
          onClick={() => onViewDetails(event.id)}
        >
          View Details
        </Button>
        
        {!isPastEvent && !isOrganizer && (
          isRegistered ? (
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => onUnregister(event.id)}
            >
              Cancel Registration
            </Button>
          ) : (
            <Button 
              variant="default" 
              className="flex-1"
              onClick={() => onRegister(event.id)}
            >
              Register
            </Button>
          )
        )}
        
        {isOrganizer && (
          <Button 
            variant="outline" 
            className="flex-1"
          >
            Manage Event
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}