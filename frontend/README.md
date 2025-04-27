# Trade Hybrid Frontend

## Overview

The frontend provides a unified user interface for all Trade Hybrid platform services, including:
- Wallet connections and management
- THC staking interface
- Nexus trading dashboard
- Signal subscription and visualization
- User profile and authentication
- Learning center and documentation

## Technology Stack

- React 18+
- TypeScript
- Vite.js
- Tailwind CSS
- Solana Web3.js
- @radix-ui component library

## Key Components

The frontend is organized into several core functional areas:

1. **Authentication**
   - Web3Auth integration
   - Phantom wallet connection
   - Traditional username/password

2. **Wallet Management**
   - Solana wallet display (SOL, THC, NFTs)
   - Transaction history
   - THC purchase interface

3. **Staking Dashboard**
   - THC staking interface
   - SOL validator staking
   - Rewards tracking
   - Stake management

4. **Nexus Trading Interface**
   - Broker connection management
   - Trading dashboard
   - Order placement and management
   - Position monitoring

5. **Signal Center**
   - AI signal displays
   - TradingView signal integration
   - Signal history and performance
   - Custom signal creation

6. **User Profile**
   - Unified user profile management
   - Settings and preferences
   - Affiliate program interface
   - Matrix display

7. **TH TV**
   - Live streaming component
   - Educational content
   - Recorded sessions

## Development Setup

The frontend is configured to work with:
- Development environment: Vite dev server (port 3000)
- Production build: Static files served via Express.js

## Environment Variables

Key environment variables:
- `VITE_API_URL`: Backend API URL
- `VITE_NEXUS_API_URL`: Nexus service URL
- `VITE_SOLANA_RPC_URL`: Solana RPC endpoint
- `VITE_WEBHOOK_URL`: Webhook service URL

## Deployment Process

The frontend is designed to be deployed:
1. Built with `npm run build`
2. Served statically from nginx or similar
3. Configured with appropriate CORS settings

## Integration Points

The frontend integrates with all other services:
- Validator status display
- Staking functionality
- Nexus trading engine
- Webhook signal subscription