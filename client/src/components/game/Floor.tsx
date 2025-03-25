import { useTexture } from "@react-three/drei";
import * as THREE from "three";

export default function Floor() {
  const texture = useTexture("/textures/grass.png");
  
  // Make the texture repeat many times over the floor
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(20, 20);
  
  return (
    <mesh 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, 0, 0]} 
      receiveShadow
    >
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial 
        map={texture} 
        color="#477A3E" 
        roughness={0.8}
      />
    </mesh>
  );
}
