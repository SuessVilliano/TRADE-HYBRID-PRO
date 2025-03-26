import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useSphere } from "@react-three/cannon";
import { useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";
import { PlayerState } from "../../lib/services/multiplayer-service";
import { GLTF } from "three-stdlib";

type GLTFResult = GLTF & {
  nodes: {
    [key: string]: THREE.Mesh
  }
  materials: {
    [key: string]: THREE.Material | THREE.MeshStandardMaterial
  }
};

interface OtherPlayerProps {
  player: PlayerState;
  onInteract?: () => void;
}

export default function OtherPlayer({ player, onInteract }: OtherPlayerProps) {
  const modelRef = useRef<THREE.Group>(null);
  const [smoothPosition, setSmoothPosition] = useState<[number, number, number]>(player.position);
  const [smoothRotation, setSmoothRotation] = useState<number>(player.rotation);
  const [interactable, setInteractable] = useState(false);
  const targetPosition = useRef<THREE.Vector3>(new THREE.Vector3(...player.position));
  const targetRotation = useRef<number>(player.rotation);
  
  // Preload the character model
  const { scene: characterModel } = useGLTF('/models/trader_character.glb') as GLTFResult & {
    scene: THREE.Group
  };
  
  // Simple physics collider for the player
  const [ref] = useSphere(() => ({
    mass: 0, // Static body
    position: player.position,
    args: [0.5], // Radius of the sphere
    type: "Static",
  }));
  
  // Update target position and rotation when player state changes
  useEffect(() => {
    targetPosition.current.set(...player.position);
    targetRotation.current = player.rotation;
  }, [player.position, player.rotation]);
  
  // Smoothly interpolate position and rotation in the game loop
  useFrame((_, delta) => {
    if (!modelRef.current) return;
    
    // Interpolate position
    const lerpFactor = Math.min(1, delta * 5); // Adjust for smoothness
    
    const newX = THREE.MathUtils.lerp(smoothPosition[0], targetPosition.current.x, lerpFactor);
    const newY = THREE.MathUtils.lerp(smoothPosition[1], targetPosition.current.y, lerpFactor);
    const newZ = THREE.MathUtils.lerp(smoothPosition[2], targetPosition.current.z, lerpFactor);
    
    setSmoothPosition([newX, newY, newZ]);
    
    // Interpolate rotation
    const newRotation = THREE.MathUtils.lerp(smoothRotation, targetRotation.current, lerpFactor);
    setSmoothRotation(newRotation);
    
    // Set model position and rotation
    modelRef.current.position.set(newX, newY, newZ);
    modelRef.current.rotation.y = newRotation;
  });
  
  // Apply customization to the model
  useEffect(() => {
    if (!modelRef.current || !player.customization) return;
    
    // Apply customization to the model if available
    const bodyMeshes = ['Body', 'Legs', 'Arms'];
    const headMeshes = ['Head'];
    
    modelRef.current.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      
      // Apply body color to body parts
      if (bodyMeshes.some(part => child.name.includes(part))) {
        if (child.material instanceof THREE.MeshStandardMaterial) {
          child.material = child.material.clone();
          child.material.color.set(player.customization.bodyColor || '#1E88E5');
          if (player.customization.bodyEmissive) {
            child.material.emissive.set(player.customization.bodyEmissive);
            child.material.emissiveIntensity = 0.5;
          }
        }
      }
      
      // Apply head color to head parts
      if (headMeshes.some(part => child.name.includes(part))) {
        if (child.material instanceof THREE.MeshStandardMaterial) {
          child.material = child.material.clone();
          child.material.color.set(player.customization.headColor || '#FFFFFF');
          if (player.customization.headEmissive) {
            child.material.emissive.set(player.customization.headEmissive);
            child.material.emissiveIntensity = 0.5;
          }
        }
      }
    });
  }, [player.customization]);
  
  return (
    <group 
      ref={ref as React.RefObject<THREE.Group>}
      onPointerOver={() => setInteractable(true)}
      onPointerOut={() => setInteractable(false)}
      onClick={() => interactable && onInteract && onInteract()}
    >
      {/* Player username floating above */}
      <group position={[0, 2, 0]}>
        <Html
          center
          className="select-none pointer-events-none"
          style={{
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: '4px 8px',
            borderRadius: '4px',
            color: 'white',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            fontSize: '14px',
          }}
          distanceFactor={15}
        >
          {player.username}
        </Html>
      </group>
      
      {/* Player model */}
      <group ref={modelRef} position={smoothPosition} rotation={[0, smoothRotation, 0]}>
        <primitive object={characterModel.clone()} scale={[1, 1, 1]} />
      </group>
      
      {/* Interaction indicator (visible when hovering) */}
      {interactable && (
        <mesh position={[0, 2.3, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#44EEFF" emissive="#44EEFF" emissiveIntensity={0.5} />
        </mesh>
      )}
    </group>
  );
}

// Preload the model
useGLTF.preload('/models/trader_character.glb');