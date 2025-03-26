import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { useGuest } from '@/lib/stores/useGuest';

interface TradeRunnerProps {
  className?: string;
}

export function TradeRunner({ className }: TradeRunnerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameActive, setGameActive] = useState(false);
  const [score, setScore] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showGameOver, setShowGameOver] = useState(false);
  const [difficulty, setDifficulty] = useState('easy');
  const [leaderboard, setLeaderboard] = useState<{name: string, score: number}[]>([]);
  
  // Get guest username for leaderboard
  const { guestUsername } = useGuest();
  
  // Game variables stored in refs to persist between renders
  const gameRef = useRef({
    player: null as any,
    obstacles: [] as any[],
    coins: [] as any[],
    gameSpeed: 5,
    isJumping: false,
    jumpStartTime: 0,
    animationFrame: 0,
    requestId: 0
  });
  
  // Character class
  class Character {
    x: number;
    y: number;
    width: number;
    height: number;
    frame: number;
    frameCount: number;
    dy: number = 0;
    grounded: boolean = false;
    
    constructor(x: number, y: number, width: number, height: number) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.frame = 0;
      this.frameCount = 0;
    }
    
    draw(ctx: CanvasRenderingContext2D) {
      ctx.fillStyle = '#00ff88';
      // Body
      ctx.fillRect(this.x, this.y, this.width, this.height);
      
      // Running animation
      this.frameCount++;
      if (this.frameCount > 5) {
        this.frame = (this.frame + 1) % 4;
        this.frameCount = 0;
      }
      
      // Legs animation
      const legOffset = [0, 5, 0, -5][this.frame];
      ctx.fillRect(this.x + 5, this.y + this.height, 10, 10 + legOffset);
      ctx.fillRect(this.x + this.width - 15, this.y + this.height, 10, 10 - legOffset);
    }
  }
  
  // Initialize the game
  const initGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const game = gameRef.current;
    game.player = new Character(50, canvas.height - 150, 40, 40);
    game.obstacles = [];
    game.coins = [];
    
    switch(difficulty) {
      case 'easy': game.gameSpeed = 5; break;
      case 'medium': game.gameSpeed = 7; break;
      case 'hard': game.gameSpeed = 9; break;
    }
    
    setScore(0);
  };
  
  // Start the game
  const startGame = () => {
    setShowWelcome(false);
    setShowGameOver(false);
    setGameActive(true);
    initGame();
    gameLoop();
  };
  
  // Game loop
  const gameLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const game = gameRef.current;
    
    if (gameActive) {
      update();
      draw(ctx);
      game.requestId = requestAnimationFrame(gameLoop);
    }
  };
  
  // Update game state
  const update = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const game = gameRef.current;
    const player = game.player;
    
    if (game.isJumping) {
      const jumpDuration = Date.now() - game.jumpStartTime;
      const MAX_JUMP_DURATION = 500;
      const jumpForce = Math.min(jumpDuration / MAX_JUMP_DURATION, 1) * -15;
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
    game.obstacles.forEach((obstacle: any, index: number) => {
      obstacle.x -= game.gameSpeed;
      if (obstacle.x + obstacle.width < 0) {
        game.obstacles.splice(index, 1);
      }
      if (collision(player, obstacle)) {
        gameOver();
      }
    });
    
    // Update coins
    game.coins.forEach((coin: any, index: number) => {
      coin.x -= game.gameSpeed;
      if (coin.x + coin.width < 0) {
        game.coins.splice(index, 1);
      }
      if (collision(player, coin)) {
        setScore(prev => prev + 10);
        game.coins.splice(index, 1);
      }
    });
    
    // Spawn obstacles
    if (Math.random() < 0.02) {
      const isTop = Math.random() < 0.5;
      game.obstacles.push({
        x: canvas.width,
        y: isTop ? 0 : canvas.height - 100,
        width: 40,
        height: Math.random() * 30 + 30,
        isTop
      });
    }
    
    // Spawn coins
    if (Math.random() < 0.03) {
      game.coins.push({
        x: canvas.width,
        y: Math.random() * (canvas.height - 200) + 50,
        width: 20,
        height: 20
      });
    }
    
    game.gameSpeed += 0.001;
  };
  
  // Draw game elements
  const draw = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const game = gameRef.current;
    
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
    game.player.draw(ctx);
    
    // Draw obstacles (order blocks)
    game.obstacles.forEach((obstacle: any) => {
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
    ctx.fillStyle = '#ffd700';
    game.coins.forEach((coin: any) => {
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
    ctx.fillText('Profits: ' + score, 20, 40);
  };
  
  // Check collision between two objects
  const collision = (a: any, b: any) => {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  };
  
  // Game over
  const gameOver = () => {
    setGameActive(false);
    setShowGameOver(true);
    cancelAnimationFrame(gameRef.current.requestId);
  };
  
  // Submit score to leaderboard
  const submitScore = (playerName: string = '') => {
    const name = playerName || guestUsername || 'Anonymous';
    const newLeaderboard = [...leaderboard, {name, score}];
    newLeaderboard.sort((a, b) => b.score - a.score);
    setLeaderboard(newLeaderboard.slice(0, 5));
    setShowGameOver(false);
    setShowWelcome(true);
  };
  
  // Handle key events for jumping
  useEffect(() => {
    const handleJumpStart = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        const game = gameRef.current;
        if (game.player?.grounded && gameActive) {
          game.isJumping = true;
          game.jumpStartTime = Date.now();
        }
      }
    };
    
    const handleJumpEnd = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        gameRef.current.isJumping = false;
      }
    };
    
    window.addEventListener('keydown', handleJumpStart);
    window.addEventListener('keyup', handleJumpEnd);
    
    return () => {
      window.removeEventListener('keydown', handleJumpStart);
      window.removeEventListener('keyup', handleJumpEnd);
    };
  }, [gameActive]);
  
  // Handle touch events for mobile devices
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const handleTouchStart = (event: TouchEvent) => {
      event.preventDefault();
      const game = gameRef.current;
      if (game.player?.grounded && gameActive) {
        game.isJumping = true;
        game.jumpStartTime = Date.now();
      }
    };
    
    const handleTouchEnd = (event: TouchEvent) => {
      event.preventDefault();
      gameRef.current.isJumping = false;
    };
    
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gameActive]);
  
  // Resize canvas when component mounts
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = Math.min(canvas.clientWidth, 800);
        canvas.height = Math.min(canvas.clientHeight, 400);
      }
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(gameRef.current.requestId);
    };
  }, []);
  
  return (
    <Card className={`${className} overflow-hidden`}>
      <CardHeader className="p-4">
        <CardTitle className="text-center">Trade Runner</CardTitle>
      </CardHeader>
      <CardContent className="p-0 relative">
        <canvas 
          ref={canvasRef} 
          className="w-full h-[300px] block bg-gradient-to-b from-blue-950 to-black border-2 border-cyan-500" 
        />
        
        {showWelcome && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/95 p-4 border-2 border-fuchsia-500 rounded-md text-center w-4/5 max-w-[300px]">
            <h3 className="text-cyan-400 text-lg mb-2">Trade Runner</h3>
            <p className="text-cyan-400 text-sm mb-2">Navigate markets, collect profits!</p>
            <div className="text-left text-cyan-400 text-xs mb-3">
              <p>- SPACEBAR or TAP to jump</p>
              <p>- Hold longer to jump higher</p>
              <p>- Avoid red order blocks</p>
              <p>- Collect golden profits</p>
            </div>
            <select 
              className="w-full mb-3 p-2 bg-gray-900 text-cyan-400 border border-cyan-700 rounded"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="easy">New Runner</option>
              <option value="medium">Advanced Runner</option>
              <option value="hard">Expert Runner</option>
            </select>
            <Button onClick={startGame} className="w-full">Start Running</Button>
          </div>
        )}
        
        {showGameOver && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/95 p-4 border-2 border-fuchsia-500 rounded-md text-center w-4/5 max-w-[300px]">
            <h3 className="text-cyan-400 text-lg mb-2">Running Session Over!</h3>
            <p className="text-cyan-400 mb-3">Total Profits: <span className="font-bold">{score}</span></p>
            <Button onClick={() => submitScore()} className="w-full mb-2">Submit Score</Button>
            <Button onClick={() => {setShowGameOver(false); setShowWelcome(true);}} variant="outline" className="w-full">New Running Session</Button>
          </div>
        )}
        
        {/* Leaderboard */}
        <div className="absolute top-2 right-2 bg-black/80 p-2 border border-cyan-500 rounded-md max-w-[150px]">
          <h4 className="text-cyan-400 text-xs font-bold mb-1">Top Runners</h4>
          <ol className="text-cyan-400 text-xs">
            {leaderboard.length > 0 ? (
              leaderboard.map((entry, index) => (
                <li key={index} className="truncate">
                  {entry.name}: {entry.score}
                </li>
              ))
            ) : (
              <li className="text-gray-400">No records yet</li>
            )}
          </ol>
        </div>
        
        {/* Branding */}
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-fuchsia-500 text-xs">
          Powered by Trade Hybrid
        </div>
      </CardContent>
    </Card>
  );
}