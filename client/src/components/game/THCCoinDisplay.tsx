import React, { useRef, useEffect, useState, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { GLTF } from "three-stdlib";

// Define the type for our GLTF model result
type GLTFResult = GLTF & {
  nodes: {
    [key: string]: THREE.Mesh
  }
  materials: {
    [key: string]: THREE.Material | THREE.MeshStandardMaterial
  }
};

// Interface for component props
interface THCCoinDisplayProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  animate?: boolean;
  onClick?: () => void;
}

/**
 * THCCoinDisplay - A 3D component to display the premium THC coin
 * in the metaverse environment
 */
export default function THCCoinDisplay({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  animate = true,
  onClick
}: THCCoinDisplayProps) {
  // Refs for the model
  const modelRef = useRef<THREE.Group>(null);
  
  // State to track loading status
  const [modelLoaded, setModelLoaded] = useState(false);
  
  // Preload the model
  useGLTF.preload('/models/thc_coin_premium.glb');
  
  // Load the model using useGLTF
  const { scene: coinModel } = useGLTF('/models/thc_coin_premium.glb') as GLTF & {
    scene: THREE.Group
  };
  
  // Update loading state
  useEffect(() => {
    if (coinModel) {
      setModelLoaded(true);
      console.log("THC Coin premium model loaded successfully");
    }
  }, [coinModel]);
  
  // Create animation for the coin
  useFrame((state, delta) => {
    if (modelRef.current && animate) {
      // Rotate the coin
      modelRef.current.rotation.y += delta * 0.5;
      
      // Add a slight floating animation
      const time = state.clock.getElapsedTime();
      modelRef.current.position.y = position[1] + Math.sin(time * 1.5) * 0.1;
    }
  });
  
  // Event handlers for interaction
  const handlePointerOver = () => {
    document.body.style.cursor = 'pointer';
  };
  
  const handlePointerOut = () => {
    document.body.style.cursor = 'auto';
  };
  
  const handleClick = () => {
    if (onClick) onClick();
  };
  
  return (
    <group 
      position={position}
      rotation={rotation}
      scale={scale}
      ref={modelRef}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {modelLoaded && coinModel ? (
        <Suspense fallback={
          <mesh castShadow>
            <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
            <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
          </mesh>
        }>
          <primitive object={coinModel.clone()} castShadow receiveShadow />
        </Suspense>
      ) : (
        // Fallback while loading
        <mesh castShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
          <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
        </mesh>
      )}
      
      {/* Add a slight glow effect */}
      <pointLight 
        position={[0, 0, 0]} 
        intensity={0.8} 
        color="#FFD700" 
        distance={3} 
        decay={2} 
      />
    </group>
  );
}