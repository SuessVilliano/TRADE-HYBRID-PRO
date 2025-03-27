import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { OrbitControls, Sky, Environment, Stats, KeyboardControls } from '@react-three/drei';
import * as THREE from 'three';

// Import our components directly
import TradeHouse from './TradeHouse';
import { Interface } from '../ui/interface';

interface SceneProps {
  showStats?: boolean;
}

export default function Scene({ showStats = true }: SceneProps) {
  return (
    <div className="relative w-full h-screen">
      {/* Main 3D Canvas */}
      <div className="w-full h-full">
        <TradeHouse />
      </div>
      
      {/* UI Overlay */}
      <Interface />
      
      {/* Debug Info - initially shown but fades out after 10 seconds */}
      <div className="absolute bottom-0 left-0 m-2 p-2 bg-black/80 text-white text-xs rounded animate-fade-in-out">
        <div>Trading Metaverse v0.2</div>
        <div>THREE.js {THREE.REVISION}</div>
        <div className="font-bold">Use WASD or Arrow Keys to move, Spacebar to jump, Shift to sprint</div>
        <div className="text-gray-300 mt-1 text-[10px]">This help box will disappear shortly</div>
      </div>
    </div>
  );
}