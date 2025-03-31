// This is a bridge file to handle react-toastify references
// without actually using the react-toastify library
// Instead, we redirect to Sonner which is already in our project

import { toast as sonnerToast } from 'sonner';
import React from 'react';

// Implement a comprehensive toast API that maps to sonner
export const toast = {
  success: (message: string | React.ReactNode, options?: any) => {
    return sonnerToast.success(typeof message === 'string' ? message : 'Success');
  },
  error: (message: string | React.ReactNode, options?: any) => {
    return sonnerToast.error(typeof message === 'string' ? message : 'Error');
  },
  info: (message: string | React.ReactNode, options?: any) => {
    return sonnerToast.info(typeof message === 'string' ? message : 'Info');
  },
  warning: (message: string | React.ReactNode, options?: any) => {
    return sonnerToast(typeof message === 'string' ? message : 'Warning');
  },
  dismiss: () => sonnerToast.dismiss(),
  update: (id: string, props: any) => sonnerToast.dismiss(id),
  // Support custom implementation for extended APIs
  dark: (message: string | React.ReactNode, options?: any) => {
    return sonnerToast(typeof message === 'string' ? message : 'Notification', {
      className: 'bg-gray-800 text-white',
    });
  },
  // Support the default toast function
  DEFAULT: 'default'
};

// Add more properties that might be imported
Object.assign(toast, {
  POSITION: {
    TOP_LEFT: 'top-left',
    TOP_RIGHT: 'top-right',
    TOP_CENTER: 'top-center',
    BOTTOM_LEFT: 'bottom-left',
    BOTTOM_RIGHT: 'bottom-right',
    BOTTOM_CENTER: 'bottom-center'
  },
  TYPE: {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error',
    DEFAULT: 'default'
  }
});

// Export toast as default for import * as toast syntax
export default toast;

// Export ToastContainer as an empty component that imports Sonner's Toaster
export const ToastContainer = (props: any) => {
  // Sonner is already included in the main app, so we don't need to render it here
  return null;
};