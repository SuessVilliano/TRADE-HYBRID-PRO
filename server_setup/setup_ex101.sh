#!/bin/bash
# Trade Hybrid Pro - EX101 Server Setup Script
# This script sets up the basic infrastructure for the Trade Hybrid Pro platform on an EX101 server

# Exit on any error
set -e

echo "==========================================================="
echo "Trade Hybrid Pro - EX101 Server Setup"
echo "==========================================================="

# Update system
echo "Updating system packages..."
apt update && apt upgrade -y

# Install essential tools
echo "Installing essential tools..."
apt install -y build-essential curl wget git unzip htop ntp nginx certbot python3-certbot-nginx

# Setup firewall
echo "Setting up firewall..."
apt install -y ufw
ufw allow ssh
ufw allow http
ufw allow https
ufw allow 8899/tcp  # Solana validator
ufw allow 8900/tcp  # Solana validator gossip
ufw allow 8001/tcp  # Solana validator gossip port range start
ufw allow 8010/tcp  # Solana validator gossip port range end
ufw --force enable

# Install Node.js
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g npm@latest
npm install -g pm2

# Install PostgreSQL
echo "Installing PostgreSQL..."
apt install -y postgresql postgresql-contrib
systemctl enable postgresql
systemctl start postgresql

# Setup PostgreSQL
echo "Setting up PostgreSQL..."
sudo -u postgres psql -c "CREATE USER tradehybrid WITH PASSWORD 'CHANGE_THIS_PASSWORD';"
sudo -u postgres psql -c "CREATE DATABASE tradehybrid_pro;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE tradehybrid_pro TO tradehybrid;"

# Install Redis
echo "Installing Redis..."
apt install -y redis-server
systemctl enable redis-server
systemctl start redis-server

# Install Solana CLI tools
echo "Installing Solana CLI tools..."
sh -c "$(curl -sSfL https://release.solana.com/v1.16.15/install)"
export PATH="/root/.local/share/solana/install/active_release/bin:$PATH"
echo 'export PATH="/root/.local/share/solana/install/active_release/bin:$PATH"' >> /root/.bashrc
echo 'export PATH="/root/.local/share/solana/install/active_release/bin:$PATH"' >> /etc/profile.d/solana.sh

# Create directory structure
echo "Creating directory structure..."
mkdir -p /opt/tradehybrid-pro/{frontend,nexus,webhooks,staking,validator,trade-journal}
mkdir -p /opt/tradehybrid-pro/data/{logs,backups,temp}
chmod -R 755 /opt/tradehybrid-pro

# Setup NGINX
echo "Setting up NGINX..."
cat > /etc/nginx/sites-available/tradehybrid-pro << 'EOL'
server {
    listen 80;
    server_name tradehybrid.club www.tradehybrid.club;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /webhooks {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Add additional locations as needed
}
EOL

ln -s /etc/nginx/sites-available/tradehybrid-pro /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# Setup PM2 service files
echo "Setting up PM2 service files..."
cat > /opt/tradehybrid-pro/ecosystem.config.js << 'EOL'
module.exports = {
  apps: [
    {
      name: 'tradehybrid-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/opt/tradehybrid-pro/frontend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'tradehybrid-nexus',
      script: 'npm',
      args: 'start',
      cwd: '/opt/tradehybrid-pro/nexus',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 8002
      }
    },
    {
      name: 'tradehybrid-webhooks',
      script: 'npm',
      args: 'start',
      cwd: '/opt/tradehybrid-pro/webhooks',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 8001
      }
    },
    {
      name: 'tradehybrid-staking',
      script: 'npm',
      args: 'start',
      cwd: '/opt/tradehybrid-pro/staking',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 8003
      }
    },
    {
      name: 'tradehybrid-trade-journal',
      script: 'npm',
      args: 'start',
      cwd: '/opt/tradehybrid-pro/trade-journal',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 8004
      }
    }
  ]
};
EOL

# Setup automatic daily backups
echo "Setting up automatic daily backups..."
cat > /etc/cron.daily/tradehybrid-backup << 'EOL'
#!/bin/bash
DATE=$(date +%Y-%m-%d)
BACKUP_DIR="/opt/tradehybrid-pro/data/backups"
LOG_DIR="/opt/tradehybrid-pro/data/logs"

# Database backup
sudo -u postgres pg_dump tradehybrid_pro > $BACKUP_DIR/tradehybrid_pro_$DATE.sql

# Compress the backup
gzip $BACKUP_DIR/tradehybrid_pro_$DATE.sql

# Keep only the last 7 days of backups
find $BACKUP_DIR -name "tradehybrid_pro_*.sql.gz" -type f -mtime +7 -delete

# Log rotation
find $LOG_DIR -name "*.log" -type f -mtime +30 -delete

# Validator logs
find /opt/tradehybrid-pro/validator/log -name "*.log" -type f -mtime +14 -delete
EOL

chmod +x /etc/cron.daily/tradehybrid-backup

# Setup system monitoring
echo "Setting up system monitoring..."
npm install -g node-problem-detector
cat > /etc/systemd/system/node-problem-detector.service << 'EOL'
[Unit]
Description=Node Problem Detector
After=network.target

[Service]
ExecStart=/usr/bin/node-problem-detector
Restart=always
User=root
Group=root
Environment=PATH=/usr/bin:/usr/local/bin
Environment=NODE_ENV=production
WorkingDirectory=/tmp

[Install]
WantedBy=multi-user.target
EOL

systemctl enable node-problem-detector
systemctl start node-problem-detector

# Setup SSL with Certbot
echo "Setting up SSL with Certbot..."
echo "NOTE: You will need to set up DNS for tradehybrid.club to point to this server first."
echo "After DNS is configured, run: certbot --nginx -d tradehybrid.club -d www.tradehybrid.club"

# Final instructions
echo "==========================================================="
echo "Server setup complete!"
echo "==========================================================="
echo "Next steps:"
echo "1. Update PostgreSQL password in environment files"
echo "2. Configure DNS to point to this server"
echo "3. Run certbot to set up SSL"
echo "4. Deploy Trade Hybrid Pro services"
echo "5. Start the Solana validator"
echo "==========================================================="