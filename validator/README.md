# Trade Hybrid Validator Service

The Trade Hybrid Validator service manages the Solana validator node that supports the Trade Hybrid platform, providing secure staking capabilities for SOL and THC tokens with a 1% commission.

## Validator Details

- **Public Key**: `5Mp3EF1donYwLxhe5hs6HoWpAucZGLZ76NKRNztkjEej`
- **Commission**: 1%
- **THC Token Address**: `4kXPBvQthvpes9TC7h6tXsYxWPUbYWpocBMVUG3eBLy4`

## Features

- Solana validator node setup and management
- Validator status monitoring and metrics
- Commission management
- Vote account tracking
- Staking rewards distribution
- Performance analytics
- Integration with the Trade Hybrid staking service

## Setup Instructions

### Prerequisites

- Ubuntu 20.04 LTS or higher
- At least 128GB RAM
- 2TB NVMe SSD
- Broadband Internet connection (1 Gbps+)
- Static IP address

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-organization/tradehybrid.git
   cd tradehybrid/validator
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   nano .env
   ```

3. Run the validator setup script:
   ```bash
   ./setup_scripts/install_validator.sh --identity /path/to/validator-keypair.json
   ```

4. Start the validator monitoring service:
   ```bash
   npm install
   npm start
   ```

## Monitoring

The validator status can be monitored through:

1. The Trade Hybrid web interface
2. Direct Solana CLI commands:
   ```bash
   solana validators | grep 5Mp3EF1donYwLxhe5hs6HoWpAucZGLZ76NKRNztkjEej
   ```
3. The monitoring API endpoints:
   - `/validator/status`: Current validator status
   - `/validator/rewards`: Reward distribution information
   - `/validator/delegators`: List of current delegators

## Configuration

The validator can be configured through the following environment variables:

- `VALIDATOR_PUBLIC_KEY`: The public key of the validator
- `VALIDATOR_IDENTITY_PATH`: Path to the validator identity keypair
- `VALIDATOR_VOTE_ACCOUNT`: The vote account public key
- `VALIDATOR_COMMISSION`: The commission percentage (default: 1.0)
- `SOLANA_RPC_URL`: URL of the Solana RPC node to use

## Validator Operations

### Upgrades

When upgrading the Solana software:

1. Announce the upgrade time to stakers
2. Stop the validator service
3. Update the Solana software
4. Restart the validator service
5. Verify the validator is properly connected to the network

### Restart Procedure

To restart the validator:

```bash
sudo systemctl restart solana-validator.service
```

### Troubleshooting

Common issues:

1. **Validator not producing blocks**:
   - Check network connectivity
   - Verify the validator is synchronized with the network
   - Check system resources

2. **High memory usage**:
   - Adjust ledger parameters
   - Consider upgrading RAM

3. **Disk space issues**:
   - Enable ledger pruning
   - Add additional storage

## Staking Integration

The validator service integrates with the Trade Hybrid staking service to provide:

- Automated rewards distribution
- Delegation management
- Staking analytics
- User-friendly staking interfaces

## Support

For validator-related support, contact:
- Email: validator@tradehybrid.club
- Discord: #validator-support