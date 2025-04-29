# Trade Hybrid MCP (Message Control Plane) Deployment Guide

This document provides comprehensive instructions for deploying the Trade Hybrid MCP (Message Control Plane) architecture on a production server, including migration to Hetzner.

## Table of Contents

1. [Introduction](#introduction)
2. [Architecture Overview](#architecture-overview)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Database Setup](#database-setup)
7. [WebSocket Server Configuration](#websocket-server-configuration)
8. [Service Integration](#service-integration)
9. [Monitoring Setup](#monitoring-setup)
10. [Troubleshooting](#troubleshooting)

## Introduction

The Message Control Plane (MCP) is the central messaging architecture of the Trade Hybrid platform. It replaces the previous webhook-based system with a centralized, queue-based approach that offers:

- Real-time message processing and broadcasting
- Structured queue management for signal reliability
- Persistent database state management
- Unified WebSocket connectivity for clients
- Comprehensive monitoring and logging

## Architecture Overview

The MCP architecture consists of these core components:

1. **MCP Server**: Central coordinator that manages processors, handlers, and client connections
2. **Queue Manager**: Handles message queues for different types of messages (signals, notifications, etc.)
3. **Signal Processor**: Processes trading signals, updates their status, and monitors price feeds
4. **Notification Processor**: Handles system notifications and broadcasts them to clients
5. **Handler Registry**: Manages various message handlers (TradingView, custom webhooks, etc.)
6. **WebSocket Server**: Provides real-time communication with clients

## Prerequisites

- Node.js 20 or higher
- PostgreSQL 14 or higher
- PM2 for process management
- Nginx as reverse proxy
- Valid SSL certificate

## Installation

### Server Preparation (Hetzner EX101)

```bash
# Update the system
apt update && apt upgrade -y

# Install essential tools
apt install -y curl wget git build-essential htop tmux vim ufw

# Setup firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 5000/tcp  # Main service
ufw allow 4000/tcp  # WebSocket connections
ufw enable
```

### Install Dependencies

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2

# Install PostgreSQL
apt install -y postgresql postgresql-contrib
```

### Clone Repository & Install Packages

```bash
# Clone repository
git clone https://github.com/your-org/trade-hybrid.git
cd trade-hybrid

# Install dependencies
npm install
```

## Configuration

### MCP Server Configuration

The MCP server is configured via environment variables and configuration files. Create a `.env` file with the following:

```
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/tradehybrid

# MCP Configuration
MCP_WEBSOCKET_PORT=4000
MCP_QUEUE_SIZE=1000
MCP_PERSISTENCE_INTERVAL=300000
MCP_SYNC_INTERVAL=1800000

# Processors Configuration
SIGNAL_PROCESSOR_UPDATE_INTERVAL=60000
NOTIFICATION_PROCESSOR_TTL=86400000

# Broker Integration
ALPACA_API_KEY=your_alpaca_key
ALPACA_API_SECRET=your_alpaca_secret
OANDA_API_KEY=your_oanda_key
```

### Configure PM2 for Process Management

Create a `ecosystem.config.js` file:

```javascript
module.exports = {
  apps: [
    {
      name: 'trade-hybrid-main',
      script: 'server/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'mcp-server',
      script: 'server/mcp-standalone.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
```

## Database Setup

The MCP requires specific database tables for operation:

```bash
# Apply database migrations
npm run db:push
```

This will create/update the necessary tables:
- `trade_signals` - For storing trading signals
- `signal_status_history` - For tracking signal status changes
- `notifications` - For system notifications
- `mcp_metrics` - For MCP performance metrics

## WebSocket Server Configuration

### Configure Nginx for WebSocket Proxy

Add this to your Nginx configuration:

```nginx
# WebSocket proxy for MCP
location /mcp/ws {
    proxy_pass http://localhost:4000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 86400;
}

# MCP API endpoints
location /api/mcp/ {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## Service Integration

### Integrate with Existing Webhooks

The MCP system is designed to work alongside the existing webhook system, ensuring backward compatibility. Both systems will process incoming webhooks:

1. The legacy webhook system tracks statistics and handles broker execution
2. The MCP system provides enhanced real-time processing and client notifications

No changes are needed to existing webhook URLs or tokens.

### Signal Provider Integration

The MCP system has provider-specific settings for different signal sources:

- Solaris AI: 5-minute timeframe
- Hybrid AI: 10-minute timeframe
- Paradox AI: 30-minute timeframe

These are automatically detected based on webhook passphrase.

## Monitoring Setup

### Health Check Endpoints

The MCP system provides these health check endpoints:

- `/api/mcp/status` - Returns overall MCP status
- `/api/mcp/metrics` - Returns detailed performance metrics
- `/api/mcp/queues` - Returns queue statistics

### Logging Configuration

Configure logging by setting the following environment variables:

```
MCP_LOG_LEVEL=info
MCP_LOG_FILE=/var/log/tradehybrid/mcp.log
MCP_CONSOLE_LOG=true
```

### Integrate with Monitoring Systems

For comprehensive monitoring, configure Prometheus or a similar monitoring system:

```bash
# Install Node.js Prometheus client
npm install prom-client

# Configure the metrics endpoint (already implemented in the MCP server)
# Access metrics at: /api/mcp/metrics
```

## Troubleshooting

### Common Issues

1. **WebSocket Connections Failing**
   - Check Nginx WebSocket proxy configuration
   - Ensure port 4000 is open in the firewall
   - Verify the MCP WebSocket server is running

2. **Signal Processing Delays**
   - Check queue size and processing rate metrics
   - Consider increasing `MCP_QUEUE_SIZE` for high-volume periods
   - Check processor thread CPU usage

3. **Database Connectivity Issues**
   - Verify PostgreSQL is running: `systemctl status postgresql`
   - Check connection string in .env file
   - Ensure database user has proper permissions

### Diagnostic Commands

```bash
# Check MCP server status
pm2 status mcp-server

# View MCP server logs
pm2 logs mcp-server

# Check database connectivity
psql -U username -d tradehybrid -c "SELECT COUNT(*) FROM trade_signals;"

# Verify WebSocket port is open
nc -zv localhost 4000
```

## Migration Considerations for Hetzner

When migrating to Hetzner, ensure:

1. All environment variables are properly transferred
2. Database is migrated with all MCP-related tables
3. WebSocket ports are open in the firewall
4. Nginx is configured for WebSocket proxying
5. PM2 is set up to run the MCP server process

Follow the complete server migration guide in `docs/migration-guide.md` for general migration steps, and incorporate these MCP-specific configurations.