# Trade Hybrid Migration Guide

This document provides step-by-step instructions for migrating the Trade Hybrid platform from the current unified codebase to the new modular architecture on a Hetzner EX101 dedicated server.

## Overview

The migration will be completed in phases:

1. **Preparation Phase**: Setting up the new server and environments
2. **Service Migration Phase**: Moving services one by one
3. **Testing Phase**: Ensuring all services work correctly
4. **Cutover Phase**: Switching production traffic to the new server

## Preparation Phase

### 1. Server Setup

```bash
# Log into the Hetzner EX101 server
ssh root@<server-ip>

# Create a deployment user
adduser deploy
usermod -aG sudo deploy
su - deploy

# Install essential tools
sudo apt update
sudo apt install -y git curl build-essential nginx certbot python3-certbot-nginx
```

### 2. Install Node.js

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2
```

### 3. Install PostgreSQL

```bash
# Install PostgreSQL 14
sudo apt install -y postgresql-14 postgresql-contrib-14

# Create database and user
sudo -u postgres psql -c "CREATE USER tradehybrid WITH PASSWORD 'secure_password';"
sudo -u postgres psql -c "CREATE DATABASE tradehybrid OWNER tradehybrid;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE tradehybrid TO tradehybrid;"
```

### 4. Clone Repository

```bash
# Clone the repository
git clone https://github.com/tradehybrid/platform.git /var/www/tradehybrid
cd /var/www/tradehybrid

# Install dependencies
npm install
```

## Service Migration Phase

### 1. Validator Setup

```bash
# Navigate to validator directory
cd /var/www/tradehybrid/validator

# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env

# Run the setup script
bash setup_scripts/install_validator.sh
```

### 2. Nexus Migration

```bash
# Navigate to nexus directory
cd /var/www/tradehybrid/nexus

# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env

# Start the service
pm2 start ecosystem.config.js --only tradehybrid-nexus
```

### 3. Webhook Service Migration

```bash
# Navigate to webhooks directory
cd /var/www/tradehybrid/webhooks

# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env

# Start the service
pm2 start ecosystem.config.js --only tradehybrid-webhooks
```

### 4. Staking Service Migration

```bash
# Navigate to staking directory
cd /var/www/tradehybrid/staking

# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env

# Start the service
pm2 start ecosystem.config.js --only tradehybrid-staking
```

### 5. Frontend Deployment

```bash
# Navigate to frontend directory
cd /var/www/tradehybrid/frontend

# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env

# Build the frontend
npm run build

# Configure Nginx
sudo cp nginx/tradehybrid.conf /etc/nginx/sites-available/tradehybrid
sudo ln -s /etc/nginx/sites-available/tradehybrid /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Setting Up SSL Certificates

```bash
# Set up SSL certificates with Let's Encrypt
sudo certbot --nginx -d tradehybrid.club -d www.tradehybrid.club -d nexus.tradehybrid.club -d stake.tradehybrid.club -d signals.tradehybrid.club
```

## Data Migration

### 1. Database Migration

```bash
# On the old server, dump the database
pg_dump -U postgres tradehybrid > tradehybrid_dump.sql

# Transfer the dump file to the new server
scp tradehybrid_dump.sql deploy@<new-server-ip>:/tmp/

# On the new server, restore the database
psql -U tradehybrid tradehybrid < /tmp/tradehybrid_dump.sql
```

### 2. Environment Variables Migration

Make sure to transfer all necessary environment variables from the old server to the new server, especially API keys and service credentials.

## Testing Phase

### 1. Service Health Checks

```bash
# Check if all services are running
pm2 status

# Check Nexus API
curl http://localhost:4000/api/v1/health

# Check Webhook API
curl http://localhost:5000/api/health

# Check Staking API
curl http://localhost:3500/api/health
```

### 2. End-to-End Testing

1. Test wallet connection
2. Test THC staking
3. Test trading signals
4. Test broker connections
5. Test user authentication

## Cutover Phase

### 1. DNS Updates

Update DNS records to point to the new server:

```
tradehybrid.club -> <new-server-ip>
www.tradehybrid.club -> <new-server-ip>
nexus.tradehybrid.club -> <new-server-ip>
stake.tradehybrid.club -> <new-server-ip>
signals.tradehybrid.club -> <new-server-ip>
```

### 2. Monitoring Setup

```bash
# Set up PM2 monitoring
pm2 install pm2-logrotate
pm2 install pm2-server-monit
pm2 save

# Configure Prometheus and Grafana
# (Follow instructions in monitoring/README.md)
```

### 3. Backup Configuration

```bash
# Set up automatic database backups
# Create backup script
cat > /var/www/tradehybrid/scripts/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/tradehybrid"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
pg_dump -U tradehybrid tradehybrid | gzip > "$BACKUP_DIR/tradehybrid_$TIMESTAMP.sql.gz"
# Keep only last 7 days of backups
find $BACKUP_DIR -name "tradehybrid_*.sql.gz" -mtime +7 -delete
EOF

# Make it executable
chmod +x /var/www/tradehybrid/scripts/backup-db.sh

# Add to crontab
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/tradehybrid/scripts/backup-db.sh") | crontab -
```

## Rollback Plan

In case of issues during migration, have a rollback plan ready:

1. Keep the old server running during migration
2. Maintain backup DNS records pointing to the old server
3. Document all configuration changes to quickly revert if needed

## Post-Migration Tasks

1. Monitor all services for at least 72 hours
2. Fine-tune resource allocation based on usage patterns
3. Set up regular maintenance schedule
4. Update documentation to reflect the new architecture