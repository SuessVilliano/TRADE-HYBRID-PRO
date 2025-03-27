import React, { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Sky, 
  Environment, 
  PerspectiveCamera, 
  OrbitControls,
  Grid,
  Text,
  useGLTF,
  Stars,
  Html
} from '@react-three/drei';
import * as THREE from 'three';
import { Interface } from '../ui/interface';
import { Map, Sun, Moon, LineChart, Bitcoin, DollarSign, BarChart, Share, Bell } from 'lucide-react';
import { Button } from '../ui/button';
import { useLocation } from 'react-router-dom';
import { GamePhase, useGame } from '@/lib/stores/useGame';
import { useMultiplayer } from '@/lib/stores/useMultiplayer';
import Floor from './Floor';
import Lights from './Lights';
import GameControls from './Controls';
import Player from './Player';
import OtherPlayer from './OtherPlayer';
import SignalTower from './SignalTower';
import CryptoTrading from './CryptoTrading';

interface SceneProps {
  showStats?: boolean;
}

// Represents a simple building model
function Building({ position, size, color, name }: { 
  position: [number, number, number], 
  size: [number, number, number], 
  color: string,
  name: string
}) {
  return (
    <group position={new THREE.Vector3(...position)}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Text
        position={[0, size[1] / 2 + 0.5, 0]}
        color="white"
        anchorX="center"
        anchorY="middle"
        fontSize={0.5}
      >
        {name}
      </Text>
    </group>
  )
}

// Load the Trade House 3D model
function TradeHouseModel({ 
  position = [0, 0, 0], 
  scale = [1, 1, 1], 
  rotation = [0, 0, 0],
  active = false
}: { 
  position?: [number, number, number], 
  scale?: [number, number, number],
  rotation?: [number, number, number],
  active?: boolean
}) {
  // Load model
  const modelPath = '/models/tradehouse.glb';
  const { scene } = useGLTF(modelPath);
  const model = useRef<THREE.Group>(null);
  
  // Clone the scene - we need to do this to avoid modifying the original
  const clonedScene = scene.clone();
  
  // Add some animation
  useFrame((state) => {
    if (model.current && active) {
      // Subtle floating animation
      model.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      
      // Subtle rotation
      model.current.rotation.y = rotation[1] + Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
    }
  });
  
  // Create a spotlight effect for the active building
  const spotlightIntensity = active ? 1 : 0.2;
  const spotlightColor = active ? '#FFD700' : '#FFFFFF';
  
  useEffect(() => {
    if (model.current) {
      // Make sure materials are receiving shadows
      model.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          
          // Add some emissive to materials when active
          if (child.material) {
            if (active) {
              child.material.emissive = new THREE.Color('#444444');
              child.material.emissiveIntensity = 0.2;
            } else {
              child.material.emissive = new THREE.Color('#000000');
              child.material.emissiveIntensity = 0;
            }
          }
        }
      });
    }
  }, [active]);
  
  return (
    <group position={new THREE.Vector3(...position)}>
      {/* The model */}
      <group 
        ref={model} 
        scale={scale}
        rotation={[rotation[0], rotation[1], rotation[2]]}
      >
        <primitive object={clonedScene} />
      </group>
      
      {/* Spotlight effect */}
      <spotLight
        position={[0, 10, 0]}
        angle={0.4}
        penumbra={0.4}
        intensity={spotlightIntensity}
        color={spotlightColor}
        castShadow
        distance={20}
      />
      
      {/* Text label */}
      <Text
        position={[0, 6, 0]}
        color="white"
        anchorX="center"
        anchorY="middle"
        fontSize={1}
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        Trade House
      </Text>
      
      {/* Interactive trigger area */}
      <mesh 
        position={[0, 1, 0]} 
        visible={false}
        onClick={() => {
          window.location.href = '/trading-space?location=tradehouse';
        }}
      >
        <sphereGeometry args={[10, 32, 32]} />
        <meshBasicMaterial color="#ffffff" opacity={0} transparent />
      </mesh>
    </group>
  );
}

// Preload the model
useGLTF.preload('/models/tradehouse.glb');

// New Trading Desk Component
function TradingDesk({ 
  position = [0, 0, 0], 
  rotation = [0, 0, 0], 
  scale = [1, 1, 1],
  active = false 
}: { 
  position?: [number, number, number], 
  rotation?: [number, number, number], 
  scale?: [number, number, number],
  active?: boolean
}) {
  const { scene: deskModel } = useGLTF('/models/trading_desk.glb') as unknown as { scene: THREE.Group };
  const clonedDesk = useMemo(() => deskModel.clone(), [deskModel]);
  const deskRef = useRef<THREE.Group>(null);
  
  // Add some visual effects for active desks
  useEffect(() => {
    if (deskRef.current) {
      clonedDesk.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          
          if (child.material) {
            if (active) {
              child.material.emissive = new THREE.Color('#2244FF');
              child.material.emissiveIntensity = 0.3;
            } else {
              child.material.emissive = new THREE.Color('#000000');
              child.material.emissiveIntensity = 0;
            }
          }
        }
      });
    }
  }, [active, clonedDesk]);
  
  return (
    <group 
      position={new THREE.Vector3(...position)} 
      rotation={[rotation[0], rotation[1], rotation[2]]}
      ref={deskRef}
    >
      <primitive object={clonedDesk} scale={scale} />
      
      {active && (
        <spotLight
          position={[0, 3, 0]}
          angle={0.3}
          penumbra={0.5}
          intensity={1}
          color="#4466FF"
          castShadow
          distance={6}
        />
      )}
    </group>
  );
}

// New Market Display Component
function MarketDisplay({ 
  position = [0, 0, 0], 
  rotation = [0, 0, 0], 
  scale = [1, 1, 1]
}: { 
  position?: [number, number, number], 
  rotation?: [number, number, number], 
  scale?: [number, number, number]
}) {
  const { scene: displayModel } = useGLTF('/models/market_display.glb') as unknown as { scene: THREE.Group };
  const clonedDisplay = useMemo(() => displayModel.clone(), [displayModel]);
  const displayRef = useRef<THREE.Group>(null);
  
  // Animate the display
  useFrame((state) => {
    if (displayRef.current) {
      // Subtle float animation
      displayRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      
      // Subtle pulse effect for screens
      clonedDisplay.traverse((child) => {
        if (child instanceof THREE.Mesh && child.name.includes('screen')) {
          const material = child.material as THREE.MeshStandardMaterial;
          if (material) {
            material.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
          }
        }
      });
    }
  });
  
  // Setup emissive materials for screens
  useEffect(() => {
    clonedDisplay.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        if (child.material) {
          // Make screens emit light
          if (child.name.includes('screen')) {
            child.material.emissive = new THREE.Color('#00AAFF');
            child.material.emissiveIntensity = 0.5;
          }
        }
      }
    });
  }, [clonedDisplay]);
  
  return (
    <group 
      position={new THREE.Vector3(...position)} 
      rotation={[rotation[0], rotation[1], rotation[2]]}
      ref={displayRef}
    >
      <primitive object={clonedDisplay} scale={scale} />
      
      <pointLight
        position={[0, 3, 0]}
        intensity={1}
        color="#00AAFF"
        distance={10}
      />
    </group>
  );
}

// New Trading Floor Component
function TradingFloor({ 
  position = [0, 0, 0], 
  rotation = [0, 0, 0], 
  scale = [1, 1, 1]
}: { 
  position?: [number, number, number], 
  rotation?: [number, number, number], 
  scale?: [number, number, number]
}) {
  const { scene: floorModel } = useGLTF('/models/trading_floor.glb') as unknown as { scene: THREE.Group };
  const clonedFloor = useMemo(() => floorModel.clone(), [floorModel]);
  
  // Setup materials and shadows
  useEffect(() => {
    clonedFloor.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        // Add emissive to screens and lights
        if (child.material && (child.name.includes('screen') || child.name.includes('light'))) {
          child.material.emissive = new THREE.Color('#88CCFF');
          child.material.emissiveIntensity = 0.5;
        }
      }
    });
  }, [clonedFloor]);
  
  return (
    <group 
      position={new THREE.Vector3(...position)} 
      rotation={[rotation[0], rotation[1], rotation[2]]}
    >
      <primitive object={clonedFloor} scale={scale} />
      
      {/* Ambient lighting for the trading floor */}
      <ambientLight intensity={0.2} color="#88AAFF" />
      
      {/* Add some area lights to simulate screens */}
      <rectAreaLight
        position={[0, 2, 0]}
        width={10}
        height={5}
        intensity={0.5}
        color="#00AAFF"
      />
    </group>
  );
}

// Create different trading locations in the 3D space
function TradingEnvironment() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const locationParam = searchParams.get('location') || 'tradehouse';
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      setIsMobile(mobileRegex.test(userAgent));
    };
    
    checkMobile();
  }, []);
  
  // Preload models - skip on mobile
  useEffect(() => {
    if (!isMobile) {
      useGLTF.preload('/models/trading_desk.glb');
      useGLTF.preload('/models/market_display.glb');
      useGLTF.preload('/models/trading_floor.glb');
    }
  }, [isMobile]);
  
  // Simplified mobile trading environment
  if (isMobile) {
    return (
      <group>
        {/* Central building - simplified for mobile */}
        <group position={[0, 0, 0]}>
          <Building 
            position={[0, 1, 0]} 
            size={[10, 3, 10]} 
            color="#3d4e60" 
            name="Trade Hub"
          />
        </group>
        
        {/* Crypto Trading Center - simplified */}
        <group position={[-15, 0, 0]}>
          <Building 
            position={[0, 1, 0]} 
            size={[8, 2, 6]} 
            color={locationParam === 'crypto' ? '#22c55e' : '#15803d'} 
            name="Crypto Trading"
          />
        </group>
        
        {/* Forex Trading Floor - simplified */}
        <group position={[15, 0, 0]}>
          <Building 
            position={[0, 1, 0]} 
            size={[8, 2, 6]} 
            color={locationParam === 'forex' ? '#ef4444' : '#b91c1c'} 
            name="Forex Trading"
          />
        </group>
        
        {/* Stock Market Exchange - simplified */}
        <group position={[0, 0, 15]}>
          <Building 
            position={[0, 1, 0]} 
            size={[8, 2, 6]} 
            color={locationParam === 'stocks' ? '#a855f7' : '#7e22ce'} 
            name="Stock Market"
          />
        </group>
        
        {/* Signal Towers - with 3D model */}
        <group position={[0, 0, -15]}>
          <SignalTower 
            position={[0, 0, 0]} 
            scale={[2, 2, 2]}
            rotation={[0, 0, 0]}
            onInteract={() => {
              window.location.href = '/trading-space?location=signals';
            }}
          />
        </group>
        
        {/* Basic floor - simplified for mobile */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[80, 80]} />
          <meshStandardMaterial 
            color="#111122" 
            metalness={0.5}
            roughness={0.5}
          />
        </mesh>
      </group>
    );
  }
  
  // Desktop full trading environment
  return (
    <group>
      {/* Central Trading Floor Environment */}
      <TradingFloor 
        position={[0, 0, 0]}
        scale={[2.5, 2.5, 2.5]}
        rotation={[0, Math.PI / 4, 0]}
      />
      
      {/* Central Market Display */}
      <MarketDisplay
        position={[0, 2, 0]}
        scale={[2, 2, 2]}
        rotation={[0, 0, 0]}
      />
      
      {/* Trade House - Central Building (3D Model) */}
      <TradeHouseModel 
        position={[0, 0, 0]}
        scale={[2.5, 2.5, 2.5]}
        rotation={[0, Math.PI / 4, 0]}
        active={locationParam === 'tradehouse'}
      />
      
      {/* Crypto Trading Center */}
      <group position={[-15, 0, 0]}>
        <Building 
          position={[0, 1, 0]} 
          size={[8, 2, 6]} 
          color={locationParam === 'crypto' ? '#22c55e' : '#15803d'} 
          name="Crypto Trading"
        />
        <CryptoTrading 
          position={[0, 0, -4]} 
          scale={[1.5, 1.5, 1.5]} 
          rotation={[0, Math.PI, 0]}
          onInteract={() => {
            window.location.href = '/trading-space?location=crypto&symbol=BTC/USD';
          }}
        />
        <MarketDisplay
          position={[0, 1, 4]}
          scale={[1, 1, 1]}
          rotation={[0, 0, 0]}
        />
      </group>
      
      {/* Forex Trading Floor */}
      <group position={[15, 0, 0]}>
        <Building 
          position={[0, 1, 0]} 
          size={[8, 2, 6]} 
          color={locationParam === 'forex' ? '#ef4444' : '#b91c1c'} 
          name="Forex Trading"
        />
        <TradingDesk 
          position={[0, 0, -4]} 
          scale={[1.5, 1.5, 1.5]} 
          rotation={[0, Math.PI, 0]}
          active={locationParam === 'forex'}
        />
        <MarketDisplay
          position={[0, 1, 4]}
          scale={[1, 1, 1]}
          rotation={[0, 0, 0]}
        />
      </group>
      
      {/* Stock Market Exchange */}
      <group position={[0, 0, 15]}>
        <Building 
          position={[0, 1, 0]} 
          size={[8, 2, 6]} 
          color={locationParam === 'stocks' ? '#a855f7' : '#7e22ce'} 
          name="Stock Market"
        />
        <TradingDesk 
          position={[-3, 0, 0]} 
          scale={[1.5, 1.5, 1.5]} 
          rotation={[0, Math.PI / 2, 0]}
          active={locationParam === 'stocks'}
        />
        <TradingDesk 
          position={[3, 0, 0]} 
          scale={[1.5, 1.5, 1.5]} 
          rotation={[0, -Math.PI / 2, 0]}
          active={locationParam === 'stocks'}
        />
        <MarketDisplay
          position={[0, 1, -4]}
          scale={[1, 1, 1]}
          rotation={[0, Math.PI, 0]}
        />
      </group>
      
      {/* Signal Towers */}
      <group position={[0, 0, -15]}>
        {/* Use our new SignalTower 3D model */}
        <SignalTower 
          position={[0, 0, 0]} 
          scale={[3, 3, 3]}
          rotation={[0, 0, 0]}
          onInteract={() => {
            window.location.href = '/trading-space?location=signals';
          }}
        />
        
        <TradingDesk 
          position={[-8, 0, -4]} 
          scale={[1.2, 1.2, 1.2]} 
          rotation={[0, Math.PI / 4, 0]}
          active={locationParam === 'signals'}
        />
        <TradingDesk 
          position={[8, 0, -4]} 
          scale={[1.2, 1.2, 1.2]} 
          rotation={[0, -Math.PI / 4, 0]}
          active={locationParam === 'signals'}
        />
      </group>
      
      {/* Enhanced floor with more visual interest */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial 
          color="#111122" 
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>
      
      {/* Glowing paths connecting buildings */}
      <group>
        {/* Path to Crypto */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-7.5, 0.02, 0]} receiveShadow>
          <planeGeometry args={[15, 3]} />
          <meshStandardMaterial 
            color="#001100" 
            emissive="#00FF00"
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Path to Forex */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[7.5, 0.02, 0]} receiveShadow>
          <planeGeometry args={[15, 3]} />
          <meshStandardMaterial 
            color="#110000" 
            emissive="#FF0000"
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Path to Stock Market */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 7.5]} receiveShadow>
          <planeGeometry args={[3, 15]} />
          <meshStandardMaterial 
            color="#110022" 
            emissive="#AA00FF"
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Path to Signal Towers */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -7.5]} receiveShadow>
          <planeGeometry args={[3, 15]} />
          <meshStandardMaterial 
            color="#001133" 
            emissive="#0044FF"
            emissiveIntensity={0.2}
          />
        </mesh>
      </group>
      
      {/* Add ambient particles for atmosphere */}
      <group position={[0, 10, 0]}>
        <mesh>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={new Float32Array(Array(3000).fill(0).map(() => (Math.random() - 0.5) * 50))}
              count={1000}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.1}
            color="#FFFFFF"
            transparent
            opacity={0.3}
            sizeAttenuation
          />
        </mesh>
      </group>
    </group>
  );
}

// Component for rendering other players
function OtherPlayers() {
  // Get multiplayer state
  const { players, clientId, connected, sendTradeOffer } = useMultiplayer();
  const [isMobile, setIsMobile] = useState(false);

  // Detect if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      setIsMobile(mobileRegex.test(userAgent));
    };
    
    checkMobile();
  }, []);

  // Handle interactions with other players
  const handleInteractWithPlayer = (playerId: string) => {
    // Show trade dialog or other interaction UI
    console.log(`Interacting with player ${playerId}`);
    // Example: Open trade offer dialog
    const tradeDialog = document.getElementById('trade-offer-dialog');
    if (tradeDialog) {
      (tradeDialog as HTMLDialogElement).showModal();
    }
  };

  // Only show other players, not ourselves
  // Limit number of visible players on mobile to improve performance
  const maxPlayersToShow = isMobile ? 3 : 20;
  
  const otherPlayers = players
    .filter(player => player.id !== clientId)
    .slice(0, maxPlayersToShow); // Limit number of players rendered on mobile
  
  return (
    <>
      {otherPlayers.map(player => (
        <OtherPlayer 
          key={player.id} 
          player={player} 
          onInteract={() => handleInteractWithPlayer(player.id)}
        />
      ))}
      
      {/* Show count of additional players if we're limiting them */}
      {isMobile && players.length > maxPlayersToShow + 1 && (
        <Html position={[0, 3, 0]} center>
          <div className="bg-black/70 px-2 py-1 rounded text-white text-xs">
            +{players.length - maxPlayersToShow - 1} more players
          </div>
        </Html>
      )}
    </>
  );
}

// Scene Camera
function SceneCamera() {
  const { camera } = useThree();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const locationParam = searchParams.get('location') || 'tradehouse';
  const [isFirstPerson, setIsFirstPerson] = useState(false);
  const [lastThirdPersonPosition, setLastThirdPersonPosition] = useState<[number, number, number]>([10, 5, 10]);
  const players = useMultiplayer((state) => state.players);
  const clientId = useMultiplayer((state) => state.clientId);
  const playerRef = useRef<THREE.Group | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      setIsMobile(mobileRegex.test(userAgent));
      console.log("Device detected as:", mobileRegex.test(userAgent) ? "mobile" : "desktop");
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Handle keyboard events for toggling views - only on desktop
  useEffect(() => {
    if (isMobile) return; // Skip on mobile devices
    
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'KeyV') {
        console.log("Toggling first-person view");
        setIsFirstPerson(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isMobile]);
  
  useEffect(() => {
    // Set camera position based on location when in third-person view
    if (!isFirstPerson || isMobile) {
      let cameraPos: [number, number, number];
      
      switch(locationParam) {
        case 'crypto':
          cameraPos = [-10, 5, 10];
          break;
        case 'forex':
          cameraPos = [10, 5, 10];
          break;
        case 'stocks':
          cameraPos = [0, 5, 20];
          break;
        case 'signals':
          cameraPos = [0, 5, -10];
          break;
        case 'tradehouse':
        default:
          cameraPos = [10, 5, 10];
      }
      
      camera.position.set(...cameraPos);
      camera.lookAt(0, 0, 0);
      setLastThirdPersonPosition(cameraPos);
    }
  }, [camera, locationParam, isFirstPerson, isMobile]);
  
  // For first-person view, follow player position - only on desktop
  useFrame(() => {
    if (isMobile) return; // Skip on mobile devices
    
    if (isFirstPerson && clientId) {
      try {
        // Find the current player
        const player = players.find(p => p.id === clientId);
        if (player) {
          // Position the camera at player position but add height for eye level
          camera.position.set(
            player.position[0],
            player.position[1] + 1.6, // Eye height
            player.position[2]
          );
          
          // Determine forward direction based on player rotation
          const angle = player.rotation;
          const lookAtX = player.position[0] + Math.sin(angle) * 5;
          const lookAtZ = player.position[2] + Math.cos(angle) * 5;
          
          camera.lookAt(lookAtX, player.position[1] + 1.6, lookAtZ);
        }
      } catch (error) {
        console.error("Error in first-person camera update:", error);
        // Fallback to third-person view on error
        setIsFirstPerson(false);
      }
    }
  });
  
  // Add UI information about first-person toggle - only show on desktop
  return !isMobile ? (
    <Html position={[0, -5, 0]} center>
      <div 
        className="text-xs px-2 py-1 bg-black/70 text-white rounded pointer-events-none"
        style={{ 
          opacity: 0.7,
          visibility: isFirstPerson ? 'visible' : 'hidden'
        }}
      >
        First-person view enabled (Press V to toggle)
      </div>
    </Html>
  ) : null;
}

export default function Scene({ showStats = false }: SceneProps) {
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if dark mode is enabled on mount
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const { phase } = useGame();
  const [isMobile, setIsMobile] = useState(false);

  // Detect if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      setIsMobile(mobileRegex.test(userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Function to toggle map for mobile users
  const toggleMobileMap = () => {
    setShowMobileMap(!showMobileMap);
  };

  // Update isDarkMode when the theme changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => {
      observer.disconnect();
    };
  }, []);

  // Function to toggle dark mode
  const toggleDarkMode = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    }
    setIsDarkMode(!isDarkMode);
  };
  
  return (
    <div className="relative w-full h-full">
      {/* 3D Canvas */}
      <GameControls>
        <Canvas 
          shadows={!isMobile} // Disable shadows on mobile for performance
          camera={{ position: [10, 5, 10], fov: 50 }}
          dpr={[1, isMobile ? 1.5 : 2]} // Lower resolution on mobile
          performance={{ min: 0.5 }} // Allow lower framerates on mobile
        >
          <Suspense fallback={null}>
            <color attach="background" args={[isDarkMode ? '#0f172a' : '#e0f2fe']} />
            
            {/* Simplified sky for mobile */}
            {isDarkMode ? (
              isMobile ? (
                <ambientLight intensity={0.5} color="#1a1a2e" />
              ) : (
                <Stars radius={100} depth={50} count={1000} factor={4} />
              )
            ) : (
              isMobile ? (
                <ambientLight intensity={0.8} color="#e0f2fe" />
              ) : (
                <Sky sunPosition={[100, 10, 100]} />
              )
            )}
            
            <ambientLight intensity={0.1} />
            <Lights />
            <SceneCamera />
            <OrbitControls 
              target={[0, 0, 0]} 
              maxPolarAngle={Math.PI/2 - 0.1}
              enableDamping={!isMobile} // Disable damping on mobile for performance
              enableZoom={true}
              makeDefault
            />
            
            <TradingEnvironment />
            <Floor />
            
            {/* Add the player character */}
            <Player />
            
            {/* Render other players from multiplayer state */}
            <OtherPlayers />
          </Suspense>
        </Canvas>
      </GameControls>
      
      {/* Interface overlay that includes the map toggle functionality */}
      <Interface 
        showMapOverride={showMobileMap} 
        onToggleMap={toggleMobileMap} 
      />
      
      {/* Mobile controls */}
      <div className="md:hidden fixed bottom-4 left-0 right-0 flex justify-center z-50">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-4 shadow-lg border border-gray-200 dark:border-gray-700">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-900 dark:text-white h-12 w-12 rounded-full flex items-center justify-center"
            onClick={toggleMobileMap}
          >
            <Map size={24} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-900 dark:text-white h-12 w-12 rounded-full flex items-center justify-center"
            onClick={toggleDarkMode}
          >
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </Button>
          <Button 
            variant="default" 
            size="icon" 
            className="bg-blue-500 text-white h-12 w-auto px-3 rounded-full flex items-center justify-center gap-2"
            onClick={() => window.location.href = '/trading-space?view=mobile&action=trade'}
          >
            <LineChart size={20} />
            <span className="text-sm font-medium">Trade</span>
          </Button>
        </div>
      </div>
      
      {/* Mobile quick access trading panel */}
      {isMobile && (
        <div className="fixed top-8 right-0 bottom-0 z-40 w-14 flex flex-col items-center gap-3 pt-4 bg-gray-800/30 backdrop-blur-sm">
          <div 
            className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center cursor-pointer shadow-lg"
            onClick={() => window.location.href = '/trading-space?view=mobile&location=crypto&symbol=BTC/USD'}
          >
            <Bitcoin size={18} className="text-white" />
          </div>
          <div 
            className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center cursor-pointer shadow-lg"
            onClick={() => window.location.href = '/trading-space?view=mobile&location=forex&symbol=EUR/USD'}
          >
            <DollarSign size={18} className="text-white" />
          </div>
          <div 
            className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center cursor-pointer shadow-lg"
            onClick={() => window.location.href = '/trading-space?view=mobile&location=stocks&symbol=AAPL'}
          >
            <BarChart size={18} className="text-white" />
          </div>
          <div 
            className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center cursor-pointer shadow-lg"
            onClick={() => window.location.href = '/trading-space?view=mobile&screen=share'}
          >
            <Share size={18} className="text-white" />
          </div>
          <div 
            className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center cursor-pointer shadow-lg mt-3"
            onClick={() => window.location.href = '/trading-space?view=mobile&location=signals'}
          >
            <Bell size={18} className="text-white" />
          </div>
        </div>
      )}
      
      {/* Mobile header with trading view shortcut */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 text-center bg-black/70 text-white text-sm py-1 z-50 flex items-center justify-center">
          <span>Mobile mode enabled</span>
          <button 
            className="ml-2 bg-blue-500 text-xs px-2 py-0.5 rounded flex items-center"
            onClick={() => {
              // Navigate to trading-space with explicit params for mobile view
              window.location.href = '/trading-space?view=mobile&location=signals';
            }}
          >
            <LineChart className="mr-1" size={12} />
            Trading View
          </button>
        </div>
      )}
    </div>
  );
}