import React, { useState } from 'react';
import { Interface } from '../ui/interface';
import { Map } from 'lucide-react';
import { Button } from '../ui/button';

export default function Scene({ showStats = false }) {
  const [showMobileMap, setShowMobileMap] = useState(false);

  // Function to toggle map for mobile users
  const toggleMobileMap = () => {
    setShowMobileMap(!showMobileMap);
  };

  return (
    <div className="relative w-full h-full">
      <div className="flex items-center justify-center h-screen w-full bg-gradient-to-b from-gray-900 to-black text-white p-4">
        <div className="text-center max-w-lg mx-auto">
          <h1 className="text-3xl font-bold mb-4">Welcome to Trade Hybrid</h1>
          <p className="mb-6">
            The 3D environment is currently being updated. In the meantime, you can explore the map by pressing the M key or using the map button below.
          </p>
          <div className="bg-gray-800 p-4 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-2">Controls:</h2>
            <ul className="text-left list-disc pl-6 space-y-1">
              <li>WASD or Arrow Keys: Move character</li>
              <li>Space: Jump</li>
              <li>Double-tap movement key: Sprint</li>
              <li>Right mouse button: Rotate camera</li>
              <li>E: Interact</li>
              <li>M: Toggle map</li>
            </ul>
          </div>
          
          {/* Mobile map button */}
          <div className="flex justify-center mb-6">
            <Button 
              onClick={toggleMobileMap}
              className="flex items-center gap-2"
              size="lg"
            >
              <Map size={18} />
              {showMobileMap ? "Close Map" : "Open Map"}
            </Button>
          </div>
          
          <div className="text-sm text-gray-400">
            On mobile? Use the map button above to view all trading locations.
          </div>
        </div>
      </div>
      
      {/* Interface overlay that includes the map toggle functionality */}
      <Interface showMapOverride={showMobileMap} onToggleMap={toggleMobileMap} />
      
      {/* Mobile bottom navigation */}
      <div className="md:hidden fixed bottom-4 left-0 right-0 flex justify-center z-50">
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white h-12 w-12 rounded-full"
            onClick={toggleMobileMap}
          >
            <Map size={24} />
          </Button>
        </div>
      </div>
    </div>
  );
}