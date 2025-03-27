import { useRef, useEffect, useState, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { GLTF } from "three-stdlib";
import { useMarketData } from "@/lib/stores/useMarketData";
import { useTrader } from "@/lib/stores/useTrader";
import { Html } from "@react-three/drei";

interface CryptoTradingProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  onInteract?: () => void;
}

// Preload the model
useGLTF.preload('/models/trading_desk.glb');

export default function CryptoTrading({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [2.5, 2.5, 2.5],
  onInteract
}: CryptoTradingProps) {
  const modelRef = useRef<THREE.Group>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [priceDisplay, setPriceDisplay] = useState("Loading...");
  const { currentPrice, symbol } = useMarketData();
  
  // Load custom model
  const { scene: tradingDeskModel } = useGLTF('/models/trading_desk.glb') as GLTF & {
    scene: THREE.Group
  };

  // Clone the model to avoid mutations affecting other instances
  const model = tradingDeskModel.clone();
  
  // Update when model loads
  useEffect(() => {
    if (model) {
      setModelLoaded(true);
      console.log("Crypto trading desk model loaded successfully");
    }
  }, [model]);

  // Customize model materials for crypto theme
  useEffect(() => {
    if (modelLoaded && modelRef.current) {
      modelRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          // Customize screen materials to show crypto colors
          if (child.name.includes('screen') || child.name.includes('monitor')) {
            if (child.material instanceof THREE.MeshStandardMaterial) {
              // Set screen to orange/blue crypto theme
              child.material.emissive = new THREE.Color('#ff9900');
              child.material.emissiveIntensity = 0.8;
            }
          }
          
          // Make the desk more metallic for a crypto vibe
          if (child.name.includes('desk') || child.name.includes('base')) {
            if (child.material instanceof THREE.MeshStandardMaterial) {
              child.material.metalness = 0.8;
              child.material.roughness = 0.2;
              child.material.color = new THREE.Color('#444455');
            }
          }
          
          // Set up shadows
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [modelLoaded]);

  // Update price display
  useEffect(() => {
    if (currentPrice > 0) {
      // Format the price with proper formatting
      setPriceDisplay(`${symbol}: $${currentPrice.toLocaleString('en-US', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`);
    }
  }, [currentPrice, symbol]);
  
  // Animate model (subtle breathing/floating effect)
  useFrame((_, delta) => {
    if (modelRef.current) {
      // Apply subtle floating animation
      modelRef.current.position.y = position[1] + Math.sin(Date.now() * 0.001) * 0.05;
      
      // Pulse the screen brightness based on price movement
      modelRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && 
            child.material instanceof THREE.MeshStandardMaterial && 
            (child.name.includes('screen') || child.name.includes('monitor'))) {
          
          // Pulse based on whether hovered or not
          const targetIntensity = hovered ? 1.2 : 0.8;
          child.material.emissiveIntensity += (targetIntensity - child.material.emissiveIntensity) * delta * 2;
        }
      });
    }
  });

  // Handle interaction
  const handleClick = () => {
    if (onInteract) {
      onInteract();
    } else {
      // Default behavior: navigate to crypto trading page
      window.location.href = '/trading-space?location=crypto';
    }
  };
  
  return (
    <group
      ref={modelRef}
      position={new THREE.Vector3(...position)}
      rotation={new THREE.Euler(...rotation)}
      scale={new THREE.Vector3(...scale)}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {modelLoaded ? (
        <Suspense fallback={
          <mesh castShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
        }>
          <primitive object={model} />
          
          {/* Add floating price display */}
          <Html
            position={[0, 2, 0]}
            center
            distanceFactor={10}
            sprite
          >
            <div className="bg-black/80 text-white px-3 py-1 rounded-md whitespace-nowrap text-center font-bold">
              {priceDisplay}
            </div>
          </Html>
          
          {/* Add a floating Bitcoin logo */}
          <mesh position={[0, 3, 0]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
            <meshStandardMaterial 
              color="#ff9900" 
              emissive="#ff9900"
              emissiveIntensity={0.5}
              metalness={1}
              roughness={0.3}
            />
          </mesh>
          
          {/* Bitcoin symbol (simpler version using basic shapes) */}
          <group position={[0, 3, 0.06]}>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.25, 0.25, 0.05, 16]} />
              <meshStandardMaterial 
                color="#ffffff" 
                emissive="#ffffff"
                emissiveIntensity={1}
              />
            </mesh>
            {/* Simplified B symbol using thin boxes */}
            <mesh position={[0, 0, 0.03]}>
              <boxGeometry args={[0.05, 0.3, 0.01]} />
              <meshStandardMaterial color="#ff9900" />
            </mesh>
            <mesh position={[0.05, 0.075, 0.03]}>
              <boxGeometry args={[0.15, 0.05, 0.01]} />
              <meshStandardMaterial color="#ff9900" />
            </mesh>
            <mesh position={[0.05, -0.075, 0.03]}>
              <boxGeometry args={[0.15, 0.05, 0.01]} />
              <meshStandardMaterial color="#ff9900" />
            </mesh>
          </group>
        </Suspense>
      ) : (
        <mesh castShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
      )}
      
      {/* Add an interaction hitbox */}
      <mesh 
        visible={false} 
        position={[0, 1, 0]} 
        scale={[2, 2, 2]}
        onClick={handleClick}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}