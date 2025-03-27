import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

export default function SceneCamera() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);
  const { camera, size } = useThree();
  
  // Log when camera is initialized
  useEffect(() => {
    console.log("SceneCamera component mounted");
    console.log("Camera position:", camera.position);
    
    return () => console.log("SceneCamera component unmounted");
  }, [camera]);
  
  // Adjust camera based on screen size
  useEffect(() => {
    console.log("Viewport size changed:", size.width, size.height);
    
    if (cameraRef.current) {
      // Adjust field of view for better visibility
      cameraRef.current.fov = size.width < 768 ? 70 : 50;
      cameraRef.current.updateProjectionMatrix();
    }
  }, [size]);
  
  // Optional smooth camera movement
  useFrame(() => {
    if (cameraRef.current) {
      // Copy camera properties to the main camera
      camera.position.copy(cameraRef.current.position);
      camera.rotation.copy(cameraRef.current.rotation);
      camera.updateProjectionMatrix();
    }
  });
  
  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[10, 8, 10]}
      fov={50}
      near={0.1}
      far={1000}
    />
  );
}