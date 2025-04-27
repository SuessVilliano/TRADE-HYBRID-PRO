# Trade Hybrid Platform Architecture

This document outlines the architecture of the Trade Hybrid platform, a cutting-edge decentralized trading platform that leverages blockchain technology, AI-driven market insights, and an adaptive user experience.

## System Overview

The Trade Hybrid platform consists of multiple interconnected services that work together to provide a comprehensive trading experience. Each service is designed to be independently deployable and scalable.

![Architecture Diagram](architecture-diagram.png)

## Service Components

### 1. Frontend Service

**Purpose**: Provides the user interface for the Trade Hybrid platform.

**Technology Stack**:
- React with TypeScript
- Tailwind CSS for styling
- @solana/wallet-adapter for wallet connections
- Web3Auth integration
- React Three Fiber for 3D visualizations
- HLS.js for TH TV livestream viewing

**Key Features**:
- Responsive design for multiple device types
- Wallet connection (Phantom, Web3Auth)
- Trading signals display
- Broker integration interfaces
- THC token staking interfaces
- User profile management
- Matrix contract visualization

**Deployment**:
- Nginx server for static file serving
- SSL termination
- Reverse proxy to backend services

### 2. Webhooks Service

**Purpose**: Handles incoming webhooks from trading platforms and provides real-time data via WebSockets.

**Technology Stack**:
- Node.js with Express
- WebSocket server
- PostgreSQL for data persistence
- Redis for caching

**Key Features**:
- TradingView webhook integration
- Cash Cow signal integration
- Real-time market data broadcasting
- Authentication middleware
- Rate limiting
- User session management
- WebSocket multiplayer capabilities

**API Endpoints**:
- `/api/webhooks/tradingview`: Receives trading signals from TradingView
- `/api/signals/trading-signals`: Returns trading signals for the authenticated user
- `/api/auth/*`: Authentication endpoints
- WebSocket endpoint for real-time updates

### 3. Nexus Service (formerly ABATEV)

**Purpose**: Aggregates multiple brokers and provides a unified interface for trade execution.

**Technology Stack**:
- Node.js with Express
- PostgreSQL for data persistence
- Redis for caching

**Key Features**:
- Broker integration (Alpaca, Interactive Brokers, etc.)
- Trade execution
- Position management
- Portfolio analysis
- Risk assessment
- Self-healing mechanisms
- Trade performance analytics

**API Endpoints**:
- `/brokers`: Lists available brokers
- `/execute`: Executes trades across selected brokers
- `/positions`: Manages open positions
- `/performance`: Provides trade performance metrics

### 4. Staking Service

**Purpose**: Manages staking operations for THC tokens and SOL.

**Technology Stack**:
- Node.js with Express
- @solana/web3.js for blockchain interaction
- @project-serum/anchor for smart contract interaction
- PostgreSQL for data persistence

**Key Features**:
- THC token staking
- SOL staking through validator
- Rewards calculation and distribution
- Validator monitoring
- Staking analytics

**API Endpoints**:
- `/stake`: For staking tokens
- `/unstake`: For unstaking tokens
- `/rewards`: For checking and claiming rewards
- `/validator`: For validator information

### 5. Validator Service

**Purpose**: Manages the Solana validator node.

**Technology Stack**:
- Solana validator software
- Node.js monitoring scripts
- PostgreSQL for data persistence

**Key Features**:
- Validator node management
- Stake account monitoring
- Commission management (1%)
- Performance analytics
- Health monitoring

## Data Flow

1. **User Authentication**:
   - Users authenticate via Whop, Phantom wallet, or Web3Auth
   - Authentication status is maintained across all services
   - Whop ID serves as the master key connecting user data

2. **Trading Signals**:
   - External platforms send signals via webhooks
   - Webhooks service processes and stores signals
   - Signals are filtered based on user membership level
   - Frontend displays signals in real-time

3. **Trade Execution**:
   - User initiates trade via frontend
   - Request is sent to Nexus service
   - Nexus service routes the trade to appropriate broker(s)
   - Execution results are returned to frontend
   - Position is tracked and monitored

4. **Staking**:
   - User initiates staking via frontend
   - Request is sent to Staking service
   - Staking service interacts with Solana blockchain
   - Staking positions are tracked and rewards calculated
   - User can claim rewards or unstake tokens

5. **Matrix Contract**:
   - User participates in affiliate matrix system
   - Matrix contract service handles slot allocation
   - Payments are processed directly via crypto transactions
   - Real-time event listeners track matrix changes

## Database Schema

The platform uses PostgreSQL for data persistence with the following key schemas:

1. **Users**:
   - Stores user information, preferences, and membership levels
   - Connected to Whop ID for authentication

2. **Trading Signals**:
   - Stores signals from various sources
   - Includes metadata for filtering and display

3. **Broker Connections**:
   - Stores broker API credentials and connection status
   - Maps users to their broker connections

4. **Staking Records**:
   - Tracks staking positions and rewards
   - Links to on-chain transactions

5. **Matrix Participation**:
   - Tracks user positions in the affiliate matrix
   - Records earnings and recycling events

## Security Considerations

1. **API Security**:
   - JWT-based authentication
   - Rate limiting on all endpoints
   - Input validation and sanitization
   - CORS configuration

2. **Credential Management**:
   - Broker API keys stored securely in environment variables
   - No credentials in code repositories
   - Regular credential rotation

3. **Blockchain Security**:
   - Secure key management for validator
   - Transaction verification and validation
   - Withdrawal limits and time locks

4. **Network Security**:
   - SSL/TLS for all connections
   - Firewall configuration
   - Regular security audits

## Scaling Strategy

The modular architecture allows for independent scaling of each service:

1. **Horizontal Scaling**:
   - Each service can be scaled independently
   - Load balancers for high-traffic services

2. **Database Scaling**:
   - Read replicas for high-read scenarios
   - Sharding for large data sets

3. **Caching Strategy**:
   - Redis used for caching frequently accessed data
   - Reduces database load and improves response times

## Monitoring and Logging

1. **Centralized Logging**:
   - Winston for log generation
   - Logs stored in structured format
   - Log rotation and archiving

2. **Performance Monitoring**:
   - Service health checks
   - Response time monitoring
   - Error rate tracking

3. **Alerts**:
   - Critical error notifications
   - Performance degradation alerts
   - Service downtime alerts

## Disaster Recovery

1. **Backup Strategy**:
   - Regular database backups
   - Configuration backups
   - Code repository mirroring

2. **Recovery Procedures**:
   - Database restoration
   - Service redeployment
   - DNS failover

## Future Architecture Enhancements

1. **Microservices Expansion**:
   - Further decomposition of services for better isolation
   - Service mesh implementation

2. **AI Integration**:
   - Enhanced signal analysis
   - Predictive analytics
   - User behavior modeling

3. **Blockchain Integration**:
   - Multi-chain support
   - DeFi integration
   - Cross-chain asset management

## Technology Stack Summary

- **Frontend**: React, TypeScript, Tailwind CSS, Three.js
- **Backend**: Node.js, Express, WebSockets
- **Database**: PostgreSQL, Redis
- **Blockchain**: Solana, SPL Tokens
- **Infrastructure**: Docker, Nginx, Systemd
- **Deployment**: Hetzner EX101 Server, Docker Compose
- **Security**: SSL/TLS, JWT, Rate Limiting
- **Monitoring**: Health Checks, Logging
- **Authentication**: Whop, Phantom Wallet, Web3Auth