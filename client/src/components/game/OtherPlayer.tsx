import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";
import { PlayerState } from "../../lib/services/multiplayer-service";
import { GLTF } from "three-stdlib";
import { useMultiplayer } from "../../lib/stores/useMultiplayer";
import { Button } from "../ui/button";
import { useAudio } from "../../lib/stores/useAudio";
import UserStatusIndicator from "./UserStatusIndicator";

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
  const [nameplateHovered, setNameplateHovered] = useState(false);
  const [voiceWaveScale, setVoiceWaveScale] = useState(1);
  const targetPosition = useRef<THREE.Vector3>(new THREE.Vector3(...player.position));
  const targetRotation = useRef<number>(player.rotation);
  
  // Get multiplayer store functions
  const { 
    sendFriendRequest, 
    mutePlayer, 
    unmutePlayer, 
    isPlayerMuted, 
    isPlayerFriend,
    clientId,
    activeSpeakers
  } = useMultiplayer();
  
  // Check if this player is currently speaking
  const isSpeaking = activeSpeakers.includes(player.id);
  
  // Preload the character model
  const { scene: characterModel } = useGLTF('/models/trader_character.glb') as GLTFResult & {
    scene: THREE.Group
  };
  
  // Reference for the player group
  const ref = useRef<THREE.Group>(null);
  
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
    
    // Animate voice indicator when speaking
    if (isSpeaking && !isPlayerMuted(player.id)) {
      // Pulse effect for voice indicator
      const pulseSpeed = 2; // Speed of the pulse
      const pulseMin = 0.9; // Minimum scale
      const pulseMax = 1.1; // Maximum scale
      
      // Calculate new scale using sine wave for smooth transition
      const newScale = pulseMin + (Math.sin(Date.now() * 0.005 * pulseSpeed) * 0.5 + 0.5) * (pulseMax - pulseMin);
      setVoiceWaveScale(newScale);
    }
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
      ref={ref}
      position={player.position}
      onPointerOver={() => setInteractable(true)}
      onPointerOut={() => setInteractable(false)}
      onClick={() => interactable && onInteract && onInteract()}
    >
      {/* Player username floating above */}
      <group position={[0, 2, 0]}>
        <Html
          center
          className="select-none"
          style={{
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: '4px 8px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '14px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
            width: 'auto',
            minWidth: '120px',
            transform: nameplateHovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.2s ease',
          }}
          distanceFactor={15}
          onPointerOver={() => setNameplateHovered(true)}
          onPointerOut={() => setNameplateHovered(false)}
        >
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center justify-between w-full">
              <span className={`${isSpeaking && !isPlayerMuted(player.id) ? "text-green-400" : "text-white"}`}>
                {player.username}
                {isPlayerMuted(player.id) && (
                  <span className="ml-1 text-red-400">🔇</span>
                )}
                {isSpeaking && !isPlayerMuted(player.id) && (
                  <span className="ml-1 text-green-400" style={{ animation: 'pulse 1.5s infinite' }}>🎤</span>
                )}
              </span>
              
              {/* Don't show distance slider with yourself */}
              {player.id !== clientId && nameplateHovered && (
                <div className="ml-2 text-xs opacity-70">
                  {Math.floor(
                    new THREE.Vector3(...player.position).distanceTo(
                      new THREE.Vector3(...smoothPosition)
                    )
                  )}m
                </div>
              )}
            </div>
            
            {/* Social buttons - only show when hovering and not yourself */}
            {nameplateHovered && player.id !== clientId && (
              <div className="flex gap-1 mt-1">
                {isPlayerFriend(player.id) ? (
                  <Button 
                    variant="default"
                    size="sm"
                    className="h-6 text-xs px-2 bg-green-600 hover:bg-green-700"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    Following
                  </Button>
                ) : (
                  <Button 
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs px-2 border-green-400 hover:bg-green-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      sendFriendRequest(player.id);
                    }}
                  >
                    Follow
                  </Button>
                )}
                
                {isPlayerMuted(player.id) ? (
                  <Button 
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs px-2 border-red-400 hover:bg-red-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      unmutePlayer(player.id);
                    }}
                  >
                    Unmute
                  </Button>
                ) : (
                  <Button 
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs px-2 border-gray-400 hover:bg-red-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      mutePlayer(player.id);
                    }}
                  >
                    Mute
                  </Button>
                )}
              </div>
            )}
          </div>
        </Html>
      </group>
      
      {/* Player model */}
      <group ref={modelRef} position={smoothPosition} rotation={[0, smoothRotation, 0]}>
        <primitive object={characterModel.clone()} scale={[1, 1, 1]} />
        
        {/* User status indicator */}
        <UserStatusIndicator userId={player.id} position={[0, 0, 0]} />
      </group>
      
      {/* Interaction indicator (visible when hovering) */}
      {interactable && (
        <mesh position={[0, 2.3, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#44EEFF" emissive="#44EEFF" emissiveIntensity={0.5} />
        </mesh>
      )}
      
      {/* Voice chat indicator (visible when speaking) */}
      {isSpeaking && !isPlayerMuted(player.id) && (
        <group position={[0, 3.2, 0]}>
          <mesh>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshBasicMaterial color="#22c55e" />
          </mesh>
          {/* Microphone icon */}
          <mesh position={[0, 0, 0.1]}>
            <boxGeometry args={[0.05, 0.15, 0.05]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
          <mesh position={[0, -0.1, 0.1]}>
            <boxGeometry args={[0.1, 0.05, 0.05]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
          {/* Sound waves animation */}
          <group scale={[voiceWaveScale, voiceWaveScale, voiceWaveScale]}>
            <mesh position={[-0.2, 0, 0]} rotation={[0, 0, Math.PI/2]}>
              <ringGeometry args={[0.1, 0.12, 8]} />
              <meshBasicMaterial color="#22c55e" transparent opacity={0.7} />
            </mesh>
            <mesh position={[0.2, 0, 0]} rotation={[0, 0, Math.PI/2]}>
              <ringGeometry args={[0.1, 0.12, 8]} />
              <meshBasicMaterial color="#22c55e" transparent opacity={0.7} />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
}

// Preload the model
useGLTF.preload('/models/trader_character.glb');