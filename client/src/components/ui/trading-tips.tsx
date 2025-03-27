import React, { useState, useEffect } from 'react';
import { Lightbulb, X, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTradingTips } from '@/lib/stores/useTradingTips';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-is-mobile';

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  intermediate: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  advanced: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100'
};

const categoryIcons = {
  crypto: '₿',
  forex: '💱',
  stocks: '📈',
  general: '🧠',
  technical: '📊',
  fundamental: '📰'
};

export function TradingTipPopup() {
  const { currentTip, showingTip, closeTip, tips, showTip } = useTradingTips();
  const [tipIndex, setTipIndex] = useState(0);
  const isMobile = useIsMobile();
  
  // Set initial tip index when currentTip changes
  useEffect(() => {
    if (currentTip) {
      const index = tips.findIndex(tip => tip.id === currentTip.id);
      if (index !== -1) {
        setTipIndex(index);
      }
    }
  }, [currentTip, tips]);
  
  // Handle navigation between tips
  const showNextTip = () => {
    const nextIndex = (tipIndex + 1) % tips.length;
    const nextTip = tips[nextIndex];
    setTipIndex(nextIndex);
    useTradingTips.setState({ currentTip: nextTip, showingTip: true });
  };
  
  const showPreviousTip = () => {
    const prevIndex = (tipIndex - 1 + tips.length) % tips.length;
    const prevTip = tips[prevIndex];
    setTipIndex(prevIndex);
    useTradingTips.setState({ currentTip: prevTip, showingTip: true });
  };
  
  if (!showingTip || !currentTip) return null;
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="w-full max-w-md"
        >
          <Card className="border-2 border-primary shadow-lg">
            <CardHeader className="pb-3 relative">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-800 text-yellow-600 dark:text-yellow-300 flex items-center justify-center">
                    <Lightbulb size={18} />
                  </div>
                  <CardTitle className="text-lg font-medium">Trading Tip</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full"
                  onClick={closeTip}
                >
                  <X size={18} />
                </Button>
              </div>
              
              <div className="mt-1 flex items-center justify-between">
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">
                    <span className="mr-1">{categoryIcons[currentTip.category as keyof typeof categoryIcons]}</span>
                    {currentTip.category.charAt(0).toUpperCase() + currentTip.category.slice(1)}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${difficultyColors[currentTip.difficulty as keyof typeof difficultyColors]}`}
                  >
                    {currentTip.difficulty.charAt(0).toUpperCase() + currentTip.difficulty.slice(1)}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Tip {tipIndex + 1} of {tips.length}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-3">
              <h3 className="text-base font-semibold mb-2">{currentTip.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{currentTip.content}</p>
              
              <div className="mt-3 flex flex-wrap gap-1">
                {currentTip.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between border-t pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={showPreviousTip}
                className="flex items-center gap-1"
              >
                <ChevronLeft size={16} />
                <span className={isMobile ? 'sr-only' : ''}>Previous</span>
              </Button>
              
              <Button
                variant="default"
                size="sm"
                onClick={closeTip}
                className="flex items-center gap-1"
              >
                <BookOpen size={16} />
                <span className={isMobile ? 'sr-only' : ''}>Got it</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={showNextTip}
                className="flex items-center gap-1"
              >
                <span className={isMobile ? 'sr-only' : ''}>Next</span>
                <ChevronRight size={16} />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export function ShowTradingTipButton({ onClick }: { onClick?: () => void }) {
  const { showTip } = useTradingTips();
  
  const handleClick = () => {
    showTip();
    if (onClick) onClick();
  };
  
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleClick}
      title="Show Trading Tip"
      className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-300 dark:border-yellow-700"
    >
      <Lightbulb size={18} className="text-yellow-600 dark:text-yellow-400" />
    </Button>
  );
}