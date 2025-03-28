import { ReactNode, useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { useTradingTips } from '../../lib/stores/useTradingTips';

interface MicroTradingTipTriggerProps {
  children?: ReactNode;
  category?: 'crypto' | 'forex' | 'stocks' | 'general' | 'technical' | 'fundamental';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  className?: string;
  label?: string;
  icon?: ReactNode;
}

export function MicroTradingTipTrigger({
  children,
  category,
  difficulty,
  className = '',
  label = 'Tip',
  icon
}: MicroTradingTipTriggerProps) {
  const { showMicroTip } = useTradingTips();
  const [hovered, setHovered] = useState(false);
  
  const handleTrigger = (e: React.MouseEvent) => {
    // Get the position where the tip should appear (next to the trigger)
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const position = {
      x: rect.right + 10, // Position to the right of the trigger
      y: rect.top
    };
    
    // Show the micro tip
    showMicroTip(category, difficulty, position);
  };
  
  return (
    <div className="relative inline-block">
      {/* Main content with trigger */}
      <div
        className={`inline-flex items-center ${className}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handleTrigger}
      >
        {children}
        
        {/* Tip icon/button */}
        <button 
          className="ml-1 p-1 rounded-full hover:bg-indigo-100/20 hover:text-indigo-400 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            handleTrigger(e);
          }}
        >
          {icon || <Lightbulb size={14} className={`${hovered ? 'text-indigo-400' : 'text-white/60'}`} />}
        </button>
        
        {/* Optional label */}
        {label && (
          <span className="ml-1 text-xs text-white/60">{label}</span>
        )}
      </div>
    </div>
  );
}