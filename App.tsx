import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, PaperProvider, Text } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { defaultCategories } from '@/constants/seedCategories';
import { colors, paperTheme, spacing } from '@/constants/theme';
import { db } from '@/db/client';
import { useDatabaseMigrations } from '@/db/migrationsHook';
import { seedDefaultCategories } from '@/db/repositories/categories';
import { useAutomaticBackup } from '@/hooks/useAutomaticBackup';
import { useRecurringGeneration } from '@/hooks/useRecurringGeneration';
import { RootNavigator } from '@/navigation/RootNavigator';
import { registerRecurringBackgroundTask } from '@/services/backgroundTask';
import { ensureNotificationSetup } from '@/services/notifications';

export default function App() {
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

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <RootNavigator />
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
