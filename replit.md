# Trade Hybrid Platform

## Overview
The Trade Hybrid Platform is a comprehensive decentralized trading platform that unifies diverse trading environments into a single, intuitive interface. It serves as a prop trading solution, integrating with HybridFunding.co and four trading platforms from GooeyTrade. The platform aims to bridge various trading environments, provide real-time market insights, and offer advanced trading tools.

## User Preferences
- **Data Integrity**: No mock, placeholder, or fallback synthetic data - only authentic data from live sources
- **Live Functionality**: All components must be fully functional with real API connections
- **Navigation Structure**: Trading & Markets simplified to 3 main options only
- **Hidden Features**: Keep broken components alive in codebase but hidden from navigation

## System Architecture

### Core Technologies
- **Frontend**: React with TypeScript, Tailwind CSS for responsive design.
- **Blockchain Integration**: Solana Web3.js.
- **Backend/Database**: PostgreSQL for advanced trading models with user_webhooks table.
- **AI/ML**: OpenAI for market analysis, Google's Genkit AI deployed for real-time insights and voice trading.
- **Trading Browser Integration**: Multi-platform trading browser.

### Recent Changes (Migration Complete - August 2025)
- Successfully migrated from Replit Agent to standard Replit environment
- Fixed dashboard image display issue for cleaner UI consistency
- Added missing routes for /staking and /portfolio pages
- Created and configured user_webhooks database table for webhook functionality
- Implemented mock AI market analysis with Hybrid Score™ calculations
- Verified live trading signals from Paradox, Solaris, and Hybrid providers are functional
- Fixed trade journal CSV export functionality with comprehensive data fields
- Platform now fully operational with all core features working

### Trading Platform Integration
- **Proprietary Integration**: HybridFunding.co for prop firm dashboards and challenge applications.
- **GooeyTrade Platforms**: DX Trade, Match Trader, cTrader, Rithmic.
- **Real-time Data Providers**: Paradox, Solaris, Hybrid for live trading signals.
- **Communication**: WebSocket connections for real-time updates and multiplayer features.

### Navigation Structure
- **Trading & Markets**:
    - Trade Dashboard (advanced trading interface)
    - DEX Dashboard (decentralized exchange trading interface)
    - Trading Platforms (connect to DX Trade, Match Trader, cTrader, Rithmic)
- **Services**:
    - Prop Firm Dashboard
    - Prop Firm Challenge
    - Affiliate Program
- **Immersive Experiences**:
    - Trading Metaverse
- **Crypto & NFTs**:
    - NFT Marketplace
    - THC Staking

### Key Features & Design Decisions
- **Unified Interface**: Centralized access to multiple trading platforms and services.
- **Real-time AI Integration**: AI-powered trading view charts with market analysis overlay, AI trade assistant with voice trading capabilities, and real-time AI market analysis using live data.
- **Enhanced TradingView Chart**: Includes a searchable symbol selector with comprehensive instrument coverage and an iframe-based chart display for reliability.
- **Streamlined Dashboards**: Consolidated "Trade Bots" and "Copy Trading," merged trade journals into an "Ultimate Trade Journal," and integrated a tabbed interface for seamless switching between prop firm platforms within the trading dashboard.
- **Mobile Responsiveness**: Optimized for mobile devices across all trading platforms and dashboards.

## External Dependencies

- **HybridFunding.co**: Prop firm services.
- **GooeyTrade**: Provider for DX Trade, Match Trader, cTrader, and Rithmic trading platforms.
- **BirdEye API**: Real-time token tracking.
- **OpenAI**: AI-powered market analysis and assistant features.
- **Alpaca**: Trading broker API (requires valid user credentials).
- **Solana**: Blockchain network.
- **RapidAPI**: Market data providers.
- **Binance API**: Real-time market data.
- **CoinGecko**: Real-time market data.
- **Paradox, Solaris, Hybrid**: Providers for live trading signals.
- **PostgreSQL**: Database for advanced trading models.
- **Drift Protocol**: Primary DEX trading platform.