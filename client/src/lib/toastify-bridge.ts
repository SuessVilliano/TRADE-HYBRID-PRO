// This is a bridge file to handle react-toastify references
// without actually using the library

// Export an empty object to satisfy imports
export default {};

// Export common toast types that might be imported
export const toast = {
  success: (message: string, options?: any) => console.log('Toast success:', message, options),
  error: (message: string, options?: any) => console.log('Toast error:', message, options),
  info: (message: string, options?: any) => console.log('Toast info:', message, options),
  warning: (message: string, options?: any) => console.log('Toast warning:', message, options),
};

// Export ToastContainer as a dummy component
export const ToastContainer = () => null;