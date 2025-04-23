import React, { useEffect, useState } from 'react';
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
  imageType = 'thDefault',
  message = 'Loading...'
}: LoadingScreenProps) {
  const [imagePath, setImagePath] = useState('/images/th-default.png');
  
  // Set image path based on imageType
  useEffect(() => {
    if (imageType === 'thTower') {
      setImagePath('/images/th-tower.png');
    } else {
      setImagePath('/images/th-default.png');
    }
  }, [imageType]);
  
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
              <div className="relative mb-8 w-48 h-48">
                <img 
                  src={imagePath} 
                  alt="Trade Hybrid" 
                  className="w-auto h-auto max-w-full max-h-full object-contain"
                />
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <div className="w-full h-full bg-primary/5 rounded-full absolute" />
                </motion.div>
              </div>
              
              <motion.div 
                className="flex items-center gap-3 mb-2"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <p className="text-lg font-medium text-white">{message}</p>
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