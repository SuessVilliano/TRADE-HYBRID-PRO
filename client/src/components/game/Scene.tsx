import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { OrbitControls, Sky, Environment, Stats, KeyboardControls } from '@react-three/drei';
import * as THREE from 'three';

// Import our components directly
import { Player } from './Player';
import { Floor } from './Floor';
import { Lights } from './Lights';
import { CryptoTrading } from './CryptoTrading';
import { Interface } from '../ui/interface';

// Define keyboard controls enum to match what's in Player.tsx
enum Controls {
  forward = 'forward',
  back = 'back',
  left = 'left',
  right = 'right',
  jump = 'jump',
}

interface SceneProps {
  showStats?: boolean;
}

export default function Scene({ showStats = true }: SceneProps) {
  // Define key mappings for controls
  const keyMap = [
    { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
    { name: Controls.back, keys: ['ArrowDown', 'KeyS'] },
    { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
    { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
    { name: Controls.jump, keys: ['Space'] },
  ];
  
  return (
    <div className="relative w-full h-screen">
      {/* Keyboard Controls Wrapper */}
      <KeyboardControls map={keyMap}>
        {/* Main 3D Canvas */}
        <Canvas
          shadows
          camera={{ position: [10, 10, 10], fov: 50 }}
          style={{ background: '#87CEEB' }}
        >
          {showStats && <Stats />}
          <fog attach="fog" args={['#87CEEB', 30, 100]} />
          <Sky sunPosition={[100, 10, 100]} />
          
          <Suspense fallback={null}>
            <Environment preset="city" />
          </Suspense>
          
          <Physics>
            <Lights />
            <Floor />
            <Player position={[0, 2, 0]} />
            <CryptoTrading position={[10, 0, 10]} />
          </Physics>
          
          <OrbitControls />
        </Canvas>
      </KeyboardControls>
      
      {/* UI Overlay */}
      <Interface />
      
      {/* Debug Info - initially shown but fades out after 10 seconds */}
      <div className="absolute bottom-0 left-0 m-2 p-2 bg-black/80 text-white text-xs rounded animate-fade-in-out">
        <div>Trading Metaverse v0.1</div>
        <div>THREE.js {THREE.REVISION}</div>
        <div className="font-bold">Use WASD or Arrow Keys to move, Spacebar to jump</div>
        <div className="text-gray-300 mt-1 text-[10px]">This help box will disappear shortly</div>
      </div>
    </div>
  );
}