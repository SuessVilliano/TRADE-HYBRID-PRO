import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import { useBullsVsBearsStore } from '@/lib/stores/useBullsVsBearsStore';
import { Button } from '@/components/ui/button';
import { PopupContainer } from '@/components/ui/popup-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import * as THREE from 'three';
import { BullsVsBearsGame } from '@/components/game/bulls-vs-bears-game';
import { MarketChart } from '@/components/ui/market-chart';

export default function BullsVsBears() {
  const gameState = useBullsVsBearsStore(state => state.gameState);
  const initializeGame = useBullsVsBearsStore(state => state.initializeGame);
  const startGame = useBullsVsBearsStore(state => state.startGame);
  const pauseGame = useBullsVsBearsStore(state => state.pauseGame);
  const resumeGame = useBullsVsBearsStore(state => state.resumeGame);
  const endGame = useBullsVsBearsStore(state => state.endGame);
  const resetGame = useBullsVsBearsStore(state => state.resetGame);
  const advanceRound = useBullsVsBearsStore(state => state.advanceRound);
  const getCurrentPlayer = useBullsVsBearsStore(state => state.getCurrentPlayer);
  
  const [showSetup, setShowSetup] = useState(true);
  const [gameMode, setGameMode] = useState<'single_player' | 'multiplayer'>('single_player');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [asset, setAsset] = useState<'BTC' | 'ETH' | 'SOL' | 'FUTURES_INDEX'>('BTC');
  const [timeFrame, setTimeFrame] = useState<'1m' | '5m' | '15m' | '1h' | '4h' | '1d'>('5m');
  const [playerName, setPlayerName] = useState('Trader');
  const [playersCount, setPlayersCount] = useState(3);
  
  // Game timing
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Handle game timing
  useEffect(() => {
    if (gameState.isGameStarted && !gameState.isGamePaused && !gameState.isGameOver) {
      // Advance round every roundDuration seconds
      timerRef.current = setInterval(() => {
        advanceRound();
      }, 1000); // Run every second to update timer
      
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [gameState.isGameStarted, gameState.isGamePaused, gameState.isGameOver, advanceRound, gameState.timeLeft]);
  
  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Function to start new game
  const handleStartNewGame = () => {
    initializeGame({
      gameMode,
      difficulty,
      asset,
      timeFrame,
      playersCount,
      playerName,
    });
    
    setShowSetup(false);
    startGame();
  };
  
  // Handle pausing/resuming game
  const handlePauseResumeGame = () => {
    if (gameState.isGamePaused) {
      resumeGame();
    } else {
      pauseGame();
    }
  };
  
  // Handle ending game early
  const handleEndGame = () => {
    endGame();
  };
  
  // Handle starting a new game
  const handleResetGame = () => {
    resetGame();
    setShowSetup(true);
  };
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };
  
  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };
  
  // Get current player
  const currentPlayer = getCurrentPlayer();
  
  return (
    <div className="h-screen w-full relative overflow-hidden">
      {/* Game Setup Screen */}
      {showSetup && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <PopupContainer className="w-full max-w-2xl">
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-6 text-center">Bulls vs Bears Trading Game</h1>
              
              <div className="space-y-6">
                <div>
                  <label className="block mb-2 font-medium">Trader Name</label>
                  <input 
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-medium">Game Mode</label>
                    <Select
                      value={gameMode}
                      onValueChange={(value) => setGameMode(value as 'single_player' | 'multiplayer')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select game mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single_player">Single Player</SelectItem>
                        <SelectItem value="multiplayer">Multiplayer (Coming Soon)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block mb-2 font-medium">Difficulty</label>
                    <Select
                      value={difficulty}
                      onValueChange={(value) => setDifficulty(value as 'easy' | 'medium' | 'hard')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy (10 rounds, bullish market)</SelectItem>
                        <SelectItem value="medium">Medium (20 rounds, mixed market)</SelectItem>
                        <SelectItem value="hard">Hard (30 rounds, volatile market)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block mb-2 font-medium">Asset</label>
                    <Select
                      value={asset}
                      onValueChange={(value) => setAsset(value as 'BTC' | 'ETH' | 'SOL' | 'FUTURES_INDEX')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select asset" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                        <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                        <SelectItem value="SOL">Solana (SOL)</SelectItem>
                        <SelectItem value="FUTURES_INDEX">Futures Index</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block mb-2 font-medium">Time Frame</label>
                    <Select
                      value={timeFrame}
                      onValueChange={(value) => setTimeFrame(value as '1m' | '5m' | '15m' | '1h' | '4h' | '1d')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time frame" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1m">1 Minute</SelectItem>
                        <SelectItem value="5m">5 Minutes</SelectItem>
                        <SelectItem value="15m">15 Minutes</SelectItem>
                        <SelectItem value="1h">1 Hour</SelectItem>
                        <SelectItem value="4h">4 Hours</SelectItem>
                        <SelectItem value="1d">1 Day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block mb-2 font-medium">AI Opponents</label>
                    <Select
                      value={playersCount.toString()}
                      onValueChange={(value) => setPlayersCount(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select number of opponents" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">1 Opponent</SelectItem>
                        <SelectItem value="3">2 Opponents</SelectItem>
                        <SelectItem value="4">3 Opponents</SelectItem>
                        <SelectItem value="5">4 Opponents</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button className="w-full py-6" onClick={handleStartNewGame}>
                    Start Game
                  </Button>
                </div>
              </div>
            </div>
          </PopupContainer>
        </div>
      )}
      
      {/* Game UI */}
      <div className="flex flex-col h-full">
        {/* Game Header */}
        <PopupContainer className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">Bulls vs Bears</h1>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Round</span>
                <span className="bg-slate-800 px-2 py-1 rounded">{gameState.round} / {gameState.maxRounds}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Time</span>
                <span className="bg-slate-800 px-2 py-1 rounded">{gameState.timeLeft}s</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Asset</span>
                <span className="bg-slate-800 px-2 py-1 rounded">{gameState.asset}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Price</span>
                <span className="bg-slate-800 px-2 py-1 rounded">{formatCurrency(gameState.currentPrice)}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {gameState.isGameStarted && !gameState.isGameOver && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handlePauseResumeGame}
                >
                  {gameState.isGamePaused ? 'Resume' : 'Pause'}
                </Button>
              )}
              
              {gameState.isGameStarted && !gameState.isGameOver && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleEndGame}
                >
                  End Game
                </Button>
              )}
              
              {gameState.isGameOver && (
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={handleResetGame}
                >
                  New Game
                </Button>
              )}
            </div>
          </div>
        </PopupContainer>
        
        {/* Game Content */}
        <div className="flex-1 flex flex-col md:flex-row">
          {/* Game 3D View - Left Column */}
          <div className="md:w-2/3 h-full">
            <Canvas
              shadows
              gl={{ antialias: true }}
              camera={{ position: [0, 5, 10], fov: 50 }}
            >
              <ambientLight intensity={0.5} />
              <directionalLight
                position={[5, 10, 5]}
                intensity={1}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
              />
              
              <BullsVsBearsGame />
              
              <OrbitControls 
                enableZoom={true} 
                enablePan={true} 
                enableRotate={true}
                minPolarAngle={Math.PI / 6}
                maxPolarAngle={Math.PI / 2}
              />
            </Canvas>
          </div>
          
          {/* Game Controls - Right Column */}
          <div className="md:w-1/3 bg-slate-900 p-4 overflow-y-auto">
            <Tabs defaultValue="market" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="market">Market</TabsTrigger>
                <TabsTrigger value="trade">Trade</TabsTrigger>
                <TabsTrigger value="positions">Positions</TabsTrigger>
                <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              </TabsList>
              
              <TabsContent value="market">
                <div className="space-y-4">
                  <div className="h-64 bg-slate-800 rounded">
                    <MarketChart />
                  </div>
                  
                  <div className="bg-slate-800 p-4 rounded">
                    <h3 className="font-semibold mb-2">Market Analysis</h3>
                    <p className="text-sm text-slate-300">
                      Current trend: <span className="font-medium">{gameState.currentTrend}</span>
                    </p>
                    <p className="text-sm text-slate-300">
                      Volatility: <span className="font-medium">{gameState.marketVolatility}%</span>
                    </p>
                    <p className="text-sm text-slate-300">
                      Time frame: <span className="font-medium">{gameState.timeFrame}</span>
                    </p>
                  </div>
                  
                  <div className="bg-slate-800 p-4 rounded">
                    <h3 className="font-semibold mb-2">Recent Price Action</h3>
                    <div className="space-y-2">
                      {gameState.priceHistory.slice(-5).map((price, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{new Date(price.time).toLocaleTimeString()}</span>
                          <span className={price.close > price.open ? 'text-green-400' : 'text-red-400'}>
                            {formatCurrency(price.close)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="trade">
                <div className="space-y-4">
                  <div className="bg-slate-800 p-4 rounded">
                    <h3 className="font-semibold mb-2">Trader Account</h3>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">Balance</span>
                      <span className="font-semibold">{formatCurrency(currentPlayer?.balance || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">P&L</span>
                      <span className={`font-semibold ${
                        (currentPlayer?.balance || 0) > (currentPlayer?.initialBalance || 0) 
                          ? 'text-green-400' 
                          : (currentPlayer?.balance || 0) < (currentPlayer?.initialBalance || 0)
                            ? 'text-red-400'
                            : 'text-slate-400'
                      }`}>
                        {formatPercentage(
                          ((currentPlayer?.balance || 0) / (currentPlayer?.initialBalance || 1) - 1) * 100
                        )}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-slate-800 p-4 rounded">
                    <h3 className="font-semibold mb-4">New Position</h3>
                    <p className="text-sm text-slate-300 mb-4">
                      Place new orders using the 3D game interface. Click on the trading platform in the 3D world to interact with it.
                    </p>
                    <Button className="w-full" variant="outline">
                      Open Trading Interface
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="positions">
                <div className="space-y-4">
                  <div className="bg-slate-800 p-4 rounded">
                    <h3 className="font-semibold mb-2">Open Positions</h3>
                    {currentPlayer?.openPositions && currentPlayer.openPositions.length > 0 ? (
                      <div className="space-y-3">
                        {currentPlayer.openPositions.map((position) => {
                          const { pnl, pnlPercentage } = useBullsVsBearsStore.getState().calculatePnL(position);
                          return (
                            <div key={position.id} className="border border-slate-700 rounded p-3">
                              <div className="flex justify-between mb-1">
                                <span className={position.size > 0 ? 'text-green-400' : 'text-red-400'}>
                                  {position.size > 0 ? 'LONG' : 'SHORT'} {Math.abs(position.size).toFixed(4)} {gameState.asset}
                                </span>
                                <span className="text-sm">
                                  {position.leverage}x
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                                <div>
                                  <span className="text-slate-400">Entry: </span>
                                  <span>{formatCurrency(position.entryPrice)}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400">Current: </span>
                                  <span>{formatCurrency(gameState.currentPrice)}</span>
                                </div>
                                {position.stopLoss && (
                                  <div>
                                    <span className="text-slate-400">Stop Loss: </span>
                                    <span>{formatCurrency(position.stopLoss)}</span>
                                  </div>
                                )}
                                {position.takeProfit && (
                                  <div>
                                    <span className="text-slate-400">Take Profit: </span>
                                    <span>{formatCurrency(position.takeProfit)}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                                <span className={`font-semibold ${
                                  pnl >= 0 ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  {formatCurrency(pnl)} ({formatPercentage(pnlPercentage)})
                                </span>
                                <Button
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => useBullsVsBearsStore.getState().closePosition(position.id)}
                                >
                                  Close
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">No open positions</p>
                    )}
                  </div>
                  
                  <div className="bg-slate-800 p-4 rounded">
                    <h3 className="font-semibold mb-2">Closed Positions</h3>
                    {currentPlayer?.closedPositions && currentPlayer.closedPositions.length > 0 ? (
                      <div className="space-y-2">
                        {currentPlayer.closedPositions.slice(-5).map((position) => (
                          <div key={position.id} className="border border-slate-700 rounded p-2">
                            <div className="flex justify-between mb-1">
                              <span className={position.size > 0 ? 'text-green-400' : 'text-red-400'}>
                                {position.size > 0 ? 'LONG' : 'SHORT'} {Math.abs(position.size).toFixed(4)} {gameState.asset}
                              </span>
                              <span className={`text-sm ${
                                position.status === 'liquidated' ? 'text-red-500' : ''
                              }`}>
                                {position.status === 'liquidated' ? 'LIQUIDATED' : ''}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-400">
                                Entry: {formatCurrency(position.entryPrice)} → Exit: {formatCurrency(position.exitPrice || 0)}
                              </span>
                              <span className={`font-semibold ${
                                (position.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {formatCurrency(position.pnl || 0)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">No closed positions</p>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="leaderboard">
                <div className="space-y-4">
                  <div className="bg-slate-800 p-4 rounded">
                    <h3 className="font-semibold mb-2">Current Rankings</h3>
                    <div className="space-y-2">
                      {gameState.players
                        .slice()
                        .sort((a, b) => {
                          // Calculate scores based on balance
                          const scoreA = ((a.balance / a.initialBalance) - 1) * 100;
                          const scoreB = ((b.balance / b.initialBalance) - 1) * 100;
                          return scoreB - scoreA;
                        })
                        .map((player, index) => {
                          const score = ((player.balance / player.initialBalance) - 1) * 100;
                          return (
                            <div key={player.id} className="flex items-center justify-between p-2 bg-slate-700/40 rounded">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{index + 1}.</span>
                                <span>{player.name} {!player.isAI && '(You)'}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span>{formatCurrency(player.balance)}</span>
                                <span className={`${
                                  score >= 0 ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  {formatPercentage(score)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                  
                  {gameState.isGameOver && (
                    <div className="bg-slate-800 p-4 rounded">
                      <h3 className="font-semibold mb-2">Game Results</h3>
                      <div className="text-center py-4">
                        <div className="text-4xl mb-2">
                          {gameState.winner === currentPlayer?.id ? '🏆' : '📊'}
                        </div>
                        <h4 className="text-xl font-bold mb-1">
                          {gameState.winner === currentPlayer?.id ? 'You Win!' : 'Game Over'}
                        </h4>
                        <p className="text-slate-300">
                          {gameState.winner === currentPlayer?.id 
                            ? 'Congratulations! You outperformed the market and your opponents.'
                            : 'Better luck next time. Keep practicing your trading strategy!'}
                        </p>
                      </div>
                      
                      <Button 
                        className="w-full mt-4" 
                        onClick={handleResetGame}
                      >
                        Play Again
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}