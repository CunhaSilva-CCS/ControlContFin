import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { runRecurringGeneration } from '@/services/runRecurringGeneration';
import { todayISODate } from '@/utils/date';

/**
 * Runs the recurring-transaction generation engine on mount and whenever the
 * app comes back to the foreground, which is the primary guarantee that
 * recurring transactions are generated (the background task is best-effort).
 */
export function useRecurringGeneration(enabled: boolean) {
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    runRecurringGeneration(todayISODate());

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        runRecurringGeneration(todayISODate());
      }
      appState.current = nextState;
    });

    return () => subscription.remove();
  }, [enabled]);
}
