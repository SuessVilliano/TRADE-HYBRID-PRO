# Trade Hybrid Platform

## Overview
A comprehensive decentralized trading platform that bridges multiple trading environments, offering traders a unified, intuitive interface for accessing diverse trading platforms seamlessly. The platform serves as a prop trading solution with HybridFunding.co integration and connects to four trading platforms from GooeyTrade provider.

## User Preferences
- **Data Integrity**: No mock, placeholder, or fallback synthetic data - only authentic data from live sources
- **Live Functionality**: All components must be fully functional with real API connections
- **Navigation Structure**: Trading & Markets simplified to 3 main options only
- **Hidden Features**: Keep broken components alive in codebase but hidden from navigation

## Project Architecture

### Core Technologies
- React with TypeScript frontend
- Tailwind CSS for responsive design
- Solana Web3.js blockchain integration
- BirdEye API for real-time token tracking
- OpenAI-powered market analysis
- PostgreSQL for advanced trading models
- Multi-platform trading browser integration

### Trading Platform Integration
- **HybridFunding.co**: Prop firm dashboard and challenge applications
- **GooeyTrade Platforms**: DX Trade, Match Trader, cTrader, Rithmic
- **Real-time Data**: Live trading signals from Paradox, Solaris, Hybrid providers
- **WebSocket Connections**: Real-time updates for signals and multiplayer features

### Navigation Structure
**Trading & Markets** (3 main options):
1. Trade Dashboard - Advanced trading interface with charts and execution
2. DEX Dashboard - Decentralized exchange trading interface  
3. Trading Platforms - Connect to DX Trade, Match Trader, cTrader, and Rithmic

**Services**:
- Prop Firm Dashboard - Access to HybridFunding.co dashboard
- Prop Firm Challenge - Apply for HybridFunding.co funded trading accounts
- Affiliate Program

**Immersive Experiences**:
- Trading Metaverse - Immersive trading experience

**Crypto & NFTs**:
- NFT Marketplace
- THC Staking

## Recent Changes

### June 16, 2025 - Evening Update
- **TradeHybrid Web App URL Correction**: Updated all TradeHybrid Web App references from app.tradehybrid.co to app.tradehybrid.club
  - Fixed iframe widget URL in TradeHybridAppWidget component
  - Updated external link handler to use correct domain
  - Corrected embedded app page URL reference
  
- **TradingView Component Enhancement**: Created fully functional TradingView iframe component
  - Implemented proper iframe-based solution for chart loading
  - Added maximize/minimize functionality and external link support
  - Resolved TradingView script loading issues with iframe approach
  
- **Prop Firm Journal Integration**: Added prop firm journal to dashboard navigation
  - Enhanced Trading Tools category with dedicated prop firm journal
  - Maintained existing trade journal functionality
  - Added professional trading journal with prop firm sync capabilities

- **Drift Trade DEX Integration**: Integrated Drift Protocol as primary DEX trading platform
  - Added prominent Drift Trade banner to DEX platform with direct launch button
  - Connected to https://app.drift.trade/ for professional perpetual futures trading
  - Enhanced DEX platform with live Solana token data and Jupiter swap functionality
  - Fixed wallet authentication using proper Solana auth provider methods
  - Maintained internal trading features alongside external Drift Trade access

- **Landing Page Platform Image Fix**: Resolved missing platform preview image
  - Created professional SVG illustration showing TradeHybrid interface
  - Added trading dashboard, charts, portfolio stats, and live signals visualization
  - Fixed image loading and display on landing page hero section

### June 16, 2025 - Initial
- **Hidden Broken Components**: Commented out broken features while keeping them alive in codebase:
  - Trading signals (demo only) → Hidden from navigation
  - Trading bots (mockup only) → Hidden from navigation  
  - AI market analysis (crashes) → Hidden from navigation
  - Learning center (buggy) → Hidden from navigation
  - Educational games → Hidden from navigation
  - Investor dashboards → Completely hidden from navigation
  
- **Restructured Navigation**: 
  - Trading & Markets now shows only 3 working options
  - Removed broken trading tools from main navigation
  - Trading platforms properly integrated

- **Prop Firm Integration**:
  - Fixed prop firm challenge page to redirect to hybridfunding.co
  - Updated prop firm dashboard URL to correct sign-in endpoint
  - Proper external URL handling for HybridFunding.co

- **Live Data Implementation**:
  - Removed all mock data from social activity feed
  - Connected to real multiplayer WebSocket data
  - Trading signals now use live data from Paradox, Solaris, Hybrid providers
  - Fixed dependency issues preventing application startup

- **Database Fixes**:
  - Resolved PostgreSQL schema issues with trading_platforms table
  - Fixed null constraint violations for platform types

## Current Status
- Application running successfully with live data sources
- Real-time trading signals active from multiple providers
- WebSocket connections established for live updates
- All core services connected (Solana, market data providers)
- Prop firm integration working with correct external URLs
- Navigation streamlined to show only functional components

## API Integrations
- **Alpaca**: Trading broker API (some authentication issues)
- **Solana**: Blockchain network integration active
- **RapidAPI**: Market data providers connected
- **OpenAI**: AI-powered analysis (API key configured)
- **HybridFunding.co**: External prop firm services
- **GooeyTrade**: Multi-platform trading integration

## Known Issues
- Some Alpaca API credentials showing 403 forbidden (needs valid keys from user)
- Solscan API blocked in cloud environment (expected, using alternatives)
- Some external services require proper API credentials for full functionality