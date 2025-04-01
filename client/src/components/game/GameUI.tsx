import React from 'react';

interface GameState {
  score: number;
  lives: number;
}

interface GameUIProps {
  gameState: GameState;
}

/**
 * Game UI component - displays game information overlay
 */
const GameUI: React.FC<GameUIProps> = ({ gameState }) => {
  const { score, lives } = gameState;
  
  return (
    <div className="game-ui absolute top-0 left-0 w-full p-4 pointer-events-none">
      <div className="flex justify-between w-full">
        {/* Left side - Score */}
        <div className="bg-gray-800 bg-opacity-80 text-white p-3 rounded-lg shadow-lg">
          <h3 className="font-bold text-lg">Score: {score}</h3>
        </div>
        
        {/* Right side - Lives */}
        <div className="bg-gray-800 bg-opacity-80 text-white p-3 rounded-lg shadow-lg">
          <h3 className="font-bold text-lg">Lives: {lives}</h3>
        </div>
      </div>
      
      {/* Controls hint */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 bg-opacity-80 text-white p-3 rounded-lg shadow-lg">
        <p className="text-sm">
          <strong>Controls:</strong> WASD / Arrows to move, Space to jump
        </p>
      </div>
    </div>
  );
};

export default GameUI;