# Webhook Service

## Overview

The Webhook Service is responsible for receiving and processing trading signals from various sources, including:
- TradingView alerts
- AI signal generators
- Custom indicator systems
- Third-party signal providers

## Architecture

The service is built with Express.js and follows a modular design:

- **Signal Receivers**: Endpoints for different signal sources
- **Signal Processors**: Logic to validate and normalize signals
- **Signal Router**: Directs signals to appropriate systems
- **Signal Storage**: Records all received signals

## API Endpoints

The webhook service exposes endpoints on port 5000:

- `/api/webhooks/tradingview` - Receive TradingView alerts
- `/api/webhooks/ai` - Receive AI-generated signals
- `/api/webhooks/custom` - For custom signal sources
- `/api/signals` - Query saved signals

## Signal Format

The service standardizes different signal formats into a common structure:

```typescript
interface TradeSignal {
  id: string;
  source: string;
  symbol: string;
  direction: 'buy' | 'sell';
  price: number;
  confidence: number;
  timeframe: string;
  timestamp: number;
  meta: Record<string, any>;
}
```

## Integration

The Webhook Service integrates with:
- Nexus trading engine
- Frontend dashboard
- User notification system
- Signal analysis systems

## Database

Signals are stored in the PostgreSQL database under the `webhooks` schema, with tables for:
- Raw signals
- Processed signals
- Performance metrics
- User subscriptions

## Setup Instructions

Full setup instructions will be provided during migration:
1. Configure Express.js server
2. Set up database schema
3. Configure security measures
4. Implement rate limiting
5. Set up monitoring

## Security Considerations

The webhook service implements:
- API key authentication
- IP whitelisting options
- Rate limiting
- Request validation
- Audit logging