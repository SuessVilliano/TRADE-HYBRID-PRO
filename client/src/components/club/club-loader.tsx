import React from 'react';
import { motion } from 'framer-motion';

/**
 * Branded animated loader for the Trade Hybrid Club.
 * Use as the Suspense fallback for club routes and anywhere
 * an async state needs a premium-feeling loading moment.
 */
export function ClubLoader({ label = 'Loading the Club…' }: { label?: string }) {
  return (
    <div className="grid min-h-[60vh] place-items-center bg-white dark:bg-[#070a12]">
      <div className="flex flex-col items-center">
        <div className="relative grid h-20 w-20 place-items-center">
          <motion.span
            className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-600 via-blue-500 to-cyan-500"
            animate={{ scale: [1, 1.12, 1], opacity: [0.55, 0.9, 0.55] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.span
            className="absolute inset-0 rounded-3xl border border-violet-400/60"
            animate={{ scale: [1, 1.35], opacity: [0.7, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
          />
          <img
            src="https://tradehybrid.co/trade-hybrid-logo.png"
            alt="Trade Hybrid"
            className="relative h-12 w-12 object-contain"
          />
        </div>
        <motion.p
          className="mt-6 text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-400"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          {label}
        </motion.p>
      </div>
    </div>
  );
}

/**
 * Skeleton card shimmer for content that is still loading.
 */
export function ClubSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-slate-100 dark:bg-white/[0.04] ${className}`}
    >
      <motion.span
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/10"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

export default ClubLoader;
