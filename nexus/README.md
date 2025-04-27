# Trade Hybrid Nexus Service

The Trade Hybrid Nexus service (formerly ABATEV) aggregates multiple brokers and provides a unified interface for trade execution, position management, and portfolio analysis.

## Features

- Broker aggregation (Alpaca, Interactive Brokers, etc.)
- Unified trade execution
- Position management
- Portfolio analysis
- Risk assessment
- Self-healing mechanisms
- Trade performance analytics
- API integration with multiple trading platforms

## Setup Instructions

### Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- Redis instance
- Broker API credentials

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-organization/tradehybrid.git
   cd tradehybrid/nexus
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
docker build -t tradehybrid-nexus .
docker run -p 4000:4000 --env-file .env tradehybrid-nexus
```

## API Endpoints

### Brokers

- `GET /brokers`: List all supported brokers
- `GET /brokers/:id`: Get details for a specific broker
- `POST /brokers/connect`: Connect a new broker account
- `DELETE /brokers/:id/disconnect`: Disconnect a broker account

### Trading

- `POST /execute`: Execute a trade across selected brokers
- `GET /positions`: Get all open positions
- `GET /positions/:id`: Get details for a specific position
- `POST /positions/:id/close`: Close a specific position

### Analytics

- `GET /performance`: Get performance metrics for all trades
- `GET /performance/:broker`: Get performance metrics by broker
- `GET /performance/:symbol`: Get performance metrics by symbol
- `GET /risk`: Get risk assessment for current portfolio

### Admin

- `POST /admin/sync`: Force synchronization with brokers
- `GET /admin/health`: Check broker connection health
- `POST /admin/reset`: Reset connection to a specific broker

## Supported Brokers

The Nexus service currently supports the following brokers:

1. **Alpaca Markets**
   - Stocks and ETFs
   - Paper trading support
   - Commission-free trading

2. **Interactive Brokers** (coming soon)
   - Global market access
   - Multi-currency support
   - Advanced order types

3. **TD Ameritrade** (coming soon)
   - Options trading
   - Futures trading
   - Forex trading

4. **Binance** (coming soon)
   - Cryptocurrency trading
   - Futures and options
   - Margin trading

## Architecture

The Nexus service consists of several components:

1. **API Server**: Handles all broker requests
2. **Broker Connectors**: Interfaces with individual broker APIs
3. **Trade Execution Engine**: Routes and executes trades
4. **Position Manager**: Tracks and manages positions
5. **Analytics Engine**: Calculates performance metrics
6. **Risk Assessment**: Evaluates portfolio risk

## Security Considerations

- All broker API keys are stored securely as environment variables
- API keys are never stored in the database in plain text
- JWT authentication for all endpoints
- Rate limiting is implemented
- Regular security audits

## Error Handling

The service includes robust error handling:

- Automatic retry on transient errors
- Circuit breakers for broker API outages
- Detailed error logging
- Self-healing mechanisms

## Monitoring

The service includes monitoring endpoints:

- `GET /health`: Service health check
- `GET /metrics`: Service metrics for monitoring systems
- `GET /status`: Broker connection status

## Support

For Nexus-related support, contact:
- Email: nexus@tradehybrid.club
- Discord: #nexus-support

## Roadmap

Planned enhancements:

- Additional broker integrations
- Advanced order types
- Algorithmic trading capabilities
- AI-powered trade recommendations
- Enhanced risk management features
- Multi-asset portfolio optimization