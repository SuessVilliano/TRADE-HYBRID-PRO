const { spawn } = require('child_process');

// Start Vite dev server for frontend
const viteProcess = spawn('npx', ['vite', 'dev', '--host', '0.0.0.0', '--port', '5173'], {
  stdio: 'inherit',
  shell: true
});

// Start backend server using node with ES modules
const backendProcess = spawn('node', ['--input-type=module', '--eval', `
import('./server/index.ts').then(mod => {
  console.log('Backend server started');
}).catch(err => {
  console.error('Backend failed:', err);
});
`], {
  stdio: 'inherit',
  shell: true
});

process.on('SIGINT', () => {
  viteProcess.kill();
  backendProcess.kill();
  process.exit();
});