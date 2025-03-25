import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useMemo } from "react";

interface TradeHouseProps {
  position: [number, number, number];
  rotation?: [number, number, number];
}

export default function TradeHouse({ 
  position, 
  rotation = [0, 0, 0] 
}: TradeHouseProps) {
  // Load wood texture for the house
  const woodTexture = useTexture("/textures/wood.jpg");
  
  // Make the texture repeat for better appearance
  woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
  woodTexture.repeat.set(2, 2);
  
  // Pre-calculate box dimensions
  const dimensions = useMemo(() => {
    return {
      base: { width: 8, height: 0.1, depth: 8 },
      floor: { width: 7.5, height: 0.2, depth: 7.5 },
      wall: { width: 7.5, height: 3, depth: 0.2 },
      roof: { width: 9, height: 0.3, depth: 9 }
    };
  }, []);
  
  return (
    <group position={position} rotation={rotation}>
      {/* Base platform */}
      <mesh position={[0, dimensions.base.height / 2, 0]} receiveShadow castShadow>
        <boxGeometry 
          args={[dimensions.base.width, dimensions.base.height, dimensions.base.depth]} 
        />
        <meshStandardMaterial color="#8B4513" roughness={0.7} />
      </mesh>
      
      {/* Floor */}
      <mesh position={[0, dimensions.base.height + dimensions.floor.height / 2, 0]} receiveShadow>
        <boxGeometry 
          args={[dimensions.floor.width, dimensions.floor.height, dimensions.floor.depth]} 
        />
        <meshStandardMaterial map={woodTexture} color="#A0522D" roughness={0.5} />
      </mesh>
      
      {/* Walls */}
      {/* Front wall with door opening */}
      <group position={[0, dimensions.base.height + dimensions.floor.height + dimensions.wall.height / 2, dimensions.floor.depth / 2 - dimensions.wall.depth / 2]}>
        {/* Left section */}
        <mesh position={[-1.5, 0, 0]} castShadow>
          <boxGeometry args={[dimensions.wall.width / 2 - 1, dimensions.wall.height, dimensions.wall.depth]} />
          <meshStandardMaterial map={woodTexture} color="#DEB887" roughness={0.5} />
        </mesh>
        
        {/* Right section */}
        <mesh position={[1.5, 0, 0]} castShadow>
          <boxGeometry args={[dimensions.wall.width / 2 - 1, dimensions.wall.height, dimensions.wall.depth]} />
          <meshStandardMaterial map={woodTexture} color="#DEB887" roughness={0.5} />
        </mesh>
        
        {/* Top section (above door) */}
        <mesh position={[0, dimensions.wall.height / 2 - 0.5, 0]} castShadow>
          <boxGeometry args={[2, 1, dimensions.wall.depth]} />
          <meshStandardMaterial map={woodTexture} color="#DEB887" roughness={0.5} />
        </mesh>
      </group>
      
      {/* Back wall */}
      <mesh 
        position={[0, dimensions.base.height + dimensions.floor.height + dimensions.wall.height / 2, -dimensions.floor.depth / 2 + dimensions.wall.depth / 2]} 
        castShadow
      >
        <boxGeometry args={[dimensions.wall.width, dimensions.wall.height, dimensions.wall.depth]} />
        <meshStandardMaterial map={woodTexture} color="#DEB887" roughness={0.5} />
      </mesh>
      
      {/* Left wall with window */}
      <group position={[-dimensions.floor.width / 2 + dimensions.wall.depth / 2, dimensions.base.height + dimensions.floor.height + dimensions.wall.height / 2, 0]}>
        {/* Bottom section */}
        <mesh position={[0, -dimensions.wall.height / 4, 0]} castShadow>
          <boxGeometry args={[dimensions.wall.depth, dimensions.wall.height / 2, dimensions.wall.width]} />
          <meshStandardMaterial map={woodTexture} color="#DEB887" roughness={0.5} />
        </mesh>
        
        {/* Top section */}
        <mesh position={[0, dimensions.wall.height / 4, 0]} castShadow>
          <boxGeometry args={[dimensions.wall.depth, dimensions.wall.height / 2, dimensions.wall.width]} />
          <meshStandardMaterial map={woodTexture} color="#DEB887" roughness={0.5} />
        </mesh>
        
        {/* Side sections */}
        <mesh position={[0, 0, -dimensions.wall.width / 4]} castShadow>
          <boxGeometry args={[dimensions.wall.depth, dimensions.wall.height, dimensions.wall.width / 2]} />
          <meshStandardMaterial map={woodTexture} color="#DEB887" roughness={0.5} />
        </mesh>
        
        <mesh position={[0, 0, dimensions.wall.width / 4]} castShadow>
          <boxGeometry args={[dimensions.wall.depth, dimensions.wall.height, dimensions.wall.width / 2]} />
          <meshStandardMaterial map={woodTexture} color="#DEB887" roughness={0.5} />
        </mesh>
      </group>
      
      {/* Right wall with window */}
      <group position={[dimensions.floor.width / 2 - dimensions.wall.depth / 2, dimensions.base.height + dimensions.floor.height + dimensions.wall.height / 2, 0]}>
        {/* Bottom section */}
        <mesh position={[0, -dimensions.wall.height / 4, 0]} castShadow>
          <boxGeometry args={[dimensions.wall.depth, dimensions.wall.height / 2, dimensions.wall.width]} />
          <meshStandardMaterial map={woodTexture} color="#DEB887" roughness={0.5} />
        </mesh>
        
        {/* Top section */}
        <mesh position={[0, dimensions.wall.height / 4, 0]} castShadow>
          <boxGeometry args={[dimensions.wall.depth, dimensions.wall.height / 2, dimensions.wall.width]} />
          <meshStandardMaterial map={woodTexture} color="#DEB887" roughness={0.5} />
        </mesh>
        
        {/* Side sections */}
        <mesh position={[0, 0, -dimensions.wall.width / 4]} castShadow>
          <boxGeometry args={[dimensions.wall.depth, dimensions.wall.height, dimensions.wall.width / 2]} />
          <meshStandardMaterial map={woodTexture} color="#DEB887" roughness={0.5} />
        </mesh>
        
        <mesh position={[0, 0, dimensions.wall.width / 4]} castShadow>
          <boxGeometry args={[dimensions.wall.depth, dimensions.wall.height, dimensions.wall.width / 2]} />
          <meshStandardMaterial map={woodTexture} color="#DEB887" roughness={0.5} />
        </mesh>
      </group>
      
      {/* Roof */}
      <mesh position={[0, dimensions.base.height + dimensions.floor.height + dimensions.wall.height + dimensions.roof.height / 2, 0]} castShadow>
        <boxGeometry args={[dimensions.roof.width, dimensions.roof.height, dimensions.roof.depth]} />
        <meshStandardMaterial color="#8B4513" roughness={0.6} />
      </mesh>
      
      {/* Roof top (pyramid) */}
      <mesh position={[0, dimensions.base.height + dimensions.floor.height + dimensions.wall.height + dimensions.roof.height + 1, 0]} castShadow>
        <coneGeometry args={[dimensions.roof.width / 2, 2, 4]} />
        <meshStandardMaterial color="#A52A2A" roughness={0.5} />
      </mesh>
      
      {/* Trade House Text */}
      <group position={[0, dimensions.base.height + dimensions.floor.height + dimensions.wall.height + 2.5, dimensions.floor.depth / 2 + 0.2]}>
        <mesh>
          <boxGeometry args={[5, 0.8, 0.1]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
        </mesh>
        {/* We would normally add Text3D here for the "TRADE HOUSE" label,
            but for simplicity we're keeping it as a colored box */}
      </group>
    </group>
  );
}
