import React, { useState } from 'react';
import { X, BarChart2, BookOpen, Bot, Award, Radio, MessageSquare, Users, Gamepad2, Tv, Coins, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './button';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onItemClick: (itemId: string) => void;
}

export function MobileMenu({ isOpen, onClose, onItemClick }: MobileMenuProps) {
  if (!isOpen) return null;
  
  // Handle menu item click
  const handleItemClick = (itemId: string) => {
    onItemClick(itemId);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex justify-start">
      {/* Menu Content */}
      <div className="bg-white dark:bg-gray-800 w-72 h-full overflow-auto animate-in slide-in-from-left">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-blue-500" />
            <span>Trade Hybrid</span>
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-2 space-y-1">
          <button
            className="flex w-full items-center gap-3 rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => handleItemClick('market')}
          >
            <BarChart2 className="h-5 w-5 text-blue-500" />
            <span>Market Charts</span>
          </button>
          
          <button
            className="flex w-full items-center gap-3 rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => handleItemClick('trade')}
          >
            <BarChart2 className="h-5 w-5 text-green-500" />
            <span>Trading Interface</span>
          </button>
          
          <button
            className="flex w-full items-center gap-3 rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => handleItemClick('journal')}
          >
            <BookOpen className="h-5 w-5 text-purple-500" />
            <span>Trading Journal</span>
          </button>
          
          <button
            className="flex w-full items-center gap-3 rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => handleItemClick('leaderboard')}
          >
            <Award className="h-5 w-5 text-yellow-500" />
            <span>Leaderboard</span>
          </button>
          
          <button
            className="flex w-full items-center gap-3 rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => handleItemClick('signals')}
          >
            <Radio className="h-5 w-5 text-red-500" />
            <span>Trading Signals</span>
          </button>
          
          <button
            className="flex w-full items-center gap-3 rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => handleItemClick('bots')}
          >
            <Bot className="h-5 w-5 text-indigo-500" />
            <span>Trading Bots</span>
          </button>
          
          <button
            className="flex w-full items-center gap-3 rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => handleItemClick('assistant')}
          >
            <Bot className="h-5 w-5 text-blue-500" />
            <span>AI Assistant</span>
          </button>
          
          <button
            className="flex w-full items-center gap-3 rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => handleItemClick('ai-analysis')}
          >
            <Bot className="h-5 w-5 text-purple-500" />
            <span>AI Market Analysis</span>
          </button>
          
          <button
            className="flex w-full items-center gap-3 rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => handleItemClick('advanced-ai-analysis')}
          >
            <Bot className="h-5 w-5 text-blue-500" />
            <span>Advanced AI Analysis</span>
          </button>
          
          <button
            className="flex w-full items-center gap-3 rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => handleItemClick('copy')}
          >
            <Users className="h-5 w-5 text-blue-500" />
            <span>Copy Trading</span>
          </button>
          
          <button
            className="flex w-full items-center gap-3 rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => handleItemClick('thc')}
          >
            <Coins className="h-5 w-5 text-yellow-500" />
            <span>THC Token</span>
          </button>
          
          <button
            className="flex w-full items-center gap-3 rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => handleItemClick('chat')}
          >
            <MessageSquare className="h-5 w-5 text-gray-500" />
            <span>Community Chat</span>
          </button>
          
          <button
            className="flex w-full items-center gap-3 rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => window.open('https://app.tradehybrid.co', '_blank')}
          >
            <Globe className="h-5 w-5 text-blue-500" />
            <span>Web App</span>
          </button>

          <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
            <Link to="/" className="flex w-full items-center gap-3 rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-700">
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Close by clicking the overlay */}
      <div className="flex-1" onClick={onClose}></div>
    </div>
  );
}