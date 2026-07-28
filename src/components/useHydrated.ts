'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';

/** Wait for Zustand persist to finish rehydrating from localStorage */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Check if persist has already rehydrated
    const unsubFinish = useStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    // Handle edge case where hydration already finished before we subscribed
    if (useStore.persist.hasHydrated()) {
      setHydrated(true);
    }

    return () => {
      unsubFinish();
    };
  }, []);

  return hydrated;
}
