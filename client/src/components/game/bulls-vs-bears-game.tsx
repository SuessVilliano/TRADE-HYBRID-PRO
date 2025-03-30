import React, { useRef, useState, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  useGLTF, 
  Environment, 
  Sky, 
  Text
} from '@react-three/drei';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';
import { useBullsVsBearsStore } from '../../lib/stores/useBullsVsBearsStore';

// Market trend indicator
function MarketTrendIndicator({ position, color }: { position: [number, number, number], color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (ref.current) {
      // Make it float up and down slowly
      ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.5) * 0.2;
      // Slowly rotate
      ref.current.rotation.y += 0.005;
    }
  });

  return (
    <mesh ref={ref} position={position} castShadow>
      <sphereGeometry args={[1, 32, 32]} />
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

// Floor/Ground component
function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#303030" />
    </mesh>
  );
}

// Trading Desk component
function TradingDesk({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const { scene: deskModel } = useGLTF('/models/modern_trading_desk.glb') as GLTF & {
    scene: THREE.Group
  };
  
  useEffect(() => {
    if (deskModel) {
      setModelLoaded(true);
      console.log("Trading desk model loaded successfully");
    }
  }, [deskModel]);
  
  return (
    <group ref={ref} position={position} scale={[2.5, 2.5, 2.5]}>
      {modelLoaded && deskModel ? (
        <Suspense fallback={
          <mesh castShadow>
            <boxGeometry args={[1, 0.5, 1]} />
            <meshStandardMaterial color="#4a4a4a" />
          </mesh>
        }>
          <primitive 
            object={deskModel.clone()} 
            castShadow 
            receiveShadow 
          />
        </Suspense>
      ) : (
        <mesh castShadow>
          <boxGeometry args={[1, 0.5, 1]} />
          <meshStandardMaterial color="#4a4a4a" />
        </mesh>
      )}
    </group>
  );
}

// Market Price Board component
function MarketPriceBoard({ position, price }: { position: [number, number, number], price: number }) {
  const ref = useRef<THREE.Group>(null);
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
  
  return (
    <group ref={ref} position={position} scale={[2, 2, 2]}>
      {modelLoaded && boardModel ? (
        <Suspense fallback={
          <mesh castShadow>
            <boxGeometry args={[2, 1, 0.2]} />
            <meshStandardMaterial color="#2c3e50" />
          </mesh>
        }>
          <primitive 
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
      <Text
        position={[0, 0, 0.5]}
        rotation={[0, 0, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        ${price.toFixed(2)}
      </Text>
    </group>
  );
}

// Trader Character component
function TraderCharacter({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const { scene: traderModel } = useGLTF('/models/simple_trader.glb') as GLTF & {
    scene: THREE.Group
  };
  
  useEffect(() => {
    if (traderModel) {
      setModelLoaded(true);
      console.log("Trader character model loaded successfully");
    }
  }, [traderModel]);
  
  return (
    <group ref={ref} position={position} scale={[2, 2, 2]}>
      {modelLoaded && traderModel ? (
        <Suspense fallback={
          <mesh castShadow>
            <capsuleGeometry args={[0.3, 1, 8, 16]} />
            <meshStandardMaterial color="#3498db" />
          </mesh>
        }>
          <primitive 
            object={traderModel.clone()} 
            castShadow 
            receiveShadow 
          />
        </Suspense>
      ) : (
        <mesh castShadow>
          <capsuleGeometry args={[0.3, 1, 8, 16]} />
          <meshStandardMaterial color="#3498db" />
        </mesh>
      )}
      <Text
        position={[0, 1.5, 0]}
        rotation={[0, 0, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        TRADER
      </Text>
    </group>
  );
}

// Bull character
function Bull({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  const { scene: bullModel } = useGLTF('/models/bull_mascot.glb') as GLTF & {
    scene: THREE.Group
  };
  
  return (
    <group ref={ref} position={position} scale={[1, 1, 1]}>
      <Suspense fallback={
        <mesh castShadow>
          <boxGeometry args={[1, 2, 1]} />
          <meshStandardMaterial color="#26a69a" />
        </mesh>
      }>
        <primitive 
          object={bullModel.clone()} 
          scale={[2.5, 2.5, 2.5]} 
          castShadow 
          receiveShadow 
        />
      </Suspense>
      <Text
        position={[0, 3, 0]}
        rotation={[0, Math.PI / 2, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        BULL
      </Text>
    </group>
  );
}

// Bear character
function Bear({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  const { scene: bearModel } = useGLTF('/models/bear_mascot.glb') as GLTF & {
    scene: THREE.Group
  };
  
  return (
    <group ref={ref} position={position} scale={[1, 1, 1]}>
      <Suspense fallback={
        <mesh castShadow>
          <boxGeometry args={[1, 2, 1]} />
          <meshStandardMaterial color="#ef5350" />
        </mesh>
      }>
        <primitive 
          object={bearModel.clone()} 
          scale={[2.5, 2.5, 2.5]} 
          castShadow 
          receiveShadow 
        />
      </Suspense>
      <Text
        position={[0, 3, 0]}
        rotation={[0, Math.PI / 2, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        BEAR
      </Text>
    </group>
  );
}

// Game scene component
function GameScene() {
  const { gameState } = useBullsVsBearsStore();
  const { camera } = useThree();
  
  // Position the camera on first render
  useEffect(() => {
    camera.position.set(15, 15, 15);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  
  // Market indicator based on current trend
  const indicatorColor = gameState.currentTrend === 'bullish' ? '#26a69a' : 
    gameState.currentTrend === 'bearish' ? '#ef5350' : 
    gameState.currentTrend === 'volatile' ? '#ff9800' : '#9e9e9e';
  
  return (
    <>
      {/* Environment */}
      <Sky sunPosition={[100, 10, 100]} />
      <Environment preset="city" />
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1} 
        castShadow 
        shadow-mapSize-width={2048} 
        shadow-mapSize-height={2048} 
      />
      
      {/* Floor */}
      <Floor />
      
      {/* Trading desk at center */}
      <TradingDesk position={[0, 0, 0]} />
      
      {/* Market price board above the desk */}
      <MarketPriceBoard 
        position={[0, 5, 0]} 
        price={gameState.currentPrice} 
      />
      
      {/* Trader character at the desk */}
      <TraderCharacter position={[0, 0, 3]} />
      
      {/* Market Trend Indicator */}
      <MarketTrendIndicator 
        position={[0, 8, 0]} 
        color={indicatorColor} 
      />
      
      {/* Bull and Bear characters positioned on opposite sides */}
      <Bull position={[8, 0, 0]} />
      <Bear position={[-8, 0, 0]} />
      
      {/* Allow user to control camera */}
      <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true} 
        minDistance={5}
        maxDistance={25}
      />
    </>
  );
}

// Main Bulls vs Bears Game component
export function BullsVsBearsGame() {
  // Preload 3D models
  useGLTF.preload('/models/bull_mascot.glb');
  useGLTF.preload('/models/bear_mascot.glb');
  useGLTF.preload('/models/modern_trading_desk.glb');
  useGLTF.preload('/models/market_price_board.glb');
  useGLTF.preload('/models/simple_trader.glb');

  return (
    <div className="bulls-vs-bears-game-container" style={{ width: '100%', height: '80vh' }}>
      <Canvas shadows>
        <Suspense fallback={null}>
          <GameScene />
        </Suspense>
      </Canvas>
    </div>
  );
}