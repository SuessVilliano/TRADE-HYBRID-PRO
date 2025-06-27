#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Start the server using node with tsx loader
const serverProcess = spawn('node', ['--loader', 'tsx/esm', 'server/index.ts'], {
  cwd: path.join(__dirname),
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' }
});

serverProcess.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

serverProcess.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Shutting down server...');
  serverProcess.kill('SIGTERM');
});