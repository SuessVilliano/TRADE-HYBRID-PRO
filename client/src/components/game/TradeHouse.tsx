import { useTexture, Text } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

interface TradeHouseProps {
  position: [number, number, number];
  rotation?: [number, number, number];
}

export default function TradeHouse({ 
  position, 
  rotation = [0, 0, 0] 
}: TradeHouseProps) {
  // Load textures for the luxury trade house
  const marbleTexture = useTexture("/textures/marble.jpg");
  const woodTexture = useTexture("/textures/wood.jpg");
  const goldRef = useRef<THREE.Group>(null);
  
  // Make textures repeat for better appearance
  woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
  woodTexture.repeat.set(3, 3);
  
  marbleTexture.wrapS = marbleTexture.wrapT = THREE.RepeatWrapping;
  marbleTexture.repeat.set(4, 4);
  
  // Add animation to gold elements
  useFrame((state) => {
    if (goldRef.current) {
      goldRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });
  
  // Pre-calculate box dimensions for a massive luxury building
  const dimensions = useMemo(() => {
    return {
      base: { width: 15, height: 0.5, depth: 15 },
      steps: { width: 12, height: 0.2, depth: 3 },
      floor: { width: 14, height: 0.3, depth: 14 },
      wall: { width: 14, height: 5, depth: 0.3 },
      roof: { width: 16, height: 0.5, depth: 16 },
      column: { radius: 0.6, height: 5 },
      dome: { radius: 8, detail: 4 }
    };
  }, []);
  
  return (
    <group position={position} rotation={rotation}>
      {/* Luxury marble base platform with steps */}
      <mesh position={[0, dimensions.base.height / 2, 0]} receiveShadow castShadow>
        <boxGeometry 
          args={[dimensions.base.width, dimensions.base.height, dimensions.base.depth]} 
        />
        <meshStandardMaterial map={marbleTexture} color="#f5f5f5" roughness={0.2} metalness={0.1} />
      </mesh>
      
      {/* Grand stairs */}
      <mesh position={[0, dimensions.base.height + dimensions.steps.height / 2, dimensions.base.depth / 2 - dimensions.steps.depth / 2]} receiveShadow castShadow>
        <boxGeometry 
          args={[dimensions.steps.width, dimensions.steps.height, dimensions.steps.depth]} 
        />
        <meshStandardMaterial map={marbleTexture} color="#f5f5f5" roughness={0.2} metalness={0.1} />
      </mesh>
      
      {/* Second step */}
      <mesh position={[0, dimensions.base.height + dimensions.steps.height * 1.5, dimensions.base.depth / 2 - dimensions.steps.depth * 1.5]} receiveShadow castShadow>
        <boxGeometry 
          args={[dimensions.steps.width - 1, dimensions.steps.height, dimensions.steps.depth]} 
        />
        <meshStandardMaterial map={marbleTexture} color="#f5f5f5" roughness={0.2} metalness={0.1} />
      </mesh>
      
      {/* Third step */}
      <mesh position={[0, dimensions.base.height + dimensions.steps.height * 2.5, dimensions.base.depth / 2 - dimensions.steps.depth * 2.5]} receiveShadow castShadow>
        <boxGeometry 
          args={[dimensions.steps.width - 2, dimensions.steps.height, dimensions.steps.depth]} 
        />
        <meshStandardMaterial map={marbleTexture} color="#f5f5f5" roughness={0.2} metalness={0.1} />
      </mesh>
      
      {/* Main floor */}
      <mesh position={[0, dimensions.base.height + dimensions.floor.height / 2, 0]} receiveShadow>
        <boxGeometry 
          args={[dimensions.floor.width, dimensions.floor.height, dimensions.floor.depth]} 
        />
        <meshStandardMaterial map={marbleTexture} color="#e0e0e0" roughness={0.1} metalness={0.2} />
      </mesh>
      
      {/* Luxury columns - front facade */}
      {[-5, -3, 3, 5].map((x, index) => (
        <mesh 
          key={`column-front-${index}`} 
          position={[x, dimensions.base.height + dimensions.column.height / 2 + dimensions.floor.height, dimensions.floor.depth / 2 - 1]} 
          castShadow
        >
          <cylinderGeometry args={[dimensions.column.radius, dimensions.column.radius * 1.2, dimensions.column.height, 16]} />
          <meshStandardMaterial map={marbleTexture} color="#f0f0f0" roughness={0.1} metalness={0.1} />
          
          {/* Column capital */}
          <mesh position={[0, dimensions.column.height / 2, 0]} castShadow>
            <cylinderGeometry args={[dimensions.column.radius * 1.5, dimensions.column.radius, 0.5, 16]} />
            <meshStandardMaterial color="#f8f8f8" roughness={0.1} metalness={0.2} />
          </mesh>
          
          {/* Column base */}
          <mesh position={[0, -dimensions.column.height / 2, 0]} castShadow>
            <cylinderGeometry args={[dimensions.column.radius * 1.4, dimensions.column.radius * 1.4, 0.5, 16]} />
            <meshStandardMaterial color="#e0e0e0" roughness={0.2} metalness={0.1} />
          </mesh>
        </mesh>
      ))}
      
      {/* Back columns */}
      {[-5, -3, 3, 5].map((x, index) => (
        <mesh 
          key={`column-back-${index}`} 
          position={[x, dimensions.base.height + dimensions.column.height / 2 + dimensions.floor.height, -dimensions.floor.depth / 2 + 1]} 
          castShadow
        >
          <cylinderGeometry args={[dimensions.column.radius, dimensions.column.radius * 1.2, dimensions.column.height, 16]} />
          <meshStandardMaterial map={marbleTexture} color="#f0f0f0" roughness={0.1} metalness={0.1} />
          
          {/* Column capital */}
          <mesh position={[0, dimensions.column.height / 2, 0]} castShadow>
            <cylinderGeometry args={[dimensions.column.radius * 1.5, dimensions.column.radius, 0.5, 16]} />
            <meshStandardMaterial color="#f8f8f8" roughness={0.1} metalness={0.2} />
          </mesh>
          
          {/* Column base */}
          <mesh position={[0, -dimensions.column.height / 2, 0]} castShadow>
            <cylinderGeometry args={[dimensions.column.radius * 1.4, dimensions.column.radius * 1.4, 0.5, 16]} />
            <meshStandardMaterial color="#e0e0e0" roughness={0.2} metalness={0.1} />
          </mesh>
        </mesh>
      ))}
      
      {/* Side columns - left */}
      {[-4, 0, 4].map((z, index) => (
        <mesh 
          key={`column-left-${index}`} 
          position={[-dimensions.floor.width / 2 + 1, dimensions.base.height + dimensions.column.height / 2 + dimensions.floor.height, z]} 
          castShadow
        >
          <cylinderGeometry args={[dimensions.column.radius, dimensions.column.radius * 1.2, dimensions.column.height, 16]} />
          <meshStandardMaterial map={marbleTexture} color="#f0f0f0" roughness={0.1} metalness={0.1} />
          
          {/* Column capital */}
          <mesh position={[0, dimensions.column.height / 2, 0]} castShadow>
            <cylinderGeometry args={[dimensions.column.radius * 1.5, dimensions.column.radius, 0.5, 16]} />
            <meshStandardMaterial color="#f8f8f8" roughness={0.1} metalness={0.2} />
          </mesh>
          
          {/* Column base */}
          <mesh position={[0, -dimensions.column.height / 2, 0]} castShadow>
            <cylinderGeometry args={[dimensions.column.radius * 1.4, dimensions.column.radius * 1.4, 0.5, 16]} />
            <meshStandardMaterial color="#e0e0e0" roughness={0.2} metalness={0.1} />
          </mesh>
        </mesh>
      ))}
      
      {/* Side columns - right */}
      {[-4, 0, 4].map((z, index) => (
        <mesh 
          key={`column-right-${index}`} 
          position={[dimensions.floor.width / 2 - 1, dimensions.base.height + dimensions.column.height / 2 + dimensions.floor.height, z]} 
          castShadow
        >
          <cylinderGeometry args={[dimensions.column.radius, dimensions.column.radius * 1.2, dimensions.column.height, 16]} />
          <meshStandardMaterial map={marbleTexture} color="#f0f0f0" roughness={0.1} metalness={0.1} />
          
          {/* Column capital */}
          <mesh position={[0, dimensions.column.height / 2, 0]} castShadow>
            <cylinderGeometry args={[dimensions.column.radius * 1.5, dimensions.column.radius, 0.5, 16]} />
            <meshStandardMaterial color="#f8f8f8" roughness={0.1} metalness={0.2} />
          </mesh>
          
          {/* Column base */}
          <mesh position={[0, -dimensions.column.height / 2, 0]} castShadow>
            <cylinderGeometry args={[dimensions.column.radius * 1.4, dimensions.column.radius * 1.4, 0.5, 16]} />
            <meshStandardMaterial color="#e0e0e0" roughness={0.2} metalness={0.1} />
          </mesh>
        </mesh>
      ))}
      
      {/* Inner walls */}
      <mesh 
        position={[0, dimensions.base.height + dimensions.floor.height + dimensions.wall.height / 2, 0]} 
        castShadow
      >
        <boxGeometry args={[dimensions.wall.width - 4, dimensions.wall.height, dimensions.wall.width - 4]} />
        <meshStandardMaterial map={woodTexture} color="#E2CCB0" roughness={0.5} transparent opacity={0.95} />
      </mesh>
      
      {/* Fancy dome roof */}
      <mesh 
        position={[0, dimensions.base.height + dimensions.floor.height + dimensions.wall.height + 2, 0]} 
        castShadow
      >
        <sphereGeometry args={[dimensions.dome.radius, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.7} />
      </mesh>
      
      {/* Gold ornament on top of dome */}
      <group 
        ref={goldRef}
        position={[0, dimensions.base.height + dimensions.floor.height + dimensions.wall.height + dimensions.dome.radius + 1.5, 0]}
      >
        <mesh castShadow>
          <torusGeometry args={[1, 0.2, 16, 32]} />
          <meshStandardMaterial color="#FFD700" roughness={0.1} metalness={1} emissive="#ff9500" emissiveIntensity={0.2} />
        </mesh>
        
        <mesh position={[0, 1, 0]} castShadow>
          <coneGeometry args={[0.3, 1.5, 16]} />
          <meshStandardMaterial color="#FFD700" roughness={0.1} metalness={1} emissive="#ff9500" emissiveIntensity={0.2} />
        </mesh>
      </group>
      
      {/* Luxury entrance - golden arch */}
      <mesh 
        position={[0, dimensions.base.height + dimensions.floor.height + 2.5, dimensions.floor.depth / 2 - 0.8]} 
        castShadow
      >
        <cylinderGeometry args={[4, 4, 0.5, 32, 1, true, Math.PI, Math.PI]} />
        <meshStandardMaterial color="#FFD700" roughness={0.1} metalness={0.8} emissive="#ff9500" emissiveIntensity={0.2} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Trade House Text - Luxury 3D sign */}
      <group position={[0, dimensions.base.height + dimensions.floor.height + dimensions.wall.height + 1, dimensions.floor.depth / 2 + 0.5]}>
        <Text
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
          fontSize={1.2}
          color="#FFD700"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter.woff"
        >
          TRADE HOUSE
        </Text>
        
        {/* Glowing background for the text */}
        <mesh position={[0, 0, -0.1]} castShadow>
          <planeGeometry args={[10, 2]} />
          <meshStandardMaterial color="#000C3D" emissive="#000C3D" emissiveIntensity={0.5} transparent opacity={0.8} />
        </mesh>
      </group>
      
      {/* Decorative lanterns at the entrance */}
      {[-4, 4].map((x, index) => (
        <group 
          key={`lantern-${index}`} 
          position={[x, dimensions.base.height + dimensions.floor.height + 2, dimensions.floor.depth / 2 - 2]}
        >
          <mesh castShadow>
            <cylinderGeometry args={[0.2, 0.2, 4, 8]} />
            <meshStandardMaterial color="#222222" roughness={0.8} />
          </mesh>
          
          <mesh position={[0, 1.5, 0]} castShadow>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial color="#FFD700" emissive="#ff9500" emissiveIntensity={0.8} transparent opacity={0.9} />
          </mesh>
        </group>
      ))}
      
      {/* Glass windows */}
      {[-4, 0, 4].map((x, index) => (
        <mesh 
          key={`window-front-${index}`} 
          position={[x, dimensions.base.height + dimensions.floor.height + 2.5, dimensions.floor.depth / 2 - 0.6]} 
          castShadow
        >
          <boxGeometry args={[1.5, 2.5, 0.1]} />
          <meshPhysicalMaterial color="#88ccff" roughness={0} metalness={0.2} transmission={0.9} transparent opacity={0.7} />
        </mesh>
      ))}
      
      {/* Luxury floor decoration */}
      <mesh 
        position={[0, dimensions.base.height + dimensions.floor.height + 0.01, 0]} 
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <ringGeometry args={[4, 6, 32]} />
        <meshStandardMaterial color="#FFD700" roughness={0.2} metalness={0.7} />
      </mesh>
    </group>
  );
}
