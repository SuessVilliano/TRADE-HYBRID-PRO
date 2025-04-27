# Solana Validator Component

This directory contains all necessary configurations and scripts for running the Trade Hybrid Solana validator node.

## Overview

The validator component is responsible for:
- Running a Solana validator node
- Managing staking operations
- Monitoring validator performance
- Providing RPC services to other platform components

## Port Configuration

- RPC Port: 8899
- WebSocket Port: 8900

## Requirements

- Solana CLI tools (1.16.x+)
- Minimum 128GB RAM
- 2TB+ NVMe SSD storage
- Ubuntu 20.04 LTS or newer

## Setup Instructions

Full setup instructions will be provided as part of the migration process. Key steps include:

1. Install Solana CLI tools
2. Configure validator identity
3. Setup monitoring tools
4. Configure systemd services for persistent operation

## Integration Points

The validator connects to:
- Staking dashboard UI (/staking)
- THC staking smart contract

## Monitoring

The validator includes:
- Prometheus metrics endpoint
- Grafana dashboard configuration
- Alerting via Telegram/Discord webhooks