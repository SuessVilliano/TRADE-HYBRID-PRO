import React, { useState, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Text, useTexture, Box, Sphere, Cylinder } from '@react-three/drei';
import { useBullsVsBearsStore } from '@/lib/stores/useBullsVsBearsStore';
import * as THREE from 'three';

// Define types for our interactive objects
type TradingTerminal = {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
};

type Player = {
  id: string;
  position: [number, number, number];
  color: string;
  isAI: boolean;
};

type MarketIndicator = {
  position: [number, number, number];
  scale: number;
  color: string;
};

// Main game component
export function BullsVsBearsGame() {
  const { scene } = useThree();
  const gameState = useBullsVsBearsStore(state => state.gameState);
  const players = useBullsVsBearsStore(state => state.gameState.players);
  const openPosition = useBullsVsBearsStore(state => state.openPosition);
  const closePosition = useBullsVsBearsStore(state => state.closePosition);
  
  // Trading terminal state
  const [showTradeInterface, setShowTradeInterface] = useState(false);
  const [selectedTerminal, setSelectedTerminal] = useState<TradingTerminal | null>(null);
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [leverage, setLeverage] = useState(1);
  const [positionSize, setPositionSize] = useState(100);

  // Reference to trading floor and price chart
  const tradingFloorRef = useRef<THREE.Mesh>(null);
  const priceChartRef = useRef<THREE.Group>(null);
  
  // Reference to bull and bear mascots
  const bullRef = useRef<THREE.Group>(null);
  const bearRef = useRef<THREE.Group>(null);
  
  // Create trading terminals
  const terminals: TradingTerminal[] = [
    { position: [-4, 1, -2], rotation: [0, Math.PI / 4, 0], scale: [1, 1, 1], color: '#3f88c5' },
    { position: [4, 1, -2], rotation: [0, -Math.PI / 4, 0], scale: [1, 1, 1], color: '#e63946' },
    { position: [0, 1, -4], rotation: [0, 0, 0], scale: [1, 1, 1], color: '#588157' },
  ];
  
  // Create player representations
  const playerObjects = players.map((player, index) => {
    const angle = (index / players.length) * Math.PI * 2;
    const radius = 6;
    return {
      id: player.id,
      position: [
        Math.sin(angle) * radius,
        1,
        Math.cos(angle) * radius
      ] as [number, number, number],
      color: player.isAI ? '#f4a261' : '#2a9d8f',
      isAI: player.isAI
    };
  });
  
  // Market indicators based on current trend
  const marketColor = {
    bullish: '#4ade80', // green
    bearish: '#ef4444', // red
    sideways: '#a1a1aa', // gray
    volatile: '#fbbf24', // yellow
  }[gameState.currentTrend];
  
  // Price history for the 3D chart
  const priceHistoryPoints = gameState.priceHistory.slice(-20).map((price, index, arr) => {
    // Normalize prices to fit in the scene
    const minPrice = Math.min(...arr.map(p => p.low));
    const maxPrice = Math.max(...arr.map(p => p.high));
    const range = maxPrice - minPrice;
    
    // Avoid division by zero
    const normalizedHeight = range === 0 ? 0 : ((price.close - minPrice) / range) * 4;
    
    return {
      position: [index * 0.5 - 5, normalizedHeight, 0] as [number, number, number],
      color: price.close > price.open ? '#4ade80' : '#ef4444',
      height: normalizedHeight,
    };
  });
  
  // Handle trading terminal click
  const handleTerminalClick = (terminal: TradingTerminal) => {
    if (!gameState.isGameStarted || gameState.isGamePaused || gameState.isGameOver) return;
    
    setSelectedTerminal(terminal);
    setShowTradeInterface(true);
  };
  
  // Handle placing an order
  const handlePlaceOrder = () => {
    if (!gameState.isGameStarted || gameState.isGamePaused || gameState.isGameOver) return;
    
    // Calculate position details
    const size = orderType === 'buy' ? positionSize : -positionSize;
    
    // Open a new position
    openPosition({
      entryPrice: gameState.currentPrice,
      size,
      leverage,
      stopLoss: orderType === 'buy' 
        ? gameState.currentPrice * 0.95 
        : gameState.currentPrice * 1.05,
      takeProfit: orderType === 'buy'
        ? gameState.currentPrice * 1.1
        : gameState.currentPrice * 0.9,
    });
    
    // Close the interface
    setShowTradeInterface(false);
  };
  
  // Animate bull and bear based on market trend
  useFrame((state, delta) => {
    // Skip animations if game not started
    if (!gameState.isGameStarted || gameState.isGamePaused) return;
    
    // Animate the bull based on bullish trends
    if (bullRef.current) {
      if (gameState.currentTrend === 'bullish') {
        bullRef.current.position.y = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
        bullRef.current.rotation.y += delta * 0.5;
      } else {
        bullRef.current.position.y = 1;
        bullRef.current.rotation.y += delta * 0.1;
      }
    }
    
    // Animate the bear based on bearish trends
    if (bearRef.current) {
      if (gameState.currentTrend === 'bearish') {
        bearRef.current.position.y = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
        bearRef.current.rotation.y -= delta * 0.5;
      } else {
        bearRef.current.position.y = 1;
        bearRef.current.rotation.y -= delta * 0.1;
      }
    }
    
    // Animate price chart
    if (priceChartRef.current) {
      priceChartRef.current.rotation.y += delta * 0.1;
    }
  });
  
  return (
    <>
      {/* Trading floor */}
      <mesh 
        ref={tradingFloorRef} 
        position={[0, 0, 0]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        receiveShadow
      >
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      
      {/* Trading terminals */}
      {terminals.map((terminal, index) => (
        <group 
          key={index}
          position={terminal.position}
          rotation={terminal.rotation as any}
          scale={terminal.scale as any}
          onClick={() => handleTerminalClick(terminal)}
        >
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.5, 1, 0.8]} />
            <meshStandardMaterial color={terminal.color} />
          </mesh>
          
          <mesh position={[0, 0.6, 0]} castShadow>
            <boxGeometry args={[1.2, 0.2, 0.6]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
          
          <Text
            position={[0, 0.8, 0]}
            rotation={[0, Math.PI, 0]}
            fontSize={0.2}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            Trading Terminal
          </Text>
        </group>
      ))}
      
      {/* Players */}
      {playerObjects.map((player) => (
        <group key={player.id} position={player.position}>
          <mesh castShadow>
            <capsuleGeometry args={[0.5, 1, 8, 16]} />
            <meshStandardMaterial color={player.color} />
          </mesh>
          
          <Text
            position={[0, 2, 0]}
            fontSize={0.3}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {players.find(p => p.id === player.id)?.name}
            {player.isAI ? ' (AI)' : ' (You)'}
          </Text>
          
          {/* Show player balance */}
          <Text
            position={[0, 1.5, 0]}
            fontSize={0.2}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            ${players.find(p => p.id === player.id)?.balance.toFixed(2)}
          </Text>
        </group>
      ))}
      
      {/* Bull and Bear Mascots */}
      <group ref={bullRef} position={[-8, 1, -8]}>
        <mesh castShadow>
          <boxGeometry args={[2, 1, 1]} />
          <meshStandardMaterial color="#4ade80" />
        </mesh>
        
        {/* Bull's head */}
        <mesh castShadow position={[1.2, 0.5, 0]}>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial color="#4ade80" />
        </mesh>
        
        {/* Bull's horns */}
        <mesh castShadow position={[1.5, 0.9, -0.4]}>
          <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} />
          <meshStandardMaterial color="#d1d5db" />
        </mesh>
        <mesh castShadow position={[1.5, 0.9, 0.4]}>
          <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} />
          <meshStandardMaterial color="#d1d5db" />
        </mesh>
        
        <Text
          position={[0, 1.5, 0]}
          fontSize={0.4}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          BULL
        </Text>
      </group>
      
      <group ref={bearRef} position={[8, 1, -8]}>
        <mesh castShadow>
          <boxGeometry args={[2, 1, 1]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
        
        {/* Bear's head */}
        <mesh castShadow position={[1.2, 0.5, 0]}>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
        
        {/* Bear's ears */}
        <mesh castShadow position={[1.2, 1.1, -0.4]}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
        <mesh castShadow position={[1.2, 1.1, 0.4]}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
        
        <Text
          position={[0, 1.5, 0]}
          fontSize={0.4}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          BEAR
        </Text>
      </group>
      
      {/* 3D Price Chart */}
      <group ref={priceChartRef} position={[0, 1, 0]}>
        {priceHistoryPoints.map((point, index) => (
          <group key={index} position={point.position}>
            <mesh castShadow>
              <boxGeometry args={[0.3, point.height || 0.1, 0.3]} />
              <meshStandardMaterial color={point.color} />
            </mesh>
          </group>
        ))}
        
        {/* Chart base */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[12, 0.1, 1]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        
        <Text
          position={[0, 5, 0]}
          fontSize={0.5}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {gameState.asset} - {gameState.timeFrame}
        </Text>
      </group>
      
      {/* Market trend indicator */}
      <group position={[0, 7, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color={marketColor} />
        </mesh>
        
        <Text
          position={[0, 2, 0]}
          fontSize={0.8}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {gameState.currentTrend.toUpperCase()}
        </Text>
      </group>
      
      {/* Trading interface */}
      {showTradeInterface && selectedTerminal && (
        <group position={[selectedTerminal.position[0], selectedTerminal.position[1] + 3, selectedTerminal.position[2]]}>
          <mesh castShadow>
            <boxGeometry args={[4, 3, 0.2]} />
            <meshStandardMaterial color="#1e293b" opacity={0.9} transparent />
          </mesh>
          
          <Text
            position={[0, 1.2, 0.2]}
            fontSize={0.3}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            onClick={() => setOrderType('buy')}
          >
            {orderType === 'buy' ? '✓ BUY / LONG' : 'BUY / LONG'}
          </Text>
          
          <Text
            position={[0, 0.8, 0.2]}
            fontSize={0.3}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            onClick={() => setOrderType('sell')}
          >
            {orderType === 'sell' ? '✓ SELL / SHORT' : 'SELL / SHORT'}
          </Text>
          
          <Text
            position={[-1.5, 0.4, 0.2]}
            fontSize={0.25}
            color="#ffffff"
            anchorX="left"
            anchorY="middle"
          >
            Leverage: {leverage}x
          </Text>
          
          <group position={[1, 0.4, 0.2]}>
            <Text
              position={[-0.3, 0, 0]}
              fontSize={0.2}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              onClick={() => setLeverage(Math.max(1, leverage - 1))}
            >
              -
            </Text>
            <Text
              position={[0.3, 0, 0]}
              fontSize={0.2}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              onClick={() => setLeverage(Math.min(20, leverage + 1))}
            >
              +
            </Text>
          </group>
          
          <Text
            position={[-1.5, 0, 0.2]}
            fontSize={0.25}
            color="#ffffff"
            anchorX="left"
            anchorY="middle"
          >
            Size: ${positionSize}
          </Text>
          
          <group position={[1, 0, 0.2]}>
            <Text
              position={[-0.3, 0, 0]}
              fontSize={0.2}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              onClick={() => setPositionSize(Math.max(100, positionSize - 100))}
            >
              -
            </Text>
            <Text
              position={[0.3, 0, 0]}
              fontSize={0.2}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              onClick={() => setPositionSize(positionSize + 100)}
            >
              +
            </Text>
          </group>
          
          <group position={[0, -0.4, 0.2]}>
            <mesh
              position={[0, 0, 0]}
              castShadow
              onClick={handlePlaceOrder}
            >
              <boxGeometry args={[2, 0.4, 0.1]} />
              <meshStandardMaterial color={orderType === 'buy' ? '#4ade80' : '#ef4444'} />
            </mesh>
            
            <Text
              position={[0, 0, 0.2]}
              fontSize={0.25}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              Place Order
            </Text>
          </group>
          
          <Text
            position={[1.8, 1.4, 0.2]}
            fontSize={0.2}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            onClick={() => setShowTradeInterface(false)}
          >
            X
          </Text>
        </group>
      )}
    </>
  );
}