import React, { useEffect } from 'react';
import { useSpatialSDK } from './useSpatialSDK';
import { SpatialPosition } from './SpatialSDK';
import { SPATIAL_CONFIG } from './config';

interface TradingDeskProps {
  id: string;
  position: SpatialPosition;
  trader: string;
  symbol: string;
}

export function TradingDesk({ id, position, trader, symbol }: TradingDeskProps) {
  const { createTradingDesk, registerInteractiveObject } = useSpatialSDK();
  
  useEffect(() => {
    // Create the trading desk in the metaverse
    createTradingDesk(
      id,
      position,
      trader,
      [
        { type: 'chart', symbol },
        { type: 'news' },
        { type: 'social' }
      ]
    );
    
    // Register for interactions
    registerInteractiveObject(id, (event) => {
      console.log(`Interaction with trading desk ${id}:`, event);
      // You could open a trading interface or show more information
    });
    
    return () => {
      // Cleanup would happen here if needed
    };
  }, [id, position, trader, symbol, createTradingDesk, registerInteractiveObject]);
  
  // This component doesn't render anything visible in React
  // It just creates and manages objects in the metaverse
  return null;
}

interface MarketDisplayProps {
  id: string;
  position: SpatialPosition;
  symbols: string[];
  displayType?: 'candlestick' | 'line' | 'heatmap';
}

export function MarketDisplay({ 
  id, 
  position, 
  symbols,
  displayType = 'candlestick'
}: MarketDisplayProps) {
  const { createMarketDisplay, registerInteractiveObject } = useSpatialSDK();
  
  useEffect(() => {
    // Create the market display in the metaverse
    createMarketDisplay(id, position, symbols, displayType);
    
    // Register for interactions
    registerInteractiveObject(id, (event) => {
      console.log(`Interaction with market display ${id}:`, event);
      // You could show more detailed charts or market information
    });
    
    return () => {
      // Cleanup would happen here if needed
    };
  }, [id, position, symbols, displayType, createMarketDisplay, registerInteractiveObject]);
  
  // This component doesn't render anything visible in React
  return null;
}

interface AIAssistantProps {
  id: string;
  position: SpatialPosition;
  name: string;
  responses: string[];
}

export function AIAssistant({ id, position, name, responses }: AIAssistantProps) {
  const { createAIAssistant, registerInteractiveObject } = useSpatialSDK();
  
  useEffect(() => {
    // Create the AI assistant in the metaverse
    createAIAssistant(id, position, name, responses);
    
    // Register for interactions
    registerInteractiveObject(id, (event) => {
      console.log(`Interaction with AI assistant ${id}:`, event);
      // You could open a chat interface or trigger a voice response
    });
    
    return () => {
      // Cleanup would happen here if needed
    };
  }, [id, position, name, responses, createAIAssistant, registerInteractiveObject]);
  
  // This component doesn't render anything visible in React
  return null;
}

interface MetaverseAreaProps {
  areaKey: string;
}

export function MetaverseArea({ areaKey }: MetaverseAreaProps) {
  const { teleportToArea } = useSpatialSDK();
  
  useEffect(() => {
    // Teleport to the area when the component mounts
    teleportToArea(areaKey);
    
    return () => {
      // No cleanup needed
    };
  }, [areaKey, teleportToArea]);
  
  // This component doesn't render anything visible in React
  return null;
}

// A component to set up the initial objects in the metaverse
export function MetaverseSetup() {
  const { 
    isInitialized, 
    initializeTradingEnvironment,
    createObject,
    showUIElement
  } = useSpatialSDK();
  
  useEffect(() => {
    if (!isInitialized) return;
    
    console.log('Setting up metaverse objects');
    
    // Initialize the trading environment
    initializeTradingEnvironment();
    
    // Create additional objects specific to our needs
    
    // Reception welcome board
    createObject(
      'welcomeBoard',
      'welcomeBoard',
      { x: 0, y: 2, z: -5 },
      {
        title: 'Welcome to Trade Hybrid Metaverse',
        description: 'Your gateway to immersive trading experiences'
      }
    );
    
    // Create a UI element for interactive tools
    showUIElement(
      'toolsPanel',
      `
        <div style="padding: 20px; background: rgba(0,0,0,0.7); color: white; font-family: Arial; border-radius: 10px;">
          <h3 style="margin-top: 0; color: #4CAF50;">Trading Tools</h3>
          <button style="background: #2196F3; color: white; border: none; padding: 8px 16px; margin: 5px; border-radius: 4px;">Charts</button>
          <button style="background: #FF9800; color: white; border: none; padding: 8px 16px; margin: 5px; border-radius: 4px;">Market Data</button>
          <button style="background: #9C27B0; color: white; border: none; padding: 8px 16px; margin: 5px; border-radius: 4px;">Portfolio</button>
        </div>
      `,
      { x: 5, y: 1.5, z: 0 }
    );
    
    return () => {
      // Cleanup would happen here if needed
    };
  }, [isInitialized, initializeTradingEnvironment, createObject, showUIElement]);
  
  // This component doesn't render anything visible in React
  return null;
}

export function TradeHybridMetaverse() {
  return (
    <>
      <MetaverseSetup />
      
      {/* Trading Area */}
      <TradingDesk
        id="mainTradingDesk"
        position={{ x: 10, y: 0, z: 5 }}
        trader="Lead Trader"
        symbol="BTCUSD"
      />
      
      <MarketDisplay
        id="mainMarketDisplay"
        position={{ x: 0, y: 3, z: -10 }}
        symbols={['BTCUSD', 'ETHUSD', 'SOLUSD']}
        displayType="candlestick"
      />
      
      <AIAssistant
        id="tradeAdvisor"
        position={{ x: 15, y: 0, z: 15 }}
        name="Trading Advisor"
        responses={[
          "Welcome to Trade Hybrid. How can I assist with your trading today?",
          "Would you like to see the latest market analysis?",
          "I can help you analyze market trends and identify trading opportunities."
        ]}
      />
    </>
  );
}