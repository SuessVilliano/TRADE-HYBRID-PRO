"use client"

import React, { ReactNode, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from "next-themes"
import { Toaster as SonnerToaster } from "sonner"

type Toast = {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
};

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

// Provider component
export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id, duration: toast.duration || 5000 };

    setToasts((prevToasts) => [...prevToasts, newToast]);

    // Auto-remove toast after duration
    if (newToast.duration) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  };

  const removeToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

// Hook to use toast
export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast component
export const Toast: React.FC<{ toast: Toast; onClose: () => void }> = ({ toast, onClose }) => {
  // Get color based on type
  const getTypeClasses = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-white';
      case 'info':
      default:
        return 'bg-blue-500 text-white';
    }
  };

  return (
    <div
      className={`flex items-center justify-between p-4 mb-3 rounded-md shadow-md ${getTypeClasses(
        toast.type
      )}`}
    >
      <p>{toast.message}</p>
      <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
        {/* X component would go here */}
        <span>X</span> {/* Placeholder for X component */}
      </button>
    </div>
  );
};


// Toaster component that renders all toasts
//This component is removed because it is redundant with the new Toaster implementation using Sonner.

export function Toaster() {
  const { theme = "system" } = useTheme()

  return (
    <SonnerToaster
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      theme={theme as "light" | "dark" | "system"}
    />
  )
}

export { SonnerToaster };