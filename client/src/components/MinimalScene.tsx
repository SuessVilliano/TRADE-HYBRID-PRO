import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, useKeyboardControls, useGLTF, KeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';
import { useMultiplayer } from '../lib/stores/useMultiplayer';
import OtherPlayers from './game/OtherPlayers';

// Define controls enum
enum Controls {
  forward = 'forward',
  back = 'back',
  left = 'left',
  right = 'right',
  jump = 'jump',
}

// Preload models
useGLTF.preload('/models/trader_character.glb');
useGLTF.preload('/models/tradehouse.glb');
useGLTF.preload('/models/thc_coin_premium.glb');

// Optimize TraderCharacter with React.memo for performance
const TraderCharacter = React.memo(function TraderCharacter(props: any) {
  const modelRef = useRef<THREE.Group>(null!);
  const [hovered, setHover] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [modelLoaded, setModelLoaded] = useState(false);
  
  // Load the character model
  const { scene: characterModel } = useGLTF('/models/trader_character.glb') as GLTF & {
    scene: THREE.Group
  };
  
  // Track loading state
  useEffect(() => {
    if (characterModel) {
      setModelLoaded(true);
      console.log("Trader character model loaded successfully");
    }
  }, [characterModel]);
  
  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y = rotation;
      setRotation(rotation + 0.01);
    }
  });
  
  return (
    <group 
      ref={modelRef}
      {...props}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      scale={[2.5, 2.5, 2.5]}
    >
      {modelLoaded && characterModel ? (
        <Suspense fallback={
          <mesh castShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
        }>
          <primitive 
            object={characterModel.clone()} 
            castShadow 
            receiveShadow 
            scale={hovered ? [1.1, 1.1, 1.1] : [1, 1, 1]}
          />
        </Suspense>
      ) : (
        <mesh castShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#5ecc89" />
        </mesh>
      )}
    </group>
  );
});

// Optimize with React.memo for better performance
const AnimatedBox = React.memo(function AnimatedBox(props: any) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHover] = useState(false);
  const [rotation, setRotation] = useState(0);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y = rotation;
      setRotation(rotation + 0.01);
    }
  });
  
  return (
    <mesh
      {...props}
      ref={meshRef}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? '#5ecc89' : '#88c'} />
    </mesh>
  );
});

// Optimize sphere component
const AnimatedSphere = React.memo(function AnimatedSphere(props: any) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHover] = useState(false);
  const [position, setPosition] = useState(0);
  
  useFrame(() => {
    if (meshRef.current) {
      setPosition(Math.sin(Date.now() * 0.001) * 0.5);
      meshRef.current.position.y = position + 1;
    }
  });
  
  return (
    <mesh
      {...props}
      ref={meshRef}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color={hovered ? '#e667c0' : '#c88'} />
    </mesh>
  );
});

function Lights() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#ffffff" />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#60a5fa" />
    </>
  );
}

// Optimize TradeHouseModel with React.memo
const TradeHouseModel = React.memo(function TradeHouseModel(props: any) {
  const modelRef = useRef<THREE.Group>(null!);
  const [hovered, setHover] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  
  // Load the tradehouse model
  const { scene: houseModel } = useGLTF('/models/tradehouse.glb') as GLTF & {
    scene: THREE.Group
  };
  
  // Track loading state
  useEffect(() => {
    if (houseModel) {
      setModelLoaded(true);
      console.log("Trade house model loaded successfully");
    }
  }, [houseModel]);
  
  return (
    <group 
      ref={modelRef}
      {...props}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      scale={[2.5, 2.5, 2.5]}
    >
      {modelLoaded && houseModel ? (
        <Suspense fallback={
          <mesh castShadow>
            <boxGeometry args={[5, 3, 5]} />
            <meshStandardMaterial color="#555555" />
          </mesh>
        }>
          <primitive 
            object={houseModel.clone()} 
            castShadow 
            receiveShadow 
          />
        </Suspense>
      ) : (
        <mesh castShadow>
          <boxGeometry args={[5, 3, 5]} />
          <meshStandardMaterial color="#555555" />
        </mesh>
      )}
    </group>
  );
});

// Optimize THCCoinModel with React.memo for better performance
const THCCoinModel = React.memo(function THCCoinModel(props: any) {
  const modelRef = useRef<THREE.Group>(null!);
  const [hovered, setHover] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [modelLoaded, setModelLoaded] = useState(false);
  
  // Load the coin model
  const { scene: coinModel } = useGLTF('/models/thc_coin_premium.glb') as GLTF & {
    scene: THREE.Group
  };
  
  // Track loading state
  useEffect(() => {
    if (coinModel) {
      setModelLoaded(true);
      console.log("THC coin model loaded successfully");
    }
  }, [coinModel]);
  
  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y = rotation;
      setRotation(rotation + 0.01);
    }
  });
  
  return (
    <group 
      ref={modelRef}
      {...props}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      scale={[1.5, 1.5, 1.5]}
    >
      {modelLoaded && coinModel ? (
        <Suspense fallback={
          <mesh castShadow>
            <cylinderGeometry args={[1, 1, 0.2, 32]} />
            <meshStandardMaterial color="#FFD700" />
          </mesh>
        }>
          <primitive 
            object={coinModel.clone()} 
            castShadow 
            receiveShadow 
            scale={hovered ? [1.1, 1.1, 1.1] : [1, 1, 1]}
          />
        </Suspense>
      ) : (
        <mesh castShadow>
          <cylinderGeometry args={[1, 1, 0.2, 32]} />
          <meshStandardMaterial color="#FFD700" />
        </mesh>
      )}
    </group>
  );
});

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial color="#111827" />
      <Grid
        args={[30, 30]}
        cellSize={1}
        cellThickness={1}
        cellColor="#334155"
        sectionSize={3}
        sectionThickness={1.5}
        sectionColor="#475569"
        fadeDistance={30}
        fadeStrength={1}
      />
    </mesh>
  );
}

function InfoPanel() {
  return (
    <group position={[0, 3, 0]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[6, 2, 0.1]} />
        <meshStandardMaterial color="#1e293b" opacity={0.9} transparent />
      </mesh>
      {/* Text would normally go here, but we're using a basic placeholder */}
    </group>
  );
}

// Player component that updates position with keyboard controls
function Player() {
  const modelRef = useRef<THREE.Group>(null!);
  const [position, setPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [rotation, setRotation] = useState(0);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [animation, setAnimation] = useState('idle');

  // Get the multiplayer service functions
  const { updatePlayerPosition, connected, clientId } = useMultiplayer();
  
  // Get keyboard controls
  const [, getKeys] = useKeyboardControls<Controls>();
  
  // Load the character model
  const { scene: characterModel } = useGLTF('/models/trader_character.glb') as GLTF & {
    scene: THREE.Group
  };
  
  // Track loading state
  useEffect(() => {
    if (characterModel) {
      setModelLoaded(true);
      console.log("Player character model loaded successfully");
    }
  }, [characterModel]);
  
  // Movement logic in the game loop
  useFrame((_, delta) => {
    if (!modelRef.current) return;
    
    // Get current key states
    const { forward, back, left, right, jump } = getKeys();
    
    // Movement speed
    const speed = 5 * delta;
    let moved = false;
    let newAnimation = 'idle';
    
    // Current position
    const newPosition: [number, number, number] = [...position];
    let newRotation = rotation;
    
    // Handle movement
    if (forward) {
      newPosition[2] -= speed;
      newRotation = 0;
      moved = true;
      newAnimation = 'walking';
    }
    
    if (back) {
      newPosition[2] += speed;
      newRotation = Math.PI;
      moved = true;
      newAnimation = 'walking';
    }
    
    if (left) {
      newPosition[0] -= speed;
      newRotation = Math.PI / 2;
      moved = true;
      newAnimation = 'walking';
    }
    
    if (right) {
      newPosition[0] += speed;
      newRotation = -Math.PI / 2;
      moved = true;
      newAnimation = 'walking';
    }
    
    if (jump) {
      // Simple jump animation
      newAnimation = 'jumping';
    }
    
    // Update position and rotation
    if (moved) {
      setPosition(newPosition);
      setRotation(newRotation);
      modelRef.current.position.set(...newPosition);
      modelRef.current.rotation.y = newRotation;
      
      // Update animation state
      if (animation !== newAnimation) {
        setAnimation(newAnimation);
      }
      
      // Send position update to multiplayer service
      if (connected && clientId) {
        updatePlayerPosition(newPosition, newRotation, newAnimation);
      }
    }
  });
  
  return (
    <group ref={modelRef} position={position} rotation={[0, rotation, 0]}>
      {modelLoaded && characterModel ? (
        <Suspense fallback={
          <mesh castShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#5ecc89" />
          </mesh>
        }>
          <primitive 
            object={characterModel.clone()} 
            castShadow 
            receiveShadow 
            scale={[2.5, 2.5, 2.5]}
          />
        </Suspense>
      ) : (
        <mesh castShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#5ecc89" />
        </mesh>
      )}
    </group>
  );
}

// Connection component to handle multiplayer connection
function MultiplayerConnection() {
  const [playerName, setPlayerName] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const { connect, connected } = useMultiplayer();
  
  // Generate a random name if not set
  useEffect(() => {
    if (!playerName) {
      const randomName = `Trader${Math.floor(Math.random() * 1000)}`;
      setPlayerName(randomName);
    }
  }, [playerName]);
  
  // Connect to multiplayer on component mount
  useEffect(() => {
    if (!connected && !isConnecting && playerName) {
      console.log("Connecting to multiplayer as:", playerName);
      setIsConnecting(true);
      
      // Connect with basic customization
      connect(playerName, {
        bodyColor: `#${Math.floor(Math.random()*16777215).toString(16)}`, // Random color
        eyeColor: "#ffffff",
        hatColor: `#${Math.floor(Math.random()*16777215).toString(16)}` // Random color
      });
      
      setIsConnecting(false);
    }
  }, [connect, connected, isConnecting, playerName]);
  
  // Render nothing visually
  return null;
}

export default function MinimalScene() {
  const [showInstructions, setShowInstructions] = useState(true);
  const [multiplayerEnabled, setMultiplayerEnabled] = useState(true);
  
  // Define key mappings for controls
  const keyMap = [
    { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
    { name: Controls.back, keys: ['ArrowDown', 'KeyS'] },
    { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
    { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
    { name: Controls.jump, keys: ['Space'] },
  ];

  return (
    <div className="h-full">
      {/* Setup multiplayer connection */}
      {multiplayerEnabled && <MultiplayerConnection />}
      
      <KeyboardControls map={keyMap}>
        <Canvas shadows camera={{ position: [10, 8, 10], fov: 50 }}>
          <color attach="background" args={['#0f172a']} />
          <fog attach="fog" args={['#0f172a', 15, 35]} />
          
          <Lights />
          <Floor />
          
          {/* Trading House elements */}
          <Suspense fallback={null}>
            {/* Controllable Player (only in multiplayer mode) */}
            {multiplayerEnabled ? <Player /> : <TraderCharacter position={[0, 0, 0]} />}
            
            {/* Other players from multiplayer */}
            {multiplayerEnabled && <OtherPlayers />}
            
            {/* Trade house building */}
            <TradeHouseModel position={[8, 0, 0]} />
            
            {/* THC Coins */}
            <THCCoinModel position={[0, 1.5, 3]} />
            <THCCoinModel position={[3, 1.5, 0]} />
            <THCCoinModel position={[-3, 1.5, -3]} />
            
            {/* Decorative elements */}
            <AnimatedBox position={[-5, 0, 5]} />
            <AnimatedSphere position={[5, 0, -5]} />
          </Suspense>
          
          {/* Info panel */}
          <InfoPanel />
          
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={30}
            maxPolarAngle={Math.PI / 2 - 0.1}
          />
          <Environment preset="city" />
        </Canvas>
      </KeyboardControls>
      
      {/* Overlay instructions */}
      {showInstructions && (
        <div className="absolute bottom-4 left-4 bg-black/70 text-white p-3 rounded-lg text-sm max-w-xs">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-bold">Trade Hybrid Metaverse</h3>
            <button 
              className="text-gray-400 hover:text-white focus:outline-none" 
              onClick={() => setShowInstructions(false)}
              aria-label="Close instructions"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <p className="text-gray-300 text-xs mb-2">
            Use the arrow keys or WASD to move your character. Space to jump.
          </p>
          <ul className="text-xs list-disc pl-4 text-gray-300">
            <li>Other players will appear automatically when they join</li>
            <li>Use voice chat in the Social Panel to communicate</li>
            <li>Hover over other players to see interaction options</li>
            <li>Visit the Trade House to access trading features</li>
          </ul>
          
          {/* Multiplayer toggle for testing */}
          <div className="mt-2 pt-2 border-t border-gray-700">
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={multiplayerEnabled}
                onChange={(e) => setMultiplayerEnabled(e.target.checked)}
                className="rounded"
              />
              Multiplayer Enabled
            </label>
          </div>
        </div>
      )}
      
      {/* Show instructions button when minimized */}
      {!showInstructions && (
        <button 
          className="absolute bottom-4 left-4 bg-primary text-white p-2 rounded-lg text-xs flex items-center gap-1 hover:bg-primary/80"
          onClick={() => setShowInstructions(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          Controls
        </button>
      )}
    </div>
  );
}