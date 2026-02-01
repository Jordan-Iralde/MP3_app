import React from 'react';
import { useSleepTimerSync } from '@/hooks/use-sleep-timer-sync';

/**
 * Internal component that wraps sleep timer sync
 * Must be rendered INSIDE PlayerProvider
 */
export function PlayerSyncManager({ children }: { children: React.ReactNode }) {
  // This hook will work because we're inside PlayerProvider
  useSleepTimerSync();

  return <>{children}</>;
}
