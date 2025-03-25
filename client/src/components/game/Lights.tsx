import { useRef } from "react";
import * as THREE from "three";

export default function Lights() {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  
  return (
    <>
      {/* Increased ambient light for better visibility */}
      <ambientLight intensity={0.6} color="#ffffff" />
      
      {/* Main directional light with shadows */}
      <directionalLight
        ref={lightRef}
        position={[10, 10, 5]}
        intensity={1.2}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      
      {/* Secondary fill light */}
      <directionalLight
        position={[-5, 8, -10]}
        intensity={0.5}
        color="#b0c4de"
      />
      
      {/* Ground fill light */}
      <hemisphereLight
        args={["#d9e8ff", "#004400", 0.5]}
      />
      
      {/* Add a spotlight to follow the player and highlight them */}
      <pointLight 
        position={[0, 8, 0]} 
        intensity={0.8} 
        color="#ffffff"
        distance={15}
        decay={2}
      />
    </>
  );
}
