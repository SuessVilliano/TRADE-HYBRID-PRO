import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useUserStore } from '@/lib/stores/useUserStore';
import { EventAccessType, EventType } from '@/lib/stores/useEventStore';
import { cn } from '@/lib/utils';

interface EventCreateFormProps {
  onSubmit: (event: Omit<EventType, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  initialEvent?: EventType;
  isEdit?: boolean;
}

export function EventCreateForm({ onSubmit, onCancel, initialEvent, isEdit = false }: EventCreateFormProps) {
  const { user } = useUserStore();
  const [title, setTitle] = useState(initialEvent?.title || '');
  const [description, setDescription] = useState(initialEvent?.description || '');
  const [startDate, setStartDate] = useState<Date>(initialEvent?.startDate ? new Date(initialEvent.startDate) : new Date());
  const [endDate, setEndDate] = useState<Date>(initialEvent?.endDate ? new Date(initialEvent.endDate) : new Date());
  const [startTime, setStartTime] = useState(initialEvent?.startDate ? format(new Date(initialEvent.startDate), 'HH:mm') : '09:00');
  const [endTime, setEndTime] = useState(initialEvent?.endDate ? format(new Date(initialEvent.endDate), 'HH:mm') : '17:00');
  const [location, setLocation] = useState(initialEvent?.location || '');
  const [isVirtual, setIsVirtual] = useState(initialEvent?.isVirtual || false);
  const [meetingUrl, setMeetingUrl] = useState(initialEvent?.meetingUrl || '');
  const [accessType, setAccessType] = useState<EventAccessType>(initialEvent?.accessType || 'free');
  const [price, setPrice] = useState<number | undefined>(initialEvent?.price || undefined);
  const [currency, setCurrency] = useState<'THC' | 'SOL' | 'USDC'>(initialEvent?.currency || 'THC');
  const [nftRequirement, setNftRequirement] = useState(initialEvent?.nftRequirement || '');
  const [capacity, setCapacity] = useState<number | undefined>(initialEvent?.capacity || undefined);
  const [tags, setTags] = useState<string[]>(initialEvent?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [imageUrl, setImageUrl] = useState(initialEvent?.image || '');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleStartDateSelect = (date: Date | undefined) => {
    if (date) {
      setStartDate(date);
      
      // If end date is before start date, update end date
      if (date > endDate) {
        setEndDate(date);
      }
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (date && date >= startDate) {
      setEndDate(date);
    }
  };

  const handleStartTimeChange = (time: string) => {
    setStartTime(time);
    
    // If end time is before start time on the same day, update end time
    if (startDate.getTime() === endDate.getTime() && time > endTime) {
      setEndTime(time);
    }
  };

  const handleAccessTypeChange = (value: string) => {
    setAccessType(value as EventAccessType);
    
    // Reset related fields when changing access type
    if (value === 'free') {
      setPrice(undefined);
      setNftRequirement('');
    } else if (value === 'nft-gated') {
      setPrice(undefined);
    }
  };

  const handleTagAdd = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!location.trim() && !isVirtual) newErrors.location = 'Location is required for in-person events';
    if (isVirtual && !meetingUrl.trim()) newErrors.meetingUrl = 'Meeting URL is required for virtual events';
    
    if (accessType === 'paid' && (!price || price <= 0)) {
      newErrors.price = 'Valid price is required for paid events';
    }
    
    if (accessType === 'nft-gated' && !nftRequirement.trim()) {
      newErrors.nftRequirement = 'NFT requirement is required for NFT-gated events';
    }
    
    // Validate capacity if provided
    if (capacity !== undefined && capacity <= 0) {
      newErrors.capacity = 'Capacity must be greater than zero';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    // Combine date and time for start and end
    const combinedStartDate = new Date(startDate);
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    combinedStartDate.setHours(startHours, startMinutes);
    
    const combinedEndDate = new Date(endDate);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    combinedEndDate.setHours(endHours, endMinutes);
    
    // Create the event object
    const eventData: Omit<EventType, 'id' | 'createdAt' | 'updatedAt'> = {
      title,
      description,
      startDate: combinedStartDate,
      endDate: combinedEndDate,
      location,
      isVirtual,
      meetingUrl: isVirtual ? meetingUrl : undefined,
      accessType,
      price: accessType === 'paid' ? price : undefined,
      currency: accessType === 'paid' ? currency : undefined,
      nftRequirement: accessType === 'nft-gated' ? nftRequirement : undefined,
      capacity,
      image: imageUrl,
      attendees: initialEvent?.attendees || [],
      organizer: initialEvent?.organizer || (user?.id || 'unknown'),
      tags,
    };
    
    onSubmit(eventData);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">{isEdit ? 'Edit Event' : 'Create New Event'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Event Title <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter event title"
                className={cn(errors.title && "border-red-500")}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>
            
            <div>
              <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter event description"
                className={cn("min-h-[100px]", errors.description && "border-red-500")}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Start Date <span className="text-red-500">*</span></Label>
                <div className="flex mt-1.5">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={handleStartDateSelect}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div>
                <Label htmlFor="startTime">Start Time <span className="text-red-500">*</span></Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              
              <div>
                <Label>End Date <span className="text-red-500">*</span></Label>
                <div className="flex mt-1.5">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={handleEndDateSelect}
                        disabled={(date) => date < startDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div>
                <Label htmlFor="endTime">End Time <span className="text-red-500">*</span></Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isVirtual"
                checked={isVirtual}
                onCheckedChange={setIsVirtual}
              />
              <Label htmlFor="isVirtual">Virtual Event</Label>
            </div>
            
            {isVirtual ? (
              <div>
                <Label htmlFor="meetingUrl">Meeting URL {isVirtual && <span className="text-red-500">*</span>}</Label>
                <Input
                  id="meetingUrl"
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  placeholder="Enter meeting URL"
                  className={cn(errors.meetingUrl && "border-red-500")}
                />
                {errors.meetingUrl && <p className="text-red-500 text-sm mt-1">{errors.meetingUrl}</p>}
              </div>
            ) : (
              <div>
                <Label htmlFor="location">Location {!isVirtual && <span className="text-red-500">*</span>}</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter event location"
                  className={cn(errors.location && "border-red-500")}
                />
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
              </div>
            )}
            
            <div>
              <Label htmlFor="accessType">Access Type <span className="text-red-500">*</span></Label>
              <Select
                value={accessType}
                onValueChange={handleAccessTypeChange}
              >
                <SelectTrigger id="accessType">
                  <SelectValue placeholder="Select access type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="nft-gated">NFT-Gated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {accessType === 'paid' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="price">Price <span className="text-red-500">*</span></Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price === undefined ? '' : price}
                    onChange={(e) => setPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="Enter price"
                    className={cn(errors.price && "border-red-500")}
                  />
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                </div>
                
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={currency}
                    onValueChange={(value) => setCurrency(value as 'THC' | 'SOL' | 'USDC')}
                  >
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="THC">THC</SelectItem>
                      <SelectItem value="SOL">SOL</SelectItem>
                      <SelectItem value="USDC">USDC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            {accessType === 'nft-gated' && (
              <div>
                <Label htmlFor="nftRequirement">NFT Requirement <span className="text-red-500">*</span></Label>
                <Input
                  id="nftRequirement"
                  value={nftRequirement}
                  onChange={(e) => setNftRequirement(e.target.value)}
                  placeholder="Enter NFT collection name or address"
                  className={cn(errors.nftRequirement && "border-red-500")}
                />
                {errors.nftRequirement && <p className="text-red-500 text-sm mt-1">{errors.nftRequirement}</p>}
              </div>
            )}
            
            <div>
              <Label htmlFor="capacity">Capacity (optional)</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={capacity === undefined ? '' : capacity}
                onChange={(e) => setCapacity(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Maximum number of attendees"
                className={cn(errors.capacity && "border-red-500")}
              />
              {errors.capacity && <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>}
            </div>
            
            <div>
              <Label htmlFor="imageUrl">Event Image URL (optional)</Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Enter image URL"
              />
            </div>
            
            <div>
              <Label htmlFor="tags">Tags (optional)</Label>
              <div className="flex mt-1.5">
                <Input
                  id="tagInput"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  className="mr-2"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleTagAdd();
                    }
                  }}
                />
                <Button 
                  type="button" 
                  onClick={handleTagAdd}
                  variant="secondary"
                >
                  Add
                </Button>
              </div>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.map((tag, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-1 px-2 py-1 bg-slate-700 rounded-md text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleTagRemove(tag)}
                        className="text-slate-400 hover:text-slate-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit">
            {isEdit ? 'Update Event' : 'Create Event'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}