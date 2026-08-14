import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, PaperProvider, Text } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LockScreen } from '@/screens/Auth/LockScreen';
import { PinSetupScreen } from '@/screens/Auth/PinSetupScreen';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { PrivacyOverlay } from '@/components/common/PrivacyOverlay';
import { defaultCategories } from '@/constants/seedCategories';
import { colors, paperTheme, spacing } from '@/constants/theme';
import { db, dbOpenError, resetDatabaseAfterOpenFailure } from '@/db/client';
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

function DatabaseRecoveryScreen() {
  const [resetting, setResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  async function handleReset() {
    setResetting(true);
    await resetDatabaseAfterOpenFailure();
    setResetting(false);
    setResetDone(true);
  }

  if (resetDone) {
    return (
      <View style={styles.center}>
        <Text variant="titleMedium" style={styles.recoveryText}>
          Pronto. Feche o app completamente e abra novamente para continuar.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.center}>
      <Text variant="titleMedium" style={styles.recoveryText}>
        Não foi possível abrir o banco de dados local.
      </Text>
      <Text variant="bodyMedium" style={styles.recoveryText}>
        Isso pode acontecer se o aparelho foi restaurado de um backup do sistema, já que a chave
        de segurança do banco fica vinculada apenas a este aparelho. Recomeçar do zero apaga os
        dados locais atuais (um backup exportado manualmente pode ser reimportado depois em
        Ajustes → Backup).
      </Text>
      <Button mode="contained" onPress={handleReset} loading={resetting} disabled={resetting}>
        Recomeçar do zero
      </Button>
    </View>
  );
}

function AppShell() {
  const { success, error } = useDatabaseMigrations();
  const [seeded, setSeeded] = useState(false);

  const [seedError, setSeedError] = useState<string | null>(null);

  useEffect(() => {
    if (!success) {
      return;
    }
    seedDefaultCategories(db, defaultCategories)
      .then(() => setSeeded(true))
      .catch(() => setSeedError('Não foi possível preparar os dados iniciais do app.'));
    ensureNotificationSetup().catch((err: unknown) =>
      console.error('Falha ao configurar notificações', err),
    );
    registerRecurringBackgroundTask().catch((err: unknown) =>
      console.error('Falha ao registrar tarefa em segundo plano', err),
    );
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

  if (seedError) {
    return (
      <View style={styles.center}>
        <Text variant="bodyMedium">{seedError}</Text>
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
    isAppLockConfigured()
      .then(async (configured) => {
        if (!configured) {
          setStatus('needs_setup');
          return;
        }
        const settings = await getAuthSettings();
        if (settings) {
          setSettings(settings);
        }
        setStatus('locked');
      })
      .catch((err: unknown) => console.error('Falha ao verificar configuração de bloqueio', err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <ErrorBoundary>
          {dbOpenError ? (
            <DatabaseRecoveryScreen />
          ) : (
            <>
              {authStatus === 'loading' && (
                <View style={styles.center}>
                  <ActivityIndicator animating size="large" color={colors.primary} />
                </View>
              )}
              {authStatus === 'needs_setup' && <PinSetupScreen />}
              {authStatus === 'locked' && <LockScreen />}
              {authStatus === 'unlocked' && <AppShell />}
            </>
          )}
          {hideFromAppSwitcher && <PrivacyOverlay />}
        </ErrorBoundary>
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
  recoveryText: {
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});
