import React, { useRef } from 'react';
import { usePlane } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import { Plane, Grid } from '@react-three/drei';
import * as THREE from 'three';

export function Floor(props: any) {
  // Physics body for the floor (static)
  const [ref] = usePlane(() => ({ 
    rotation: [-Math.PI / 2, 0, 0], 
    position: [0, 0, 0],
    type: 'Static'
  }));

  // Grid helper for better visual orientation
  const gridRef = useRef<THREE.GridHelper>(null!);
  
  // Update grid with subtle animation
  useFrame((state, delta) => {
    if (gridRef.current) {
      // Add slight wave effect to grid for visual interest
      gridRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });
  
  return (
    <group>
      {/* Physical floor */}
      <mesh ref={ref as any} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      
      {/* Visual floor enhancements */}
      <Plane 
        args={[100, 100]} 
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
        receiveShadow
      >
        <meshStandardMaterial 
          color="#3a3a3a" 
          roughness={0.8}
          metalness={0.2}
        />
      </Plane>
      
      {/* Decorative grid overlay */}
      <Grid
        args={[100, 100, 100, 100]}
        position={[0, 0.02, 0]}
        cellColor="#666666"
        sectionColor="#888888"
        infiniteGrid
        fadeDistance={50}
        fadeStrength={1.5}
      />
      
      {/* Add a center marker for orientation */}
      <group position={[0, 0.03, 0]}>
        <mesh>
          <ringGeometry args={[1, 2, 32]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.5} />
        </mesh>
        <mesh>
          <ringGeometry args={[3, 3.2, 32]} />
          <meshBasicMaterial color="#ff6600" transparent opacity={0.3} />
        </mesh>
      </group>
      
      {/* Add some reference orientation lines */}
      <group position={[0, 0.03, 0]}>
        {/* X-axis (red) */}
        <mesh position={[15, 0, 0]}>
          <boxGeometry args={[30, 0.05, 0.05]} />
          <meshBasicMaterial color="#ff0000" transparent opacity={0.5} />
        </mesh>
        
        {/* Z-axis (blue) */}
        <mesh position={[0, 0, 15]}>
          <boxGeometry args={[0.05, 0.05, 30]} />
          <meshBasicMaterial color="#0000ff" transparent opacity={0.5} />
        </mesh>
      </group>
      
      {/* Lighting optimization for floor highlight */}
      <pointLight position={[0, 5, 0]} intensity={0.3} color="white" />
    </group>
  );
}