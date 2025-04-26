// Polyfill for Node.js process object in browser environments
export const process = {
  env: {
    NODE_ENV: import.meta.env.MODE || 'development',
    // Add any other environment variables that might be accessed
    // For example, if you're using process.env.SOME_API_KEY, add it here
  },
  browser: true,
  version: '',
  platform: typeof navigator !== 'undefined' ? navigator.platform : '',
  nextTick: (callback: Function, ...args: any[]) => {
    setTimeout(() => callback(...args), 0);
  }
};