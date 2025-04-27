# THC Staking Service

This directory contains the Trade Hybrid Coin (THC) staking service including smart contracts and API endpoints.

## Overview

The THC staking service enables:
- Staking of THC tokens for rewards
- Participation in platform governance
- Earning trading fee discounts
- Qualifying for affiliate program tiers

## Key Components

- Smart Contract: Anchor-based Solana program for on-chain staking
- API Server: Express.js service for staking operations
- Client SDK: JavaScript library for client-side interaction with staking program

## Technical Details

- Smart Contract Address: 4kXPBvQthvpes9TC7h6tXsYxWPUbYWpocBMVUG3eBLy4
- Token Address: 4kXPBvQthvpes9TC7h6tXsYxWPUbYWpocBMVUG3eBLy4
- API Port: 3500
- Network: Solana Mainnet

## Staking Features

- Flexible staking periods (30/60/90/180/365 days)
- Tiered rewards based on staking duration
- Early unstaking with penalty
- Auto-compounding options

## API Endpoints

The staking service exposes several REST API endpoints:

- `POST /api/stake` - Stake tokens
- `POST /api/unstake` - Unstake tokens
- `GET /api/rewards/:wallet` - Get rewards information
- `GET /api/stats` - Global staking statistics

## Integration

This service integrates with:
- Frontend staking dashboard
- User profile system
- Reward distribution engine