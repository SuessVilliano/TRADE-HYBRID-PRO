import React from 'react';
import * as THREE from 'three';

/**
 * Lighting component for the 3D game environment
 */
const Lighting: React.FC = () => {
  return (
    <>
      {/* Main directional light (sun) */}
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      
      {/* Ambient light for general scene illumination */}
      <ambientLight intensity={0.3} />
      
      {/* Hemisphere light to simulate sky/ground reflection */}
      <hemisphereLight 
        args={[0x87CEEB, 0x3D5229, 0.5]} 
        position={[0, 50, 0]} 
      />
    </>
  );
};

export default Lighting;