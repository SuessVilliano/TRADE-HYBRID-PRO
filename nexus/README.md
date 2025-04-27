# Nexus - Broker Aggregation Service

## Overview

Nexus (formerly ABATEV) is the core trading engine of the Trade Hybrid platform, providing:
- Multi-broker connectivity
- Intelligent trade routing
- Order execution optimization
- Trading analytics

## Architecture

The Nexus service is designed as a modular system with these components:

- **Broker Connectors**: Adapters for each supported broker
- **Trade Router**: Intelligent routing of orders to the optimal broker
- **Execution Engine**: Order placement and management
- **Analytics Engine**: Performance tracking and optimization

## Supported Brokers

Nexus supports connections to the following brokers:

- Alpaca
- OANDA
- Tradier
- cTrader
- Match-Trader
- MetaTrader 4/5 (via Bridge)
- Custom broker integrations

## API Endpoints

Nexus exposes a RESTful API on port 4000:

- `/api/v1/brokers` - List available brokers
- `/api/v1/connect` - Connect to a broker
- `/api/v1/accounts` - Manage trading accounts
- `/api/v1/orders` - Place and manage orders
- `/api/v1/positions` - View and manage open positions
- `/api/v1/history` - Trading history
- `/api/v1/signals` - Access trading signals

## Database

Nexus uses the shared PostgreSQL database with the `nexus` schema for:
- Broker connection details
- User preferences
- Order history
- Performance metrics

## Configuration

The service is configured via environment variables:

- `NEXUS_PORT`: API port (default: 4000)
- `NEXUS_LOG_LEVEL`: Logging verbosity
- `NEXUS_DB_CONNECTION`: Database connection string

## Integration

Nexus integrates with:
- Webhook service (for signals)
- Frontend dashboard
- Authentication service