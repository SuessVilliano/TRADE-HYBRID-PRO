import React, { useState } from 'react';
import { LightbulbIcon } from 'lucide-react';
import { Button } from './button';
import { useMicroLearning } from '../../lib/context/MicroLearningProvider';
import { MicroLearningSettings } from './micro-learning-settings';

const TradingTipsButton: React.FC = () => {
  const { showTip } = useMicroLearning();
  const [showSettings, setShowSettings] = useState(false);
  
  const handleShowTip = () => {
    showTip('bottom-right');
  };
  
  return (
    <div className="relative">
      {/* Trading Tips Button */}
      <Button 
        variant="outline" 
        size="sm" 
        className="relative flex items-center gap-2"
        onClick={() => setShowSettings(true)}
      >
        <LightbulbIcon size={16} className="text-yellow-400" />
        <span className="hidden sm:inline">Trading Tips</span>
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
      </Button>
      
      {/* Dropdown Menu */}
      {showSettings && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <MicroLearningSettings 
            onClose={() => setShowSettings(false)} 
          />
        </div>
      )}
    </div>
  );
};

// Export both named and default export
export { TradingTipsButton };
export default TradingTipsButton;