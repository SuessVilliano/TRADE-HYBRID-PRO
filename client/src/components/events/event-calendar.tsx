import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isWithinInterval } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { EventType } from '@/lib/stores/useEventStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface EventDot {
  date: Date;
  events: EventType[];
}

interface EventCalendarProps {
  events: EventType[];
  onDateSelect: (date: Date) => void;
  onAddEvent: () => void;
  onEventClick: (eventId: string) => void;
  showControls?: boolean;
}

export function EventCalendar({ events, onDateSelect, onAddEvent, onEventClick, showControls = true }: EventCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [eventDots, setEventDots] = useState<EventDot[]>([]);
  const [eventsOnSelectedDate, setEventsOnSelectedDate] = useState<EventType[]>([]);

  // Process events to create event dots for the calendar
  useEffect(() => {
    if (!events || events.length === 0) {
      setEventDots([]);
      return;
    }

    const dots: EventDot[] = [];
    const startDate = startOfMonth(currentMonth);
    const endDate = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });

    daysInMonth.forEach(day => {
      const eventsOnThisDay = events.filter(event => {
        const eventStart = new Date(event.startDate);
        const eventEnd = new Date(event.endDate);
        return isWithinInterval(day, { start: eventStart, end: eventEnd })
              || isSameDay(day, eventStart) 
              || isSameDay(day, eventEnd);
      });

      if (eventsOnThisDay.length > 0) {
        dots.push({
          date: day,
          events: eventsOnThisDay
        });
      }
    });

    setEventDots(dots);
  }, [currentMonth, events]);

  // Update selected date events
  useEffect(() => {
    if (!selectedDate || !events || events.length === 0) {
      setEventsOnSelectedDate([]);
      return;
    }

    const filtered = events.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      return isWithinInterval(selectedDate, { start: eventStart, end: eventEnd }) ||
             isSameDay(selectedDate, eventStart) ||
             isSameDay(selectedDate, eventEnd);
    });

    setEventsOnSelectedDate(filtered);
  }, [selectedDate, events]);

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      onDateSelect(date);
    }
  };

  // Custom render function for day cells
  const renderDay = (date: Date, modifiers: any = {}) => {
    const hasEvents = eventDots.some(dot => isSameDay(dot.date, date));
    const isSelected = selectedDate && isSameDay(date, selectedDate);
    const isOutsideCurrentMonth = !isSameMonth(date, currentMonth);

    return (
      <div className="relative w-full h-full">
        <div className={`
          absolute top-1 right-1 left-1 bottom-1 flex items-center justify-center rounded-full
          ${isSelected ? 'bg-blue-500 text-white' : ''}
          ${isOutsideCurrentMonth ? 'opacity-50' : ''}
        `}>
          {format(date, 'd')}
        </div>
        {hasEvents && (
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
            {eventDots
              .filter(dot => isSameDay(dot.date, date))
              .flatMap(dot => dot.events)
              .slice(0, 3)  // Limit to 3 dots
              .map((event, idx) => {
                // Different colors for different event types
                let bgColor = 'bg-blue-500';
                if (event.accessType === 'paid') bgColor = 'bg-green-500';
                if (event.accessType === 'nft-gated') bgColor = 'bg-purple-500';
                
                return (
                  <div 
                    key={`${event.id}_${idx}`}
                    className={`w-1 h-1 rounded-full ${bgColor}`}
                  />
                );
              })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Event Calendar</h3>
        
        {showControls && (
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handlePrevMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[100px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button 
              variant="default" 
              size="sm"
              onClick={onAddEvent}
              className="ml-2"
            >
              <Plus className="h-4 w-4 mr-1" /> New Event
            </Button>
          </div>
        )}
      </div>
      
      <div className="flex flex-col lg:flex-row gap-4">
        <Card className="lg:w-3/5">
          <CardContent className="p-4">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="rounded-md border"
              // Custom day rendering using classNames and cell content override
              classNames={{
                day_selected: "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white",
                day_today: "bg-slate-700 text-white",
              }}
            />
          </CardContent>
        </Card>
        
        <Card className="lg:w-2/5">
          <CardContent className="p-4 h-full">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-md font-medium">
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
              </h4>
              <span className="text-sm text-slate-400">
                {eventsOnSelectedDate.length} event{eventsOnSelectedDate.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            {eventsOnSelectedDate.length > 0 ? (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                {eventsOnSelectedDate.map((event) => (
                  <div 
                    key={event.id}
                    className="p-3 rounded-md bg-slate-800 border border-slate-700 hover:border-slate-600 cursor-pointer transition-colors"
                    onClick={() => onEventClick(event.id)}
                  >
                    <div className="flex justify-between items-start">
                      <h5 className="font-medium">{event.title}</h5>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        event.accessType === 'free' ? 'bg-green-500/20 text-green-500' :
                        event.accessType === 'paid' ? 'bg-blue-500/20 text-blue-500' :
                        'bg-purple-500/20 text-purple-500'
                      }`}>
                        {event.accessType === 'free' ? 'Free' : 
                         event.accessType === 'paid' ? `${event.price} ${event.currency}` : 
                         'NFT'}
                      </span>
                    </div>
                    
                    <div className="mt-1 text-xs text-slate-400">
                      {format(new Date(event.startDate), 'h:mm a')} - {format(new Date(event.endDate), 'h:mm a')}
                    </div>
                    
                    <div className="mt-2 text-sm line-clamp-2 text-slate-300">
                      {event.description}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[250px] border border-dashed border-slate-700 rounded-md">
                <div className="text-center">
                  <div className="text-slate-400 mb-2">No events on this date</div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onAddEvent}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Event
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}