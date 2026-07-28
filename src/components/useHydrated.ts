'use client';

import { useEffect, useState } from 'react';

/** Check if the current user has authenticated (sessionStorage check) */
export function useHydrated() {
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  return ready;
}
