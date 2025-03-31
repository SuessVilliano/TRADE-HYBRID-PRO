import React from 'react';
import { PopupContainer } from '@/components/ui/popup-container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BookOpen, Brain, ChartLine, GraduationCap } from 'lucide-react';

export default function EducationalGamesPage() {
  return (
    <div className="container mx-auto py-4 px-4 min-h-screen">
      <div className="flex flex-col space-y-6 lg:space-y-0 lg:flex-row lg:space-x-6 w-full">
        <div className="w-full lg:w-64 flex-shrink-0 bg-slate-800 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4 text-white">Game Center</h3>
          <nav className="space-y-1">
            <Link to="/trade-runner" className="flex items-center px-3 py-2 text-white hover:bg-slate-700 rounded-md">
              <span className="ml-2">Trading Games</span>
            </Link>
            <div className="ml-4 mt-2 space-y-1">
              <Link to="/trade-runner-browser" className="block px-3 py-2 text-white hover:bg-slate-700 rounded-md">
                Trade Runner
              </Link>
              <Link to="/bulls-vs-bears" className="block px-3 py-2 text-white hover:bg-slate-700 rounded-md">
                Bulls vs Bears
              </Link>
            </div>
            <Link to="/educational-games" className="flex items-center px-3 py-2 text-white bg-blue-600 rounded-md">
              <span className="ml-2">Educational Games</span>
            </Link>
            <div className="ml-4 mt-2">
              <Link to="/trade-simulator" className="block px-3 py-2 text-white hover:bg-slate-700 rounded-md">
                Trade Simulator
              </Link>
            </div>
          </nav>
        </div>
        
        <div className="flex-1">
          <PopupContainer padding>
            <h2 className="text-2xl font-bold mb-6">Educational Trading Games</h2>
            <p className="mb-6 text-slate-300">
              Enhance your trading skills with our educational games designed to teach trading concepts in an interactive and engaging way.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-5 bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors">
                <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
                  <ChartLine className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Trade Simulator</h3>
                <p className="text-slate-300 mb-4">Practice trading with virtual money in a risk-free environment. Learn the basics of market orders, limit orders, and trading psychology.</p>
                <Link to="/trade-simulator">
                  <Button className="w-full">Launch Simulator</Button>
                </Link>
              </Card>
              
              <Card className="p-5 bg-slate-800 border-slate-700 hover:border-green-500 transition-colors">
                <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Chart Pattern Quiz</h3>
                <p className="text-slate-300 mb-4">Test your knowledge of chart patterns. Identify bullish and bearish patterns to predict market movements.</p>
                <Button className="w-full" variant="outline" disabled>Coming Soon</Button>
              </Card>
              
              <Card className="p-5 bg-slate-800 border-slate-700 hover:border-purple-500 transition-colors">
                <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                  <GraduationCap className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Trading Terminology</h3>
                <p className="text-slate-300 mb-4">Learn essential trading terms through a fun and interactive flashcard-style game. Master the language of trading.</p>
                <Button className="w-full" variant="outline" disabled>Coming Soon</Button>
              </Card>
              
              <Card className="p-5 bg-slate-800 border-slate-700 hover:border-orange-500 transition-colors">
                <div className="h-12 w-12 rounded-full bg-orange-500/20 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Market Scenario Challenge</h3>
                <p className="text-slate-300 mb-4">Face realistic market scenarios and make trading decisions. Learn how different news events affect markets.</p>
                <Button className="w-full" variant="outline" disabled>Coming Soon</Button>
              </Card>
            </div>
          </PopupContainer>
        </div>
      </div>
    </div>
  );
}