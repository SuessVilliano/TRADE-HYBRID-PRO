import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CoinParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  angle: number;
  distance: number;
  opacity: number;
}

interface ExplodingCoinAnimationProps {
  isVisible: boolean;
  position?: { x: number; y: number };
  onComplete?: () => void;
  coinType?: 'sol' | 'usdc' | 'thc';
  particleCount?: number;
}

/**
 * A component that creates an exploding coin animation
 * Used to visualize commission payments in the affiliate matrix
 */
export function ExplodingCoinAnimation({
  isVisible,
  position = { x: 0, y: 0 },
  onComplete,
  coinType = 'sol',
  particleCount = 20
}: ExplodingCoinAnimationProps) {
  const [particles, setParticles] = useState<CoinParticle[]>([]);
  
  // Define coin color based on type
  const getCoinColor = () => {
    switch (coinType) {
      case 'sol':
        return '#9945FF'; // Solana purple
      case 'usdc':
        return '#2775CA'; // USDC blue
      case 'thc':
        return '#E4761B'; // THC token color (using similar to ETH)
      default:
        return '#9945FF';
    }
  };
  
  // Generate particles when animation becomes visible
  useEffect(() => {
    if (isVisible) {
      const newParticles: CoinParticle[] = Array.from({ length: particleCount }).map((_, i) => {
        const angle = Math.random() * 2 * Math.PI;
        const distance = 20 + Math.random() * 80; // Distance from center
        
        return {
          id: i,
          x: position.x,
          y: position.y,
          size: 5 + Math.random() * 10,
          color: getCoinColor(),
          angle,
          distance,
          opacity: 1
        };
      });
      
      setParticles(newParticles);
      
      // Clear particles after animation
      const timer = setTimeout(() => {
        setParticles([]);
        if (onComplete) onComplete();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, position.x, position.y]);
  
  // Show the main coin in the center
  const renderMainCoin = () => {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute',
              left: position.x - 25,
              top: position.y - 25,
              width: 50,
              height: 50,
              borderRadius: '50%',
              backgroundColor: getCoinColor(),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              boxShadow: '0 0 15px rgba(255, 255, 255, 0.5)',
              zIndex: 1000
            }}
          >
            {coinType.toUpperCase()}
          </motion.div>
        )}
      </AnimatePresence>
    );
  };
  
  // Render the flying particles
  const renderParticles = () => {
    return particles.map((particle) => {
      const targetX = position.x + Math.cos(particle.angle) * particle.distance;
      const targetY = position.y + Math.sin(particle.angle) * particle.distance;
      
      return (
        <motion.div
          key={particle.id}
          initial={{ 
            x: position.x, 
            y: position.y,
            scale: 0,
            opacity: 0 
          }}
          animate={{ 
            x: targetX, 
            y: targetY,
            scale: 1,
            opacity: [0, 1, 0.8, 0]
          }}
          transition={{ 
            duration: 1.5,
            ease: "easeOut"
          }}
          style={{
            position: 'absolute',
            width: particle.size,
            height: particle.size,
            borderRadius: '50%',
            backgroundColor: particle.color,
            boxShadow: `0 0 5px ${particle.color}`,
            zIndex: 999
          }}
        />
      );
    });
  };
  
  return (
    <div style={{ position: 'relative' }}>
      {renderMainCoin()}
      {renderParticles()}
    </div>
  );
}

export default ExplodingCoinAnimation;