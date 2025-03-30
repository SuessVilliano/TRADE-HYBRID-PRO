
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SignalNotificationService } from '@/lib/services/signal-notification-service';

export function SignalNotificationSender() {
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'success' | 'warning' | 'error'>('info');

  const handleSend = () => {
    if (message.trim()) {
      SignalNotificationService.showAdminMessage(message, type);
      setMessage('');
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Send Notification</h3>
      
      <div className="space-y-2">
        <Textarea 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter notification message..."
          className="min-h-[100px]"
        />
        
        <Select value={type} onValueChange={(value: any) => setType(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleSend} className="w-full">
          Send Notification
        </Button>
      </div>
    </div>
  );
}
