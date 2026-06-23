// src/hooks/useNetwork.ts
// expo-network doesn't expose an event listener, so we poll every 4 seconds.
// This gives us reliable offline detection without crashing.

import { useEffect, useRef, useState } from 'react';
import * as Network from 'expo-network';

export function useNetwork() {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkConnection = async () => {
    try {
      const state = await Network.getNetworkStateAsync();
      setIsConnected(state.isConnected !== false && state.isInternetReachable !== false);
    } catch {
      // If the check itself fails, assume connected to avoid false offline banners
      setIsConnected(true);
    }
  };

  useEffect(() => {
    // Run immediately on mount
    checkConnection();

    // Then poll every 4 seconds
    intervalRef.current = setInterval(checkConnection, 4000);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return isConnected;
}
