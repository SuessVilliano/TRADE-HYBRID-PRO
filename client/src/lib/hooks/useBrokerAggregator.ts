import { useBrokerAggregator as useStoreTs } from '../stores/useBrokerAggregator';
import { useBrokerAggregator as useStoreTsx } from '../stores/useBrokerAggregator.tsx';
import { useEffect, useState } from 'react';

/**
 * A hook to access the broker aggregator state and actions
 * This hook handles compatibility between the two existing implementations
 * of the broker aggregator store (.ts and .tsx versions)
 */
export const useBrokerAggregator = () => {
  // First try the .ts implementation, then fall back to the .tsx implementation if needed
  try {
    // Use the store from the .ts file by default
    return useStoreTs();
  } catch (error) {
    console.warn('Falling back to .tsx implementation of useBrokerAggregator');
    try {
      // Fall back to the .tsx implementation if the .ts one fails
      return useStoreTsx();
    } catch (fallbackError) {
      console.error('Both broker aggregator implementations failed:', fallbackError);
      // Return a minimal implementation that won't crash the app
      return {
        isLoading: false,
        error: 'Broker aggregator service unavailable',
        // Include minimal required methods that return appropriate defaults
        initializeAggregator: async () => { console.error('Broker aggregator service unavailable'); },
        selectBroker: () => { console.error('Broker aggregator service unavailable'); },
        toggleABATEV: () => { console.error('Broker aggregator service unavailable'); },
        executeTrade: async () => ({ success: false, error: 'Broker aggregator service unavailable' }),
        compareForSymbol: async () => [],
      };
    }
  }
};