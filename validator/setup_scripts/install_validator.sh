#!/bin/bash
#
# Trade Hybrid Solana Validator Setup Script
# This script sets up a Solana validator node with the Trade Hybrid configuration
#
# Usage: ./install_validator.sh [options]
#
# Options:
#   --mainnet       Setup validator for mainnet (default)
#   --testnet       Setup validator for testnet
#   --devnet        Setup validator for devnet
#   --identity      Path to the validator identity keypair (required)
#   --vote          Path to the vote account keypair (will be created if not provided)
#   --ledger        Path to store the ledger (default: ~/validator-ledger)
#   --help          Show this help message
#
# Example: ./install_validator.sh --mainnet --identity ~/validator-keypair.json

set -e

# Default values
NETWORK="mainnet"
LEDGER_PATH="$HOME/validator-ledger"
IDENTITY_PATH=""
VOTE_PATH=""
RPC_URL="https://api.mainnet-beta.solana.com"
METRICS_IDENTITY="TradeHybridValidator"
COMMISSION=1

# Parse arguments
while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
        --mainnet)
            NETWORK="mainnet"
            RPC_URL="https://api.mainnet-beta.solana.com"
            shift
            ;;
        --testnet)
            NETWORK="testnet"
            RPC_URL="https://api.testnet.solana.com"
            shift
            ;;
        --devnet)
            NETWORK="devnet"
            RPC_URL="https://api.devnet.solana.com"
            shift
            ;;
        --identity)
            IDENTITY_PATH="$2"
            shift
            shift
            ;;
        --vote)
            VOTE_PATH="$2"
            shift
            shift
            ;;
        --ledger)
            LEDGER_PATH="$2"
            shift
            shift
            ;;
        --help)
            echo "Trade Hybrid Solana Validator Setup Script"
            echo ""
            echo "Usage: ./install_validator.sh [options]"
            echo ""
            echo "Options:"
            echo "  --mainnet       Setup validator for mainnet (default)"
            echo "  --testnet       Setup validator for testnet"
            echo "  --devnet        Setup validator for devnet"
            echo "  --identity      Path to the validator identity keypair (required)"
            echo "  --vote          Path to the vote account keypair (will be created if not provided)"
            echo "  --ledger        Path to store the ledger (default: ~/validator-ledger)"
            echo "  --help          Show this help message"
            echo ""
            echo "Example: ./install_validator.sh --mainnet --identity ~/validator-keypair.json"
            exit 0
            ;;
        *)
            echo "Unknown option: $key"
            exit 1
            ;;
    esac
done

# Check for required arguments
if [ -z "$IDENTITY_PATH" ]; then
    echo "Error: Validator identity keypair is required."
    echo "Use --identity <path> to specify the validator identity keypair."
    exit 1
fi

if [ ! -f "$IDENTITY_PATH" ]; then
    echo "Error: Validator identity keypair file not found at $IDENTITY_PATH"
    exit 1
fi

# Display configuration
echo "========================================================"
echo "Trade Hybrid Validator Setup"
echo "========================================================"
echo "Network:        $NETWORK"
echo "Ledger Path:    $LEDGER_PATH"
echo "Identity Path:  $IDENTITY_PATH"
echo "Vote Path:      ${VOTE_PATH:-<will be created>}"
echo "RPC URL:        $RPC_URL"
echo "========================================================"
echo ""

# Confirm setup
read -p "Continue with this configuration? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled by user."
    exit 1
fi

# Create directories
mkdir -p "$LEDGER_PATH"

# Install required packages
echo "Installing required packages..."
sudo apt-get update
sudo apt-get install -y libssl-dev libudev-dev pkg-config zlib1g-dev llvm clang cmake make git

# Install Solana CLI
echo "Installing Solana CLI..."
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

# Verify installation
solana --version

# Generate vote account if not provided
if [ -z "$VOTE_PATH" ]; then
    echo "Generating vote account keypair..."
    VOTE_PATH="$HOME/vote-account-keypair.json"
    solana-keygen new --no-passphrase -o "$VOTE_PATH"
    echo "Vote account keypair saved to $VOTE_PATH"
fi

# Initialize validator
echo "Initializing validator..."
solana-validator --identity "$IDENTITY_PATH" \
                 --vote-account "$VOTE_PATH" \
                 --ledger "$LEDGER_PATH" \
                 --rpc-port 8899 \
                 --dynamic-port-range 8000-8020 \
                 --entrypoint entrypoint.mainnet-beta.solana.com:8001 \
                 --entrypoint entrypoint2.mainnet-beta.solana.com:8001 \
                 --entrypoint entrypoint3.mainnet-beta.solana.com:8001 \
                 --entrypoint entrypoint4.mainnet-beta.solana.com:8001 \
                 --entrypoint entrypoint5.mainnet-beta.solana.com:8001 \
                 --known-validator 5D1fNXzvv5NjV1ysLjirC4WY92RNsVGF9xbegyPv73Dw \
                 --known-validator 7XSY3MrYnK8vq693Rju17bbPkCN3Z7KvvfvJx4wFymSg \
                 --known-validator Ft5fbkqNa76vnsjYNwjDZUXoTWpP7VYm3mtsaQckQADN \
                 --known-validator 9QxCLckBiJc783jnMvXZubK4wH86Eqqvashtrwvcsgkv \
                 --expected-genesis-hash 5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d \
                 --wal-recovery-mode skip_any_corrupted_record \
                 --limit-ledger-size \
                 --log ~/validator-log.txt \
                 --accounts ~/accounts \
                 --no-snapshot-fetch \
                 --maximum-local-snapshot-age 500 \
                 --no-port-check \
                 --no-poh-speed-test \
                 --skip-poh-verify

# Create systemd service
cat > /tmp/solana-validator.service << EOF
[Unit]
Description=Solana Validator
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
Restart=always
RestartSec=1
User=$USER
ExecStart=$HOME/.local/share/solana/install/active_release/bin/solana-validator \\
    --identity "$IDENTITY_PATH" \\
    --vote-account "$VOTE_PATH" \\
    --ledger "$LEDGER_PATH" \\
    --rpc-port 8899 \\
    --dynamic-port-range 8000-8020 \\
    --entrypoint entrypoint.mainnet-beta.solana.com:8001 \\
    --entrypoint entrypoint2.mainnet-beta.solana.com:8001 \\
    --entrypoint entrypoint3.mainnet-beta.solana.com:8001 \\
    --entrypoint entrypoint4.mainnet-beta.solana.com:8001 \\
    --entrypoint entrypoint5.mainnet-beta.solana.com:8001 \\
    --known-validator 5D1fNXzvv5NjV1ysLjirC4WY92RNsVGF9xbegyPv73Dw \\
    --known-validator 7XSY3MrYnK8vq693Rju17bbPkCN3Z7KvvfvJx4wFymSg \\
    --known-validator Ft5fbkqNa76vnsjYNwjDZUXoTWpP7VYm3mtsaQckQADN \\
    --known-validator 9QxCLckBiJc783jnMvXZubK4wH86Eqqvashtrwvcsgkv \\
    --expected-genesis-hash 5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d \\
    --wal-recovery-mode skip_any_corrupted_record \\
    --limit-ledger-size \\
    --log $HOME/validator-log.txt \\
    --accounts $HOME/accounts \\
    --no-snapshot-fetch \\
    --maximum-local-snapshot-age 500 \\
    --no-port-check \\
    --no-poh-speed-test \\
    --skip-poh-verify

[Install]
WantedBy=multi-user.target
EOF

echo "Generated systemd service file at /tmp/solana-validator.service"
echo "To install the service, run:"
echo "sudo mv /tmp/solana-validator.service /etc/systemd/system/"
echo "sudo systemctl daemon-reload"
echo "sudo systemctl enable solana-validator.service"
echo "sudo systemctl start solana-validator.service"

# Set validator commission
echo "Setting validator commission to $COMMISSION%..."
solana vote-update-commission "$VOTE_PATH" "$COMMISSION" --keypair "$IDENTITY_PATH"

# Display validator information
echo "========================================================"
echo "Validator setup complete!"
echo "========================================================"
echo "Validator Public Key: $(solana-keygen pubkey "$IDENTITY_PATH")"
echo "Vote Account: $(solana-keygen pubkey "$VOTE_PATH")"
echo "Commission: $COMMISSION%"
echo "Network: $NETWORK"
echo "========================================================"
echo "To check your validator status:"
echo "solana validators | grep $(solana-keygen pubkey "$IDENTITY_PATH")"
echo "========================================================"