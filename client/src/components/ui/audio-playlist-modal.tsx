
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Maximize2, Minimize2 } from 'lucide-react';

interface AudioPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  playlistUrl: string;
}

export default function AudioPlaylistModal({
  isOpen,
  onClose,
  title,
  playlistUrl
}: AudioPlaylistModalProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isExpanded ? 'w-[90vw] h-[90vh]' : 'w-[600px]'}`}>
        <DialogHeader className="flex flex-row justify-between items-center">
          <DialogTitle>{title}</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </Button>
        </DialogHeader>
        <div className={`${isExpanded ? 'h-[calc(90vh-80px)]' : 'h-[450px]'}`}>
          <iframe
            width="100%"
            height="100%"
            scrolling="no"
            frameBorder="no"
            allow="autoplay"
            src={playlistUrl}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
