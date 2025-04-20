import React from 'react';
import { BullsVsBearsScene } from '../components/game/bulls-vs-bears/BullsVsBearsScene';

// Bulls vs Bears Game Page Component
export default function BullsVsBearsGame() {
  return (
    <div className="w-full h-screen bg-slate-900">
      <BullsVsBearsScene />
    </div>
  );
}