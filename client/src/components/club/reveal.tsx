import React from 'react';
import { motion } from 'framer-motion';

type RevealProps = {
  children: React.ReactNode;
  /** stagger order inside a group */
  index?: number;
  /** vertical travel distance in px */
  distance?: number;
  className?: string;
  /** run once when scrolled into view (default) or every time */
  once?: boolean;
};

/**
 * Scroll-triggered reveal wrapper — fade + rise with a soft
 * stagger so sections feel alive without feeling busy.
 */
export function Reveal({
  children,
  index = 0,
  distance = 28,
  className,
  once = true,
}: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-80px' }}
      transition={{
        duration: 0.7,
        delay: Math.min(index * 0.08, 0.5),
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

export default Reveal;
