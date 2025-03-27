import React, { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TradingTipsExplorer } from './trading-tips-explorer';
import { useTradingTips } from '@/lib/stores/useTradingTips';
import { toast } from 'sonner';

export function TradingTipsButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { tips, viewedTips } = useTradingTips();
  
  // Calculate number of unread tips
  const unreadCount = tips.filter(tip => !viewedTips.includes(tip.id)).length;
  
  const handleOpenTips = () => {
    setIsOpen(true);
    
    if (unreadCount > 0) {
      toast.info(`You have ${unreadCount} unread trading tips`, {
        description: "Explore helpful tips to improve your trading skills",
        duration: 3000,
      });
    }
  };
  
  return (
    <>
      <div className="relative">
        <Button
          onClick={handleOpenTips}
          variant="outline"
          className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-900/50"
        >
          <Lightbulb className="h-4 w-4" />
          <span>Trading Tips</span>
        </Button>
        
        {unreadCount > 0 && (
          <Badge 
            variant="default" 
            className="absolute -top-2 -right-2 bg-red-500 h-5 min-w-5 flex items-center justify-center p-0 px-1"
          >
            {unreadCount}
          </Badge>
        )}
      </div>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <span>Trading Tips Library</span>
            </DialogTitle>
          </DialogHeader>
          
          <TradingTipsExplorer />
        </DialogContent>
      </Dialog>
    </>
  );
}