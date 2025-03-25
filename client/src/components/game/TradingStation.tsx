import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, useTexture } from "@react-three/drei";
import * as THREE from "three";

interface TradingStationProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  type: "crypto" | "stocks" | "forex";
}

export default function TradingStation({
  position,
  rotation = [0, 0, 0],
  type
}: TradingStationProps) {
  const stationRef = useRef<THREE.Group>(null);
  const screenRef = useRef<THREE.Mesh>(null);
  
  // Load a texture for the desk surface
  const woodTexture = useTexture("/textures/wood.jpg");
  
  // Get color based on trading station type
  const getColor = () => {
    switch (type) {
      case "crypto":
        return "#FF9900"; // Orange for crypto
      case "stocks":
        return "#4285F4"; // Blue for stocks
      case "forex":
        return "#34A853"; // Green for forex
      default:
        return "#FFFFFF";
    }
  };
  
  // Get label based on type
  const getLabel = () => {
    switch (type) {
      case "crypto":
        return "CRYPTO";
      case "stocks":
        return "STOCKS";
      case "forex":
        return "FOREX";
      default:
        return "TRADING";
    }
  };
  
  // Animate the screen (subtle floating effect)
  useFrame((state) => {
    if (screenRef.current) {
      // Make the screen float up and down slightly
      screenRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.05 + 1.6;
      
      // Rotate slightly to face the player
      if (stationRef.current) {
        const time = state.clock.getElapsedTime() * 0.2;
        stationRef.current.rotation.y = rotation[1] + Math.sin(time) * 0.1;
      }
    }
  });
  
  return (
    <group ref={stationRef} position={position} rotation={rotation}>
      {/* Base platform */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[1.5, 1.5, 0.1, 32]} />
        <meshStandardMaterial color="#444444" roughness={0.8} />
      </mesh>
      
      {/* Desk */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.2, 1, 0.9, 32]} />
        <meshStandardMaterial map={woodTexture} color="#A0522D" roughness={0.6} />
      </mesh>
      
      {/* Screen */}
      <mesh 
        ref={screenRef}
        position={[0, 1.6, 0]} 
        castShadow
      >
        {/* Screen frame */}
        <boxGeometry args={[1.8, 1, 0.1]} />
        <meshStandardMaterial color="#222222" roughness={0.3} />
        
        {/* Screen display */}
        <mesh position={[0, 0, 0.06]}>
          <boxGeometry args={[1.6, 0.8, 0.01]} />
          <meshStandardMaterial color={getColor()} emissive={getColor()} emissiveIntensity={0.3} />
        </mesh>
      </mesh>
      
      {/* Label */}
      <Text
        position={[0, 0.9, 1]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.2}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.5}
      >
        {getLabel()}
      </Text>
      
      {/* Holographic price display effect */}
      <mesh position={[0, 2.2, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial
          color={getColor()}
          emissive={getColor()}
          emissiveIntensity={1}
          transparent={true}
          opacity={0.8}
        />
      </mesh>
    </group>
  );
}
