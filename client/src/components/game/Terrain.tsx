import React, { useEffect } from 'react';
import { usePlane } from '@react-three/cannon';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Terrain component - creates a textured plane for the trading floor
 */
const Terrain: React.FC = () => {
  // Load terrain texture
  const grassTexture = useTexture('/textures/grass.png');
  
  // Configure texture
  useEffect(() => {
    if (grassTexture) {
      grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
      grassTexture.repeat.set(20, 20); // Repeat texture to cover large plane
      grassTexture.encoding = THREE.sRGBEncoding;
    }
  }, [grassTexture]);
  
  // Use a physics plane for the ground
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0], // Rotate to be horizontal
    position: [0, 0, 0],
    type: 'static',
  }));

  // Create a textured mesh for the terrain
  return (
    <mesh 
      ref={ref}
      receiveShadow
    >
      <planeGeometry args={[100, 100, 20, 20]} />
      <meshStandardMaterial 
        map={grassTexture}
        roughness={0.8}
        metalness={0.1}
        color="#ffffff" // White color allows texture to show true colors
      />
    </mesh>
  );
};

export default Terrain;