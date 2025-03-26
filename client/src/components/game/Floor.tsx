import React from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';

export default function Floor() {
  return (
    <mesh 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, 0, 0]} 
      receiveShadow
    >
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial 
        color="#777777" 
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  );
}