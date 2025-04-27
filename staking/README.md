# Trade Hybrid Staking Service

The Trade Hybrid Staking service enables users to stake SOL and THC tokens securely, earning rewards while supporting the Trade Hybrid ecosystem.

## Features

- Stake SOL to the Trade Hybrid validator (1% commission)
- Stake THC tokens for token rewards
- View staking analytics and rewards history
- Auto-compound rewards
- Delegator dashboard
- Real-time staking information

## Setup Instructions

### Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- Redis instance
- Solana RPC access

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-organization/tradehybrid.git
   cd tradehybrid/staking
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   nano .env
   ```

4. Start the service:
   ```bash
   npm start
   ```

### Docker Deployment

To deploy using Docker:

```bash
docker build -t tradehybrid-staking .
docker run -p 3500:3500 --env-file .env tradehybrid-staking
```

## API Endpoints

### Staking

- `POST /stake/sol`: Stake SOL to the validator
- `POST /stake/thc`: Stake THC tokens
- `POST /unstake/sol`: Unstake SOL from the validator
- `POST /unstake/thc`: Unstake THC tokens

### Rewards

- `GET /rewards`: Get current rewards information
- `POST /rewards/claim`: Claim available rewards
- `POST /rewards/compound`: Auto-compound rewards

### Validator

- `GET /validator/info`: Get validator information
- `GET /validator/stats`: Get validator performance statistics
- `GET /validator/delegators`: List delegators and stake amounts

### User

- `GET /user/stakes`: Get user's staking positions
- `GET /user/rewards`: Get user's rewards history
- `GET /user/transactions`: Get user's staking transactions

## Staking Parameters

### SOL Staking

- **Validator Public Key**: `5Mp3EF1donYwLxhe5hs6HoWpAucZGLZ76NKRNztkjEej`
- **Commission**: 1%
- **Minimum Stake**: 0.1 SOL
- **Rewards Rate**: ~5-7% APY (network dependent)
- **Unstaking Period**: ~2-3 days (network epoch dependent)

### THC Staking

- **THC Token Address**: `4kXPBvQthvpes9TC7h6tXsYxWPUbYWpocBMVUG3eBLy4`
- **Rewards Rate**: 12% APY
- **Minimum Stake**: 100 THC
- **Rewards Distribution**: Daily
- **Unstaking Period**: 7 days

## Architecture

The staking service consists of several components:

1. **API Server**: Handles all staking requests
2. **Solana Interaction Engine**: Communicates with the Solana blockchain
3. **Rewards Calculator**: Calculates and tracks rewards
4. **Database**: Stores staking positions and rewards history
5. **Scheduler**: Runs periodic tasks like rewards distribution

## Security Considerations

- All private keys are stored securely as environment variables
- Transactions require user signatures
- Rate limiting is implemented on all endpoints
- Input validation for all parameters
- Regular security audits

## Monitoring & Maintenance

The service includes monitoring endpoints:

- `GET /health`: Service health check
- `GET /metrics`: Service metrics for monitoring systems

## Support

For staking-related support, contact:
- Email: staking@tradehybrid.club
- Discord: #staking-support

## Roadmap

Planned enhancements:

- Multi-chain staking support
- Liquid staking options
- Advanced staking analytics
- Mobile notifications for staking events
- Integration with DeFi protocols for additional yield opportunities