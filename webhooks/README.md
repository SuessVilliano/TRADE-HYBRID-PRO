# Trade Hybrid Webhooks Service

The Trade Hybrid Webhooks service handles incoming webhooks from trading platforms, provides real-time data via WebSockets, and manages user authentication and session state.

## Features

- TradingView webhook integration
- Cash Cow signal integration
- Real-time market data broadcasting
- User authentication and session management
- WebSocket multiplayer capabilities
- Trading signal processing and filtering
- WebSocket server for real-time updates

## Setup Instructions

### Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- Redis instance
- Webhook provider credentials (TradingView, Cash Cow, etc.)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-organization/tradehybrid.git
   cd tradehybrid/webhooks
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
docker build -t tradehybrid-webhooks .
docker run -p 5000:5000 --env-file .env tradehybrid-webhooks
```

## API Endpoints

### Webhooks

- `POST /api/webhooks/tradingview`: Receives webhook signals from TradingView
- `POST /api/webhooks/cashcow`: Receives webhook signals from Cash Cow
- `POST /api/webhooks/custom`: Receives custom webhook signals

### Signals

- `GET /api/signals/trading-signals`: Returns trading signals for the authenticated user
- `GET /api/signals/historical`: Returns historical signals
- `GET /api/signals/performance`: Returns performance metrics for signals

### Authentication

- `POST /api/auth/login`: Authenticates a user
- `POST /api/auth/logout`: Logs out a user
- `GET /api/auth/user`: Returns the current authenticated user
- `POST /api/auth/register`: Registers a new user

### WebSockets

- `/ws`: WebSocket connection endpoint for real-time updates

## Supported Webhook Providers

The service currently supports the following webhook providers:

1. **TradingView**
   - Alert webhooks
   - Strategy webhooks
   - Custom indicator webhooks

2. **Cash Cow**
   - Trading signals
   - Market alerts
   - Custom notifications

3. **Custom Providers**
   - Configurable webhook format
   - Signal transformation
   - Filtering capabilities

## WebSocket Protocol

The WebSocket server uses the following message format:

```json
{
  "type": "player_update | chat_message | join | leave | trade_offer | friend_request | friend_response | voice_status | voice_data | ping | user_status | social_activity | trading_signal | webhook_status_update",
  "data": {
    // Message-specific data
  }
}
```

### Message Types

- `player_update`: Updates player position in the virtual space
- `chat_message`: Global or private chat messages
- `join`: Player joining the platform
- `leave`: Player leaving the platform
- `trade_offer`: Trading offer between users
- `trading_signal`: New trading signal broadcast
- `webhook_status_update`: Webhook provider status updates

## Signal Processing

Incoming webhook signals undergo several processing steps:

1. **Authentication**: Verify the webhook source
2. **Parsing**: Extract the signal data
3. **Transformation**: Convert to a standard format
4. **Enrichment**: Add additional metadata
5. **Filtering**: Apply membership-based filtering
6. **Storage**: Save to the database
7. **Broadcasting**: Send to connected clients via WebSockets

## Security Considerations

- Webhook authentication with secrets
- Rate limiting on all endpoints
- IP-based filtering for webhook sources
- Input validation for all parameters
- Regular security audits

## Monitoring

The service includes monitoring endpoints:

- `GET /api/health`: Service health check
- `GET /api/metrics`: Service metrics for monitoring systems
- `GET /api/webhooks/status`: Webhook provider status

## Support

For webhooks-related support, contact:
- Email: webhooks@tradehybrid.club
- Discord: #webhooks-support

## Roadmap

Planned enhancements:

- Additional webhook provider integrations
- Enhanced signal analysis
- Machine learning-based signal quality scoring
- Advanced filtering options
- Custom webhook builder for users
- Enhanced WebSocket capabilities with rooms and channels