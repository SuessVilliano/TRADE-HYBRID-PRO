import React from 'react';
import { Link } from 'react-router-dom';
import { TradeRunner } from '@/components/ui/trade-runner';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function GamePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-950 to-black p-4">
      <div className="flex items-center mb-4">
        <Link to="/">
          <Button variant="outline" size="sm" className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Main App
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-cyan-400">Trade Runner</h1>
      </div>
      
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-4xl">
          <TradeRunner className="w-full shadow-lg" />
        </div>
      </div>
      
      <footer className="mt-auto pt-4 text-center text-gray-400 text-sm">
        <p>© {new Date().getFullYear()} Trade Hybrid</p>
      </footer>
    </div>
  );
}