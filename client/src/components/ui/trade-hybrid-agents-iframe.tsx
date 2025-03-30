import React, { useState } from 'react';
import { Button } from '../ui/button';
import { X } from 'lucide-react';

interface TradeHybridAgentsIframeProps {
  fullScreen?: boolean;
  onClose?: () => void;
}

export function TradeHybridAgentsIframe({ fullScreen = false, onClose }: TradeHybridAgentsIframeProps) {
  return (
    <div className={`bg-black overflow-hidden ${fullScreen ? 'fixed inset-0 z-50' : 'w-full h-[600px] rounded-lg'}`}>
      {fullScreen && onClose && (
        <div className="absolute top-4 right-4 z-10">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="bg-slate-800/70 hover:bg-slate-700/70 text-white rounded-full p-2 h-10 w-10"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      )}
      <iframe 
        src="https://tradehybridagents.com"
        className="w-full h-full border-0" 
        allowFullScreen
      ></iframe>
    </div>
  );
}

export function TradeHybridAgentsModal() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="bg-purple-600 hover:bg-purple-700 w-full"
      >
        Launch AI Chat Agents
      </Button>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <TradeHybridAgentsIframe fullScreen onClose={() => setIsOpen(false)} />
        </div>
      )}
    </>
  );
}