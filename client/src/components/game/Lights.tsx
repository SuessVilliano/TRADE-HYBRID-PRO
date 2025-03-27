import React, { useRef } from 'react';
import { useHelper } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function Lights() {
  // Light references
  const directionalLightRef = useRef<THREE.DirectionalLight>(null!);
  const pointLightRef = useRef<THREE.PointLight>(null!);
  const spotLightRef = useRef<THREE.SpotLight>(null!);
  
  // Animated light colors for subtle environment effects
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Slowly pulse the point light intensity for ambient effect
    if (pointLightRef.current) {
      pointLightRef.current.intensity = 1 + Math.sin(time * 0.5) * 0.3;
    }
    
    // Subtly move the spot light for dynamic shadows
    if (spotLightRef.current) {
      spotLightRef.current.position.x = Math.sin(time * 0.3) * 5;
      spotLightRef.current.position.z = Math.cos(time * 0.3) * 5;
    }
  });
  
  // Uncomment this to visualize light during development
  // useHelper(directionalLightRef, THREE.DirectionalLightHelper, 5);
  
  return (
    <>
      {/* Ambient light for base illumination */}
      <ambientLight intensity={0.6} color="#ffffff" />
      
      {/* Main directional light (sun-like) */}
      <directionalLight
        ref={directionalLightRef}
        position={[10, 15, 10]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      
      {/* Supplementary point light */}
      <pointLight
        ref={pointLightRef}
        position={[0, 10, 0]}
        intensity={1}
        color="#f0f8ff"
        distance={50}
        castShadow
      />
      
      {/* Spotlight for dramatic highlights */}
      <spotLight
        ref={spotLightRef}
        position={[5, 15, 5]}
        angle={0.3}
        penumbra={0.8}
        intensity={1.5}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
      />
      
      {/* Additional fill lights for better visibility */}
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#6496ff" />
      <pointLight position={[10, 5, -10]} intensity={0.5} color="#ff9664" />
      
      {/* Trading floor area spotlight */}
      <spotLight
        position={[10, 15, 10]}
        angle={0.5}
        penumbra={0.6}
        intensity={1.0}
        color="#ffffff"
        castShadow
        target-position={[10, 0, 10]}
      />
      
      {/* Colored rim light for character highlighting */}
      <pointLight position={[0, 3, -10]} intensity={0.5} color="#64ffb4" />
    </>
  );
}