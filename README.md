# Trade Hybrid Platform

A cutting-edge decentralized trading platform that leverages blockchain technology, AI-driven market insights, and an adaptive user experience to revolutionize digital asset trading.

## Overview

Trade Hybrid is a comprehensive trading platform that combines traditional and decentralized finance, offering:

- AI-driven trading signals and market analysis
- Multi-broker integration via the Nexus service
- Solana blockchain integration with wallet connectivity
- THC token staking with rewards
- SOL staking through our validator (1% commission)
- Affiliate matrix systems with direct crypto payments
- Transparent token pricing from multiple sources (BirdEye and Raydium)
- Trade Hybrid TV (TH TV) for livestream viewing
- Real-time multiplayer features

## Architecture

The platform uses a modular, service-oriented architecture:

- **Frontend**: React application for user interface
- **Webhooks**: Signal processing and WebSocket communications
- **Nexus**: Broker aggregation and trade execution (formerly ABATEV)
- **Staking**: THC and SOL staking management
- **Validator**: Solana validator node management

For detailed architecture information, see [docs/architecture.md](docs/architecture.md).

## Services

### Frontend

The user interface for the Trade Hybrid platform, built with React, TypeScript, and Tailwind CSS.

- [Frontend Documentation](frontend/README.md)

### Webhooks Service

Handles incoming webhooks from trading platforms and provides real-time data via WebSockets.

- [Webhooks Documentation](webhooks/README.md)

### Nexus Service

Aggregates multiple brokers and provides a unified interface for trade execution.

- [Nexus Documentation](nexus/README.md)

### Staking Service

Manages staking operations for THC tokens and SOL.

- [Staking Documentation](staking/README.md)

### Validator Service

Manages the Solana validator node that supports the Trade Hybrid platform.

- [Validator Documentation](validator/README.md)

## Key Features

### Wallet Integration

Trade Hybrid supports multiple wallet connections:

- Phantom Wallet for Solana users
- Web3Auth for email/social login users

### Trading Signals

AI-driven trading signals are provided for multiple markets:

- Cryptocurrency pairs
- Stock markets
- Forex markets
- Commodities

### Nexus Trading

The Nexus service (formerly ABATEV) provides:

- Integration with multiple brokers
- Unified trade execution
- Position management
- Risk assessment
- Performance analytics

### THC Token

The Trade Hybrid Coin (THC) offers:

- Staking with 12% APY
- Platform fee discounts
- Access to premium features
- Governance participation

### Solana Validator

The platform runs a Solana validator with:

- Public Key: `5Mp3EF1donYwLxhe5hs6HoWpAucZGLZ76NKRNztkjEej`
- Commission: 1%
- Secure staking through the platform

## Deployment

The platform can be deployed using Docker or directly on a server:

### Docker Deployment

```bash
# Build and start all services
docker-compose up -d
```

For detailed deployment instructions, see [docs/migration-guide.md](docs/migration-guide.md).

### Manual Deployment

Each service can be deployed independently:

```bash
# Clone repository
git clone https://github.com/your-organization/tradehybrid.git
cd tradehybrid

# Setup each service
cd service-directory
npm install
npm start
```

## Development

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher
- Redis for caching
- Solana CLI tools (for validator)

### Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/your-organization/tradehybrid.git
   cd tradehybrid
   ```

2. Install dependencies for all services:
   ```bash
   npm run install-all
   ```

3. Set up environment variables:
   ```bash
   # Copy example files
   cp .env.example .env
   ```

4. Start all services in development mode:
   ```bash
   npm run dev
   ```

## Environment Configuration

The platform uses the following key environment variables:

- `SOLANA_RPC_URL`: Solana RPC endpoint
- `VALIDATOR_PUBLIC_KEY`: Validator public key
- `THC_TOKEN_ADDRESS`: THC token address
- `ALPACA_API_KEY` & `ALPACA_API_SECRET`: Alpaca broker credentials
- `WHOP_API_KEY` & `WHOP_APP_ID`: Whop integration credentials
- `JWT_SECRET`: Security token for API authentication

For complete environment details, see each service's `.env.example` file.

## License

Proprietary - All Rights Reserved

## Contact

- Website: [tradehybrid.club](https://tradehybrid.club)
- Support: support@tradehybrid.club
- Discord: [Trade Hybrid Discord](https://discord.gg/tradehybrid)