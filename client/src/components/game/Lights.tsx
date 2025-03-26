import React from 'react';
import * as THREE from 'three';

export default function Lights() {
  return (
    <>
      {/* Main directional light (sun) */}
      <directionalLight
        position={[10, 20, 10]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      
      {/* Fill light */}
      <directionalLight
        position={[-10, 10, -10]}
        intensity={0.3}
      />
      
      {/* Spotlight for each building */}
      <spotLight
        position={[0, 15, 0]}
        angle={0.3}
        penumbra={0.2}
        intensity={0.8}
        castShadow
      />
      
      {/* Spotlight for crypto area */}
      <spotLight
        position={[-15, 10, 0]}
        angle={0.3}
        penumbra={0.2}
        intensity={0.5}
        castShadow
        color="#22c55e"
      />
      
      {/* Spotlight for forex area */}
      <spotLight
        position={[15, 10, 0]}
        angle={0.3}
        penumbra={0.2}
        intensity={0.5}
        castShadow
        color="#ef4444"
      />
      
      {/* Spotlight for stocks area */}
      <spotLight
        position={[0, 10, 15]}
        angle={0.3}
        penumbra={0.2}
        intensity={0.5}
        castShadow
        color="#a855f7"
      />
      
      {/* Spotlight for signals area */}
      <spotLight
        position={[0, 10, -15]}
        angle={0.3}
        penumbra={0.2}
        intensity={0.5}
        castShadow
        color="#3b82f6"
      />
    </>
  );
}