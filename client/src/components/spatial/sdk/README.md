# Trade Hybrid Spatial Metaverse SDK

This SDK provides integration with Spatial.io to create an interactive metaverse trading environment for Trade Hybrid.

## Overview

The Trade Hybrid Spatial SDK allows users to:

1. Navigate and interact with a 3D metaverse trading environment
2. Access trading desks, market displays, and AI trading assistants
3. Teleport between different areas of the trading metaverse
4. Interact with real-time market data and trading tools in a 3D environment

## Components

### SpatialSDK.ts

Core SDK implementation that handles communication with the Spatial.io iframe. Provides methods for:

- Creating interactive 3D objects
- Managing teleportation between areas
- Handling user interactions
- Loading 3D models and UI elements

### config.ts

Configuration for the metaverse environment:

- Area definitions and positions
- Interactive element definitions
- Default settings

### useSpatialSDK.tsx

React hook for using the SDK in components, with convenient methods for:

- Initializing the SDK
- Creating trading-specific objects
- Managing user navigation
- Handling area transitions

### MetaverseObjects.tsx

React components for creating and managing interactive objects in the metaverse:

- `TradingDesk`: Creates interactive trading stations
- `MarketDisplay`: Shows real-time market data
- `AIAssistant`: Virtual trading assistants
- `MetaverseArea`: Handles area navigation
- `TradeHybridMetaverse`: Sets up the complete Trade Hybrid environment

## Metaverse Areas

The Trade Hybrid metaverse consists of 6 main areas:

1. **Reception & Welcome Area**
   - Virtual receptionist
   - Digital welcome board
   - Company information

2. **Trading Floor**
   - Multiple trading desks
   - Real-time market displays
   - AI trading assistants

3. **Hybrid Holdings Private Trading Room**
   - Exclusive access area
   - Live market tracker
   - Portfolio displays

4. **Streaming & Podcast Studio**
   - Professional recording setup
   - AI co-host for market news
   - Booking system for recording sessions

5. **Merch & Tools Store**
   - Digital product displays
   - Instant checkout system
   - Trading tools showcase

6. **Event Space & Education Room**
   - Auditorium for workshops
   - Digital whiteboard
   - AI tutor for educational support

## Usage

### Basic Integration

```tsx
import { SpatialMetaverse } from '../components/spatial/SpatialMetaverse';

function TradingSpace() {
  return (
    <div>
      <SpatialMetaverse 
        spatialUrl="https://www.spatial.io/s/your-spatial-url" 
        fullWidth={true}
        autoEnterVR={false}
      />
    </div>
  );
}
```

### Custom Object Creation

```tsx
import { useSpatialSDK } from '../components/spatial/sdk';

function CustomTradingEnvironment() {
  const { createTradingDesk, createMarketDisplay } = useSpatialSDK();
  
  useEffect(() => {
    // Create a custom trading desk
    createTradingDesk(
      'myTradingDesk',
      { x: 10, y: 0, z: 5 },
      'Trader Name',
      [{ type: 'chart', symbol: 'BTCUSD' }]
    );
    
    // Create a market display
    createMarketDisplay(
      'marketDisplay',
      { x: 0, y: 3, z: -10 },
      ['BTCUSD', 'ETHUSD'],
      'candlestick'
    );
  }, []);
  
  return null; // This component manages objects but doesn't render visible UI
}
```

## Future Development

### Planned Features

1. Integration with real-time trading data from Trade Hybrid's APIs
2. Multi-user interaction and collaborative trading
3. Voice communication between users in the metaverse
4. Interactive tutorials and guided experiences
5. Virtual trading competitions and events

### 3D Model Development

For adding new 3D models to the metaverse:

1. Create models in Blender or other 3D software
2. Export as GLB or GLTF format
3. Upload to Spatial.io or reference via URL
4. Use the SDK's `loadModel` method to place in the environment

## Notes

- The SDK is designed to work with Spatial.io's embedding features
- Communication happens via iframe messaging
- Requires proper iframe permissions for full functionality