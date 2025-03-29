import React, { useRef, useState, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  useGLTF, 
  Environment, 
  Sky, 
  Text
} from '@react-three/drei';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';
import { useBullsVsBearsStore } from '../../lib/stores/useBullsVsBearsStore';

// Market trend indicator
function MarketTrendIndicator({ position, color }: { position: [number, number, number], color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (ref.current) {
      // Make it float up and down slowly
      ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.5) * 0.2;
      // Slowly rotate
      ref.current.rotation.y += 0.005;
    }
  });

  return (
    <mesh ref={ref} position={position} castShadow>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial 
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

// Floor/Ground component
function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#303030" />
    </mesh>
  );
}

// Bull character
function Bull({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  const { scene: bullModel } = useGLTF('/models/bull_mascot.glb') as GLTF & {
    scene: THREE.Group
  };
  
  return (
    <group ref={ref} position={position} scale={[1, 1, 1]}>
      <Suspense fallback={
        <mesh castShadow>
          <boxGeometry args={[1, 2, 1]} />
          <meshStandardMaterial color="#26a69a" />
        </mesh>
      }>
        <primitive 
          object={bullModel.clone()} 
          scale={[2.5, 2.5, 2.5]} 
          castShadow 
          receiveShadow 
        />
      </Suspense>
      <Text
        position={[0, 3, 0]}
        rotation={[0, Math.PI / 2, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        BULL
      </Text>
    </group>
  );
}

// Bear character
function Bear({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  const { scene: bearModel } = useGLTF('/models/bear_mascot.glb') as GLTF & {
    scene: THREE.Group
  };
  
  return (
    <group ref={ref} position={position} scale={[1, 1, 1]}>
      <Suspense fallback={
        <mesh castShadow>
          <boxGeometry args={[1, 2, 1]} />
          <meshStandardMaterial color="#ef5350" />
        </mesh>
      }>
        <primitive 
          object={bearModel.clone()} 
          scale={[2.5, 2.5, 2.5]} 
          castShadow 
          receiveShadow 
        />
      </Suspense>
      <Text
        position={[0, 3, 0]}
        rotation={[0, Math.PI / 2, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        BEAR
      </Text>
    </group>
  );
}

// Game scene component
function GameScene() {
  const { gameState } = useBullsVsBearsStore();
  const { camera } = useThree();
  
  // Position the camera on first render
  useEffect(() => {
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  
  // Market indicator based on current trend
  const indicatorColor = gameState.currentTrend === 'bullish' ? '#26a69a' : 
    gameState.currentTrend === 'bearish' ? '#ef5350' : 
    gameState.currentTrend === 'volatile' ? '#ff9800' : '#9e9e9e';
  
  return (
    <>
      {/* Environment */}
      <Sky sunPosition={[100, 10, 100]} />
      <Environment preset="city" />
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1} 
        castShadow 
        shadow-mapSize-width={2048} 
        shadow-mapSize-height={2048} 
      />
      
      {/* Floor */}
      <Floor />
      
      {/* Market Trend Indicator */}
      <MarketTrendIndicator 
        position={[0, 5, 0]} 
        color={indicatorColor} 
      />
      
      {/* Bull and Bear characters positioned on opposite sides */}
      <Bull position={[5, 0, 0]} />
      <Bear position={[-5, 0, 0]} />
      
      {/* Central price display */}
      <Text
        position={[0, 7, 0]}
        rotation={[0, 0, 0]}
        fontSize={1}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        ${gameState.currentPrice.toFixed(2)}
      </Text>
      
      {/* Allow user to control camera */}
      <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true} 
        minDistance={5}
        maxDistance={20}
      />
    </>
  );
}

// Main Bulls vs Bears Game component
export function BullsVsBearsGame() {
  // Preload 3D models
  useGLTF.preload('/models/bull_mascot.glb');
  useGLTF.preload('/models/bear_mascot.glb');

  return (
    <div className="bulls-vs-bears-game-container" style={{ width: '100%', height: '80vh' }}>
      <Canvas shadows>
        <Suspense fallback={null}>
          <GameScene />
        </Suspense>
      </Canvas>
    </div>
  );
}