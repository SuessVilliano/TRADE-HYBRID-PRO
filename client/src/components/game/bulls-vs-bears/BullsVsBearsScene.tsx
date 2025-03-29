import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  useGLTF, 
  OrbitControls, 
  Environment, 
  Sky, 
  Text, 
  useKeyboardControls,
  KeyboardControls,
  PerspectiveCamera 
} from '@react-three/drei';
import * as THREE from 'three';
import { Physics, usePlane, useBox } from '@react-three/cannon';
import { GLTF } from 'three-stdlib';
import { useGameStore } from './gameStore';
import { usePriceStore } from './priceStore';
import { PriceChart } from './PriceChart';
import { GameScore } from './GameScore';
import { GameUI } from './GameUI';

// Define our controls
enum Controls {
  forward = 'forward',
  back = 'back',
  left = 'left',
  right = 'right',
  jump = 'jump',
  action = 'action',
}

// Simple floor component
function Floor() {
  const [ref] = usePlane<THREE.Group>(() => ({ 
    rotation: [-Math.PI / 2, 0, 0], 
    position: [0, -0.5, 0],
    type: 'Static'
  }));

  return (
    <group ref={ref}>
      <mesh receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#3a6ea5" />
      </mesh>
    </group>
  );
}

// Player model (Bull or Bear)
interface PlayerProps {
  position: [number, number, number];
  character: 'bull' | 'bear';
  isPlayer?: boolean;
}

function Player({ position, character, isPlayer = false }: PlayerProps) {
  const modelRef = useRef<THREE.Group>(null);
  const [ref, api] = useBox<THREE.Group>(() => ({ 
    mass: 1, 
    position, 
    args: [1, 2, 1]
  }));

  // For movement control
  const [subscribeKeys, getKeys] = useKeyboardControls<Controls>();
  
  // Load the appropriate character model
  const modelPath = character === 'bull' 
    ? '/models/bull_character.glb' 
    : '/models/bear_character.glb';

  // This is a placeholder - you should generate or acquire proper models for bull and bear
  const color = character === 'bull' ? '#2a9d8f' : '#e76f51';

  // Movement logic
  useFrame((state, delta) => {
    if (!isPlayer) return;

    const keys = getKeys();
    const moveSpeed = 5;
    const direction = new THREE.Vector3();

    if (keys.forward) direction.z -= 1;
    if (keys.back) direction.z += 1;
    if (keys.left) direction.x -= 1;
    if (keys.right) direction.x += 1;

    // Normalize for consistent speed
    if (direction.length() > 0) {
      direction.normalize().multiplyScalar(moveSpeed * delta);
      api.velocity.set(direction.x, 0, direction.z);

      // Rotate the model to face the movement direction
      if (modelRef.current) {
        const angle = Math.atan2(direction.x, direction.z);
        modelRef.current.rotation.y = angle;
      }
    }
  });

  return (
    <group ref={ref}>
      <group ref={modelRef}>
        {/* Placeholder model - replace with actual loaded models */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[1, 2, 1]} />
          <meshStandardMaterial color={color} />
        </mesh>
        
        {isPlayer && (
          <Text
            position={[0, 2.5, 0]}
            scale={[0.5, 0.5, 0.5]}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {character === 'bull' ? 'You (Bull)' : 'You (Bear)'}
          </Text>
        )}
      </group>
    </group>
  );
}

// AI Traders (opponents)
function AITraders() {
  const { aiTraders } = useGameStore();
  
  return (
    <>
      {aiTraders.map((trader: any, index: number) => (
        <Player 
          key={`ai-trader-${index}`}
          position={trader.position}
          character={trader.type}
        />
      ))}
    </>
  );
}

// Main Trading Arena
function TradingArena() {
  const { camera } = useThree();
  const { marketTrend } = usePriceStore();
  
  // Set skybox color based on market trend
  const skyColor = marketTrend === 'bullish' 
    ? new THREE.Color('#87ceeb') 
    : new THREE.Color('#1e3a8a');
  
  // Set camera position
  React.useEffect(() => {
    camera.position.set(0, 15, 20);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (
    <>
      <Sky distance={450000} sunPosition={[0, 1, 0]} turbidity={10} rayleigh={0.5} mieCoefficient={0.005} mieDirectionalG={0.8} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow shadow-mapSize={[2048, 2048]} />
      
      <Floor />
      
      {/* Player character */}
      <Player position={[0, 1, 0]} character="bull" isPlayer={true} />
      
      {/* AI traders */}
      <AITraders />
      
      {/* Market visualization */}
      <PriceChart position={[0, 10, -20]} scale={[10, 5, 1]} />
      
      {/* 3D structures for trading points */}
      <mesh position={[-15, 2, -15]} castShadow>
        <boxGeometry args={[4, 4, 4]} />
        <meshStandardMaterial color="#3498db" />
        <Text
          position={[0, 3, 0]}
          rotation={[0, Math.PI / 4, 0]}
          scale={[1, 1, 1]}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Buy Zone
        </Text>
      </mesh>
      
      <mesh position={[15, 2, -15]} castShadow>
        <boxGeometry args={[4, 4, 4]} />
        <meshStandardMaterial color="#e74c3c" />
        <Text
          position={[0, 3, 0]}
          rotation={[0, -Math.PI / 4, 0]}
          scale={[1, 1, 1]}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Sell Zone
        </Text>
      </mesh>
    </>
  );
}

// Main component that sets up the game scene
export function BullsVsBearsScene() {
  const keyMap = [
    { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
    { name: Controls.back, keys: ['ArrowDown', 'KeyS'] },
    { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
    { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
    { name: Controls.jump, keys: ['Space'] },
    { name: Controls.action, keys: ['KeyE'] },
  ];

  return (
    <div className="w-full h-screen">
      <KeyboardControls map={keyMap}>
        <Canvas shadows>
          <Physics>
            <Suspense fallback={null}>
              <TradingArena />
            </Suspense>
          </Physics>
          <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2 - 0.1} />
        </Canvas>
      </KeyboardControls>
      
      {/* Game UI overlay */}
      <GameUI />
    </div>
  );
}