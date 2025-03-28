import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, useKeyboardControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';

// Define controls enum
enum Controls {
  forward = 'forward',
  back = 'back',
  left = 'left',
  right = 'right',
  jump = 'jump',
}

// Preload models
useGLTF.preload('/models/trader_character.glb');
useGLTF.preload('/models/tradehouse.glb');
useGLTF.preload('/models/thc_coin_premium.glb');

function TraderCharacter(props: any) {
  const modelRef = useRef<THREE.Group>(null!);
  const [hovered, setHover] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [modelLoaded, setModelLoaded] = useState(false);
  
  // Load the character model
  const { scene: characterModel } = useGLTF('/models/trader_character.glb') as GLTF & {
    scene: THREE.Group
  };
  
  // Track loading state
  useEffect(() => {
    if (characterModel) {
      setModelLoaded(true);
      console.log("Trader character model loaded successfully");
    }
  }, [characterModel]);
  
  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y = rotation;
      setRotation(rotation + 0.01);
    }
  });
  
  return (
    <group 
      ref={modelRef}
      {...props}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      scale={[2.5, 2.5, 2.5]}
    >
      {modelLoaded && characterModel ? (
        <Suspense fallback={
          <mesh castShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
        }>
          <primitive 
            object={characterModel.clone()} 
            castShadow 
            receiveShadow 
            scale={hovered ? [1.1, 1.1, 1.1] : [1, 1, 1]}
          />
        </Suspense>
      ) : (
        <mesh castShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#5ecc89" />
        </mesh>
      )}
    </group>
  );
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

function TradeHouseModel(props: any) {
  const modelRef = useRef<THREE.Group>(null!);
  const [hovered, setHover] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  
  // Load the tradehouse model
  const { scene: houseModel } = useGLTF('/models/tradehouse.glb') as GLTF & {
    scene: THREE.Group
  };
  
  // Track loading state
  useEffect(() => {
    if (houseModel) {
      setModelLoaded(true);
      console.log("Trade house model loaded successfully");
    }
  }, [houseModel]);
  
  return (
    <group 
      ref={modelRef}
      {...props}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      scale={[2.5, 2.5, 2.5]}
    >
      {modelLoaded && houseModel ? (
        <Suspense fallback={
          <mesh castShadow>
            <boxGeometry args={[5, 3, 5]} />
            <meshStandardMaterial color="#555555" />
          </mesh>
        }>
          <primitive 
            object={houseModel.clone()} 
            castShadow 
            receiveShadow 
          />
        </Suspense>
      ) : (
        <mesh castShadow>
          <boxGeometry args={[5, 3, 5]} />
          <meshStandardMaterial color="#555555" />
        </mesh>
      )}
    </group>
  );
}

function THCCoinModel(props: any) {
  const modelRef = useRef<THREE.Group>(null!);
  const [hovered, setHover] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [modelLoaded, setModelLoaded] = useState(false);
  
  // Load the coin model
  const { scene: coinModel } = useGLTF('/models/thc_coin_premium.glb') as GLTF & {
    scene: THREE.Group
  };
  
  // Track loading state
  useEffect(() => {
    if (coinModel) {
      setModelLoaded(true);
      console.log("THC coin model loaded successfully");
    }
  }, [coinModel]);
  
  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y = rotation;
      setRotation(rotation + 0.01);
    }
  });
  
  return (
    <group 
      ref={modelRef}
      {...props}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      scale={[1.5, 1.5, 1.5]}
    >
      {modelLoaded && coinModel ? (
        <Suspense fallback={
          <mesh castShadow>
            <cylinderGeometry args={[1, 1, 0.2, 32]} />
            <meshStandardMaterial color="#FFD700" />
          </mesh>
        }>
          <primitive 
            object={coinModel.clone()} 
            castShadow 
            receiveShadow 
            scale={hovered ? [1.1, 1.1, 1.1] : [1, 1, 1]}
          />
        </Suspense>
      ) : (
        <mesh castShadow>
          <cylinderGeometry args={[1, 1, 0.2, 32]} />
          <meshStandardMaterial color="#FFD700" />
        </mesh>
      )}
    </group>
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

function InfoPanel() {
  return (
    <group position={[0, 3, 0]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[6, 2, 0.1]} />
        <meshStandardMaterial color="#1e293b" opacity={0.9} transparent />
      </mesh>
      {/* Text would normally go here, but we're using a basic placeholder */}
    </group>
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
      <Canvas shadows camera={{ position: [10, 8, 10], fov: 50 }}>
        <color attach="background" args={['#0f172a']} />
        <fog attach="fog" args={['#0f172a', 15, 35]} />
        
        <Lights />
        <Floor />
        
        {/* Trading House elements */}
        <Suspense fallback={null}>
          {/* Trader character */}
          <TraderCharacter position={[0, 0, 0]} />
          
          {/* Trade house building */}
          <TradeHouseModel position={[8, 0, 0]} />
          
          {/* THC Coins */}
          <THCCoinModel position={[0, 1.5, 3]} />
          <THCCoinModel position={[3, 1.5, 0]} />
          <THCCoinModel position={[-3, 1.5, -3]} />
          
          {/* Decorative elements */}
          <AnimatedBox position={[-5, 0, 5]} />
          <AnimatedSphere position={[5, 0, -5]} />
        </Suspense>
        
        {/* Info panel */}
        <InfoPanel />
        
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={30}
          maxPolarAngle={Math.PI / 2 - 0.1}
        />
        <Environment preset="city" />
      </Canvas>
      
      {/* Overlay instructions */}
      <div className="absolute bottom-4 left-4 bg-black/70 text-white p-3 rounded-lg text-sm max-w-xs">
        <h3 className="font-bold mb-1">Trade Hybrid Metaverse Preview</h3>
        <p className="text-gray-300 text-xs mb-2">
          This is a simplified preview of the full metaverse experience. The complete version will include:
        </p>
        <ul className="text-xs list-disc pl-4 text-gray-300">
          <li>Full character movement</li>
          <li>Interactive trade signals</li>
          <li>Live market data</li>
          <li>Multiplayer interaction</li>
          <li>Voice communication</li>
        </ul>
      </div>
    </div>
  );
}