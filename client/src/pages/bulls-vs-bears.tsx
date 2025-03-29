import React, { useEffect, useState, useRef } from 'react';
import { BullsVsBearsGame } from '../components/game/bulls-vs-bears-game';
import { MarketChart } from '../components/ui/market-chart';
import { useBullsVsBearsStore } from '../lib/stores/useBullsVsBearsStore';

export default function BullsVsBears() {
  const { 
    gameState, 
    highScores, 
    totalGamesPlayed, 
    winCount, 
    initializeGame, 
    startGame, 
    pauseGame, 
    resumeGame, 
    endGame, 
    resetGame,
    advanceRound,
    generateNextPrice 
  } = useBullsVsBearsStore();
  
  const [showGameSettings, setShowGameSettings] = useState(!gameState.isGameStarted);
  const [playerName, setPlayerName] = useState('Trader');
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const [selectedAsset, setSelectedAsset] = useState('BTC');
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('5m');
  const [aiPlayersCount, setAiPlayersCount] = useState(3);
  
  // Timer for price updates
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize the game on component mount if not already initialized
  useEffect(() => {
    if (!gameState.gameId) {
      console.log('Initializing Bulls vs Bears game...');
      initializeGame({
        gameMode: 'single_player',
        difficulty: 'medium',
        asset: 'BTC',
        timeFrame: '5m',
        playersCount: 3,
        playerName: 'Trader'
      });
    }
  }, [gameState.gameId, initializeGame]);
  
  // Game loop to update prices and advance rounds
  useEffect(() => {
    // Clear any existing timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Only start timer if game is started and not paused or finished
    if (gameState.isGameStarted && !gameState.isGamePaused && !gameState.isGameOver) {
      console.log('Starting price update interval...');
      
      // Update price every 2 seconds
      timerRef.current = setInterval(() => {
        console.log('Updating price...');
        
        // Call advanceRound to update game state
        advanceRound();
        
        // For immediate visual feedback, also generate a new price
        generateNextPrice();
      }, 2000);
    }
    
    // Cleanup interval on unmount or when game state changes
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [
    gameState.isGameStarted,
    gameState.isGamePaused, 
    gameState.isGameOver,
    advanceRound,
    generateNextPrice
  ]);

  // Handle game initialization with settings
  const handleStartGame = () => {
    console.log('Starting new game with settings:', {
      playerName,
      difficulty: selectedDifficulty,
      asset: selectedAsset,
      timeFrame: selectedTimeFrame,
      playersCount: aiPlayersCount
    });
    
    initializeGame({
      gameMode: 'single_player',
      difficulty: selectedDifficulty as any,
      asset: selectedAsset as any,
      timeFrame: selectedTimeFrame as any,
      playersCount: aiPlayersCount,
      playerName
    });
    
    startGame();
    setShowGameSettings(false);
  };

  // Handle pause/resume
  const toggleGamePause = () => {
    if (gameState.isGamePaused) {
      resumeGame();
    } else {
      pauseGame();
    }
  };

  // Handle reset
  const handleResetGame = () => {
    resetGame();
    setShowGameSettings(true);
  };

  // Game settings UI
  const GameSettings = () => (
    <div className="game-settings bg-slate-800 p-6 rounded-lg max-w-xl mx-auto my-8 text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">Bulls vs Bears Game Settings</h2>
      
      <div className="mb-4">
        <label className="block mb-2">Your Name</label>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="w-full p-2 bg-slate-700 rounded"
        />
      </div>
      
      <div className="mb-4">
        <label className="block mb-2">Difficulty</label>
        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="w-full p-2 bg-slate-700 rounded"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block mb-2">Trading Asset</label>
        <select
          value={selectedAsset}
          onChange={(e) => setSelectedAsset(e.target.value)}
          className="w-full p-2 bg-slate-700 rounded"
        >
          <option value="BTC">Bitcoin (BTC)</option>
          <option value="ETH">Ethereum (ETH)</option>
          <option value="SOL">Solana (SOL)</option>
          <option value="FUTURES_INDEX">Futures Index</option>
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block mb-2">Time Frame</label>
        <select
          value={selectedTimeFrame}
          onChange={(e) => setSelectedTimeFrame(e.target.value)}
          className="w-full p-2 bg-slate-700 rounded"
        >
          <option value="1m">1 Minute</option>
          <option value="5m">5 Minutes</option>
          <option value="15m">15 Minutes</option>
          <option value="1h">1 Hour</option>
          <option value="4h">4 Hours</option>
          <option value="1d">1 Day</option>
        </select>
      </div>
      
      <div className="mb-6">
        <label className="block mb-2">AI Players</label>
        <input
          type="range"
          min="1"
          max="5"
          value={aiPlayersCount}
          onChange={(e) => setAiPlayersCount(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="text-center">{aiPlayersCount} AI Players</div>
      </div>
      
      <button
        onClick={handleStartGame}
        className="w-full bg-green-600 py-3 px-6 rounded-lg font-bold hover:bg-green-700 transition-colors"
      >
        Start Game
      </button>
    </div>
  );

  // Game stats component
  const GameStats = () => (
    <div className="game-stats bg-slate-800 p-4 rounded-lg mb-4 text-white">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">{gameState.asset} Trading - Round {gameState.round}/{gameState.maxRounds}</h3>
          <p className="text-sm">Current Trend: <span className={
            gameState.currentTrend === 'bullish' ? 'text-green-500' : 
            gameState.currentTrend === 'bearish' ? 'text-red-500' : 
            gameState.currentTrend === 'volatile' ? 'text-orange-500' : 'text-gray-500'
          }>{gameState.currentTrend.toUpperCase()}</span></p>
        </div>
        
        <div className="text-right">
          <p className="text-sm">Time Left: {Math.floor(gameState.timeLeft / 60)}:{(gameState.timeLeft % 60).toString().padStart(2, '0')}</p>
          <p className="text-sm">Volatility: {gameState.marketVolatility}%</p>
        </div>
      </div>
    </div>
  );

  // Game controls
  const GameControls = () => (
    <div className="game-controls flex justify-center gap-4 my-4">
      <button
        onClick={toggleGamePause}
        className={`py-2 px-6 rounded-lg font-bold transition-colors ${
          gameState.isGamePaused ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-600 hover:bg-amber-700'
        }`}
      >
        {gameState.isGamePaused ? 'Resume Game' : 'Pause Game'}
      </button>
      
      <button
        onClick={handleResetGame}
        className="bg-red-600 py-2 px-6 rounded-lg font-bold hover:bg-red-700 transition-colors"
      >
        Reset Game
      </button>
    </div>
  );

  // Player ranking component
  const PlayerRanking = () => {
    const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);
    
    return (
      <div className="player-ranking bg-slate-800 p-4 rounded-lg text-white">
        <h3 className="text-xl font-bold mb-4">Player Rankings</h3>
        
        <div className="overflow-hidden rounded-lg">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="p-2 text-left">Rank</th>
                <th className="p-2 text-left">Player</th>
                <th className="p-2 text-right">Balance</th>
                <th className="p-2 text-right">Open Positions</th>
                <th className="p-2 text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((player, index) => (
                <tr key={player.id} className={`${player.isAI ? '' : 'bg-blue-900'} border-t border-slate-700`}>
                  <td className="p-2">{index + 1}</td>
                  <td className="p-2 font-medium">{player.name} {!player.isAI && '(You)'}</td>
                  <td className="p-2 text-right">${player.balance.toFixed(2)}</td>
                  <td className="p-2 text-right">{player.openPositions.length}</td>
                  <td className="p-2 text-right">{player.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="bulls-vs-bears-page min-h-screen bg-slate-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Bulls vs Bears Trading Game</h1>
      
      {showGameSettings ? (
        <GameSettings />
      ) : (
        <div className="game-container">
          <GameStats />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <BullsVsBearsGame />
            </div>
            
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-xl font-bold mb-2">Market Chart</h3>
                <MarketChart width={400} height={300} />
              </div>
              
              <PlayerRanking />
            </div>
          </div>
          
          <GameControls />
        </div>
      )}
    </div>
  );
}