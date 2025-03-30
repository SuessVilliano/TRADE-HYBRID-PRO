import React from 'react';
import { useTradeSimulator } from '../../lib/stores/useTradeSimulator';

const WelcomeMessage: React.FC = () => {
  const showWelcomeMessage = useTradeSimulator(state => state.showWelcomeMessage);
  const startGame = useTradeSimulator(state => state.startGame);
  const dismissWelcomeMessage = useTradeSimulator(state => state.dismissWelcomeMessage);
  
  if (!showWelcomeMessage) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5">
        <div className="flex flex-col items-center text-center">
          <img src="/green-cash.svg" alt="Money icon" className="w-20 h-20 mb-4" />
          
          <h2 className="text-2xl font-bold mb-2">Welcome to Trade Simulator</h2>
          
          <p className="text-gray-600 mb-4">
            Practice trading with virtual money and develop your skills before risking real funds.
          </p>
          
          <div className="bg-gray-100 rounded-lg p-4 text-left w-full mb-6">
            <h3 className="font-bold mb-2">You'll start with:</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="bg-green-100 text-green-800 font-bold px-2 py-1 rounded mr-2">
                  $10,000
                </span>
                <span>Virtual balance</span>
              </li>
              <li className="flex items-center">
                <span className="bg-blue-100 text-blue-800 font-bold px-2 py-1 rounded mr-2">
                  5
                </span>
                <span>Assets to trade</span>
              </li>
              <li className="flex items-center">
                <span className="bg-purple-100 text-purple-800 font-bold px-2 py-1 rounded mr-2">
                  ∞
                </span>
                <span>Educational tips</span>
              </li>
            </ul>
          </div>
          
          <div className="flex flex-col w-full space-y-3">
            <button 
              onClick={startGame}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-bold text-lg transition-colors"
            >
              Start Trading
            </button>
            
            <button 
              onClick={dismissWelcomeMessage}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-medium transition-colors"
            >
              Just take a look
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeMessage;