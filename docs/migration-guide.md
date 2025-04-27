# Trade Hybrid Platform Migration Guide

This document provides step-by-step instructions for migrating the Trade Hybrid platform to the Hetzner EX101 dedicated server.

## Table of Contents

1. [Server Preparation](#1-server-preparation)
2. [Clone Repository](#2-clone-repository)
3. [Environment Setup](#3-environment-setup)
4. [Docker Deployment](#4-docker-deployment)
5. [Systemd Service Installation](#5-systemd-service-installation)
6. [SSL Configuration](#6-ssl-configuration)
7. [DNS Configuration](#7-dns-configuration)
8. [Database Migration](#8-database-migration)
9. [Post-Migration Verification](#9-post-migration-verification)

## 1. Server Preparation

### Hetzner EX101 Specifications

- CPU: Intel Xeon E5-1650 v2 (6 cores, 12 threads)
- RAM: 64 GB DDR3
- Storage: 2 x 480GB SSD with RAID 1
- Network: 1 Gbps connection
- Location: Helsinki data center

### Initial Server Setup

```bash
# Update the system
apt update && apt upgrade -y

# Install essential tools
apt install -y curl wget git build-essential htop tmux vim ufw

# Setup firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 5000/tcp  # Webhooks service
ufw allow 4000/tcp  # Nexus service
ufw allow 3500/tcp  # Staking service
ufw enable

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
curl -L "https://github.com/docker/compose/releases/download/v2.18.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create deploy user
adduser deploy
usermod -aG sudo deploy
usermod -aG docker deploy

# Setup SSH key authentication for deploy user
mkdir -p /home/deploy/.ssh
cat >> /home/deploy/.ssh/authorized_keys << 'EOL'
# Paste your public SSH key here
EOL
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys

# Disable password authentication
sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart sshd
```

## 2. Clone Repository

```bash
# Switch to deploy user
su - deploy

# Create application directory
mkdir -p /var/www/tradehybrid
cd /var/www/tradehybrid

# Clone repository
git clone https://github.com/your-organization/tradehybrid.git .
```

## 3. Environment Setup

Create environment files for each service component based on the provided `.env.example` files:

```bash
# Copy example files
cp .env.example .env
cp nexus/.env.example nexus/.env
cp webhooks/.env.example webhooks/.env
cp staking/.env.example staking/.env
cp validator/.env.example validator/.env

# Edit the files to set proper values
nano .env
nano nexus/.env
nano webhooks/.env
nano staking/.env
nano validator/.env
```

Required environment variables to update:
- Database credentials
- JWT secret
- API keys (Alpaca, Whop, etc.)
- Solana RPC URL
- Validator identity information

## 4. Docker Deployment

Deploy the services using Docker Compose:

```bash
# Build and start all services
docker-compose up -d

# Check container status
docker-compose ps

# View logs for specific services
docker-compose logs -f frontend
docker-compose logs -f webhooks
docker-compose logs -f nexus
docker-compose logs -f staking
```

## 5. Systemd Service Installation

Alternatively, deploy services using systemd for direct host execution:

```bash
# Copy service files to systemd
sudo cp nexus/nexus.service /etc/systemd/system/
sudo cp webhooks/webhooks.service /etc/systemd/system/
sudo cp staking/staking.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable and start services
sudo systemctl enable nexus.service
sudo systemctl enable webhooks.service
sudo systemctl enable staking.service

sudo systemctl start nexus.service
sudo systemctl start webhooks.service
sudo systemctl start staking.service

# Check service status
sudo systemctl status nexus.service
sudo systemctl status webhooks.service
sudo systemctl status staking.service
```

## 6. SSL Configuration

Configure SSL certificates using Let's Encrypt:

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificates for main domain and subdomains
sudo certbot --nginx -d tradehybrid.club -d www.tradehybrid.club -d api.tradehybrid.club -d nexus.tradehybrid.club -d stake.tradehybrid.club

# Copy certificates to nginx SSL directory
sudo mkdir -p /etc/nginx/ssl
sudo cp /etc/letsencrypt/live/tradehybrid.club/fullchain.pem /etc/nginx/ssl/tradehybrid.crt
sudo cp /etc/letsencrypt/live/tradehybrid.club/privkey.pem /etc/nginx/ssl/tradehybrid.key

# Set up auto-renewal
sudo certbot renew --dry-run
```

## 7. DNS Configuration

Configure DNS records for the domain:

1. A Record: `tradehybrid.club` → Hetzner server IP
2. A Record: `www.tradehybrid.club` → Hetzner server IP
3. A Record: `api.tradehybrid.club` → Hetzner server IP
4. A Record: `nexus.tradehybrid.club` → Hetzner server IP
5. A Record: `stake.tradehybrid.club` → Hetzner server IP

## 8. Database Migration

Migrate the existing database to the new server:

```bash
# On the old server, export the database
pg_dump -U <username> <database_name> > tradehybrid_db_backup.sql

# Transfer the backup file to the new server
scp tradehybrid_db_backup.sql deploy@<new_server_ip>:/tmp/

# On the new server, import the database
psql -U tradehybrid -d tradehybrid < /tmp/tradehybrid_db_backup.sql

# Verify the migration
docker-compose exec postgres psql -U tradehybrid -d tradehybrid -c "SELECT COUNT(*) FROM trade_signals;"
```

## 9. Post-Migration Verification

Verify that all services are running correctly:

1. Check frontend website at `https://tradehybrid.club`
2. Test API endpoints at `https://api.tradehybrid.club/api/health`
3. Verify Nexus service at `https://nexus.tradehybrid.club/health`
4. Check Staking service at `https://stake.tradehybrid.club/health`
5. Verify WebSocket connections
6. Test authentication flows
7. Verify trading signals display
8. Check THC staking functionality
9. Test Solana wallet connections
10. Verify Whop integration

## Troubleshooting

### Service Not Starting

Check the service logs:

```bash
# For Docker deployment
docker-compose logs <service_name>

# For systemd deployment
sudo journalctl -u <service_name>.service -f
```

### Database Connection Issues

Verify database credentials and connection:

```bash
# Test PostgreSQL connection
psql -h localhost -U tradehybrid -d tradehybrid -c "SELECT 1;"

# Check if PostgreSQL is running
sudo systemctl status postgresql
```

### SSL Certificate Issues

Verify SSL certificates:

```bash
# Check certificate validity
sudo certbot certificates

# Test SSL configuration
curl -vI https://tradehybrid.club
```

### Nginx Configuration Issues

Check Nginx configuration:

```bash
# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## Rollback Plan

In case of migration issues, follow these steps to roll back:

1. Revert DNS changes to point back to the old server
2. Keep the old server running until all issues are resolved
3. Document encountered issues and solutions for the next migration attempt