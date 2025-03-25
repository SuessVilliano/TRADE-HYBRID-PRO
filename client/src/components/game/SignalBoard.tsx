import { useState, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Box, Plane, useCursor } from '@react-three/drei';
import * as THREE from 'three';
import { useSignals, TradingSignal } from '@/lib/stores/useSignals';

interface SignalBoardProps {
  position: [number, number, number];
  rotation?: [number, number, number];
}

export default function SignalBoard({ 
  position, 
  rotation = [0, 0, 0] 
}: SignalBoardProps) {
  const { signals } = useSignals();
  const [hovered, setHovered] = useState(false);
  const [displayedSignals, setDisplayedSignals] = useState<TradingSignal[]>([]);
  const groupRef = useRef<THREE.Group>(null);
  
  useCursor(hovered);
  
  // Update displayed signals when backend signals change
  useEffect(() => {
    if (signals.length > 0) {
      setDisplayedSignals(signals.slice(0, 5)); // Show latest 5 signals
    }
  }, [signals]);
  
  // Add subtle animation to the board
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  // Format signal type for display
  const getSignalColor = (action: string) => {
    switch (action) {
      case 'buy':
        return '#22c55e'; // green
      case 'sell':
        return '#ef4444'; // red
      default:
        return '#ffffff'; // white
    }
  };

  return (
    <group 
      ref={groupRef}
      position={position} 
      rotation={rotation.map(r => r * Math.PI / 180) as [number, number, number]}
    >
      {/* Main board frame */}
      <Box 
        args={[3, 2, 0.1]} 
        position={[0, 0, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial color="#111827" />
      </Box>
      
      {/* Header */}
      <Box args={[3, 0.4, 0.12]} position={[0, 0.8, 0]}>
        <meshStandardMaterial color="#1e293b" />
      </Box>
      
      <Text
        position={[0, 0.8, 0.08]}
        color="white"
        fontSize={0.2}
        font="/fonts/inter.woff"
        anchorX="center"
        anchorY="middle"
      >
        TRADING SIGNALS
      </Text>
      
      {/* TradingView Logo */}
      <Text
        position={[-1.2, 0.8, 0.08]}
        color="#2962FF"
        fontSize={0.12}
        font="/fonts/inter.woff"
        anchorX="center"
        anchorY="middle"
      >
        TradingView
      </Text>
      
      {/* Signals display area */}
      <Plane 
        args={[2.8, 1.5]} 
        position={[0, -0.05, 0.06]}
      >
        <meshBasicMaterial color="#0f172a" transparent opacity={0.8} />
      </Plane>
      
      {/* Display signals */}
      {displayedSignals.length > 0 ? (
        displayedSignals.map((signal, index) => (
          <group key={signal.id} position={[0, 0.5 - index * 0.3, 0.07]}>
            {/* Symbol and action */}
            <Text
              position={[-1.2, 0, 0]}
              color={getSignalColor(signal.action)}
              fontSize={0.14}
              font="/fonts/inter.woff"
              anchorX="left"
              anchorY="middle"
              maxWidth={0.8}
            >
              {signal.symbol} 
            </Text>
            
            <Text
              position={[-0.6, 0, 0]}
              color={getSignalColor(signal.action)}
              fontSize={0.14}
              font="/fonts/inter.woff"
              fontWeight="bold"
              anchorX="left"
              anchorY="middle"
            >
              {signal.action.toUpperCase()}
            </Text>
            
            {/* Price */}
            <Text
              position={[0, 0, 0]}
              color="white"
              fontSize={0.12}
              font="/fonts/inter.woff"
              anchorX="left"
              anchorY="middle"
            >
              ${signal.price.toLocaleString()}
            </Text>
            
            {/* Confidence */}
            <group position={[1.1, 0, 0]}>
              {/* Background bar */}
              <Plane args={[0.5, 0.08]} position={[0, 0, -0.001]}>
                <meshBasicMaterial color="#374151" />
              </Plane>
              
              {/* Confidence level */}
              <Plane 
                args={[signal.confidence / 100 * 0.5, 0.08]} 
                position={[-(0.5 - signal.confidence / 100 * 0.5) / 2, 0, 0]}
              >
                <meshBasicMaterial 
                  color={
                    signal.confidence > 70 ? '#22c55e' :
                    signal.confidence > 40 ? '#eab308' : 
                    '#ef4444'
                  } 
                />
              </Plane>
            </group>
          </group>
        ))
      ) : (
        <Text
          position={[0, 0, 0.07]}
          color="#9ca3af"
          fontSize={0.15}
          font="/fonts/inter.woff"
          anchorX="center"
          anchorY="middle"
        >
          No signals available
        </Text>
      )}
      
      {/* Webhook info at bottom */}
      <Text
        position={[0, -0.85, 0.07]}
        color="#64748b"
        fontSize={0.08}
        font="/fonts/inter.woff"
        anchorX="center"
        anchorY="middle"
      >
        Webhook: apps.taskmagic.com/api/v1/.../Ec3lDNCfkpQtHNbWk16mA
      </Text>
    </group>
  );
}