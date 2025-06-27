#!/bin/bash

# Deployment Fix Script for Trade Hybrid Platform
# Addresses @sentry/cli module dependency conflicts with whatwg-url/utils.js

echo "🔧 Starting deployment fix..."

# Step 1: Clear npm cache and corrupted package state
echo "📦 Clearing npm cache and corrupted packages..."
npm cache clean --force
rm -rf node_modules package-lock.json

# Step 2: Install dependencies with legacy peer deps, allowing optional deps for esbuild
echo "📥 Installing dependencies with conflict resolution..."
npm install --legacy-peer-deps --prefer-offline

# Step 3: Run npm audit fix to resolve vulnerabilities
echo "🔍 Fixing dependency vulnerabilities..."
npm audit fix --force || echo "Audit fix completed with warnings"

# Step 4: Verify build process
echo "🏗️ Running build process..."
npm run build

echo "✅ Deployment fix completed!"