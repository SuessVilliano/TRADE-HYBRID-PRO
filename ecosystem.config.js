/**
 * PM2 Ecosystem Configuration File
 * Used for deploying the Trade Hybrid platform services
 * 
 * Usage:
 * - Development: pm2 start ecosystem.config.js --env development
 * - Production: pm2 start ecosystem.config.js --env production
 */

module.exports = {
  apps: [
    {
      name: 'tradehybrid-nexus',
      script: 'nexus/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 4000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000
      }
    },
    {
      name: 'tradehybrid-webhooks',
      script: 'webhooks/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    },
    {
      name: 'tradehybrid-staking',
      script: 'staking/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3500
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3500
      }
    },
    {
      name: 'tradehybrid-frontend',
      script: 'frontend/server.js',
      instances: 2,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 80
      }
    },
    {
      name: 'validator-monitor',
      script: 'validator/monitor.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ],

  // Deployment Configuration
  deploy: {
    production: {
      user: 'deploy',
      host: 'tradehybrid-server',
      ref: 'origin/main',
      repo: 'git@github.com:tradehybrid/platform.git',
      path: '/var/www/tradehybrid',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production'
    },
    staging: {
      user: 'deploy',
      host: 'tradehybrid-staging',
      ref: 'origin/develop',
      repo: 'git@github.com:tradehybrid/platform.git',
      path: '/var/www/tradehybrid-staging',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env development'
    }
  }
};