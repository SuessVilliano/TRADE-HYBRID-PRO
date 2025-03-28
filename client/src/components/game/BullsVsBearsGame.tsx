import { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { KeyboardControls, OrbitControls, Text, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { useMarketData } from "@/lib/stores/useMarketData";
import { useAudio } from "@/lib/stores/useAudio";

// Game states
enum GameState {
  WAITING = "waiting",
  PLAYING = "playing",
  GAME_OVER = "game_over"
}

// Difficulty levels
enum Difficulty {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced"
}

// Controls enum
enum Controls {
  forward = 'forward',
  back = 'back',
  left = 'left',
  right = 'right',
  jump = 'jump',
}

// Market chart visualization
interface MarketChartProps {
  priceHistory: number[];
  width?: number;
  height?: number;
  color?: string;
}

function MarketChart({ priceHistory, width = 10, height = 5, color = "#00ff00" }: MarketChartProps) {
  const points = priceHistory.map((price: number, index: number) => 
    new THREE.Vector3(index * (width / Math.max(priceHistory.length - 1, 1)) - width / 2, 
                     (price - Math.min(...priceHistory)) / (Math.max(...priceHistory) - Math.min(...priceHistory) || 1) * height - height / 2, 
                     0)
  );

  return (
    <group>
      {/* Base platform */}
      <mesh position={[0, -height / 2 - 0.1, 0]} receiveShadow>
        <boxGeometry args={[width + 1, 0.1, 3]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* Price line */}
      {points.length > 1 && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={points.length}
              array={new Float32Array(points.flatMap((p: THREE.Vector3) => [p.x, p.y, p.z]))}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={color} linewidth={2} />
        </line>
      )}

      {/* Current price marker */}
      {points.length > 0 && (
        <mesh position={[points[points.length - 1].x, points[points.length - 1].y, points[points.length - 1].z]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color={color} />
        </mesh>
      )}

      {/* Price axis labels */}
      {priceHistory.length > 0 && (
        <>
          <Text 
            position={[-width / 2 - 0.5, 0, 0]} 
            rotation={[0, 0, Math.PI / 2]} 
            fontSize={0.3}
            color="#ffffff"
          >
            Price
          </Text>
          <Text 
            position={[0, -height / 2 - 0.5, 0]}
            fontSize={0.3}
            color="#ffffff"
          >
            Time
          </Text>
        </>
      )}
    </group>
  );
}

// Game scene
interface GameSceneProps {
  priceHistory: number[];
  onBuy: () => void;
  onSell: () => void;
  playerScore: number;
  gameState: GameState;
  streak: number;
}

function GameScene({ 
  priceHistory, 
  onBuy, 
  onSell, 
  playerScore, 
  gameState, 
  streak 
}: GameSceneProps) {
  // Background environment
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <OrbitControls enablePan={false} enableZoom={true} maxDistance={20} minDistance={5} />
      
      {/* Market chart */}
      <MarketChart priceHistory={priceHistory} />
      
      {/* Game status display */}
      <Text 
        position={[0, 3, 0]}
        fontSize={0.5}
        color="#ffffff"
      >
        {gameState === GameState.WAITING ? "Bulls vs Bears Trading Game" : 
         gameState === GameState.PLAYING ? `Score: ${playerScore} | Streak: ${streak}` :
         `Game Over! Final Score: ${playerScore}`}
      </Text>

      {/* Trading buttons rendered in 3D space */}
      {gameState === GameState.PLAYING && (
        <>
          <group position={[-2, -3, 0]}>
            <mesh onClick={onBuy} castShadow>
              <boxGeometry args={[2, 0.7, 0.2]} />
              <meshStandardMaterial color="#4CAF50" />
            </mesh>
            <Text position={[0, 0, 0.2]} fontSize={0.3} color="#ffffff">BUY</Text>
          </group>

          <group position={[2, -3, 0]}>
            <mesh onClick={onSell} castShadow>
              <boxGeometry args={[2, 0.7, 0.2]} />
              <meshStandardMaterial color="#F44336" />
            </mesh>
            <Text position={[0, 0, 0.2]} fontSize={0.3} color="#ffffff">SELL</Text>
          </group>
        </>
      )}
    </>
  );
}

// AI market generator
class MarketGenerator {
  private basePrice: number;
  private volatility: number;
  private trend: number;
  private noise: number;
  private history: number[];
  private trendChangeProbability: number;
  private lastDirection: boolean | null;

  constructor(
    basePrice = 100, 
    volatility = 1.0, 
    initialTrend = 0.1, 
    noise = 0.5,
    trendChangeProbability = 0.05
  ) {
    this.basePrice = basePrice;
    this.volatility = volatility;
    this.trend = initialTrend;
    this.noise = noise;
    this.history = [basePrice];
    this.trendChangeProbability = trendChangeProbability;
    this.lastDirection = null;
  }

  generateNextPrice(): number {
    // Randomly change trend direction occasionally
    if (Math.random() < this.trendChangeProbability) {
      this.trend = -this.trend;
    }
    
    // Calculate random movement
    const randomComponent = (Math.random() - 0.5) * this.noise * this.volatility;
    const trendComponent = this.trend * this.volatility;
    
    // Calculate new price
    let lastPrice = this.history[this.history.length - 1];
    let newPrice = lastPrice + trendComponent + randomComponent;
    
    // Ensure price doesn't go negative
    newPrice = Math.max(newPrice, 1);
    
    // Update last direction
    this.lastDirection = newPrice > lastPrice;
    
    // Store price in history
    this.history.push(newPrice);
    
    return newPrice;
  }

  getHistory(): number[] {
    return [...this.history];
  }

  getLastDirection(): boolean | null {
    return this.lastDirection;
  }

  // Reset the market generator
  reset(basePrice = 100): void {
    this.history = [basePrice];
    this.lastDirection = null;
  }
}

// Main game component
export default function BullsVsBearsGame() {
  const [gameState, setGameState] = useState<GameState>(GameState.WAITING);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.BEGINNER);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [priceHistory, setPriceHistory] = useState<number[]>([100]);
  const marketGenerator = useRef(new MarketGenerator());
  const gameLoopInterval = useRef<NodeJS.Timeout | null>(null);
  const audioStore = useAudio();

  // Reset game
  const resetGame = () => {
    marketGenerator.current.reset();
    setPriceHistory([100]);
    setScore(0);
    setStreak(0);
    setGameState(GameState.WAITING);
    
    // Stop the game loop if it's running
    if (gameLoopInterval.current) {
      clearInterval(gameLoopInterval.current);
      gameLoopInterval.current = null;
    }
  };

  // Start game
  const startGame = (selectedDifficulty: Difficulty) => {
    resetGame();
    setDifficulty(selectedDifficulty);
    setGameState(GameState.PLAYING);
    
    // Configure market generator based on difficulty
    let volatility = 1.0;
    let noise = 0.5;
    let trendChangeProbability = 0.05;
    
    switch (selectedDifficulty) {
      case Difficulty.BEGINNER:
        volatility = 0.8;
        noise = 0.3;
        trendChangeProbability = 0.03;
        break;
      case Difficulty.INTERMEDIATE:
        volatility = 1.2;
        noise = 0.6;
        trendChangeProbability = 0.05;
        break;
      case Difficulty.ADVANCED:
        volatility = 1.8;
        noise = 0.9;
        trendChangeProbability = 0.08;
        break;
    }
    
    marketGenerator.current = new MarketGenerator(
      100, volatility, 0.1, noise, trendChangeProbability
    );
    
    // Play success sound when starting
    audioStore.playSuccessSound();
    
    // Start game loop - update market every second
    const intervalTime = selectedDifficulty === Difficulty.BEGINNER ? 1500 :
                         selectedDifficulty === Difficulty.INTERMEDIATE ? 1000 : 700;
    
    gameLoopInterval.current = setInterval(() => {
      const newPrice = marketGenerator.current.generateNextPrice();
      setPriceHistory(marketGenerator.current.getHistory());
      
      // End game after 30 moves
      if (marketGenerator.current.getHistory().length > 30) {
        setGameState(GameState.GAME_OVER);
        if (gameLoopInterval.current) {
          clearInterval(gameLoopInterval.current);
          gameLoopInterval.current = null;
        }
      }
    }, intervalTime);
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (gameLoopInterval.current) {
        clearInterval(gameLoopInterval.current);
      }
    };
  }, []);

  // Handle buy action
  const handleBuy = () => {
    const direction = marketGenerator.current.getLastDirection();
    if (direction === true) {
      // Correct prediction - price went up
      setScore(prev => prev + 10 * (streak + 1));
      setStreak(prev => prev + 1);
      audioStore.playSuccessSound();
    } else {
      // Wrong prediction
      setScore(prev => prev - 5);
      setStreak(0);
      audioStore.playHitSound();
    }
  };

  // Handle sell action
  const handleSell = () => {
    const direction = marketGenerator.current.getLastDirection();
    if (direction === false) {
      // Correct prediction - price went down
      setScore(prev => prev + 10 * (streak + 1));
      setStreak(prev => prev + 1);
      audioStore.playSuccessSound();
    } else {
      // Wrong prediction
      setScore(prev => prev - 5);
      setStreak(0);
      audioStore.playHitSound();
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1">
        <Canvas shadows camera={{ position: [0, 0, 10], fov: 50 }}>
          <GameScene
            priceHistory={priceHistory}
            onBuy={handleBuy}
            onSell={handleSell}
            playerScore={score}
            gameState={gameState}
            streak={streak}
          />
        </Canvas>
      </div>
      
      {/* UI Controls */}
      <div className="p-4 bg-black/30 backdrop-blur">
        {gameState === GameState.WAITING && (
          <div className="flex flex-col space-y-2">
            <h2 className="text-xl font-bold mb-2">Bulls vs Bears Trading Game</h2>
            <p className="text-sm mb-4">Trade with market pattern recognition and earn points!</p>
            <div className="flex gap-2">
              <Button 
                onClick={() => startGame(Difficulty.BEGINNER)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Beginner
              </Button>
              <Button 
                onClick={() => startGame(Difficulty.INTERMEDIATE)}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Intermediate
              </Button>
              <Button 
                onClick={() => startGame(Difficulty.ADVANCED)}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                Advanced
              </Button>
            </div>
          </div>
        )}
        
        {gameState === GameState.PLAYING && (
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-bold">Score: {score}</p>
              <p className="text-sm">Streak: {streak}x</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleBuy}
                className="bg-green-600 hover:bg-green-700"
              >
                BUY
              </Button>
              <Button 
                onClick={handleSell}
                className="bg-red-600 hover:bg-red-700"
              >
                SELL
              </Button>
            </div>
          </div>
        )}
        
        {gameState === GameState.GAME_OVER && (
          <div className="flex flex-col space-y-2">
            <h2 className="text-xl font-bold">Game Over!</h2>
            <p className="text-lg">Final Score: {score}</p>
            <Button 
              onClick={() => resetGame()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Play Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}