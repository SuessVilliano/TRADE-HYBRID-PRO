import React, { useState } from 'react';
import { useGame } from '@/lib/stores/useGame';
import { useTrader } from '@/lib/stores/useTrader';
import { useBots } from '@/lib/stores/useBots';
import { useSignals } from '@/lib/stores/useSignals';
import { useLeaderboard } from '@/lib/stores/useLeaderboard';
import { useWebApp } from '@/lib/stores/useWebApp';
import { Button } from './button';
import { SimpleWalletButton } from './simple-wallet-button';
import { SimpleAffiliateSystem } from './simple-affiliate-system';
import { TradeRunner } from './trade-runner';
import { 
  PanelLeft, 
  BarChart2, 
  BookOpen, 
  Bot, 
  Award, 
  MessageSquare, 
  Radio, 
  Settings, 
  Globe, 
  ChevronLeft, 
  ChevronRight,
  Gamepad2
} from 'lucide-react';
import { ContextualTooltip } from './contextual-tooltip';

export function GameSidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const { openWebApp } = useWebApp();
  const { fetchTrades } = useTrader();
  const { fetchBots } = useBots();
  const { fetchSignals } = useSignals();
  const { fetchLeaderboard } = useLeaderboard();

  // Toggle sidebar expanded state
  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
    // Reset active tab when collapsing
    if (isExpanded) {
      setActiveTab(null);
    }
  };

  // Handle tab click
  const handleTabClick = (tabId: string) => {
    if (activeTab === tabId) {
      setActiveTab(null);
    } else {
      setActiveTab(tabId);
      // Expand sidebar if it's collapsed
      if (!isExpanded) {
        setIsExpanded(true);
      }
      
      // Handle different tab actions
      switch (tabId) {
        case 'journal':
          fetchTrades();
          break;
        case 'bots':
          fetchBots();
          break;
        case 'signals':
          fetchSignals();
          break;
        case 'leaderboard':
          fetchLeaderboard();
          break;
        case 'webapp':
          openWebApp('https://app.tradehybrid.co');
          break;
      }
    }
  };

  return (
    <div className={`fixed left-0 top-0 h-full z-40 flex transition-all duration-300 ease-in-out ${isExpanded ? '' : 'transform -translate-x-[calc(100%-3.5rem)]'}`}>
      {/* Sidebar container */}
      <div className="relative flex h-full">
        {/* Main sidebar */}
        <div className={`bg-background/80 backdrop-blur-sm border-r flex flex-col h-full shadow-md transition-all duration-300 ${isExpanded ? 'w-64' : 'w-14'}`}>
          {/* Sidebar header */}
          <div className="p-3 border-b flex items-center justify-between">
            {isExpanded ? (
              <>
                <h2 className="font-semibold text-sm flex items-center space-x-2">
                  <BarChart2 className="h-4 w-4" />
                  <span>Trade Hybrid</span>
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={toggleSidebar}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 mx-auto"
                onClick={toggleSidebar}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Wallet connection */}
          <div className={`p-3 border-b ${isExpanded ? '' : 'flex justify-center'}`}>
            {isExpanded ? (
              <SimpleWalletButton />
            ) : (
              <ContextualTooltip
                id="wallet-tooltip"
                title="Connect Wallet"
                content="Connect your crypto wallet to access the platform"
                position="right"
              >
                <Button variant="outline" size="icon" onClick={() => handleTabClick('wallet')}>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </Button>
              </ContextualTooltip>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {/* Trading Journal */}
            <ContextualTooltip
              id="journal-tooltip"
              title="Trading Journal"
              content="View your trade history and performance"
              position="right"
            >
              <Button
                variant={activeTab === 'journal' ? 'default' : 'ghost'}
                size={isExpanded ? 'default' : 'icon'}
                className={`w-full justify-start ${isExpanded ? '' : 'flex justify-center'}`}
                onClick={() => handleTabClick('journal')}
              >
                <BookOpen className="h-4 w-4 mr-2 flex-shrink-0" />
                {isExpanded && <span>Journal</span>}
              </Button>
            </ContextualTooltip>

            {/* Trading Bots */}
            <ContextualTooltip
              id="bots-tooltip"
              title="Trading Bots"
              content="Manage your automated trading bots"
              position="right"
            >
              <Button
                variant={activeTab === 'bots' ? 'default' : 'ghost'}
                size={isExpanded ? 'default' : 'icon'}
                className={`w-full justify-start ${isExpanded ? '' : 'flex justify-center'}`}
                onClick={() => handleTabClick('bots')}
              >
                <Bot className="h-4 w-4 mr-2 flex-shrink-0" />
                {isExpanded && <span>Bots</span>}
              </Button>
            </ContextualTooltip>

            {/* Trading Signals */}
            <ContextualTooltip
              id="signals-tooltip"
              title="Trading Signals"
              content="View incoming trading signals and alerts"
              position="right"
            >
              <Button
                variant={activeTab === 'signals' ? 'default' : 'ghost'}
                size={isExpanded ? 'default' : 'icon'}
                className={`w-full justify-start ${isExpanded ? '' : 'flex justify-center'}`}
                onClick={() => handleTabClick('signals')}
              >
                <Radio className="h-4 w-4 mr-2 flex-shrink-0" />
                {isExpanded && <span>Signals</span>}
              </Button>
            </ContextualTooltip>

            {/* Leaderboard */}
            <ContextualTooltip
              id="leaderboard-tooltip"
              title="Leaderboard"
              content="See the top traders and their performance"
              position="right"
            >
              <Button
                variant={activeTab === 'leaderboard' ? 'default' : 'ghost'}
                size={isExpanded ? 'default' : 'icon'}
                className={`w-full justify-start ${isExpanded ? '' : 'flex justify-center'}`}
                onClick={() => handleTabClick('leaderboard')}
              >
                <Award className="h-4 w-4 mr-2 flex-shrink-0" />
                {isExpanded && <span>Leaderboard</span>}
              </Button>
            </ContextualTooltip>

            {/* Web App */}
            <ContextualTooltip
              id="webapp-tooltip"
              title="Web App"
              content="Open the Trade Hybrid web application"
              position="right"
            >
              <Button
                variant={activeTab === 'webapp' ? 'default' : 'ghost'}
                size={isExpanded ? 'default' : 'icon'}
                className={`w-full justify-start ${isExpanded ? '' : 'flex justify-center'}`}
                onClick={() => handleTabClick('webapp')}
              >
                <Globe className="h-4 w-4 mr-2 flex-shrink-0" />
                {isExpanded && <span>Web App</span>}
              </Button>
            </ContextualTooltip>

            {/* Chat / Community */}
            <ContextualTooltip
              id="chat-tooltip"
              title="Community Chat"
              content="Chat with other traders in the community"
              position="right"
            >
              <Button
                variant={activeTab === 'chat' ? 'default' : 'ghost'}
                size={isExpanded ? 'default' : 'icon'}
                className={`w-full justify-start ${isExpanded ? '' : 'flex justify-center'}`}
                onClick={() => handleTabClick('chat')}
              >
                <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                {isExpanded && <span>Community</span>}
              </Button>
            </ContextualTooltip>
            
            {/* Trade Runner Game */}
            <ContextualTooltip
              id="game-tooltip"
              title="Trade Runner"
              content="Play the Trade Runner game and climb the leaderboard"
              position="right"
            >
              <Button
                variant={activeTab === 'game' ? 'default' : 'ghost'}
                size={isExpanded ? 'default' : 'icon'}
                className={`w-full justify-start ${isExpanded ? '' : 'flex justify-center'}`}
                onClick={() => handleTabClick('game')}
              >
                <Gamepad2 className="h-4 w-4 mr-2 flex-shrink-0" />
                {isExpanded && <span>Trade Runner</span>}
              </Button>
            </ContextualTooltip>
          </div>

          {/* Content panel for expanded tabs */}
          {isExpanded && activeTab === 'game' && (
            <div className="mt-2 p-1 border-t">
              <TradeRunner className="w-full h-full" />
            </div>
          )}
          
          {isExpanded && activeTab === 'affiliate' && (
            <div className="mt-2 p-1 border-t">
              <SimpleAffiliateSystem />
            </div>
          )}
          
          {isExpanded && activeTab === 'wallet' && (
            <div className="mt-2 p-1 border-t">
              <SimpleWalletButton />
            </div>
          )}

          {/* Footer with affiliate and settings */}
          <div className="p-3 border-t">
            {isExpanded ? (
              <div className="space-y-3">
                <SimpleAffiliateSystem />
                <Button
                  variant="ghost"
                  size="default"
                  className="w-full justify-start"
                  onClick={() => handleTabClick('settings')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  <span>Settings</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-3 flex flex-col items-center">
                <ContextualTooltip
                  id="affiliate-tooltip"
                  title="Affiliate Program"
                  content="Share your referral link and earn rewards"
                  position="right"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleTabClick('affiliate')}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </Button>
                </ContextualTooltip>
                
                <ContextualTooltip
                  id="settings-tooltip"
                  title="Settings"
                  content="Configure your account and preferences"
                  position="right"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleTabClick('settings')}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </ContextualTooltip>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}