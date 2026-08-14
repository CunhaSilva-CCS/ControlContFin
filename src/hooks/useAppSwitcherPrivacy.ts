import { useEffect, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

/**
 * True whenever the app isn't the active foreground app — covers the
 * inactive/background states the OS uses when generating the app-switcher
 * preview. Meant to drive an immediate cover-up overlay, independent of the
 * (much slower) auto-lock timer in useAutoLock, so account balances and
 * transactions never appear in the recent-apps thumbnail.
 */
export function useAppSwitcherPrivacy(): boolean {
  const [hidden, setHidden] = useState(AppState.currentState !== 'active');

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      setHidden(nextState !== 'active');
    });
    return () => subscription.remove();
  }, []);

  return hidden;
}
