import React, { useRef, useState, useEffect, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import { useGLTF, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';

// Typing for our GLB model
type GLTFResult = GLTF & {
  nodes: {
    [key: string]: THREE.Mesh;
  };
  materials: {
    [key: string]: THREE.Material;
  };
};

// Bitcoin price display component
function BitcoinPrice({ position }: { position: [number, number, number] }) {
  const [price, setPrice] = useState(42567.89);
  const [trend, setTrend] = useState<'up' | 'down' | 'neutral'>('neutral');
  const textRef = useRef<THREE.Mesh>(null!);
  
  // Update Bitcoin price periodically
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    // Update price every 2 seconds with some random movement
    if (Math.floor(time) % 2 === 0 && Math.floor(time) !== Math.floor(time - 0.1)) {
      const change = (Math.random() - 0.5) * 200;
      const newPrice = price + change;
      setPrice(newPrice);
      setTrend(change > 0 ? 'up' : change < 0 ? 'down' : 'neutral');
      
      // Log price change for debugging
      console.log(`Bitcoin price updated: ${newPrice.toFixed(2)}, trend: ${trend}`);
    }
    
    // Add subtle floating animation to the text
    if (textRef.current) {
      textRef.current.position.y = position[1] + Math.sin(time * 2) * 0.05;
    }
  });
  
  // Color based on price trend
  const getColor = () => {
    switch (trend) {
      case 'up':
        return '#00ff00';
      case 'down':
        return '#ff0000';
      case 'neutral':
      default:
        return '#ffffff';
    }
  };
  
  return (
    <group position={position} ref={textRef}>
      <Text
        color={getColor()}
        fontSize={0.5}
        maxWidth={10}
        lineHeight={1}
        textAlign="center"
        font="/fonts/Inter-Bold.woff"
        anchorX="center"
        anchorY="middle"
      >
        {`BTC $${price.toFixed(2)}`}
      </Text>
      
      <Text
        position={[0, -0.6, 0]}
        color="white"
        fontSize={0.2}
        maxWidth={10}
        lineHeight={1}
        textAlign="center"
        font="/fonts/Inter-Medium.woff"
        anchorX="center"
        anchorY="middle"
      >
        Live Crypto Trading
      </Text>
    </group>
  );
}

// Main CryptoTrading component
export function CryptoTrading(props: any) {
  const [ref] = useBox(() => ({
    type: 'Static',
    position: props.position || [0, 0, 0],
    args: [4, 2, 4],
    ...props
  }));
  
  const [modelLoaded, setModelLoaded] = useState(false);
  const [model, setModel] = useState<THREE.Group | null>(null);
  
  // Preload the model on component first mount
  useEffect(() => {
    // Preload the desk model
    useGLTF.preload('/models/trading_desk.glb');
  }, []);
  
  // Load the trading desk model
  useEffect(() => {
    try {
      // Use the preloaded model
      const gltf = useGLTF('/models/trading_desk.glb');
      
      if (gltf && gltf.scene) {
        // Clone the model to avoid issues
        const modelClone = gltf.scene.clone();
        
        // Scale and position adjustments
        modelClone.scale.set(1.5, 1.5, 1.5);
        modelClone.position.set(0, 0, 0);
        
        // Enable shadows
        modelClone.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        
        setModel(modelClone);
        setModelLoaded(true);
        console.log("Trading desk model loaded successfully");
      } else {
        console.error("Trading desk model scene is undefined");
        setModelLoaded(false);
      }
    } catch (error) {
      console.error("Error in trading desk model loading:", error);
      setModelLoaded(false);
    }
  }, []);
  
  // Trading desk with monitors/screens
  return (
    <group>
      <group ref={ref as any}>
        {modelLoaded && model ? (
          <primitive object={model} />
        ) : (
          // Fallback if model fails to load
          <group>
            {/* Base table */}
            <mesh receiveShadow castShadow position={[0, 0.5, 0]}>
              <boxGeometry args={[4, 1, 2]} />
              <meshStandardMaterial color="#3a3a3a" />
            </mesh>
            
            {/* Monitor stand */}
            <mesh receiveShadow castShadow position={[0, 1.25, -0.5]}>
              <boxGeometry args={[0.5, 0.5, 0.5]} />
              <meshStandardMaterial color="#222222" />
            </mesh>
            
            {/* Monitor screen */}
            <mesh receiveShadow castShadow position={[0, 2, -0.5]}>
              <boxGeometry args={[3, 1.5, 0.1]} />
              <meshStandardMaterial color="#000000" emissive="#2a2a50" emissiveIntensity={0.5} />
            </mesh>
            
            {/* Keyboard */}
            <mesh receiveShadow castShadow position={[0, 1.05, 0.5]}>
              <boxGeometry args={[2, 0.1, 0.8]} />
              <meshStandardMaterial color="#111111" />
            </mesh>
          </group>
        )}
        
        {/* Bitcoin price display above the desk */}
        <BitcoinPrice position={[0, 3, 0]} />
        
        {/* Add lighting to highlight the trading desk */}
        <pointLight position={[0, 3, 0]} intensity={0.8} color="#64c8ff" distance={10} />
      </group>
    </group>
  );
}