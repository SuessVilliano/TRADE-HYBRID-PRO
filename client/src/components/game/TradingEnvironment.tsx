import React, { useEffect } from 'react';
import * as THREE from 'three';

export default function TradingEnvironment() {
  // Log when environment is initialized
  useEffect(() => {
    console.log("TradingEnvironment component mounted");
    return () => console.log("TradingEnvironment component unmounted");
  }, []);
  
  return (
    <>
      {/* Central hub structure */}
      <group position={[0, 0, 0]}>
        {/* Central platform base */}
        <mesh position={[0, 0.1, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[8, 10, 0.5, 32]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
        </mesh>
        
        {/* Central tower - main structure */}
        <mesh position={[0, 5, 0]} castShadow>
          <cylinderGeometry args={[2, 3, 10, 16]} />
          <meshStandardMaterial color="#1e40af" metalness={0.7} roughness={0.2} />
        </mesh>
        
        {/* Tower top */}
        <mesh position={[0, 10.5, 0]} castShadow>
          <sphereGeometry args={[3, 32, 16]} />
          <meshStandardMaterial 
            color="#3b82f6" 
            emissive="#60a5fa" 
            emissiveIntensity={0.5} 
            metalness={0.9} 
            roughness={0.1} 
          />
        </mesh>
      </group>
      
      {/* Trading zones - four buildings around central hub */}
      
      {/* Crypto trading zone (green) */}
      <group position={[-20, 0, 0]}>
        <mesh position={[0, 2, 0]} castShadow>
          <boxGeometry args={[8, 4, 8]} />
          <meshStandardMaterial 
            color="#15803d" 
            emissive="#22c55e" 
            emissiveIntensity={0.3} 
            metalness={0.6} 
            roughness={0.3} 
          />
        </mesh>
        <mesh position={[0, 5, 0]} castShadow>
          <boxGeometry args={[4, 2, 4]} />
          <meshStandardMaterial 
            color="#16a34a" 
            emissive="#4ade80" 
            emissiveIntensity={0.5} 
            metalness={0.7} 
            roughness={0.2} 
          />
        </mesh>
        {/* Label */}
        <mesh position={[0, 8, 0]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial 
            color="#4ade80" 
            emissive="#4ade80" 
            emissiveIntensity={1} 
          />
        </mesh>
      </group>
      
      {/* Forex trading zone (red) */}
      <group position={[20, 0, 0]}>
        <mesh position={[0, 2, 0]} castShadow>
          <boxGeometry args={[8, 4, 8]} />
          <meshStandardMaterial 
            color="#b91c1c" 
            emissive="#ef4444" 
            emissiveIntensity={0.3} 
            metalness={0.6} 
            roughness={0.3} 
          />
        </mesh>
        <mesh position={[0, 5, 0]} castShadow>
          <boxGeometry args={[4, 2, 4]} />
          <meshStandardMaterial 
            color="#dc2626" 
            emissive="#f87171" 
            emissiveIntensity={0.5} 
            metalness={0.7} 
            roughness={0.2} 
          />
        </mesh>
        {/* Label */}
        <mesh position={[0, 8, 0]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial 
            color="#f87171" 
            emissive="#f87171" 
            emissiveIntensity={1} 
          />
        </mesh>
      </group>
      
      {/* Stocks trading zone (purple) */}
      <group position={[0, 0, 20]}>
        <mesh position={[0, 2, 0]} castShadow>
          <boxGeometry args={[8, 4, 8]} />
          <meshStandardMaterial 
            color="#7e22ce" 
            emissive="#a855f7" 
            emissiveIntensity={0.3} 
            metalness={0.6} 
            roughness={0.3} 
          />
        </mesh>
        <mesh position={[0, 5, 0]} castShadow>
          <boxGeometry args={[4, 2, 4]} />
          <meshStandardMaterial 
            color="#9333ea" 
            emissive="#c084fc" 
            emissiveIntensity={0.5} 
            metalness={0.7} 
            roughness={0.2} 
          />
        </mesh>
        {/* Label */}
        <mesh position={[0, 8, 0]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial 
            color="#c084fc" 
            emissive="#c084fc" 
            emissiveIntensity={1} 
          />
        </mesh>
      </group>
      
      {/* Signals & analysis zone (blue) */}
      <group position={[0, 0, -20]}>
        <mesh position={[0, 2, 0]} castShadow>
          <boxGeometry args={[8, 4, 8]} />
          <meshStandardMaterial 
            color="#1d4ed8" 
            emissive="#3b82f6" 
            emissiveIntensity={0.3} 
            metalness={0.6} 
            roughness={0.3} 
          />
        </mesh>
        <mesh position={[0, 5, 0]} castShadow>
          <boxGeometry args={[4, 2, 4]} />
          <meshStandardMaterial 
            color="#2563eb" 
            emissive="#60a5fa" 
            emissiveIntensity={0.5} 
            metalness={0.7} 
            roughness={0.2} 
          />
        </mesh>
        {/* Label */}
        <mesh position={[0, 8, 0]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial 
            color="#60a5fa" 
            emissive="#60a5fa" 
            emissiveIntensity={1} 
          />
        </mesh>
      </group>
      
      {/* Connecting paths */}
      {/* Path from center to crypto */}
      <mesh position={[-10, 0.05, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[10, 0.1, 2]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      
      {/* Path from center to forex */}
      <mesh position={[10, 0.05, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[10, 0.1, 2]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      
      {/* Path from center to stocks */}
      <mesh position={[0, 0.05, 10]} rotation={[0, Math.PI/2, 0]}>
        <boxGeometry args={[10, 0.1, 2]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      
      {/* Path from center to signals */}
      <mesh position={[0, 0.05, -10]} rotation={[0, Math.PI/2, 0]}>
        <boxGeometry args={[10, 0.1, 2]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
    </>
  );
}