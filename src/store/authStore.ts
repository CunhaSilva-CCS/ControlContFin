import { create } from 'zustand';

import { DEFAULT_AUTO_LOCK_MINUTES } from '@/services/auth/authService';

export type AuthStatus = 'loading' | 'needs_setup' | 'locked' | 'unlocked';

type AuthStoreState = {
  status: AuthStatus;
  biometricEnabled: boolean;
  autoLockMinutes: number;
  setStatus: (status: AuthStatus) => void;
  setSettings: (settings: { biometricEnabled: boolean; autoLockMinutes: number }) => void;
};

export const useAuthStore = create<AuthStoreState>((set) => ({
  status: 'loading',
  biometricEnabled: false,
  autoLockMinutes: DEFAULT_AUTO_LOCK_MINUTES,
  setStatus: (status) => set({ status }),
  setSettings: (settings) => set(settings),
}));
