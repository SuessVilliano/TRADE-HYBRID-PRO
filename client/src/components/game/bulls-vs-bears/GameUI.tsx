import React, { useState, useEffect } from 'react';
import { useGameStore } from './gameStore';
import { usePriceStore } from './priceStore';

// Game UI overlay component
export function GameUI() {
  const { 
    isGameStarted, 
    isGamePaused, 
    isGameOver, 
    humanPlayer, 
    round, 
    timeRemaining, 
    totalTrades, 
    winningTrades, 
    initializeGame, 
    startGame, 
    pauseGame, 
    resumeGame, 
    resetGame, 
    placeTrade 
  } = useGameStore();
  
  const { marketTrend, currentPrice } = usePriceStore();
  
  // Game settings
  const [showSettings, setShowSettings] = useState(!isGameStarted);
  const [playerName, setPlayerName] = useState('Trader');
  const [playerType, setPlayerType] = useState<'bull' | 'bear'>('bull');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [aiCount, setAiCount] = useState(5);
  
  // Game timer formatting
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle game start
  const handleStartGame = () => {
    initializeGame({
      mode: 'single_player',
      difficulty,
      playerName,
      playerType,
      aiCount
    });
    startGame();
    setShowSettings(false);
  };
  
  // Handle game reset
  const handleResetGame = () => {
    resetGame();
    setShowSettings(true);
  };
  
  // Game settings UI
  const GameSettings = () => (
    <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-80 z-20">
      <div className="bg-slate-800 p-6 rounded-lg max-w-md text-white">
        <h2 className="text-2xl font-bold mb-4 text-center">Bulls vs Bears Game</h2>
        
        <div className="mb-4">
          <label className="block mb-1">Your Name</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full p-2 bg-slate-700 rounded"
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-1">Character Type</label>
          <div className="flex gap-3 mb-2">
            <button
              className={`flex-1 py-2 px-3 rounded-lg ${playerType === 'bull' ? 'bg-green-600' : 'bg-slate-600'}`}
              onClick={() => setPlayerType('bull')}
            >
              Bull (Buy)
            </button>
            <button
              className={`flex-1 py-2 px-3 rounded-lg ${playerType === 'bear' ? 'bg-red-600' : 'bg-slate-600'}`}
              onClick={() => setPlayerType('bear')}
            >
              Bear (Sell)
            </button>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block mb-1">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as any)}
            className="w-full p-2 bg-slate-700 rounded"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block mb-1">AI Traders: {aiCount}</label>
          <input
            type="range"
            min="1"
            max="10"
            value={aiCount}
            onChange={(e) => setAiCount(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        
        <button
          onClick={handleStartGame}
          className="w-full bg-blue-600 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
        >
          Start Game
        </button>
      </div>
    </div>
  );
  
  // Game controls UI
  const GameControls = () => (
    <div className="absolute bottom-0 left-0 right-0 bg-slate-900 bg-opacity-80 p-3 flex flex-col md:flex-row justify-between items-center">
      <div className="flex gap-2 mb-2 md:mb-0">
        <button
          onClick={() => placeTrade('buy')}
          className="bg-green-600 py-2 px-4 rounded-lg font-bold hover:bg-green-700 transition-colors text-white"
          disabled={isGamePaused || isGameOver}
        >
          Buy
        </button>
        <button
          onClick={() => placeTrade('sell')}
          className="bg-red-600 py-2 px-4 rounded-lg font-bold hover:bg-red-700 transition-colors text-white"
          disabled={isGamePaused || isGameOver}
        >
          Sell
        </button>
        <button
          onClick={() => placeTrade('neutral')}
          className="bg-gray-600 py-2 px-4 rounded-lg font-bold hover:bg-gray-700 transition-colors text-white"
          disabled={isGamePaused || isGameOver}
        >
          Hold
        </button>
      </div>
      
      <div className="flex gap-2">
        {isGameStarted && !isGameOver && (
          <button
            onClick={isGamePaused ? resumeGame : pauseGame}
            className={`py-2 px-4 rounded-lg font-bold transition-colors text-white ${
              isGamePaused ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'
            }`}
          >
            {isGamePaused ? 'Resume' : 'Pause'}
          </button>
        )}
        
        <button
          onClick={handleResetGame}
          className="bg-red-600 py-2 px-4 rounded-lg font-bold hover:bg-red-700 transition-colors text-white"
        >
          Reset
        </button>
      </div>
    </div>
  );
  
  // Game statistics UI
  const GameStats = () => (
    <div className="absolute top-0 left-0 right-0 bg-slate-900 bg-opacity-80 p-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-white">
      <div>
        <h3 className="text-sm font-semibold">Round</h3>
        <div className="text-lg">{round} / 10</div>
        <div className="text-xs">Time: {formatTime(timeRemaining)}</div>
      </div>
      
      <div>
        <h3 className="text-sm font-semibold">Market</h3>
        <div className={`text-lg ${
          marketTrend === 'bullish' ? 'text-green-500' : 
          marketTrend === 'bearish' ? 'text-red-500' : 
          'text-gray-400'
        }`}>
          {marketTrend.toUpperCase()} (${currentPrice.toFixed(2)})
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-semibold">Balance</h3>
        <div className="text-lg">${humanPlayer?.balance.toFixed(2) || '0.00'}</div>
        <div className="text-xs">
          Win rate: {totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 100) : 0}%
        </div>
      </div>
    </div>
  );
  
  // Game over UI
  const GameOver = () => (
    <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-80 z-20">
      <div className="bg-slate-800 p-6 rounded-lg max-w-md text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Game Over</h2>
        
        <div className="mb-6">
          <p className="text-xl">Final Score: {humanPlayer?.score || 0}</p>
          <p className="text-md mt-2">Balance: ${humanPlayer?.balance.toFixed(2) || '0.00'}</p>
          <p className="text-sm mt-4">
            Win Rate: {totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 100) : 0}%
            ({winningTrades} / {totalTrades})
          </p>
        </div>
        
        <button
          onClick={handleResetGame}
          className="bg-blue-600 py-2 px-6 rounded-lg font-bold hover:bg-blue-700 transition-colors"
        >
          Play Again
        </button>
      </div>
    </div>
  );
  
  return (
    <>
      {/* Show game settings at start */}
      {showSettings && <GameSettings />}
      
      {/* Game stats when playing */}
      {isGameStarted && !showSettings && <GameStats />}
      
      {/* Game controls when playing */}
      {isGameStarted && !showSettings && <GameControls />}
      
      {/* Game over screen */}
      {isGameOver && <GameOver />}
    </>
  );
}