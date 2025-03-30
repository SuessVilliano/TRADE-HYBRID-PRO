"use client"

import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const addToast = (toastData: Omit<Toast, 'id'>) => {
    switch (toastData.type) {
      case 'success':
        toast.success(toastData.message, { autoClose: toastData.duration || 5000 });
        break;
      case 'error':
        toast.error(toastData.message, { autoClose: toastData.duration || 5000 });
        break;
      case 'warning':
        toast.warning(toastData.message, { autoClose: toastData.duration || 5000 });
        break;
      case 'info':
        toast.info(toastData.message, { autoClose: toastData.duration || 5000 });
        break;
    }
  };

  const removeToast = (id: string) => {
    toast.dismiss(id);
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer position="top-right" />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContainer;