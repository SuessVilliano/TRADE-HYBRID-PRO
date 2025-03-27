import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls, Box, Sphere, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Simple animated box
function AnimatedBox(props: any) {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta * 0.5;
    meshRef.current.rotation.y += delta * 0.2;
  });
  
  return (
    <Box
      ref={meshRef}
      args={[1, 1, 1]}
      {...props}
    >
      <meshStandardMaterial color={props.color || "#5885F2"} />
    </Box>
  );
}

// Simple animated sphere
function AnimatedSphere(props: any) {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state, delta) => {
    meshRef.current.rotation.y += delta * 0.3;
    
    // Simple hover animation
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.2 + props.baseY;
  });
  
  return (
    <Sphere
      ref={meshRef}
      args={[0.5, 32, 32]}
      {...props}
    >
      <meshStandardMaterial color={props.color || "#42A5F5"} />
    </Sphere>
  );
}

// Simple light setup
function Lights() {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 10]} intensity={1} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
    </>
  );
}

// Floor component
function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#3f3f3f" />
    </mesh>
  );
}

export default function MinimalScene() {
  const [mounted, setMounted] = useState(false);
  
  // Log component lifecycle
  useEffect(() => {
    console.log("MinimalScene mounted");
    setMounted(true);
    
    return () => {
      console.log("MinimalScene unmounted");
    };
  }, []);
  
  return (
    <div className="w-full h-screen">
      <Canvas 
        shadows 
        camera={{ position: [3, 3, 5], fov: 75 }}
        style={{ background: '#111827' }}
      >
        <Lights />
        <Floor />
        
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        
        <AnimatedBox position={[0, 0.5, 0]} />
        <AnimatedSphere position={[2, 0.5, 0]} baseY={0.5} color="#E91E63" />
        <AnimatedSphere position={[-2, 0.5, 0]} baseY={0.5} color="#4CAF50" />
        
        {/* Debug reference cube at origin */}
        <Box position={[0, 0.1, 0]} args={[0.2, 0.2, 0.2]}>
          <meshStandardMaterial color="red" />
        </Box>
        
        {/* Status text overlay */}
        {mounted && (
          <group position={[0, 2, 0]}>
            <Sphere args={[0.2, 16, 16]}>
              <meshStandardMaterial color="lime" emissive="lime" emissiveIntensity={0.5} />
            </Sphere>
          </group>
        )}
      </Canvas>
      
      {/* Debug overlay */}
      <div className="absolute top-0 left-0 m-4 p-2 bg-black/50 text-white text-xs rounded">
        <div>MinimalScene Loaded</div>
        <div>THREE.js version: {THREE.REVISION}</div>
      </div>
    </div>
  );
}