import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  KeyboardControls,
  useKeyboardControls,
  Environment,
  Stats
} from '@react-three/drei';
import { Physics } from '@react-three/cannon';
import * as THREE from 'three';

// Game components
import Terrain from './Terrain';
import Player from './Player';
import Lighting from './Lighting';
import GameUI from './GameUI';

// Controls mapping
export enum Controls {
  forward = 'forward',
  back = 'back',
  left = 'left',
  right = 'right',
  jump = 'jump',
}

/**
 * Main Game component for the 3D metaverse trading environment
 */
const Game: React.FC = () => {
  const [gameState, setGameState] = useState({
    score: 0,
    lives: 3,
  });

  // Define key mappings
  const keyMap = [
    { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
    { name: Controls.back, keys: ['ArrowDown', 'KeyS'] },
    { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
    { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
    { name: Controls.jump, keys: ['Space'] },
  ];

  console.log('Game component rendering...');

  return (
    <div className="game-container w-full h-full">
      <KeyboardControls map={keyMap}>
        <Canvas
          shadows
          gl={{ antialias: true }}
          camera={{ position: [0, 5, 10], fov: 60 }}
        >
          <Stats />
          <Lighting />
          <Environment preset="sunset" />
          
          <Physics
            gravity={[0, -9.8, 0]}
            defaultContactMaterial={{
              friction: 0.1,
              restitution: 0.7,
            }}
          >
            <Player position={[0, 3, 0]} />
            <Terrain />
          </Physics>
          
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={20}
          />
        </Canvas>
      </KeyboardControls>
      
      <GameUI gameState={gameState} />
    </div>
  );
};

export default Game;