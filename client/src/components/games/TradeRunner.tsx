import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Physics, usePlane, useBox, useSphere } from '@react-three/cannon';
import { 
  useGLTF, 
  Text, 
  OrbitControls, 
  PerspectiveCamera, 
  useKeyboardControls,
  KeyboardControls
} from '@react-three/drei';
import * as THREE from 'three';
import { useIsMobile } from '../../hooks/use-is-mobile';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

// Types
enum GameState {
  READY = 'ready',
  PLAYING = 'playing',
  GAME_OVER = 'game_over'
}

interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  level: number;
  completionTime: number;
  date: string;
}

interface GameStats {
  score: number;
  distance: number;
  coins: number;
  level: number;
  lives: number;
  timeElapsed: number;
}

// Ground component
function Ground(props: any) {
  const [ref] = usePlane(() => ({ 
    rotation: [-Math.PI / 2, 0, 0], 
    position: [0, -0.5, 0], 
    ...props 
  }));

  return (
    <group ref={ref}>
      <mesh receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#303030" />
      </mesh>
      {/* Grid lines for the floor */}
      <gridHelper args={[100, 100, '#606060', '#404040']} position={[0, 0.01, 0]} />
    </group>
  );
}

// Obstacle component
function Obstacle({ position, scale = [1, 1, 1], rotation = [0, 0, 0], onCollide }: any) {
  const [ref, api] = useBox(() => ({ 
    args: scale,
    position,
    rotation,
    onCollide,
    type: 'Static'
  }));

  // Use the existing obstacle model
  const { scene } = useGLTF('/models/obstacle.glb');
  
  return (
    <group ref={ref} scale={[2.5, 2.5, 2.5]}>
      <primitive object={scene.clone()} />
    </group>
  );
}

// Coin component
function Coin({ position, onCollect }: any) {
  const [ref, api] = useSphere(() => ({ 
    args: [0.5],
    position,
    type: 'Static',
    isTrigger: true,
    onCollide: (e) => {
      if (e.body.name === 'player') {
        onCollect();
        api.position.set(position[0], -10, position[2]); // Move out of view when collected
      }
    }
  }));

  // Rotate the coin
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.02;
    }
  });

  return (
    <mesh ref={ref} name="coin" castShadow>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color="gold" metalness={0.7} roughness={0.3} />
      <Text
        position={[0, 0, 0.6]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.3}
        color="darkgoldenrod"
      >
        C
      </Text>
      <Text
        position={[0, 0, -0.6]}
        fontSize={0.3}
        color="darkgoldenrod"
      >
        C
      </Text>
    </mesh>
  );
}

// Player component
function Player({ onGameOver }: { onGameOver: () => void }) {
  const [ref, api] = useBox(() => ({ 
    args: [1, 1, 1],
    mass: 1,
    position: [0, 0.5, 0],
    name: 'player',
    onCollide: (e) => {
      // Check if we collided with an obstacle
      if (e.body.name === 'obstacle') {
        onGameOver();
      }
    }
  }));

  // Animation state
  const jumpPressed = useKeyboardControls((state: any) => state.jump);
  const leftPressed = useKeyboardControls((state: any) => state.left);
  const rightPressed = useKeyboardControls((state: any) => state.right);
  
  // Player control
  useFrame((state) => {
    if (ref.current) {
      // Handle jumping
      if (jumpPressed) {
        // Get current velocity
        const velocity = new THREE.Vector3();
        api.velocity.subscribe(v => velocity.set(v[0], v[1], v[2]));
        
        // Only jump if we're close to the ground
        if (Math.abs(velocity.y) < 0.1) {
          api.velocity.set(velocity.x, 8, velocity.z);
        }
      }
      
      // Handle left/right movement
      const moveSpeed = 5;
      if (leftPressed) {
        api.velocity.set(moveSpeed * -1, 0, 0);
      } else if (rightPressed) {
        api.velocity.set(moveSpeed, 0, 0);
      } else {
        api.velocity.set(0, 0, 0);
      }
    }
  });

  // Use the trader_character model for the player
  const { scene } = useGLTF('/models/trader_character.glb');
  
  return (
    <group ref={ref} name="player" scale={[0.5, 0.5, 0.5]}>
      <primitive object={scene.clone()} />
    </group>
  );
}

// Camera that follows the player
function FollowCamera({ playerRef }: { playerRef: React.RefObject<THREE.Group> }) {
  const { camera } = useThree();
  
  useFrame(() => {
    if (playerRef.current) {
      const playerPosition = playerRef.current.position;
      camera.position.x = playerPosition.x;
      camera.position.y = playerPosition.y + 5;
      camera.position.z = playerPosition.z + 10;
      camera.lookAt(playerPosition.x, playerPosition.y, playerPosition.z);
    }
  });
  
  return null;
}

// Endless runner level generator
function RunnerLevel({ onCoinCollect, onObstacleHit, playerRef, speed }: any) {
  const [obstacles, setObstacles] = useState<any[]>([]);
  const [coins, setCoins] = useState<any[]>([]);
  const levelProgress = useRef(0);
  const spawnDistance = 50; // How far ahead to spawn objects
  const despawnDistance = -20; // How far behind to remove objects
  
  // Generate the initial level segments
  useEffect(() => {
    generateInitialLevel();
  }, []);
  
  // Level generation
  const generateInitialLevel = () => {
    const newObstacles = [];
    const newCoins = [];
    
    // Create some initial obstacles
    for (let i = 0; i < 10; i++) {
      const z = -20 - (i * 10);
      const x = Math.random() * 8 - 4;
      
      newObstacles.push({
        id: `obstacle-${i}`,
        position: [x, 0, z],
        scale: [1, 1, 1],
        rotation: [0, Math.random() * Math.PI, 0]
      });
    }
    
    // Create some initial coins
    for (let i = 0; i < 20; i++) {
      const z = -15 - (i * 5);
      const x = Math.random() * 8 - 4;
      
      newCoins.push({
        id: `coin-${i}`,
        position: [x, 1, z]
      });
    }
    
    setObstacles(newObstacles);
    setCoins(newCoins);
  };
  
  // Move objects towards the player
  useFrame(() => {
    // Update level progress
    levelProgress.current += speed * 0.1;
    
    // Move existing obstacles
    setObstacles(prevObstacles => {
      return prevObstacles.map(obstacle => ({
        ...obstacle,
        position: [
          obstacle.position[0],
          obstacle.position[1],
          obstacle.position[2] + speed * 0.1
        ]
      })).filter(obstacle => obstacle.position[2] < despawnDistance);
    });
    
    // Move existing coins
    setCoins(prevCoins => {
      return prevCoins.map(coin => ({
        ...coin,
        position: [
          coin.position[0],
          coin.position[1],
          coin.position[2] + speed * 0.1
        ]
      })).filter(coin => coin.position[2] < despawnDistance);
    });
    
    // Spawn new obstacles if needed
    if (Math.random() < 0.01) {
      const x = Math.random() * 8 - 4;
      setObstacles(prevObstacles => [
        ...prevObstacles,
        {
          id: `obstacle-${Date.now()}`,
          position: [x, 0, spawnDistance],
          scale: [1, 1, 1],
          rotation: [0, Math.random() * Math.PI, 0]
        }
      ]);
    }
    
    // Spawn new coins if needed
    if (Math.random() < 0.05) {
      const x = Math.random() * 8 - 4;
      setCoins(prevCoins => [
        ...prevCoins,
        {
          id: `coin-${Date.now()}`,
          position: [x, 1, spawnDistance]
        }
      ]);
    }
  });
  
  return (
    <>
      {obstacles.map(obstacle => (
        <Obstacle
          key={obstacle.id}
          position={obstacle.position}
          scale={obstacle.scale}
          rotation={obstacle.rotation}
          onCollide={onObstacleHit}
        />
      ))}
      
      {coins.map(coin => (
        <Coin
          key={coin.id}
          position={coin.position}
          onCollect={() => onCoinCollect(coin.id)}
        />
      ))}
    </>
  );
}

// HUD for displaying game info
function GameHUD({ stats }: { stats: GameStats }) {
  return (
    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between bg-black/50 text-white font-bold">
      <div>Score: {stats.score.toLocaleString()}</div>
      <div>Level: {stats.level}</div>
      <div>Coins: {stats.coins}</div>
      <div>Lives: {stats.lives}</div>
      <div>Time: {Math.floor(stats.timeElapsed)}s</div>
    </div>
  );
}

// Game controls component
function GameControls({ children }: { children: React.ReactNode }) {
  const controls = [
    { name: 'forward', keys: ['KeyW', 'ArrowUp'] },
    { name: 'backward', keys: ['KeyS', 'ArrowDown'] },
    { name: 'left', keys: ['KeyA', 'ArrowLeft'] },
    { name: 'right', keys: ['KeyD', 'ArrowRight'] },
    { name: 'jump', keys: ['Space'] },
  ];

  return (
    <React.Fragment>
      {children}
    </React.Fragment>
  );
}

// The main game component
function Game({ onGameOver, onUpdateScore }: { 
  onGameOver: (score: number) => void,
  onUpdateScore: (score: number) => void
}) {
  const [gameState, setGameState] = useState<GameState>(GameState.READY);
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    distance: 0,
    coins: 0,
    level: 1,
    lives: 3,
    timeElapsed: 0
  });
  
  const playerRef = useRef<THREE.Group>(null);
  const gameSpeed = useRef(0.5);
  
  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && gameState === GameState.READY) {
        setGameState(GameState.PLAYING);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState]);
  
  // Increase game speed over time
  useFrame((state, delta) => {
    if (gameState === GameState.PLAYING) {
      // Update timer
      setStats(prev => ({
        ...prev,
        timeElapsed: prev.timeElapsed + delta
      }));
      
      // Increase score based on distance
      setStats(prev => ({
        ...prev,
        score: prev.score + Math.floor(delta * 10 * gameSpeed.current),
        distance: prev.distance + delta * gameSpeed.current
      }));
      
      // Update the score in parent component
      onUpdateScore(stats.score);
      
      // Increase speed gradually
      gameSpeed.current = Math.min(2, 0.5 + stats.timeElapsed / 100);
      
      // Level up every 30 seconds
      if (Math.floor(stats.timeElapsed / 30) + 1 > stats.level) {
        setStats(prev => ({
          ...prev,
          level: Math.floor(prev.timeElapsed / 30) + 1
        }));
      }
    }
  });
  
  // Handle coin collection
  const handleCoinCollect = (coinId: string) => {
    setStats(prev => ({
      ...prev,
      coins: prev.coins + 1,
      score: prev.score + 100
    }));
  };
  
  // Handle obstacle collision
  const handleObstacleHit = () => {
    setStats(prev => {
      const newLives = prev.lives - 1;
      if (newLives <= 0) {
        setGameState(GameState.GAME_OVER);
        onGameOver(prev.score);
      }
      return {
        ...prev,
        lives: newLives
      };
    });
  };
  
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1} 
        castShadow 
        shadow-mapSize-width={2048} 
        shadow-mapSize-height={2048} 
      />
      
      <PerspectiveCamera makeDefault position={[0, 5, 10]} />
      
      {playerRef.current && <FollowCamera playerRef={playerRef} />}
      
      <Physics>
        <Ground />
        
        {gameState === GameState.PLAYING && (
          <>
            <Player onGameOver={handleObstacleHit} />
            
            <RunnerLevel 
              onCoinCollect={handleCoinCollect}
              onObstacleHit={handleObstacleHit}
              playerRef={playerRef}
              speed={gameSpeed.current}
            />
          </>
        )}
      </Physics>
      
      {gameState === GameState.READY && (
        <Text
          position={[0, 2, 0]}
          fontSize={1}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Press SPACE to start
        </Text>
      )}
      
      {gameState === GameState.GAME_OVER && (
        <Text
          position={[0, 2, 0]}
          fontSize={1}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Game Over
        </Text>
      )}
    </>
  );
}

// Leaderboard component
function Leaderboard({ gameId = 'trade-runner' }: { gameId?: string }) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/games/${gameId}/leaderboard`);
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard');
        }
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching leaderboard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, [gameId]);
  
  if (isLoading) {
    return <div className="text-center py-4">Loading leaderboard...</div>;
  }
  
  if (error) {
    return <div className="text-center py-4 text-red-500">Error: {error}</div>;
  }
  
  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <h3 className="text-xl font-bold mb-4 text-center">Leaderboard</h3>
      
      <div className="grid grid-cols-5 gap-2 font-bold mb-2 text-gray-400">
        <div>Rank</div>
        <div className="col-span-2">Player</div>
        <div>Score</div>
        <div>Level</div>
      </div>
      
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {leaderboard.map((entry, index) => (
          <div 
            key={entry.id} 
            className="grid grid-cols-5 gap-2 p-2 rounded bg-gray-800 hover:bg-gray-700"
          >
            <div className="font-mono">{index + 1}</div>
            <div className="col-span-2 truncate">{entry.username}</div>
            <div className="font-mono">{entry.score.toLocaleString()}</div>
            <div className="font-mono">{entry.level}</div>
          </div>
        ))}
        
        {leaderboard.length === 0 && (
          <div className="text-center py-4 text-gray-400">No scores yet. Be the first!</div>
        )}
      </div>
    </div>
  );
}

// Main TradeRunner component
export default function TradeRunner() {
  const [gameActive, setGameActive] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    distance: 0,
    coins: 0,
    level: 1,
    lives: 3,
    timeElapsed: 0
  });
  const [showControls, setShowControls] = useState(false);
  
  const isMobile = useIsMobile();
  
  // Map of keys for keyboard controls
  const keyMap = [
    { name: 'forward', keys: ['KeyW', 'ArrowUp'] },
    { name: 'backward', keys: ['KeyS', 'ArrowDown'] },
    { name: 'left', keys: ['KeyA', 'ArrowLeft'] },
    { name: 'right', keys: ['KeyD', 'ArrowRight'] },
    { name: 'jump', keys: ['Space'] },
  ];
  
  const handleGameOver = (score: number) => {
    setGameActive(false);
    if (score > highScore) {
      setHighScore(score);
      // Submit score to server
      fetch('/api/games/trade-runner/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          score,
          level: gameStats.level,
          completionTime: Math.floor(gameStats.timeElapsed)
        })
      })
        .then(res => res.json())
        .catch(err => console.error('Error submitting score:', err));
    }
  };
  
  const handleUpdateScore = (score: number) => {
    setCurrentScore(score);
    setGameStats(prev => ({
      ...prev,
      score
    }));
  };
  
  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-4 bg-gray-900">
        <h2 className="text-2xl font-bold mb-2">Trade Runner</h2>
        <p className="text-gray-400 mb-4">
          Run through the financial markets, collect coins and avoid obstacles. Use the arrow keys to move and space to jump.
        </p>
        
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div>
            <span className="font-bold">Current Score:</span> {currentScore.toLocaleString()}
          </div>
          <div>
            <span className="font-bold">High Score:</span> {highScore.toLocaleString()}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setGameActive(!gameActive)}
              variant={gameActive ? "destructive" : "default"}
            >
              {gameActive ? "End Game" : "Start Game"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowControls(!showControls)}
            >
              {showControls ? "Hide Controls" : "Show Controls"}
            </Button>
          </div>
        </div>
        
        {showControls && (
          <div className="mt-4 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-lg font-bold mb-2">Controls</h3>
            <ul className="grid grid-cols-2 gap-2">
              <li><span className="font-bold">Move Left:</span> Left Arrow / A</li>
              <li><span className="font-bold">Move Right:</span> Right Arrow / D</li>
              <li><span className="font-bold">Jump:</span> Space</li>
            </ul>
          </div>
        )}
      </div>
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 bg-gray-800">
        <div className="lg:col-span-3 relative rounded-lg overflow-hidden bg-black">
          {gameActive && <GameHUD stats={gameStats} />}
          
          <Suspense fallback={<div className="text-center py-10">Loading game...</div>}>
            <KeyboardControls map={keyMap}>
              <Canvas shadows className="w-full h-full">
                <Game
                  onGameOver={handleGameOver}
                  onUpdateScore={handleUpdateScore}
                />
              </Canvas>
            </KeyboardControls>
          </Suspense>
          
          {!gameActive && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/80 p-6 rounded-lg text-center">
                <h3 className="text-xl font-bold mb-2">Trade Runner</h3>
                <p className="mb-4">Click "Start Game" to begin</p>
                <Button onClick={() => setGameActive(true)}>Start Game</Button>
              </div>
            </div>
          )}
        </div>
        
        <div className="lg:col-span-1">
          <Tabs defaultValue="leaderboard">
            <TabsList className="w-full">
              <TabsTrigger value="leaderboard" className="flex-1">Leaderboard</TabsTrigger>
              <TabsTrigger value="rewards" className="flex-1">Rewards</TabsTrigger>
            </TabsList>
            
            <TabsContent value="leaderboard" className="mt-4">
              <Leaderboard gameId="trade-runner" />
            </TabsContent>
            
            <TabsContent value="rewards" className="mt-4 bg-gray-900 rounded-lg p-4">
              <h3 className="text-xl font-bold mb-4 text-center">Rewards</h3>
              <div className="space-y-4">
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="font-bold">1,000 points</div>
                  <div className="text-gray-400">10 THC Tokens</div>
                </div>
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="font-bold">5,000 points</div>
                  <div className="text-gray-400">50 THC Tokens</div>
                </div>
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="font-bold">10,000 points</div>
                  <div className="text-gray-400">100 THC Tokens</div>
                </div>
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="font-bold">Top Weekly Player</div>
                  <div className="text-gray-400">500 THC Tokens</div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}