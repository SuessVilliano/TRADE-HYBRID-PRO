import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';

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

const TradeRunner: React.FC = () => {
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

  // Price data for chart background
  const priceDataRef = useRef<{x: number, y: number}[]>([]);
  const marketTrendRef = useRef<'up' | 'down' | 'sideways'>('up');
  const trendDurationRef = useRef(0);
  const maxTrendDuration = 100; // How long a trend lasts

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
    priceDataRef.current = [];
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
      animFrameRef.current = null;
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
    
    // Update obstacles - use reverse loop to avoid issues when removing elements
    for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
      const obstacle = obstaclesRef.current[i];
      obstacle.x -= gameSpeedRef.current;
      
      // Remove if off screen
      if (obstacle.x + obstacle.width < 0) {
        obstaclesRef.current.splice(i, 1);
        continue;
      }
      
      // Check collision with player
      if (collision(player, obstacle)) {
        gameOver();
        return;
      }
    }
    
    // Update coins - use reverse loop to avoid issues when removing elements
    for (let i = coinsRef.current.length - 1; i >= 0; i--) {
      const coin = coinsRef.current[i];
      coin.x -= gameSpeedRef.current;
      
      // Remove if off screen
      if (coin.x + coin.width < 0) {
        coinsRef.current.splice(i, 1);
        continue;
      }
      
      // Check collision with player
      if (collision(player, coin)) {
        scoreRef.current += 10;
        setScore(scoreRef.current);
        coinsRef.current.splice(i, 1);
      }
    }
    
    // Update market trend
    trendDurationRef.current++;
    if (trendDurationRef.current >= maxTrendDuration) {
      // Change market trend randomly
      const random = Math.random();
      if (random < 0.4) {
        marketTrendRef.current = 'up';
      } else if (random < 0.8) {
        marketTrendRef.current = 'down';
      } else {
        marketTrendRef.current = 'sideways';
      }
      trendDurationRef.current = 0;
    }
    
    // Update price data for the chart
    if (priceDataRef.current.length === 0) {
      // Initialize with a starting point
      priceDataRef.current.push({
        x: 0,
        y: canvas.height / 2
      });
    }
    
    // Add new price point
    const lastPoint = priceDataRef.current[priceDataRef.current.length - 1];
    let yChange = 0;
    
    // Determine price movement based on market trend
    switch (marketTrendRef.current) {
      case 'up':
        yChange = -Math.random() * 3 - 0.5; // Trend up (negative y is up)
        break;
      case 'down':
        yChange = Math.random() * 3 + 0.5; // Trend down
        break;
      case 'sideways':
        yChange = (Math.random() - 0.5) * 3; // Sideways
        break;
    }
    
    // Add some randomness to avoid straight lines
    yChange += (Math.random() - 0.5) * 2;
    
    // Keep price within canvas bounds
    const newY = Math.max(50, Math.min(canvas.height - 100, lastPoint.y + yChange));
    
    priceDataRef.current.push({
      x: lastPoint.x + 2,
      y: newY
    });
    
    // Remove old points if they're off screen
    if (priceDataRef.current.length > canvas.width / 2) {
      priceDataRef.current.shift();
    }
    
    // Shift all price points left (simulate chart movement)
    priceDataRef.current.forEach(point => {
      point.x -= 1;
    });
    
    // Spawn obstacles randomly, match with market trend
    if (Math.random() < 0.02) {
      // More obstacles at the bottom during uptrend and at the top during downtrend
      const isTop = marketTrendRef.current === 'down' ? Math.random() < 0.7 : Math.random() < 0.3;
      obstaclesRef.current.push({
        x: canvas.width,
        y: isTop ? 0 : canvas.height - 100,
        width: 40,
        height: Math.random() * 30 + 30,
        isTop
      });
    }
    
    // Spawn coins randomly, around the chart line
    if (Math.random() < 0.03) {
      const lastPriceY = priceDataRef.current[priceDataRef.current.length - 1].y;
      
      // Position coins near the price line for more interesting gameplay
      const coinY = lastPriceY + (Math.random() - 0.5) * 100;
      
      coinsRef.current.push({
        x: canvas.width,
        y: Math.max(50, Math.min(canvas.height - 100, coinY)),
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
    
    // Draw price chart
    if (priceDataRef.current.length > 1) {
      // Draw price line
      ctx.strokeStyle = marketTrendRef.current === 'up' ? '#00ff00' : 
                        marketTrendRef.current === 'down' ? '#ff0000' : 
                        '#ffff00';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(priceDataRef.current[0].x, priceDataRef.current[0].y);
      
      for (let i = 1; i < priceDataRef.current.length; i++) {
        ctx.lineTo(priceDataRef.current[i].x, priceDataRef.current[i].y);
      }
      ctx.stroke();
      
      // Fill area under the chart
      ctx.beginPath();
      ctx.moveTo(priceDataRef.current[0].x, canvas.height);
      for (let i = 0; i < priceDataRef.current.length; i++) {
        ctx.lineTo(priceDataRef.current[i].x, priceDataRef.current[i].y);
      }
      ctx.lineTo(priceDataRef.current[priceDataRef.current.length - 1].x, canvas.height);
      ctx.closePath();
      
      // Fill with gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, marketTrendRef.current === 'up' ? 'rgba(0, 255, 0, 0.2)' :
                              marketTrendRef.current === 'down' ? 'rgba(255, 0, 0, 0.2)' :
                              'rgba(255, 255, 0, 0.2)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Label market trend
      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = marketTrendRef.current === 'up' ? '#00ff00' : 
                     marketTrendRef.current === 'down' ? '#ff0000' : 
                     '#ffff00';
      const trendText = marketTrendRef.current === 'up' ? 'BULLISH' : 
                       marketTrendRef.current === 'down' ? 'BEARISH' : 
                       'RANGING';
      ctx.fillText(trendText, canvas.width - 100, 30);
    }
    
    // Draw player
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Draw player eyes - add detail
    ctx.fillStyle = '#000';
    ctx.fillRect(player.x + player.width - 15, player.y + 10, 5, 5);
    
    // Draw player legs with animation
    const legOffset = [0, 5, 0, -5][player.frame];
    ctx.fillStyle = '#00ff88';
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
      
      // Label the obstacles
      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      const text = obstacle.isTop ? 'SELL' : 'BUY';
      const textWidth = ctx.measureText(text).width;
      ctx.fillText(text, obstacle.x + (obstacle.width - textWidth) / 2, obstacle.y + obstacle.height / 2 + 4);
    });
    
    // Draw coins (profits)
    coinsRef.current.forEach(coin => {
      // Glow effect
      ctx.shadowColor = '#ffff00';
      ctx.shadowBlur = 10;
      
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(coin.x + coin.width/2, coin.y + coin.height/2, coin.width/2, 0, Math.PI * 2);
      ctx.fill();
      
      // Add shine effect
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(coin.x + coin.width/3, coin.y + coin.height/3, coin.width/6, 0, Math.PI * 2);
      ctx.fill();
      
      // Reset shadow
      ctx.shadowBlur = 0;
    });
    
    // Draw ground
    const groundGradient = ctx.createLinearGradient(0, canvas.height - 50, 0, canvas.height);
    groundGradient.addColorStop(0, '#113355');
    groundGradient.addColorStop(1, '#001133');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
    
    // Draw score with shadow
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 5;
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Profits: $' + scoreRef.current, 20, 40);
    ctx.shadowBlur = 0;
    
    // Draw explanatory text for market trend
    ctx.font = '14px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Market Trend:', canvas.width - 100, 50);
    
    // Draw game instructions
    if (scoreRef.current < 50) { // Only show for beginners
      ctx.font = '14px Arial';
      ctx.fillStyle = '#cccccc';
      ctx.fillText('Press SPACE to jump', 20, 70);
      ctx.fillText('Collect coins, avoid obstacles', 20, 90);
    }
  };

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

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
            <option value="medium">Experienced Trader</option>
            <option value="hard">Pro Trader</option>
          </select>
          
          <Button
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
            onClick={startGame}
          >
            Start Trading
          </Button>
        </div>
      )}
      
      {/* Game Over Screen */}
      {showGameOver && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-900/95 p-6 border-2 border-red-500 rounded-lg text-center w-11/12 max-w-md">
          <h1 className="text-3xl font-bold mb-2 text-red-500">Trade Liquidated!</h1>
          <p className="text-gray-300 mb-4">Your final profit: ${score}</p>
          
          <div className="mb-4">
            <p className="text-gray-300 mb-2">Enter your name for the leaderboard:</p>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Trader Name"
              className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 mb-2 text-white"
            />
            <Button
              variant="outline"
              className="w-full mb-4"
              onClick={submitScore}
            >
              Submit Score
            </Button>
          </div>
          
          <h2 className="text-xl font-semibold mb-2 text-cyan-500">Leaderboard</h2>
          <div className="bg-slate-800 rounded-lg p-3 mb-4">
            {leaderboard.slice(0, 5).map((entry, index) => (
              <div key={index} className="flex justify-between items-center py-1 border-b border-slate-700 last:border-0">
                <span className={`${index === 0 ? 'text-amber-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-amber-700' : 'text-gray-400'}`}>
                  {index + 1}. {entry.name}
                </span>
                <span className="font-mono">${entry.score}</span>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowGameOver(false);
                setShowWelcome(true);
              }}
            >
              Main Menu
            </Button>
            <Button
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
              onClick={startGame}
            >
              Trade Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TradeRunner;