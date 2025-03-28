import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';

// Define controls enum
enum Controls {
  forward = 'forward',
  back = 'back',
  left = 'left',
  right = 'right',
  jump = 'jump',
}

function AnimatedBox(props: any) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHover] = useState(false);
  const [rotation, setRotation] = useState(0);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y = rotation;
      setRotation(rotation + 0.01);
    }
  });
  
  return (
    <mesh
      {...props}
      ref={meshRef}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? '#5ecc89' : '#88c'} />
    </mesh>
  );
}

function AnimatedSphere(props: any) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHover] = useState(false);
  const [position, setPosition] = useState(0);
  
  useFrame(() => {
    if (meshRef.current) {
      setPosition(Math.sin(Date.now() * 0.001) * 0.5);
      meshRef.current.position.y = position + 1;
    }
  });
  
  return (
    <mesh
      {...props}
      ref={meshRef}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color={hovered ? '#e667c0' : '#c88'} />
    </mesh>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#ffffff" />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#60a5fa" />
    </>
  );
}

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial color="#111827" />
      <Grid
        args={[30, 30]}
        cellSize={1}
        cellThickness={1}
        cellColor="#334155"
        sectionSize={3}
        sectionThickness={1.5}
        sectionColor="#475569"
        fadeDistance={30}
        fadeStrength={1}
      />
    </mesh>
  );
}

export default function MinimalScene() {
  // Define key mappings for controls
  const keyMap = [
    { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
    { name: Controls.back, keys: ['ArrowDown', 'KeyS'] },
    { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
    { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
    { name: Controls.jump, keys: ['Space'] },
  ];

  return (
    <div className="h-full">
      <Canvas shadows camera={{ position: [5, 5, 5], fov: 50 }}>
        <color attach="background" args={['#0f172a']} />
        <fog attach="fog" args={['#0f172a', 10, 30]} />
        
        <Lights />
        <Floor />
        
        {/* Example objects */}
        <AnimatedBox position={[-2, 0, 0]} />
        <AnimatedSphere position={[2, 0, 0]} />
        
        {/* Info text - visualization */}
        <group position={[0, 0.1, 0]}>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[4, 0.2, 2]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[0, 0.7, 0]}>
            <boxGeometry args={[3.8, 0.1, 1.8]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
        </group>
        
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2 - 0.1}
        />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}