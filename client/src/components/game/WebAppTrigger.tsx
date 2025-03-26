import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Box, useCursor } from '@react-three/drei';
import * as THREE from 'three';
import { useWebApp } from '@/lib/stores/useWebApp';

interface WebAppTriggerProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  url?: string;
}

export default function WebAppTrigger({ 
  position, 
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  url = 'https://app.tradehybrid.co'
}: WebAppTriggerProps) {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const { openWebApp } = useWebApp();
  const groupRef = useRef<THREE.Group>(null);
  
  useCursor(hovered);
  
  // Add floating animation
  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating motion
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
      
      // Subtle rotation
      groupRef.current.rotation.y = THREE.MathUtils.degToRad(rotation[1]) + 
        Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });
  
  // Handle click to open the web app
  const handleClick = () => {
    setClicked(true);
    openWebApp(url);
    
    // Reset clicked state after animation
    setTimeout(() => setClicked(false), 200);
  };
  
  return (
    <group 
      ref={groupRef}
      position={position}
      scale={clicked ? scale.map(s => s * 0.9) as [number, number, number] : scale}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Base platform */}
      <Box
        args={[1.5, 0.1, 1.5]}
        position={[0, -0.55, 0]}
      >
        <meshStandardMaterial color={hovered ? "#3b82f6" : "#1e40af"} />
      </Box>
      
      {/* Holographic display stand */}
      <Box
        args={[0.3, 1, 0.3]}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial 
          color="#1e293b"
          roughness={0.2}
          metalness={0.8}
        />
      </Box>
      
      {/* Holographic projection */}
      <group position={[0, 0.8, 0]}>
        {/* Animated holographic box */}
        <Box
          args={[1, 0.6, 0.05]}
          position={[0, 0, 0]}
        >
          <meshStandardMaterial 
            color={hovered ? "#3b82f6" : "#2563eb"}
            emissive={hovered ? "#3b82f6" : "#2563eb"}
            emissiveIntensity={0.5}
            transparent
            opacity={0.7}
          />
        </Box>
        
        {/* App logo/text */}
        <Text
          position={[0, 0, 0.05]}
          color="white"
          fontSize={0.18}
          font="/fonts/inter.woff"
          anchorX="center"
          anchorY="middle"
        >
          Trade Hybrid
        </Text>
        
        {/* Interaction instructions */}
        <Text
          position={[0, -0.3, 0.05]}
          color="white"
          fontSize={0.08}
          font="/fonts/inter.woff"
          anchorX="center"
          anchorY="top"
        >
          Click to open
        </Text>
      </group>
      
      {/* Emissive ring at base */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 0.7, 32]} />
        <meshStandardMaterial 
          color={hovered ? "#3b82f6" : "#2563eb"} 
          emissive={hovered ? "#3b82f6" : "#2563eb"}
          emissiveIntensity={0.8}
        />
      </mesh>
    </group>
  );
}