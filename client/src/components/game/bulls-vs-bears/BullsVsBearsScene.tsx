import React, { useState, useRef, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  useGLTF, 
  OrbitControls, 
  Environment, 
  Sky, 
  Text, 
  useKeyboardControls,
  KeyboardControls,
  PerspectiveCamera,
  useTexture
} from '@react-three/drei';
import * as THREE from 'three';
import { Physics, usePlane, useBox } from '@react-three/cannon';
import { GLTF } from 'three-stdlib';
import { useGameStore } from './gameStore';
import { usePriceStore } from './priceStore';
import { PriceChart } from './PriceChart';
import { GameScore } from './GameScore';
import { GameUI } from './GameUI';

// Define our controls
enum Controls {
  forward = 'forward',
  back = 'back',
  left = 'left',
  right = 'right',
  jump = 'jump',
  action = 'action',
}

// Preload models
useGLTF.preload('/models/bull_mascot.glb');
useGLTF.preload('/models/bear_mascot.glb');
useGLTF.preload('/models/trading_floor.glb');
useGLTF.preload('/models/trading_desk.glb');
useGLTF.preload('/models/market_price_board.glb');

// Floor/Trading Floor component
function TradingFloor() {
  const floorRef = useRef<THREE.Group>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [ref] = usePlane<THREE.Group>(() => ({ 
    rotation: [-Math.PI / 2, 0, 0], 
    position: [0, -0.5, 0],
    type: 'Static'
  }));
  
  // Load the trading floor model
  const { scene: floorModel } = useGLTF('/models/trading_floor.glb') as GLTF & {
    scene: THREE.Group
  };
  
  // Also use a texture for the base floor
  const grassTexture = useTexture('/textures/grass.png');
  grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
  grassTexture.repeat.set(20, 20);
  
  useEffect(() => {
    if (floorModel) {
      setModelLoaded(true);
      console.log("Trading floor model loaded successfully");
    }
  }, [floorModel]);

  return (
    <group ref={ref}>
      {/* Base floor with texture */}
      <mesh receiveShadow rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial map={grassTexture} color="#6b8e23" />
      </mesh>
      
      {/* 3D trading floor model */}
      {modelLoaded && floorModel && (
        <group ref={floorRef} position={[0, 0, 0]} scale={[5, 5, 5]}>
          <primitive 
            object={floorModel.clone()} 
            receiveShadow 
          />
        </group>
      )}
    </group>
  );
}

// Player model (Bull or Bear)
interface PlayerProps {
  position: [number, number, number];
  character: 'bull' | 'bear';
  isPlayer?: boolean;
}

function Player({ position, character, isPlayer = false }: PlayerProps) {
  const modelRef = useRef<THREE.Group>(null);
  const [ref, api] = useBox<THREE.Group>(() => ({ 
    mass: 1, 
    position, 
    args: [1, 2, 1]
  }));

  // For movement control
  const [subscribeKeys, getKeys] = useKeyboardControls<Controls>();
  
  // Load the appropriate character model
  const { scene: bullModel } = useGLTF('/models/bull_mascot.glb') as GLTF & {
    scene: THREE.Group
  };
  
  const { scene: bearModel } = useGLTF('/models/bear_mascot.glb') as GLTF & {
    scene: THREE.Group
  };
  
  const [modelLoaded, setModelLoaded] = useState(false);
  
  useEffect(() => {
    if (character === 'bull' && bullModel) {
      setModelLoaded(true);
      console.log("Bull model loaded successfully");
    } else if (character === 'bear' && bearModel) {
      setModelLoaded(true);
      console.log("Bear model loaded successfully");
    }
  }, [character, bullModel, bearModel]);

  // Movement logic
  useFrame((state, delta) => {
    if (!isPlayer || !modelRef.current) return;

    const keys = getKeys();
    const moveSpeed = 5;
    const direction = new THREE.Vector3();

    if (keys.forward) direction.z -= 1;
    if (keys.back) direction.z += 1;
    if (keys.left) direction.x -= 1;
    if (keys.right) direction.x += 1;

    // Normalize for consistent speed
    if (direction.length() > 0) {
      direction.normalize().multiplyScalar(moveSpeed * delta);
      api.velocity.set(direction.x, 0, direction.z);

      // Rotate the model to face the movement direction
      if (modelRef.current) {
        const angle = Math.atan2(direction.x, direction.z);
        modelRef.current.rotation.y = angle;
      }
    } else {
      // If no keys are pressed, stop movement
      api.velocity.set(0, 0, 0);
    }
    
    // Add a small bounce animation for more liveliness
    if (modelRef.current) {
      modelRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 0.1;
    }
  });

  // Make non-player characters move randomly
  useEffect(() => {
    if (!isPlayer && modelRef.current) {
      const interval = setInterval(() => {
        const randomX = (Math.random() - 0.5) * 3;
        const randomZ = (Math.random() - 0.5) * 3;
        
        api.velocity.set(randomX, 0, randomZ);
        
        if (modelRef.current) {
          const angle = Math.atan2(randomX, randomZ);
          modelRef.current.rotation.y = angle;
        }
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [isPlayer, api]);

  return (
    <group ref={ref}>
      <group ref={modelRef}>
        {/* Use the appropriate 3D model based on character type */}
        {modelLoaded && (
          <Suspense fallback={
            <mesh castShadow>
              <boxGeometry args={[1, 2, 1]} />
              <meshStandardMaterial color={character === 'bull' ? '#2a9d8f' : '#e76f51'} />
            </mesh>
          }>
            <primitive 
              object={character === 'bull' ? bullModel.clone() : bearModel.clone()} 
              scale={[2.5, 2.5, 2.5]} 
              position={[0, -1, 0]}
              castShadow 
              receiveShadow 
            />
          </Suspense>
        )}
        
        {/* Fallback if model doesn't load */}
        {!modelLoaded && (
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[1, 2, 1]} />
            <meshStandardMaterial color={character === 'bull' ? '#2a9d8f' : '#e76f51'} />
          </mesh>
        )}
        
        {/* Label for player character */}
        {isPlayer && (
          <Text
            position={[0, 3, 0]}
            scale={[1, 1, 1]}
            color="white"
            fontSize={0.5}
            anchorX="center"
            anchorY="middle"
          >
            {character === 'bull' ? 'You (Bull)' : 'You (Bear)'}
          </Text>
        )}
      </group>
    </group>
  );
}

// AI Traders (opponents)
function AITraders() {
  const { aiTraders } = useGameStore();
  const [traders, setTraders] = useState<any[]>([]);
  
  // Generate some random traders if none are defined in the store
  useEffect(() => {
    if (!aiTraders || aiTraders.length === 0) {
      const randomTraders = Array(5).fill(0).map((_, index) => ({
        position: [
          (Math.random() - 0.5) * 20, 
          0.5, 
          (Math.random() - 0.5) * 20
        ] as [number, number, number],
        type: Math.random() > 0.5 ? 'bull' : 'bear'
      }));
      
      setTraders(randomTraders);
    } else {
      setTraders(aiTraders);
    }
  }, [aiTraders]);
  
  return (
    <>
      {traders.map((trader: any, index: number) => (
        <Player 
          key={`ai-trader-${index}`}
          position={trader.position}
          character={trader.type}
        />
      ))}
    </>
  );
}

// Trading Desk component
function TradingDesk({ position }: { position: [number, number, number] }) {
  const deskRef = useRef<THREE.Group>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const { scene: deskModel } = useGLTF('/models/trading_desk.glb') as GLTF & {
    scene: THREE.Group
  };
  
  useEffect(() => {
    if (deskModel) {
      setModelLoaded(true);
      console.log("Trading desk model loaded successfully");
    }
  }, [deskModel]);
  
  return (
    <group position={position} scale={[3, 3, 3]}>
      {modelLoaded && deskModel ? (
        <Suspense fallback={
          <mesh castShadow>
            <boxGeometry args={[2, 1, 2]} />
            <meshStandardMaterial color="#4a4a4a" />
          </mesh>
        }>
          <primitive 
            ref={deskRef}
            object={deskModel.clone()} 
            castShadow 
            receiveShadow 
          />
        </Suspense>
      ) : (
        <mesh castShadow>
          <boxGeometry args={[2, 1, 2]} />
          <meshStandardMaterial color="#4a4a4a" />
        </mesh>
      )}
    </group>
  );
}

// Market Price Board component
function MarketPriceBoard({ position, price, trend }: { 
  position: [number, number, number], 
  price: number,
  trend: string
}) {
  const boardRef = useRef<THREE.Group>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const { scene: boardModel } = useGLTF('/models/market_price_board.glb') as GLTF & {
    scene: THREE.Group
  };
  
  useEffect(() => {
    if (boardModel) {
      setModelLoaded(true);
      console.log("Market price board model loaded successfully");
    }
  }, [boardModel]);
  
  // Animated price display
  const [displayPrice, setDisplayPrice] = useState(price);
  useEffect(() => {
    // Animate price changes
    const step = (price - displayPrice) / 10;
    if (Math.abs(price - displayPrice) > 0.1) {
      const timeout = setTimeout(() => {
        setDisplayPrice(prev => prev + step);
      }, 50);
      return () => clearTimeout(timeout);
    } else {
      setDisplayPrice(price);
    }
  }, [price, displayPrice]);
  
  return (
    <group position={position} scale={[3, 3, 3]}>
      {modelLoaded && boardModel ? (
        <Suspense fallback={
          <mesh castShadow>
            <boxGeometry args={[2, 1, 0.2]} />
            <meshStandardMaterial color="#2c3e50" />
          </mesh>
        }>
          <primitive 
            ref={boardRef}
            object={boardModel.clone()} 
            castShadow 
            receiveShadow 
          />
        </Suspense>
      ) : (
        <mesh castShadow>
          <boxGeometry args={[2, 1, 0.2]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
      )}
      
      {/* Price display */}
      <Text
        position={[0, 0, 0.5]}
        rotation={[0, 0, 0]}
        fontSize={0.3}
        color={trend === 'bullish' ? "#4caf50" : trend === 'bearish' ? "#f44336" : "#ffffff"}
        font="/fonts/Roboto-Bold.ttf"
        anchorX="center"
        anchorY="middle"
      >
        ${displayPrice.toFixed(2)}
      </Text>
      
      {/* Trend indicator */}
      <Text
        position={[0, -0.4, 0.5]}
        rotation={[0, 0, 0]}
        fontSize={0.15}
        color={trend === 'bullish' ? "#4caf50" : trend === 'bearish' ? "#f44336" : "#9e9e9e"}
        font="/fonts/Roboto-Medium.ttf"
        anchorX="center"
        anchorY="middle"
      >
        {trend === 'bullish' ? '▲ BULLISH' : trend === 'bearish' ? '▼ BEARISH' : '◆ NEUTRAL'}
      </Text>
    </group>
  );
}

// Buy Zone indicator
function BuyZone({ position }: { position: [number, number, number] }) {
  const pulseRef = useRef<THREE.Group>(null);
  
  // Pulse animation
  useFrame(({ clock }) => {
    if (pulseRef.current) {
      pulseRef.current.scale.x = 1 + Math.sin(clock.elapsedTime * 2) * 0.1;
      pulseRef.current.scale.y = 1 + Math.sin(clock.elapsedTime * 2) * 0.1;
      pulseRef.current.scale.z = 1 + Math.sin(clock.elapsedTime * 2) * 0.1;
    }
  });
  
  return (
    <group position={position}>
      <group ref={pulseRef}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[4, 4, 4]} />
          <meshStandardMaterial 
            color="#2196f3" 
            transparent={true} 
            opacity={0.7} 
            emissive="#1976d2" 
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>
      <Text
        position={[0, 3, 0]}
        rotation={[0, Math.PI / 4, 0]}
        scale={[1, 1, 1]}
        color="white"
        fontSize={0.7}
        font="/fonts/Roboto-Bold.ttf"
        anchorX="center"
        anchorY="middle"
      >
        BUY ZONE
      </Text>
    </group>
  );
}

// Sell Zone indicator
function SellZone({ position }: { position: [number, number, number] }) {
  const pulseRef = useRef<THREE.Group>(null);
  
  // Pulse animation
  useFrame(({ clock }) => {
    if (pulseRef.current) {
      pulseRef.current.scale.x = 1 + Math.sin(clock.elapsedTime * 2 + Math.PI) * 0.1;
      pulseRef.current.scale.y = 1 + Math.sin(clock.elapsedTime * 2 + Math.PI) * 0.1;
      pulseRef.current.scale.z = 1 + Math.sin(clock.elapsedTime * 2 + Math.PI) * 0.1;
    }
  });
  
  return (
    <group position={position}>
      <group ref={pulseRef}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[4, 4, 4]} />
          <meshStandardMaterial 
            color="#f44336" 
            transparent={true} 
            opacity={0.7} 
            emissive="#d32f2f" 
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>
      <Text
        position={[0, 3, 0]}
        rotation={[0, -Math.PI / 4, 0]}
        scale={[1, 1, 1]}
        color="white"
        fontSize={0.7}
        font="/fonts/Roboto-Bold.ttf"
        anchorX="center"
        anchorY="middle"
      >
        SELL ZONE
      </Text>
    </group>
  );
}

// Market Trend Visualization
function MarketTrendIndicator({ position, trend }: { 
  position: [number, number, number], 
  trend: string 
}) {
  const indicatorRef = useRef<THREE.Mesh>(null);
  
  // Color based on market trend
  const color = trend === 'bullish' ? '#4caf50' : 
                trend === 'bearish' ? '#f44336' : 
                trend === 'volatile' ? '#ff9800' : '#9e9e9e';
  
  // Floating animation
  useFrame(({ clock }) => {
    if (indicatorRef.current) {
      // Make it float up and down slowly
      indicatorRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.5) * 0.5;
      // Rotate
      indicatorRef.current.rotation.y += 0.01;
    }
  });
  
  return (
    <mesh 
      ref={indicatorRef} 
      position={position} 
      castShadow
    >
      <sphereGeometry args={[2, 32, 32]} />
      <meshStandardMaterial 
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

// Market Sound Effects
function MarketSoundEffect({ trend, volume = 0.3 }: { trend: string, volume?: number }) {
  // Play different sounds based on market trend changes
  const [lastTrend, setLastTrend] = useState(trend);
  
  useEffect(() => {
    if (trend !== lastTrend) {
      const sound = new Audio(
        trend === 'bullish' ? '/sounds/success.mp3' : 
        trend === 'bearish' ? '/sounds/hit.mp3' : '/sounds/background.mp3'
      );
      sound.volume = volume;
      sound.play();
      setLastTrend(trend);
    }
  }, [trend, lastTrend, volume]);
  
  return null;
}

// Main Trading Arena
function TradingArena() {
  const { camera } = useThree();
  const { marketTrend } = usePriceStore();
  const [currentPrice, setCurrentPrice] = useState(50000); // Default BTC price
  
  // Generate semi-random price data
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrice(prev => {
        const volatility = 50; // Default volatility
        const trend = marketTrend === 'bullish' ? 1 : marketTrend === 'bearish' ? -1 : 0;
        const change = (Math.random() - 0.5 + trend * 0.1) * volatility;
        return Math.max(10000, prev + change);
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [marketTrend]);
  
  // Set camera position
  useEffect(() => {
    camera.position.set(0, 15, 20);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  // Determine skybox settings based on market trend
  const skyTurbidity = marketTrend === 'bearish' ? 15 : 10;
  const skyRayleigh = marketTrend === 'bearish' ? 1 : 0.5;
  const sunPosition = marketTrend === 'bearish' 
    ? [10, 0.5, 10] as [number, number, number] 
    : [0, 1, 0] as [number, number, number];

  return (
    <>
      {/* Environment */}
      <Sky 
        distance={450000} 
        turbidity={skyTurbidity} 
        rayleigh={skyRayleigh} 
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
        sunPosition={sunPosition}
      />
      <Environment preset={marketTrend === 'bearish' ? 'night' : 'city'} />
      <ambientLight intensity={marketTrend === 'bearish' ? 0.3 : 0.5} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={marketTrend === 'bearish' ? 0.7 : 1} 
        castShadow 
        shadow-mapSize={[2048, 2048]} 
      />
      
      {/* Fog effect */}
      <fog attach="fog" args={[
        marketTrend === 'bearish' ? '#1a237e' : '#e3f2fd', 
        30,
        100
      ]} />
      
      {/* Sound effects */}
      <MarketSoundEffect trend={marketTrend} />
      
      {/* Trading Floor */}
      <TradingFloor />
      
      {/* Trading Desk at center */}
      <TradingDesk position={[0, 0, 0]} />
      
      {/* Market Price Board */}
      <MarketPriceBoard 
        position={[0, 5, 0]} 
        price={currentPrice}
        trend={marketTrend}
      />
      
      {/* Market Trend Indicator */}
      <MarketTrendIndicator 
        position={[0, 10, 0]} 
        trend={marketTrend}
      />
      
      {/* Player character (Bull) */}
      <Player position={[0, 1, 5]} character="bull" isPlayer={true} />
      
      {/* AI traders */}
      <AITraders />
      
      {/* Trading Zones */}
      <BuyZone position={[-15, 2, -15]} />
      <SellZone position={[15, 2, -15]} />
    </>
  );
}

// Main component that sets up the game scene
export function BullsVsBearsScene() {
  const keyMap = [
    { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
    { name: Controls.back, keys: ['ArrowDown', 'KeyS'] },
    { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
    { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
    { name: Controls.jump, keys: ['Space'] },
    { name: Controls.action, keys: ['KeyE'] },
  ];

  return (
    <div className="w-full h-screen">
      <KeyboardControls map={keyMap}>
        <Canvas shadows>
          <fog attach="fog" args={['#e3f2fd', 30, 100]} />
          <Physics>
            <Suspense fallback={null}>
              <TradingArena />
            </Suspense>
          </Physics>
          <OrbitControls 
            enablePan={true} 
            maxPolarAngle={Math.PI / 2 - 0.1}
            minDistance={5}
            maxDistance={30}
          />
        </Canvas>
      </KeyboardControls>
      
      {/* Game UI overlay */}
      <GameUI />
    </div>
  );
}