import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from './gameStore';

// Props for the GameScore component
interface GameScoreProps {
  position: [number, number, number];
  scale?: number;
}

// 3D visualization of game score that follows player
export function GameScore({ position, scale = 1 }: GameScoreProps) {
  const scoreRef = useRef<THREE.Group>(null);
  const { humanPlayer, winningTrades, totalTrades } = useGameStore();
  
  // Calculate win rate
  const winRate = totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 100) : 0;
  
  // Format score with comma for thousands
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  
  // Animated floating effect
  useFrame(({ clock }) => {
    if (scoreRef.current) {
      // Make it float up and down
      scoreRef.current.position.y = position[1] + Math.sin(clock.elapsedTime) * 0.1;
      // Ensure it always faces the camera
      scoreRef.current.quaternion.copy(
        scoreRef.current.parent?.quaternion.clone().invert() || new THREE.Quaternion()
      );
    }
  });
  
  // Determine score color based on whether it's positive or negative
  const scoreColor = (humanPlayer?.balance || 0) > 10000 ? '#4caf50' : '#f44336';
  
  return (
    <group ref={scoreRef} position={position} scale={[scale, scale, scale]}>
      {/* Score display */}
      <Text
        position={[0, 0.4, 0]}
        fontSize={0.3}
        color={scoreColor}
        font="/fonts/Roboto-Bold.ttf"
        anchorX="center"
        anchorY="middle"
      >
        ${formatNumber(humanPlayer?.balance || 0)}
      </Text>
      
      {/* Win rate */}
      <Text
        position={[0, 0, 0]}
        fontSize={0.2}
        color="white"
        font="/fonts/Roboto-Medium.ttf"
        anchorX="center"
        anchorY="middle"
      >
        Win Rate: {winRate}%
      </Text>
      
      {/* Trades count */}
      <Text
        position={[0, -0.3, 0]}
        fontSize={0.15}
        color="#9e9e9e"
        font="/fonts/Roboto-Regular.ttf"
        anchorX="center"
        anchorY="middle"
      >
        Trades: {winningTrades}/{totalTrades}
      </Text>
      
      {/* Background panel for better readability */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[2, 1.2]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}