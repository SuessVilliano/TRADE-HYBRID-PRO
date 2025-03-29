import React from 'react';
import { EventType } from '@/lib/stores/useEventStore';
import { EventCard } from './event-card';

interface EventGridProps {
  events: EventType[];
  onRegister: (eventId: string) => void;
  onUnregister: (eventId: string) => void;
  onViewDetails: (eventId: string) => void;
  compact?: boolean;
  emptyMessage?: string;
}

export function EventGrid({ 
  events, 
  onRegister, 
  onUnregister, 
  onViewDetails, 
  compact = false,
  emptyMessage = "No events found" 
}: EventGridProps) {
  if (!events || events.length === 0) {
    return (
      <div className="flex items-center justify-center h-60 w-full border border-dashed border-slate-600 rounded-lg">
        <div className="text-center space-y-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-slate-400">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${compact 
      ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' 
      : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'}`}
    >
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          onRegister={onRegister}
          onUnregister={onUnregister}
          onViewDetails={onViewDetails}
          compact={compact}
        />
      ))}
    </div>
  );
}