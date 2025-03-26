import React from 'react';
import { Interface } from '../ui/interface';

export default function Scene({ showStats = false }) {
  return (
    <div className="relative w-full h-full">
      <div className="flex items-center justify-center h-screen w-full bg-gradient-to-b from-gray-900 to-black text-white p-4">
        <div className="text-center max-w-lg mx-auto">
          <h1 className="text-3xl font-bold mb-4">Welcome to Trade Hybrid</h1>
          <p className="mb-6">
            The 3D environment is currently being updated. In the meantime, you can explore the map by pressing the M key.
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
          <div className="text-sm text-gray-400">
            Pressing M will show you the trading metaverse map with all available locations.
          </div>
        </div>
      </div>
      
      {/* Interface overlay that includes the map toggle functionality */}
      <Interface />
    </div>
  );
}