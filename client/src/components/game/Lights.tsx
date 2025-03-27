import React, { useEffect } from 'react';
import * as THREE from 'three';

export default function Lights() {
  // Log when lights are initialized
  useEffect(() => {
    console.log("Lights component mounted");
    return () => console.log("Lights component unmounted");
  }, []);
  
  return (
    <>
      {/* Global ambient light */}
      <ambientLight intensity={0.6} color="#ffffff" />
      
      {/* Main directional light (sun) with increased intensity */}
      <directionalLight
        position={[10, 30, 10]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      
      {/* Fill light with increased intensity */}
      <directionalLight
        position={[-10, 10, -10]}
        intensity={0.7}
      />
      
      {/* Main hemisphere light for better overall illumination */}
      <hemisphereLight 
        args={['#ffffff', '#000000', 0.5]}
      />
      
      {/* Central point light for better player visibility */}
      <pointLight
        position={[0, 8, 0]}
        intensity={1.0}
        color="#ffffff"
        distance={30}
        castShadow
      />
      
      {/* Spotlight for each building with increased intensity and range */}
      <spotLight
        position={[0, 20, 0]}
        angle={0.5}
        penumbra={0.3}
        intensity={1.2}
        castShadow
        distance={50}
      />
      
      {/* Spotlight for crypto area with increased intensity */}
      <spotLight
        position={[-15, 15, 0]}
        angle={0.4}
        penumbra={0.3}
        intensity={0.8}
        castShadow
        color="#22c55e"
        distance={40}
      />
      
      {/* Spotlight for forex area with increased intensity */}
      <spotLight
        position={[15, 15, 0]}
        angle={0.4}
        penumbra={0.3}
        intensity={0.8}
        castShadow
        color="#ef4444"
        distance={40}
      />
      
      {/* Spotlight for stocks area with increased intensity */}
      <spotLight
        position={[0, 15, 15]}
        angle={0.4}
        penumbra={0.3}
        intensity={0.8}
        castShadow
        color="#a855f7"
        distance={40}
      />
      
      {/* Spotlight for signals area with increased intensity */}
      <spotLight
        position={[0, 15, -15]}
        angle={0.4}
        penumbra={0.3}
        intensity={0.8}
        castShadow
        color="#3b82f6"
        distance={40}
      />
    </>
  );
}