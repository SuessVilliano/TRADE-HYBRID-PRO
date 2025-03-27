import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Text } from "@react-three/drei";
import * as THREE from "three";
import { useSignals } from "@/lib/stores/useSignals";
import { GLTF } from "three-stdlib";

interface SignalTowerProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  onInteract?: () => void;
}

type GLTFResult = GLTF & {
  nodes: {
    [key: string]: THREE.Mesh
  }
  materials: {
    [key: string]: THREE.Material | THREE.MeshStandardMaterial
  }
};

// Preload the model
useGLTF.preload('/models/signal_tower.glb');

export default function SignalTower({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [2.5, 2.5, 2.5],
  onInteract
}: SignalTowerProps) {
  const group = useRef<THREE.Group>(null);
  const { signals } = useSignals();
  const [pulseIntensity, setPulseIntensity] = useState(1);
  const [hasNewSignals, setHasNewSignals] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Load signal tower model
  const { scene: signalTowerModel } = useGLTF('/models/signal_tower.glb') as GLTFResult & {
    scene: THREE.Group
  };
  
  // Clone the model to avoid mutations affecting other instances
  const model = signalTowerModel.clone();
  
  // Check for new unread signals
  useEffect(() => {
    const unreadSignals = signals.filter(signal => !signal.read);
    const count = unreadSignals.length;
    setHasNewSignals(count > 0);
    setUnreadCount(count);
  }, [signals]);
  
  // Animate the signal tower light based on available signals
  useFrame((_, delta) => {
    if (hasNewSignals) {
      // Pulsate faster with more intensity when there are new signals
      setPulseIntensity(state => {
        const newIntensity = state + Math.sin(Date.now() * 0.005) * delta * 2;
        return Math.max(1, Math.min(newIntensity, 3)); // Clamp between 1 and 3
      });
    } else {
      // Gentle pulsing when no new signals
      setPulseIntensity(1 + Math.sin(Date.now() * 0.001) * 0.2);
    }
    
    // Apply the pulse intensity to the model's emission
    if (group.current) {
      group.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          // Find materials that should emit light (like screens, lights, etc.)
          if (child.material.name?.includes('light') || 
              child.material.name?.includes('screen') ||
              child.material.name?.includes('display') ||
              child.material.name?.includes('emit')) {
            // Update emission intensity
            child.material.emissiveIntensity = pulseIntensity;
            
            // Set color based on signal status
            if (hasNewSignals) {
              child.material.emissive = new THREE.Color(0x00ff88); // Green for new signals
            } else {
              child.material.emissive = new THREE.Color(0x0088ff); // Blue for normal state
            }
          }
        }
      });
    }
  });
  
  // Handle interaction with the signal tower
  const handleClick = () => {
    if (onInteract) {
      onInteract();
    } else {
      // Default behavior: navigate to the signals page
      window.location.href = '/trading-space?location=signals';
    }
  };
  
  return (
    <group
      ref={group}
      position={new THREE.Vector3(...position)}
      rotation={new THREE.Euler(...rotation)}
      scale={new THREE.Vector3(...scale)}
      onClick={handleClick}
    >
      <primitive object={model} />
      
      {/* Tower label */}
      <Text
        position={[0, 8, 0]}
        fontSize={0.5}
        color="#FFFFFF"
        font="/fonts/inter.woff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        Signal Tower
      </Text>
      
      {/* Add an interaction hitbox */}
      <mesh visible={false} position={[0, 2, 0]} scale={[2, 4, 2]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Add a visible indicator for new signals */}
      {hasNewSignals && (
        <group>
          <mesh position={[0, 6, 0]}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial
              color="#00ff88"
              emissive="#00ff88"
              emissiveIntensity={pulseIntensity}
              toneMapped={false}
            />
          </mesh>
          
          {/* Display count of new signals */}
          <group position={[0, 4, 0]}>
            <mesh>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#ffffff"
                emissiveIntensity={1}
              />
            </mesh>
            <Text
              position={[0, 0, 0.31]}
              fontSize={0.25}
              color="#000000"
              font="/fonts/inter.woff"
              anchorX="center"
              anchorY="middle"
            >
              {unreadCount}
            </Text>
          </group>

          {/* Indicator beam */}
          <mesh position={[0, 10, 0]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.3, 8, 8, 1, true]} />
            <meshStandardMaterial
              color="#00ff88"
              emissive="#00ff88"
              emissiveIntensity={pulseIntensity * 0.5}
              transparent
              opacity={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}