import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  isLoading: boolean;
  children: React.ReactNode;
  imageType?: 'thTower' | 'thDefault';
  message?: string;
}

export function LoadingScreen({ 
  isLoading, 
  children,
  imageType = 'thDefault', // Kept for backwards compatibility
  message = 'Loading...'
}: LoadingScreenProps) {
  
  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
          >
            <div className="flex flex-col items-center justify-center p-6 rounded-lg text-center">
              <motion.div 
                className="flex items-center gap-3 mb-4"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-2xl font-medium text-white">{message}</p>
              </motion.div>
              
              <p className="text-sm text-gray-400">Powered by Trade Hybrid</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {children}
    </>
  );
}