import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTradingTips } from '../../lib/stores/useTradingTips';
import { X } from 'lucide-react';

interface MicroTradingTipProps {
  position?: { x: number, y: number };
  onClose?: () => void;
}

export function MicroTradingTip({ position, onClose }: MicroTradingTipProps) {
  const { 
    currentMicroTip,
    showingMicroTip,
    microTipPosition,
    closeMicroTip 
  } = useTradingTips();
  
  const [tipPosition, setTipPosition] = useState(position || microTipPosition || { x: window.innerWidth / 2, y: window.innerHeight / 2 });

  // Update position if it changes
  useEffect(() => {
    if (microTipPosition) {
      setTipPosition(microTipPosition);
    }
  }, [microTipPosition]);
  
  // Handle close action
  const handleClose = () => {
    onClose?.();
    closeMicroTip();
  };
  
  // Ensure the tip stays within the viewport
  useEffect(() => {
    const tipWidth = 250; // estimated width
    const tipHeight = 100; // estimated height
    
    // Adjust x position if it would go off-screen
    let adjustedX = tipPosition.x;
    if (adjustedX + tipWidth > window.innerWidth) {
      adjustedX = window.innerWidth - tipWidth - 10;
    }
    if (adjustedX < 10) {
      adjustedX = 10;
    }
    
    // Adjust y position if it would go off-screen
    let adjustedY = tipPosition.y;
    if (adjustedY + tipHeight > window.innerHeight) {
      adjustedY = window.innerHeight - tipHeight - 10;
    }
    if (adjustedY < 10) {
      adjustedY = 10;
    }
    
    // Update if adjustments were needed
    if (adjustedX !== tipPosition.x || adjustedY !== tipPosition.y) {
      setTipPosition({ x: adjustedX, y: adjustedY });
    }
  }, [tipPosition]);
  
  // Don't render if no micro tip or not showing
  if (!currentMicroTip || !showingMicroTip) return null;
  
  return (
    <AnimatePresence>
      {showingMicroTip && (
        <motion.div
          className="fixed z-50 shadow-xl"
          style={{ 
            left: tipPosition.x, 
            top: tipPosition.y,
            transformOrigin: 'center center'
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          <div className="relative max-w-[250px] rounded-lg bg-black/75 backdrop-blur-sm text-white p-3 border border-indigo-500/30">
            <button 
              onClick={handleClose}
              className="absolute -top-2 -right-2 rounded-full bg-indigo-600 p-1 hover:bg-indigo-700"
            >
              <X size={16} />
            </button>
            
            <div className="font-medium text-sm">
              {currentMicroTip.title}
            </div>
            
            <div className="mt-2 flex gap-1 flex-wrap">
              {currentMicroTip.tags.slice(0, 2).map(tag => (
                <span key={tag} className="text-xs bg-indigo-800/50 px-1.5 py-0.5 rounded">
                  {tag}
                </span>
              ))}
              <span className="text-xs bg-indigo-700/50 px-1.5 py-0.5 rounded capitalize">
                {currentMicroTip.difficulty}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}