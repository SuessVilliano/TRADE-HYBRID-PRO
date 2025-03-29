import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format, parseISO, isAfter } from 'date-fns';
import { CalendarCheck, Grid3X3, Plus, Filter, Calendar as CalendarIcon, Share2 } from 'lucide-react';
import { useUserStore } from '@/lib/stores/useUserStore';
import { useEventStore, EventType } from '@/lib/stores/useEventStore';
import { EventCalendar } from '@/components/events/event-calendar';
import { EventGrid } from '@/components/events/event-grid';
import { EventCreateForm } from '@/components/events/event-create-form';
import { EventCard } from '@/components/events/event-card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PopupContainer } from '@/components/ui/popup-container';

export default function EventsPage() {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { 
    events, 
    addEvent, 
    updateEvent, 
    deleteEvent, 
    registerForEvent, 
    unregisterFromEvent, 
    getUpcomingEvents,
    getPastEvents,
    getEventById
  } = useEventStore();
  
  // UI States
  const [viewMode, setViewMode] = useState<'calendar' | 'grid'>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventType | undefined>(undefined);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventType | undefined>(undefined);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddToCalDialog, setShowAddToCalDialog] = useState(false);
  const [calendarEmail, setCalendarEmail] = useState('');
  
  // Filters
  const [filters, setFilters] = useState({
    showPastEvents: false,
    accessType: 'all',
    userEvents: 'all',
    searchTerm: '',
  });
  
  // Filter events based on current filters
  const filteredEvents = () => {
    let filtered = [...events];
    
    // Filter past events
    if (!filters.showPastEvents) {
      filtered = filtered.filter(event => isAfter(new Date(event.endDate), new Date()));
    }
    
    // Filter by access type
    if (filters.accessType !== 'all') {
      filtered = filtered.filter(event => event.accessType === filters.accessType);
    }
    
    // Filter by user events
    if (user && filters.userEvents !== 'all') {
      if (filters.userEvents === 'registered') {
        filtered = filtered.filter(event => user?.id && event.attendees.includes(user.id));
      } else if (filters.userEvents === 'organized') {
        filtered = filtered.filter(event => user?.id && event.organizer === user.id);
      }
    }
    
    // Filter by search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        event => 
          event.title.toLowerCase().includes(searchLower) ||
          event.description.toLowerCase().includes(searchLower) ||
          event.location.toLowerCase().includes(searchLower) ||
          event.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    return filtered;
  };
  
  // Sort events by date
  const sortedEvents = () => {
    return filteredEvents().sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  };
  
  const featuredEvents = () => {
    // Get upcoming events and take the first 3
    return getUpcomingEvents().slice(0, 3);
  };
  
  // Handle event actions
  const handleRegisterForEvent = (eventId: string) => {
    if (!user) {
      // Handle unauthenticated users
      alert('Please sign in to register for events');
      return;
    }
    
    if (user?.id) {
      registerForEvent(eventId, user.id);
    }
  };
  
  const handleUnregisterFromEvent = (eventId: string) => {
    if (!user || !user.id) return;
    unregisterFromEvent(eventId, user.id);
  };
  
  const handleViewEventDetails = (eventId: string) => {
    const event = getEventById(eventId);
    if (event) {
      setSelectedEvent(event);
      setShowEventDetails(true);
    }
  };
  
  const handleCreateEvent = (eventData: Omit<EventType, 'id' | 'createdAt' | 'updatedAt'>) => {
    addEvent(eventData);
    setShowCreateForm(false);
  };
  
  const handleEditEvent = (eventData: Omit<EventType, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingEvent) {
      updateEvent(editingEvent.id, eventData);
      setIsEditing(false);
      setEditingEvent(undefined);
      setShowCreateForm(false);
    }
  };
  
  const handleDeleteEvent = () => {
    if (selectedEvent) {
      deleteEvent(selectedEvent.id);
      setShowDeleteConfirm(false);
      setShowEventDetails(false);
    }
  };
  
  const startEditEvent = (event: EventType) => {
    setEditingEvent(event);
    setIsEditing(true);
    setShowCreateForm(true);
    setShowEventDetails(false);
  };
  
  const closeCreateForm = () => {
    setShowCreateForm(false);
    setIsEditing(false);
    setEditingEvent(undefined);
  };
  
  const handleAddToCalendar = () => {
    if (selectedEvent && calendarEmail) {
      // In a real implementation, this would integrate with a calendar service
      // For now, we'll just show a success message
      alert(`Event details would be sent to ${calendarEmail}`);
      setShowAddToCalDialog(false);
      setCalendarEmail('');
    }
  };
  
  const handleShareEvent = () => {
    if (selectedEvent) {
      // Create a shareable link (in a real app this would generate a unique URL)
      const shareableLink = `${window.location.origin}/events/${selectedEvent.id}`;
      
      // Copy to clipboard
      navigator.clipboard.writeText(shareableLink)
        .then(() => {
          alert('Link copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy link: ', err);
        });
    }
  };
  
  // Add some sample events for demonstration
  useEffect(() => {
    // Only add sample events if none exist yet
    if (events.length === 0) {
      // Sample event for Global Virtual Event
      const globalEvent: Omit<EventType, 'id' | 'createdAt' | 'updatedAt'> = {
        title: 'Global Virtual Trading Summit 2025',
        description: 'Join us for our flagship virtual event featuring top industry experts, live trading sessions, and networking opportunities. This premier event will showcase the latest trading strategies and technologies.',
        startDate: new Date('2025-12-10T09:00:00'),
        endDate: new Date('2025-12-12T18:00:00'),
        location: 'Global',
        isVirtual: true,
        meetingUrl: 'https://meet.tradehybrid.club/summit2025',
        accessType: 'paid',
        price: 99.99,
        currency: 'THC',
        capacity: 5000,
        attendees: [],
        organizer: user?.id || 'tradehybrid',
        tags: ['summit', 'trading', 'global', 'virtual', 'networking'],
        image: '/images/global-summit-2025.jpg',
      };
      
      // Add more sample events
      const cryptoMasterclass: Omit<EventType, 'id' | 'createdAt' | 'updatedAt'> = {
        title: 'Crypto Trading Masterclass',
        description: 'Learn advanced cryptocurrency trading techniques and strategies from our expert traders. This exclusive event is perfect for intermediate to advanced traders.',
        startDate: new Date('2025-08-15T10:00:00'),
        endDate: new Date('2025-08-15T16:00:00'),
        location: 'Virtual',
        isVirtual: true,
        meetingUrl: 'https://meet.tradehybrid.club/masterclass',
        accessType: 'nft-gated',
        nftRequirement: 'Trade Hybrid Pro NFT',
        capacity: 100,
        attendees: [],
        organizer: user?.id || 'tradehybrid',
        tags: ['crypto', 'masterclass', 'trading', 'education'],
        image: '/images/crypto-masterclass.jpg',
      };
      
      // Miami Trading Retreat
      const miamiRetreat: Omit<EventType, 'id' | 'createdAt' | 'updatedAt'> = {
        title: 'Miami Trading Retreat',
        description: 'Join us for a luxurious 3-day trading retreat in Miami. Network with fellow traders, participate in live trading sessions, and enjoy exclusive social events.',
        startDate: new Date('2025-06-25T09:00:00'),
        endDate: new Date('2025-06-27T17:00:00'),
        location: 'Miami Beach Resort, FL',
        isVirtual: false,
        accessType: 'paid',
        price: 1499.99,
        currency: 'USDC',
        capacity: 50,
        attendees: [],
        organizer: user?.id || 'tradehybrid',
        tags: ['retreat', 'miami', 'networking', 'luxury'],
        image: '/images/miami-retreat.jpg',
      };
      
      // Add a free webinar
      const freeWebinar: Omit<EventType, 'id' | 'createdAt' | 'updatedAt'> = {
        title: 'Introduction to Trade Hybrid Platform',
        description: 'A free webinar introducing the Trade Hybrid platform and its features. Perfect for newcomers to the platform.',
        startDate: new Date('2025-04-10T18:00:00'),
        endDate: new Date('2025-04-10T19:30:00'),
        location: 'Virtual',
        isVirtual: true,
        meetingUrl: 'https://meet.tradehybrid.club/intro',
        accessType: 'free',
        attendees: [],
        organizer: user?.id || 'tradehybrid',
        tags: ['webinar', 'introduction', 'beginner', 'free'],
        image: '/images/intro-webinar.jpg',
      };
      
      // Add the events to the store
      addEvent(globalEvent);
      addEvent(cryptoMasterclass);
      addEvent(miamiRetreat);
      addEvent(freeWebinar);
    }
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold">Events</h1>
            <p className="text-slate-400 mt-1">
              Discover events, retreats, masterminds, and more in the Trade Hybrid community
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            
            <div className="bg-slate-700 p-1 rounded-md flex">
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                className="rounded-r-none"
              >
                <CalendarIcon className="h-4 w-4 mr-1" />
                Calendar
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-l-none"
              >
                <Grid3X3 className="h-4 w-4 mr-1" />
                Grid
              </Button>
            </div>
            
            <Button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          </div>
        </div>
        
        {/* Filters panel */}
        {showFilters && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="searchTerm" className="mb-1.5 block">Search</Label>
                  <Input
                    id="searchTerm"
                    placeholder="Search events..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="accessType" className="mb-1.5 block">Access Type</Label>
                  <Select
                    value={filters.accessType}
                    onValueChange={(value) => setFilters({...filters, accessType: value})}
                  >
                    <SelectTrigger id="accessType">
                      <SelectValue placeholder="Filter by access" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Events</SelectItem>
                      <SelectItem value="free">Free Events</SelectItem>
                      <SelectItem value="paid">Paid Events</SelectItem>
                      <SelectItem value="nft-gated">NFT-Gated Events</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {user && (
                  <div>
                    <Label htmlFor="userEvents" className="mb-1.5 block">Your Events</Label>
                    <Select
                      value={filters.userEvents}
                      onValueChange={(value) => setFilters({...filters, userEvents: value})}
                    >
                      <SelectTrigger id="userEvents">
                        <SelectValue placeholder="Filter by your events" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Events</SelectItem>
                        <SelectItem value="registered">Registered Events</SelectItem>
                        <SelectItem value="organized">Organized by You</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="flex items-end">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="showPastEvents" 
                      checked={filters.showPastEvents} 
                      onCheckedChange={(checked) => 
                        setFilters({...filters, showPastEvents: checked as boolean})
                      }
                    />
                    <Label htmlFor="showPastEvents">Show past events</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Featured Events */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Featured Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredEvents().map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onRegister={handleRegisterForEvent}
                onUnregister={handleUnregisterFromEvent}
                onViewDetails={handleViewEventDetails}
                compact={true}
              />
            ))}
            
            {/* If there are no featured events, show a promotional banner for the Global Virtual Event */}
            {featuredEvents().length === 0 && (
              <Card className="col-span-1 md:col-span-3 bg-gradient-to-r from-blue-900 to-purple-900 overflow-hidden">
                <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-2xl font-bold text-white mb-2">Global Virtual Event December 2025</h3>
                    <p className="text-blue-100 mb-4">Our biggest event of the year - save the date!</p>
                    <Button 
                      onClick={() => {
                        const event = events.find(e => e.title.includes('Global Virtual Trading Summit'));
                        if (event) {
                          handleViewEventDetails(event.id);
                        }
                      }} 
                      className="bg-white text-blue-900 hover:bg-blue-50"
                    >
                      Learn More
                    </Button>
                  </div>
                  <div className="w-full md:w-auto">
                    <img 
                      src="/images/global-summit-promo.jpg" 
                      alt="Global Virtual Event" 
                      className="rounded-lg w-full max-w-md h-auto shadow-lg"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        {/* Upcoming Events Highlight */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Upcoming Events</h2>
            <Button 
              variant="link" 
              onClick={() => setFilters({...filters, showPastEvents: false})}
              className="text-blue-400 hover:text-blue-300"
            >
              View All
            </Button>
          </div>
          
          <EventGrid
            events={getUpcomingEvents().slice(0, 3)}
            onRegister={handleRegisterForEvent}
            onUnregister={handleUnregisterFromEvent}
            onViewDetails={handleViewEventDetails}
            compact={true}
            emptyMessage="No upcoming events"
          />
        </div>
      </header>
      
      <main>
        {viewMode === 'calendar' ? (
          <EventCalendar
            events={sortedEvents()}
            onDateSelect={setSelectedDate}
            onAddEvent={() => setShowCreateForm(true)}
            onEventClick={handleViewEventDetails}
          />
        ) : (
          <EventGrid
            events={sortedEvents()}
            onRegister={handleRegisterForEvent}
            onUnregister={handleUnregisterFromEvent}
            onViewDetails={handleViewEventDetails}
            emptyMessage={
              filters.searchTerm 
                ? `No events found for "${filters.searchTerm}"` 
                : "No events found with current filters"
            }
          />
        )}
      </main>
      
      {/* Create/Edit Event Form */}
      {showCreateForm && (
        <PopupContainer>
          <div className="p-4 max-w-4xl mx-auto">
            <EventCreateForm
              onSubmit={isEditing ? handleEditEvent : handleCreateEvent}
              onCancel={closeCreateForm}
              initialEvent={editingEvent}
              isEdit={isEditing}
            />
          </div>
        </PopupContainer>
      )}
      
      {/* Event Details Dialog */}
      {showEventDetails && selectedEvent && (
        <Dialog open={showEventDetails} onOpenChange={setShowEventDetails}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex justify-between items-start">
                <DialogTitle className="text-2xl">{selectedEvent.title}</DialogTitle>
                <Badge className={
                  selectedEvent.accessType === 'free' 
                    ? 'bg-green-500' 
                    : selectedEvent.accessType === 'paid' 
                      ? 'bg-blue-500' 
                      : 'bg-purple-500'
                }>
                  {selectedEvent.accessType === 'free' 
                    ? 'Free' 
                    : selectedEvent.accessType === 'paid' 
                      ? `${selectedEvent.price} ${selectedEvent.currency}` 
                      : 'NFT Required'}
                </Badge>
              </div>
              <DialogDescription>
                {format(new Date(selectedEvent.startDate), 'EEEE, MMMM d, yyyy')} at {format(new Date(selectedEvent.startDate), 'h:mm a')}
              </DialogDescription>
            </DialogHeader>
            
            <div className="relative pb-[40%] bg-slate-800 rounded-md overflow-hidden mb-4">
              {selectedEvent.image ? (
                <img 
                  src={selectedEvent.image} 
                  alt={selectedEvent.title} 
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
                  <CalendarCheck className="h-16 w-16 text-slate-500" />
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">About this event</h3>
                <p className="text-slate-300 whitespace-pre-line">{selectedEvent.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-1">Date and Time</h4>
                  <p className="text-slate-200">
                    {format(new Date(selectedEvent.startDate), 'MMMM d, yyyy')}
                    <br />
                    {format(new Date(selectedEvent.startDate), 'h:mm a')} - {format(new Date(selectedEvent.endDate), 'h:mm a')}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-1">Location</h4>
                  <p className="text-slate-200">
                    {selectedEvent.isVirtual ? 'Virtual Event' : selectedEvent.location}
                    {selectedEvent.isVirtual && selectedEvent.meetingUrl && (
                      <a 
                        href={selectedEvent.meetingUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block mt-1 text-blue-400 hover:text-blue-300"
                      >
                        Join Event
                      </a>
                    )}
                  </p>
                </div>
                
                {selectedEvent.capacity && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-1">Capacity</h4>
                    <p className="text-slate-200">
                      {selectedEvent.attendees.length} / {selectedEvent.capacity} attendees
                    </p>
                  </div>
                )}
                
                {selectedEvent.accessType === 'nft-gated' && selectedEvent.nftRequirement && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-1">NFT Requirement</h4>
                    <p className="text-slate-200">
                      {selectedEvent.nftRequirement}
                    </p>
                  </div>
                )}
              </div>
              
              {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-1">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedEvent.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter className="sm:justify-between flex-col sm:flex-row gap-2 sm:gap-0">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddToCalDialog(true)}
                >
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Add to Calendar
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShareEvent}
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
              
              <div className="flex gap-2">
                {user && user.id && selectedEvent.organizer === user.id && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditEvent(selectedEvent)}
                    >
                      Edit
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      Delete
                    </Button>
                  </>
                )}
                
                {!isAfter(new Date(selectedEvent.endDate), new Date()) ? (
                  <Badge variant="outline" className="ml-2 py-1 bg-slate-800 text-slate-300">
                    Event Ended
                  </Badge>
                ) : user && user.id && selectedEvent.attendees.includes(user.id) ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleUnregisterFromEvent(selectedEvent.id);
                      setShowEventDetails(false);
                    }}
                  >
                    Cancel Registration
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      handleRegisterForEvent(selectedEvent.id);
                      setShowEventDetails(false);
                    }}
                  >
                    Register
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Add to Calendar Dialog */}
      {showAddToCalDialog && (
        <Dialog open={showAddToCalDialog} onOpenChange={setShowAddToCalDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add to Calendar</DialogTitle>
              <DialogDescription>
                Enter your email to receive calendar invitation
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="calendarEmail">Email</Label>
                <Input
                  id="calendarEmail"
                  value={calendarEmail}
                  onChange={(e) => setCalendarEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  id="sendReminders"
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-500"
                />
                <Label htmlFor="sendReminders" className="text-sm">Send event reminders</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAddToCalDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddToCalendar}
                disabled={!calendarEmail}
              >
                Add to Calendar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event
              and remove the data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEvent} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}