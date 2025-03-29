import React, { useEffect } from 'react';
import { BullsVsBearsScene } from '../components/game/bulls-vs-bears/BullsVsBearsScene';
import { useGameStore } from '../components/game/bulls-vs-bears/gameStore';
import { usePriceStore } from '../components/game/bulls-vs-bears/priceStore';
import { PopupContainer } from '../components/ui/popup-container';

export default function BullsVsBears() {
  const { gameActive, endGame } = useGameStore();
  const { stopSimulation } = usePriceStore();
  
  // Clean up when the component unmounts
  useEffect(() => {
    return () => {
      // End the game and stop all simulations when navigating away
      if (gameActive) {
        endGame();
        stopSimulation();
      }
    };
  }, [gameActive, endGame, stopSimulation]);
  
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto py-4 px-4">
        <h1 className="text-3xl font-bold mb-4">Bulls vs Bears</h1>
        <p className="text-gray-300 mb-6">
          Step into the ultimate trading showdown! Choose your side - bull or bear - and navigate the volatile 
          THC token market with skill and strategy. Make the right trades at the right time to claim victory!
        </p>
        
        <PopupContainer className="h-[calc(100vh-240px)]" padding>
          <BullsVsBearsScene />
        </PopupContainer>
        
        <div className="mt-6 bg-slate-800 rounded-lg p-4">
          <h2 className="text-xl font-bold mb-2">How to Play</h2>
          <ul className="list-disc pl-6 space-y-1 text-gray-300">
            <li>Use <span className="font-mono bg-slate-700 px-1 rounded">W, A, S, D</span> or arrow keys to move around</li>
            <li>Visit the green building to buy THC tokens</li>
            <li>Visit the red building to sell THC tokens</li>
            <li>Bulls profit when prices go up, Bears profit when prices go down</li>
            <li>Watch for market news events that can impact token prices</li>
            <li>Trade at the right time to maximize your score</li>
          </ul>
        </div>
      </div>
    </div>
  );
}