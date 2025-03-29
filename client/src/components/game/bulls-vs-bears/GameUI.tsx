import React, { useState } from 'react';
import { useGameStore } from './gameStore';
import { usePriceStore } from './priceStore';
import { GameScore } from './GameScore';

// Trading UI Panel
interface TradingPanelProps {
  onTrade: (type: 'buy' | 'sell', amount: number) => void;
}

function TradingPanel({ onTrade }: TradingPanelProps) {
  const [amount, setAmount] = useState(1);
  const { currentPrice } = usePriceStore();
  const { player } = useGameStore();
  
  return (
    <div className="p-4 bg-gray-900 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-3">Trade THC Coins</h3>
      
      <div className="mb-3">
        <p className="text-sm text-gray-400">Current Price</p>
        <p className="text-xl font-bold text-white">{currentPrice.toFixed(2)} THC</p>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-400">Your Balance</p>
        <p className="text-lg font-semibold text-white">{player.balance.toFixed(2)} $</p>
        <p className="text-sm text-gray-400">THC Coins</p>
        <p className="text-lg font-semibold text-white">{player.inventory.coins}</p>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">Amount</label>
        <div className="flex items-center">
          <button
            className="px-2 py-1 bg-gray-700 text-white rounded-l"
            onClick={() => setAmount(prev => Math.max(1, prev - 1))}
          >
            -
          </button>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-16 px-2 py-1 text-center bg-gray-800 text-white border-0"
          />
          <button
            className="px-2 py-1 bg-gray-700 text-white rounded-r"
            onClick={() => setAmount(prev => prev + 1)}
          >
            +
          </button>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <button
          className="px-4 py-2 bg-green-600 text-white rounded-lg flex-1 hover:bg-green-700 transition-colors"
          onClick={() => onTrade('buy', amount)}
          disabled={player.balance < amount * currentPrice}
        >
          Buy
        </button>
        <button
          className="px-4 py-2 bg-red-600 text-white rounded-lg flex-1 hover:bg-red-700 transition-colors"
          onClick={() => onTrade('sell', amount)}
          disabled={player.inventory.coins < amount}
        >
          Sell
        </button>
      </div>
    </div>
  );
}

// Game events panel
function GameEventsPanel() {
  const { gameEvents } = usePriceStore();
  
  // Show only recent events
  const recentEvents = gameEvents.slice(-5).reverse();
  
  return (
    <div className="p-4 bg-gray-900 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-3">Market Events</h3>
      
      {recentEvents.length === 0 ? (
        <p className="text-gray-500 italic">No recent events</p>
      ) : (
        <ul className="space-y-2">
          {recentEvents.map((event) => (
            <li key={event.id} className="border-l-4 pl-3 py-1" style={{
              borderColor: event.impact > 0 ? '#4caf50' : '#f44336'
            }}>
              <p className="text-sm text-white">{event.message}</p>
              <p className="text-xs text-gray-400">
                {new Date(event.timestamp).toLocaleTimeString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Game menu/controls
interface GameMenuProps {
  onStartGame: (character: 'bull' | 'bear') => void;
  onEndGame: () => void;
}

function GameMenu({ onStartGame, onEndGame }: GameMenuProps) {
  const { gameActive, gameMode, player } = useGameStore();
  const [characterSelect, setCharacterSelect] = useState(false);
  
  if (!gameActive && !characterSelect) {
    return (
      <div className="p-6 bg-gray-900 rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Bulls vs Bears</h2>
        <p className="text-gray-300 mb-6">
          Trade your way to victory in this fast-paced market simulation game!
        </p>
        <button
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors mb-2 w-full"
          onClick={() => setCharacterSelect(true)}
        >
          Start Game
        </button>
      </div>
    );
  }
  
  if (!gameActive && characterSelect) {
    return (
      <div className="p-6 bg-gray-900 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-white mb-4">Choose Your Character</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <button
            className="p-4 bg-green-800 rounded-lg text-center hover:bg-green-700 transition-colors"
            onClick={() => onStartGame('bull')}
          >
            <div className="mb-2 flex justify-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">🐂</span>
              </div>
            </div>
            <h3 className="text-white font-semibold">Bull</h3>
            <p className="text-sm text-gray-300">Long-term trader, buys low and sells high</p>
          </button>
          
          <button
            className="p-4 bg-red-800 rounded-lg text-center hover:bg-red-700 transition-colors"
            onClick={() => onStartGame('bear')}
          >
            <div className="mb-2 flex justify-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">🐻</span>
              </div>
            </div>
            <h3 className="text-white font-semibold">Bear</h3>
            <p className="text-sm text-gray-300">Short-term trader, profits from price drops</p>
          </button>
        </div>
        
        <button
          className="px-4 py-2 bg-gray-700 text-white rounded-lg w-full hover:bg-gray-600 transition-colors"
          onClick={() => setCharacterSelect(false)}
        >
          Back
        </button>
      </div>
    );
  }
  
  return (
    <div className="p-4 bg-gray-900 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-white">Game Controls</h3>
        <div className="text-sm px-2 py-1 bg-purple-700 text-white rounded">
          {player.character === 'bull' ? '🐂 Bull' : '🐻 Bear'}
        </div>
      </div>
      
      <div className="mb-4 grid grid-cols-2 gap-2">
        <div>
          <p className="text-xs text-gray-400">Score</p>
          <p className="text-lg font-semibold text-white">{player.score}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Balance</p>
          <p className="text-lg font-semibold text-white">${player.balance.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-1">Controls</h4>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>WASD or Arrow Keys: Move</li>
          <li>Space: Jump</li>
          <li>E: Interact / Trade</li>
          <li>Buy Zone: Green Building</li>
          <li>Sell Zone: Red Building</li>
        </ul>
      </div>
      
      <button
        className="px-4 py-2 bg-red-600 text-white rounded-lg w-full hover:bg-red-700 transition-colors"
        onClick={onEndGame}
      >
        End Game
      </button>
    </div>
  );
}

// Main Game UI Component
export function GameUI() {
  const { 
    startGame, 
    endGame, 
    gameActive, 
    makeTrade,
    generateAITraders,
  } = useGameStore();
  
  const { 
    simulateMarketCycle,
    generatePrices,
    resetPriceStore,
    stopSimulation,
  } = usePriceStore();
  
  // Handler for starting the game
  const handleStartGame = (character: 'bull' | 'bear') => {
    // Reset price store and generate initial data
    resetPriceStore();
    generatePrices(100, 100);
    
    // Generate AI traders
    generateAITraders(10);
    
    // Start market simulation
    simulateMarketCycle(300, 1000);
    
    // Start the game
    startGame('singleplayer', character);
  };
  
  // Handler for ending the game
  const handleEndGame = () => {
    stopSimulation();
    endGame();
  };
  
  // Handler for executing trades
  const handleTrade = (type: 'buy' | 'sell', amount: number) => {
    const { currentPrice } = usePriceStore.getState();
    makeTrade(type, amount, currentPrice);
  };
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top UI - Score */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <GameScore />
      </div>
      
      {/* Left UI - Trading Panel */}
      <div className="absolute top-4 left-4 w-64 pointer-events-auto">
        {gameActive && <TradingPanel onTrade={handleTrade} />}
      </div>
      
      {/* Right UI - Game Events */}
      <div className="absolute top-4 right-4 w-64 pointer-events-auto">
        {gameActive && <GameEventsPanel />}
      </div>
      
      {/* Bottom UI - Game Menu */}
      <div className="absolute bottom-4 left-4 w-64 pointer-events-auto">
        <GameMenu 
          onStartGame={handleStartGame}
          onEndGame={handleEndGame}
        />
      </div>
    </div>
  );
}