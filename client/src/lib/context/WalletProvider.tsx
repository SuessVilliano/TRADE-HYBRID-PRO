import React, { FC, ReactNode } from 'react';

// Simple wallet provider wrapper to fix issues with Solana wallet context
interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: FC<WalletProviderProps> = ({ children }) => {
  // For now just pass through children
  // Later we can implement the full Solana wallet adapter setup
  return (
    <>{children}</>
  );
};

export default WalletProvider;