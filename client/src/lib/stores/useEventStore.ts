import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type EventAccessType = 'free' | 'paid' | 'nft-gated';

export interface EventType {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  image?: string;
  accessType: EventAccessType;
  price?: number;
  currency?: 'THC' | 'SOL' | 'USDC';
  nftRequirement?: string;
  capacity?: number;
  attendees: string[]; // Array of wallet addresses or user IDs
  organizer: string; // Wallet address or user ID
  isVirtual: boolean;
  meetingUrl?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface EventState {
  events: EventType[];
  addEvent: (event: Omit<EventType, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEvent: (id: string, updates: Partial<EventType>) => void;
  deleteEvent: (id: string) => void;
  registerForEvent: (eventId: string, attendeeId: string) => void;
  unregisterFromEvent: (eventId: string, attendeeId: string) => void;
  getEventsByMonth: (month: number, year: number) => EventType[];
  getUpcomingEvents: () => EventType[];
  getPastEvents: () => EventType[];
  getEventById: (id: string) => EventType | undefined;
  getUserEvents: (userId: string) => EventType[];
}

export const useEventStore = create<EventState>()(
  persist(
    (set, get) => ({
      events: [],
      
      addEvent: (eventData) => {
        const newEvent: EventType = {
          ...eventData,
          id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          events: [...state.events, newEvent]
        }));
        return newEvent;
      },
      
      updateEvent: (id, updates) => {
        set((state) => ({
          events: state.events.map((event) => 
            event.id === id 
              ? { ...event, ...updates, updatedAt: new Date() } 
              : event
          )
        }));
      },
      
      deleteEvent: (id) => {
        set((state) => ({
          events: state.events.filter((event) => event.id !== id)
        }));
      },
      
      registerForEvent: (eventId, attendeeId) => {
        set((state) => ({
          events: state.events.map((event) => 
            event.id === eventId && !event.attendees.includes(attendeeId)
              ? { 
                  ...event, 
                  attendees: [...event.attendees, attendeeId],
                  updatedAt: new Date()
                } 
              : event
          )
        }));
      },
      
      unregisterFromEvent: (eventId, attendeeId) => {
        set((state) => ({
          events: state.events.map((event) => 
            event.id === eventId
              ? { 
                  ...event, 
                  attendees: event.attendees.filter(id => id !== attendeeId),
                  updatedAt: new Date()
                } 
              : event
          )
        }));
      },
      
      getEventsByMonth: (month, year) => {
        return get().events.filter((event) => {
          const startDate = new Date(event.startDate);
          return startDate.getMonth() === month && startDate.getFullYear() === year;
        });
      },
      
      getUpcomingEvents: () => {
        const now = new Date();
        return get().events
          .filter((event) => new Date(event.startDate) > now)
          .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      },
      
      getPastEvents: () => {
        const now = new Date();
        return get().events
          .filter((event) => new Date(event.endDate) < now)
          .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
      },
      
      getEventById: (id) => {
        return get().events.find((event) => event.id === id);
      },
      
      getUserEvents: (userId) => {
        return get().events.filter(
          (event) => 
            event.organizer === userId || 
            event.attendees.includes(userId)
        );
      },
    }),
    {
      name: 'trade-hybrid-events',
    }
  )
);