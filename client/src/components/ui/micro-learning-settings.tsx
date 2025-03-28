import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { PopupContainer } from './popup-container';
import { useMicroLearning } from '../../lib/context/MicroLearningProvider';

interface MicroLearningSettingsProps {
  onClose: () => void;
}

export const MicroLearningSettings: React.FC<MicroLearningSettingsProps> = ({
  onClose
}) => {
  const { likedTips, dislikedTips, savedTips, showTip } = useMicroLearning();
  
  // Local settings state
  const [autoShow, setAutoShow] = useState<boolean>(true);
  const [interval, setInterval] = useState<number>(5); // in minutes
  
  // Load settings from localStorage on mount
  useEffect(() => {
    const savedAutoShow = localStorage.getItem('microLearningAutoShow');
    const savedInterval = localStorage.getItem('microLearningInterval');
    
    if (savedAutoShow !== null) {
      setAutoShow(savedAutoShow === 'true');
    }
    
    if (savedInterval !== null) {
      setInterval(parseInt(savedInterval, 10));
    }
  }, []);
  
  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('microLearningAutoShow', autoShow.toString());
    localStorage.setItem('microLearningInterval', interval.toString());
  }, [autoShow, interval]);
  
  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setInterval(value);
    }
  };
  
  const handleShowNow = () => {
    // Close settings
    onClose();
    // Show a tip
    setTimeout(() => {
      showTip('bottom-right');
    }, 300);
  };
  
  return (
    <PopupContainer className="w-full max-w-md mx-auto bg-slate-800 p-6 rounded-lg shadow-lg" padding>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Trading Tips Settings</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="autoShow" className="text-sm font-medium">
              Automatically show trading tips
            </label>
            <div className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                id="autoShow" 
                className="sr-only peer" 
                checked={autoShow}
                onChange={() => setAutoShow(!autoShow)}
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="interval" className="text-sm font-medium">
              Show tips every (minutes):
            </label>
            <input
              type="number"
              id="interval"
              min="1"
              max="60"
              value={interval}
              onChange={handleIntervalChange}
              disabled={!autoShow}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="pt-4 border-t border-slate-700">
          <h3 className="text-lg font-medium mb-2">Your Tips</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-500">{likedTips.length}</div>
              <div className="text-sm text-slate-400">Liked</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-500">{dislikedTips.length}</div>
              <div className="text-sm text-slate-400">Disliked</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-500">{savedTips.length}</div>
              <div className="text-sm text-slate-400">Saved</div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleShowNow}>
            Show Tip Now
          </Button>
        </div>
      </div>
    </PopupContainer>
  );
};