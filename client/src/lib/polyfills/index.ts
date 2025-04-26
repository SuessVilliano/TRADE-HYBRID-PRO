// Export all polyfills from a single index for easier imports

// Buffer polyfill for Solana web3.js
export * from './buffer';

// Process polyfill for Node.js compatibility
export * from './process';

// More polyfills can be added here in the future

// Apply global polyfills - These will affect the global scope
// Only use this for compatibility with libraries that expect global objects
if (typeof window !== 'undefined') {
  // Add Buffer to window for libraries that expect it globally
  (window as any).Buffer = window.Buffer || require('./buffer').Buffer;
  
  // Add process to window for libraries that expect it globally
  (window as any).process = window.process || require('./process').process;
}