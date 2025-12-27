/**
 * Agent 2: Performance - SWR Configuration with Caching
 */

import { SWRConfiguration } from 'swr';

export const swrConfig: SWRConfiguration = {
  // Disable automatic revalidation on focus
  revalidateOnFocus: false,
  
  // Revalidate when network reconnects
  revalidateOnReconnect: true,
  
  // Dedupe requests within 10 seconds
  dedupingInterval: 10000,
  
  // Retry on error
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  
  // Keep data fresh
  refreshInterval: 0, // Disable polling by default
  
  // Cache configuration
  provider: () => new Map(),
  
  // Default fetcher
  fetcher: async (url: string) => {
    const res = await fetch(url);
    
    if (!res.ok) {
      const error = new Error('API Error');
      (error as any).status = res.status;
      throw error;
    }
    
    return res.json();
  },
  
  // Error handling
  onError: (error, key) => {
    console.error(`SWR Error for ${key}:`, error);
    
    // Send to error tracking service
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error);
    }
  },
  
  // Success callback
  onSuccess: (data, key) => {
    console.log(`SWR Success for ${key}`);
  },
};

// Presets for different data types
export const courseSwrConfig: SWRConfiguration = {
  ...swrConfig,
  refreshInterval: 300000, // 5 minutes
  revalidateOnMount: true,
};

export const userSwrConfig: SWRConfiguration = {
  ...swrConfig,
  refreshInterval: 60000, // 1 minute
  revalidateOnFocus: true,
};

export const staticSwrConfig: SWRConfiguration = {
  ...swrConfig,
  refreshInterval: 0,
  revalidateOnMount: false,
  dedupingInterval: 3600000, // 1 hour
};
