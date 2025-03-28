import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../components/ui/button';

interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  dy: number;
  grounded: boolean;
  frame: number;
  frameCount: number;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  isTop: boolean;
}

interface Coin {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface LeaderboardEntry {
  name: string;
  score: number;
}

const BullsVsBears: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameActive, setGameActive] = useState(false);
  const [score, setScore] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showGameOver, setShowGameOver] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [playerName, setPlayerName] = useState('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
    { name: 'TraderPro', score: 620 },
    { name: 'MarketMaster', score: 510 },
    { name: 'TradingQueen', score: 480 },
    { name: 'CryptoKing', score: 425 },
    { name: 'WallStreetWhiz', score: 350 },
  ]);

  // Game state - using refs to avoid rerenders during game loop
  const playerRef = useRef<Player | null>(null);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const coinsRef = useRef<Coin[]>([]);
  const gameSpeedRef = useRef(5);
  const scoreRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);
  const isJumpingRef = useRef(false);
  const jumpStartTimeRef = useRef(0);

  // Handle canvas resize
  useEffect(() => {
    function resizeCanvas() {
      if (canvasRef.current) {
        canvasRef.current.width = Math.min(window.innerWidth, 1200);
        canvasRef.current.height = Math.min(window.innerHeight - 100, 600);
      }
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Setup keyboard and touch controls
  useEffect(() => {
    function handleJumpStart(event: KeyboardEvent | TouchEvent) {
      if (!gameActive) return;
      
      if ((event.type === 'keydown' && (event as KeyboardEvent).code === 'Space') || 
          event.type === 'touchstart') {
        event.preventDefault();
        if (playerRef.current?.grounded) {
          isJumpingRef.current = true;
          jumpStartTimeRef.current = Date.now();
        }
      }
    }

    function handleJumpEnd(event: KeyboardEvent | TouchEvent) {
      if ((event.type === 'keyup' && (event as KeyboardEvent).code === 'Space') || 
          event.type === 'touchend') {
        event.preventDefault();
        isJumpingRef.current = false;
      }
    }

    document.addEventListener('keydown', handleJumpStart);
    document.addEventListener('keyup', handleJumpEnd);
    canvasRef.current?.addEventListener('touchstart', handleJumpStart);
    canvasRef.current?.addEventListener('touchend', handleJumpEnd);

    return () => {
      document.removeEventListener('keydown', handleJumpStart);
      document.removeEventListener('keyup', handleJumpEnd);
      canvasRef.current?.removeEventListener('touchstart', handleJumpStart);
      canvasRef.current?.removeEventListener('touchend', handleJumpEnd);
    };
  }, [gameActive]);

  // Initialize game
  const initGame = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    
    // Set initial game speed based on difficulty
    switch(difficulty) {
      case 'easy': gameSpeedRef.current = 5; break;
      case 'medium': gameSpeedRef.current = 7; break;
      case 'hard': gameSpeedRef.current = 9; break;
    }
    
    // Initialize player
    playerRef.current = {
      x: 50,
      y: canvas.height - 150,
      width: 40,
      height: 40,
      dy: 0,
      grounded: true,
      frame: 0,
      frameCount: 0
    };
    
    // Initialize empty arrays
    obstaclesRef.current = [];
    coinsRef.current = [];
    scoreRef.current = 0;
    setScore(0);
  };

  // Start game
  const startGame = () => {
    setShowWelcome(false);
    setShowGameOver(false);
    setGameActive(true);
    initGame();
    gameLoop();
  };

  // Game over
  const gameOver = () => {
    setGameActive(false);
    setShowGameOver(true);
    setScore(scoreRef.current);
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
    }
  };

  // Submit score to leaderboard
  const submitScore = () => {
    const name = playerName || 'Anonymous';
    const newLeaderboard = [...leaderboard, { name, score: scoreRef.current }]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    
    setLeaderboard(newLeaderboard);
    setPlayerName('');
  };

  // Check collision between objects
  const collision = (a: Player | Obstacle | Coin, b: Player | Obstacle | Coin) => {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  };

  // Main game loop
  const gameLoop = () => {
    if (!gameActive || !canvasRef.current || !playerRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Update
    updateGame();
    
    // Draw
    drawGame(ctx);
    
    // Continue the loop
    animFrameRef.current = requestAnimationFrame(gameLoop);
  };

  // Update game state
  const updateGame = () => {
    if (!canvasRef.current || !playerRef.current) return;
    
    const canvas = canvasRef.current;
    const player = playerRef.current;
    
    // Jump handling
    if (isJumpingRef.current) {
      const jumpDuration = Date.now() - jumpStartTimeRef.current;
      const maxJumpDuration = 500;
      const jumpForce = Math.min(jumpDuration / maxJumpDuration, 1) * -15;
      player.dy = jumpForce;
    }
    
    // Apply gravity
    player.dy += 0.6;
    player.y += player.dy;
    player.grounded = false;
    
    // Ground collision
    if (player.y + player.height > canvas.height - 50) {
      player.y = canvas.height - player.height - 50;
      player.dy = 0;
      player.grounded = true;
    }
    
    // Update obstacles
    obstaclesRef.current.forEach((obstacle, index) => {
      obstacle.x -= gameSpeedRef.current;
      
      // Remove if off screen
      if (obstacle.x + obstacle.width < 0) {
        obstaclesRef.current.splice(index, 1);
      }
      
      // Check collision with player
      if (collision(player, obstacle)) {
        gameOver();
      }
    });
    
    // Update coins
    coinsRef.current.forEach((coin, index) => {
      coin.x -= gameSpeedRef.current;
      
      // Remove if off screen
      if (coin.x + coin.width < 0) {
        coinsRef.current.splice(index, 1);
      }
      
      // Check collision with player
      if (collision(player, coin)) {
        scoreRef.current += 10;
        setScore(scoreRef.current);
        coinsRef.current.splice(index, 1);
      }
    });
    
    // Spawn obstacles randomly
    if (Math.random() < 0.02) {
      const isTop = Math.random() < 0.5;
      obstaclesRef.current.push({
        x: canvas.width,
        y: isTop ? 0 : canvas.height - 100,
        width: 40,
        height: Math.random() * 30 + 30,
        isTop
      });
    }
    
    // Spawn coins randomly
    if (Math.random() < 0.03) {
      coinsRef.current.push({
        x: canvas.width,
        y: Math.random() * (canvas.height - 200) + 50,
        width: 20,
        height: 20
      });
    }
    
    // Increase game speed gradually
    gameSpeedRef.current += 0.001;
    
    // Update player animation
    if (player.grounded) {
      player.frameCount++;
      if (player.frameCount > 5) {
        player.frame = (player.frame + 1) % 4;
        player.frameCount = 0;
      }
    }
  };

  // Draw the game
  const drawGame = (ctx: CanvasRenderingContext2D) => {
    if (!canvasRef.current || !playerRef.current) return;
    
    const canvas = canvasRef.current;
    const player = playerRef.current;
    
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid background
    ctx.strokeStyle = '#113355';
    ctx.lineWidth = 1;
    const gridSize = 50;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Draw player
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Draw player legs with animation
    const legOffset = [0, 5, 0, -5][player.frame];
    ctx.fillRect(player.x + 5, player.y + player.height, 10, 10 + legOffset);
    ctx.fillRect(player.x + player.width - 15, player.y + player.height, 10, 10 - legOffset);
    
    // Draw obstacles (order blocks)
    obstaclesRef.current.forEach(obstacle => {
      ctx.fillStyle = obstacle.isTop ? '#ff3300' : '#ff0033';
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      
      // Add gradient effect
      const gradient = ctx.createLinearGradient(
        obstacle.x, obstacle.y,
        obstacle.x + obstacle.width, obstacle.y + obstacle.height
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
      ctx.fillStyle = gradient;
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
    
    // Draw coins (profits)
    coinsRef.current.forEach(coin => {
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(coin.x + coin.width/2, coin.y + coin.height/2, coin.width/2, 0, Math.PI * 2);
      ctx.fill();
      
      // Add shine effect
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(coin.x + coin.width/3, coin.y + coin.height/3, coin.width/6, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Draw ground
    const groundGradient = ctx.createLinearGradient(0, canvas.height - 50, 0, canvas.height);
    groundGradient.addColorStop(0, '#113355');
    groundGradient.addColorStop(1, '#001133');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
    
    // Draw score
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Profits: ' + scoreRef.current, 20, 40);
  };

  return (
    <div className="flex justify-center items-center flex-col py-4 relative min-h-screen">
      <canvas 
        ref={canvasRef}
        className="bg-gradient-to-b from-slate-900 to-black border-2 border-cyan-500"
      ></canvas>
      
      {/* Welcome Screen */}
      {showWelcome && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-900/95 p-6 border-2 border-fuchsia-500 rounded-lg text-center w-11/12 max-w-md">
          <h1 className="text-3xl font-bold mb-2 text-cyan-500">Bulls vs Bears Runner</h1>
          <p className="text-gray-300 mb-4">Navigate the markets, avoid order blocks, collect profits!</p>
          
          <div className="bg-slate-800 rounded-lg p-4 mb-4 text-left">
            <p className="font-semibold mb-2 text-cyan-400">Instructions:</p>
            <ul className="space-y-1 text-gray-300 list-disc pl-5">
              <li>SPACEBAR or TAP to jump</li>
              <li>Hold longer to jump higher</li>
              <li>Avoid red order blocks</li>
              <li>Collect golden profits</li>
              <li>Trade your way to the top!</li>
            </ul>
          </div>
          
          <select 
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
            className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 mb-4 text-white"
          >
            <option value="easy">New Trader</option>
            <option value="medium">Advanced Trader</option>
            <option value="hard">Expert Trader</option>
          </select>
          
          <Button
            onClick={startGame}
            className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 transition-transform hover:scale-105"
          >
            Start Trading
          </Button>
        </div>
      )}
      
      {/* Game Over Screen */}
      {showGameOver && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-900/95 p-6 border-2 border-fuchsia-500 rounded-lg text-center w-11/12 max-w-md">
          <h2 className="text-2xl font-bold mb-2 text-red-500">Trading Session Over!</h2>
          <p className="text-xl mb-4">Total Profits: <span className="text-green-500">{score}</span></p>
          
          <input
            type="text"
            placeholder="Enter your trader name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 mb-4 text-white"
          />
          
          <div className="flex gap-2 mb-4">
            <Button
              onClick={submitScore}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Submit Score
            </Button>
            
            <Button
              onClick={() => {
                setShowGameOver(false);
                setShowWelcome(true);
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              New Session
            </Button>
          </div>
        </div>
      )}
      
      {/* Leaderboard */}
      <div className="absolute top-4 right-4 bg-slate-900/80 p-4 border border-cyan-500 rounded-lg max-w-xs z-10">
        <h3 className="text-lg font-bold mb-2 text-center text-cyan-400">Top Traders</h3>
        <ol className="space-y-1">
          {leaderboard.slice(0, 5).map((entry, index) => (
            <li key={index} className="flex justify-between">
              <span className="text-gray-300">{index + 1}. {entry.name}</span>
              <span className="text-green-500">${entry.score}</span>
            </li>
          ))}
        </ol>
      </div>
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm text-fuchsia-500">
        Powered by Trade Hybrid
      </div>
    </div>
  );
};

export default BullsVsBears;