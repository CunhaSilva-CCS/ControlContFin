import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { useAuthStore } from '@/store/authStore';

/**
 * Re-locks the app once it has spent more than `autoLockMinutes` in the
 * background/inactive state. Only acts while the app is currently unlocked.
 */
export function useAutoLock() {
  const status = useAuthStore((state) => state.status);
  const autoLockMinutes = useAuthStore((state) => state.autoLockMinutes);
  const setStatus = useAuthStore((state) => state.setStatus);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const backgroundedAtMs = useRef<number | null>(null);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const previousState = appState.current;
      appState.current = nextState;

      if (nextState.match(/inactive|background/) && previousState === 'active') {
        backgroundedAtMs.current = Date.now();
        return;
      }

      if (nextState === 'active' && previousState.match(/inactive|background/)) {
        const wasBackgroundedAt = backgroundedAtMs.current;
        backgroundedAtMs.current = null;
        if (
          wasBackgroundedAt !== null &&
          useAuthStore.getState().status === 'unlocked' &&
          Date.now() - wasBackgroundedAt >= autoLockMinutes * 60_000
        ) {
          setStatus('locked');
        }
      }
    });

    return () => subscription.remove();
  }, [autoLockMinutes, setStatus]);

  return status;
}
