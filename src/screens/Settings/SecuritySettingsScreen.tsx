import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { List, SegmentedButtons, Switch, Text } from 'react-native-paper';

import { colors, spacing } from '@/constants/theme';
import type { SettingsStackParamList } from '@/navigation/types';
import { getAuthSettings, setAutoLockMinutes, setBiometricEnabled } from '@/services/auth/authService';
import { isBiometricAvailable } from '@/services/auth/biometricAuth';
import { useAuthStore } from '@/store/authStore';

type Props = NativeStackScreenProps<SettingsStackParamList, 'SecuritySettings'>;

const AUTO_LOCK_OPTIONS = [
  { value: '0', label: 'Imediato' },
  { value: '1', label: '1 min' },
  { value: '5', label: '5 min' },
  { value: '15', label: '15 min' },
];

export function SecuritySettingsScreen({ navigation }: Props) {
  const biometricEnabled = useAuthStore((state) => state.biometricEnabled);
  const autoLockMinutes = useAuthStore((state) => state.autoLockMinutes);
  const setSettings = useAuthStore((state) => state.setSettings);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    isBiometricAvailable()
      .then(setBiometricAvailable)
      .catch(() => setBiometricAvailable(false));
    getAuthSettings()
      .then((settings) => {
        if (settings) {
          setSettings(settings);
        }
      })
      .catch(() => setLoadError('Não foi possível carregar as configurações de segurança.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleToggleBiometric(value: boolean) {
    await setBiometricEnabled(value);
    setSettings({ biometricEnabled: value, autoLockMinutes });
  }

  async function handleChangeAutoLock(value: string) {
    const minutes = Number(value);
    await setAutoLockMinutes(minutes);
    setSettings({ biometricEnabled, autoLockMinutes: minutes });
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loadError && (
        <Text variant="bodyMedium" style={styles.error}>
          {loadError}
        </Text>
      )}
      <List.Item
        title="Alterar PIN"
        left={(props) => <List.Icon {...props} icon="lock-reset" />}
        onPress={() => navigation.navigate('ChangePin')}
      />

      <List.Item
        title="Autenticação em duas etapas (biometria)"
        description={
          biometricAvailable
            ? 'Exige biometria além do PIN para abrir o app'
            : 'Biometria não disponível ou não configurada neste aparelho'
        }
        left={(props) => <List.Icon {...props} icon="fingerprint" />}
        right={() => (
          <Switch
            value={biometricEnabled}
            disabled={!biometricAvailable}
            onValueChange={handleToggleBiometric}
          />
        )}
      />

      <Text variant="titleSmall" style={styles.sectionTitle}>
        Bloquear automaticamente após
      </Text>
      <SegmentedButtons
        value={String(autoLockMinutes)}
        onValueChange={handleChangeAutoLock}
        buttons={AUTO_LOCK_OPTIONS}
        style={styles.segmented}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    marginTop: spacing.md,
  },
  segmented: {
    marginTop: spacing.xs,
  },
  error: {
    color: colors.expense,
  },
});
