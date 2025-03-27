import React, { useEffect } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';

export default function Floor() {
  // Log when floor is initialized
  useEffect(() => {
    console.log("Floor component mounted");
    return () => console.log("Floor component unmounted");
  }, []);

  // Create a grid pattern
  const gridSize = 100;
  const gridDivisions = 50;
  
  return (
    <>
      {/* Main floor */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]} 
        receiveShadow
      >
        <planeGeometry args={[gridSize, gridSize]} />
        <meshStandardMaterial 
          color="#4a5568" 
          roughness={0.7}
          metalness={0.3}
          emissive="#111111"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Grid lines overlay */}
      <gridHelper 
        args={[gridSize, gridDivisions, '#2563eb', '#94a3b8']} 
        position={[0, 0.01, 0]}
      />
      
      {/* Central platform */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
        receiveShadow
      >
        <circleGeometry args={[10, 32]} />
        <meshStandardMaterial 
          color="#1e40af" 
          roughness={0.5}
          metalness={0.5}
          emissive="#1e3a8a"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Debug position marker at origin */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.5, 0.1, 0.5]} />
        <meshStandardMaterial color="red" />
      </mesh>
    </>
  );
}