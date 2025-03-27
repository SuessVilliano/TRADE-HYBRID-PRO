import { useState, useEffect } from 'react';
import { TradeJournalPopup } from './trade-journal-popup';
import { BotsPopup } from './bots-popup';
import { SignalsPopup } from './signals-popup';
import { LeaderboardPopup } from './leaderboard-popup';
import { ChatPopup } from './chat-popup';
import { AffiliatePopup } from './affiliate-popup';
import { WalletPopup } from './wallet-popup';
import { SettingsPopup } from './settings-popup';

/**
 * Popup Manager Component
 * - Central handler for all popup displays in the metaverse
 * - Listens for custom events to show/hide popups
 * - Coordinates popup z-index and focus management
 */
export function PopupManager() {
  // State for each popup visibility
  const [showJournal, setShowJournal] = useState(false);
  const [showBots, setShowBots] = useState(false);
  const [showSignals, setShowSignals] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showAffiliate, setShowAffiliate] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Set up event listeners for showing popups
  useEffect(() => {
    // Event handlers for each popup
    const handleShowJournal = () => setShowJournal(true);
    const handleShowBots = () => setShowBots(true);
    const handleShowSignals = () => setShowSignals(true);
    const handleShowLeaderboard = () => setShowLeaderboard(true);
    const handleShowChat = () => setShowChat(true);
    const handleShowAffiliate = () => setShowAffiliate(true);
    const handleShowWallet = () => setShowWallet(true);
    const handleShowSettings = () => setShowSettings(true);
    
    // Add event listeners
    document.addEventListener('show-trade-journal-popup', handleShowJournal);
    document.addEventListener('show-bots-popup', handleShowBots);
    document.addEventListener('show-signals-popup', handleShowSignals);
    document.addEventListener('show-leaderboard-popup', handleShowLeaderboard);
    document.addEventListener('show-chat-popup', handleShowChat);
    document.addEventListener('show-affiliate-popup', handleShowAffiliate);
    document.addEventListener('show-wallet-popup', handleShowWallet);
    document.addEventListener('show-settings-popup', handleShowSettings);
    
    // Cleanup event listeners
    return () => {
      document.removeEventListener('show-trade-journal-popup', handleShowJournal);
      document.removeEventListener('show-bots-popup', handleShowBots);
      document.removeEventListener('show-signals-popup', handleShowSignals);
      document.removeEventListener('show-leaderboard-popup', handleShowLeaderboard);
      document.removeEventListener('show-chat-popup', handleShowChat);
      document.removeEventListener('show-affiliate-popup', handleShowAffiliate);
      document.removeEventListener('show-wallet-popup', handleShowWallet);
      document.removeEventListener('show-settings-popup', handleShowSettings);
    };
  }, []);

  // Capture escape key to close all popups
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Close all popups when escape is pressed
        setShowJournal(false);
        setShowBots(false);
        setShowSignals(false);
        setShowLeaderboard(false);
        setShowChat(false);
        setShowAffiliate(false);
        setShowWallet(false);
        setShowSettings(false);
      }
    };
    
    window.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  // When any popup is visible, add a class to the body to prevent scrolling
  useEffect(() => {
    const anyPopupVisible = 
      showJournal || 
      showBots || 
      showSignals || 
      showLeaderboard || 
      showChat || 
      showAffiliate || 
      showWallet || 
      showSettings;
    
    if (anyPopupVisible) {
      document.body.classList.add('popup-open');
    } else {
      document.body.classList.remove('popup-open');
    }
    
    return () => {
      document.body.classList.remove('popup-open');
    };
  }, [
    showJournal,
    showBots,
    showSignals,
    showLeaderboard,
    showChat,
    showAffiliate,
    showWallet,
    showSettings
  ]);

  return (
    <>
      <TradeJournalPopup 
        isOpen={showJournal} 
        onClose={() => setShowJournal(false)} 
      />
      
      <BotsPopup 
        isOpen={showBots} 
        onClose={() => setShowBots(false)} 
      />
      
      <SignalsPopup 
        isOpen={showSignals} 
        onClose={() => setShowSignals(false)} 
      />
      
      <LeaderboardPopup 
        isOpen={showLeaderboard} 
        onClose={() => setShowLeaderboard(false)} 
      />
      
      <ChatPopup 
        isOpen={showChat} 
        onClose={() => setShowChat(false)} 
      />
      
      <AffiliatePopup 
        isOpen={showAffiliate} 
        onClose={() => setShowAffiliate(false)} 
      />
      
      <WalletPopup 
        isOpen={showWallet} 
        onClose={() => setShowWallet(false)} 
      />
      
      <SettingsPopup 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </>
  );
}