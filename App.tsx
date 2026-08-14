import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, PaperProvider, Text } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LockScreen } from '@/screens/Auth/LockScreen';
import { PinSetupScreen } from '@/screens/Auth/PinSetupScreen';
import { PrivacyOverlay } from '@/components/common/PrivacyOverlay';
import { defaultCategories } from '@/constants/seedCategories';
import { colors, paperTheme, spacing } from '@/constants/theme';
import { db } from '@/db/client';
import { useDatabaseMigrations } from '@/db/migrationsHook';
import { seedDefaultCategories } from '@/db/repositories/categories';
import { useAppSwitcherPrivacy } from '@/hooks/useAppSwitcherPrivacy';
import { useAutoLock } from '@/hooks/useAutoLock';
import { useAutomaticBackup } from '@/hooks/useAutomaticBackup';
import { useRecurringGeneration } from '@/hooks/useRecurringGeneration';
import { RootNavigator } from '@/navigation/RootNavigator';
import { getAuthSettings, isAppLockConfigured } from '@/services/auth/authService';
import { registerRecurringBackgroundTask } from '@/services/backgroundTask';
import { ensureNotificationSetup } from '@/services/notifications';
import { useAuthStore } from '@/store/authStore';

function AppShell() {
  const { success, error } = useDatabaseMigrations();
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (!success) {
      return;
    }
    seedDefaultCategories(db, defaultCategories).then(() => setSeeded(true));
    ensureNotificationSetup();
    registerRecurringBackgroundTask();
  }, [success]);

  useRecurringGeneration(seeded);
  useAutomaticBackup(seeded);

  if (error) {
    return (
      <View style={styles.center}>
        <Text variant="bodyMedium">Erro ao preparar o banco de dados: {error.message}</Text>
      </View>
    );
  }

  if (!success || !seeded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator animating size="large" color={colors.primary} />
      </View>
    );
  }

  return <RootNavigator />;
}

export default function App() {
  const authStatus = useAutoLock();
  const hideFromAppSwitcher = useAppSwitcherPrivacy();
  const setStatus = useAuthStore((state) => state.setStatus);
  const setSettings = useAuthStore((state) => state.setSettings);

  useEffect(() => {
    isAppLockConfigured().then(async (configured) => {
      if (!configured) {
        setStatus('needs_setup');
        return;
      }
      const settings = await getAuthSettings();
      if (settings) {
        setSettings(settings);
      }
      setStatus('locked');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        {authStatus === 'loading' && (
          <View style={styles.center}>
            <ActivityIndicator animating size="large" color={colors.primary} />
          </View>
        )}
        {authStatus === 'needs_setup' && <PinSetupScreen />}
        {authStatus === 'locked' && <LockScreen />}
        {authStatus === 'unlocked' && <AppShell />}
        {hideFromAppSwitcher && <PrivacyOverlay />}
        <StatusBar style="auto" />
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
});
