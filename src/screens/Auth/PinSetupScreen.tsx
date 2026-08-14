import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { PinPad } from '@/components/auth/PinPad';
import { colors, spacing } from '@/constants/theme';
import { DEFAULT_AUTO_LOCK_MINUTES, setBiometricEnabled, setupPin } from '@/services/auth/authService';
import { isBiometricAvailable } from '@/services/auth/biometricAuth';
import { PIN_LENGTH } from '@/services/auth/pinPolicy';
import { useAuthStore } from '@/store/authStore';

type Step = 'create' | 'confirm' | 'biometric';

export function PinSetupScreen() {
  const [step, setStep] = useState<Step>('create');
  const [firstPin, setFirstPin] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [biometricError, setBiometricError] = useState<string | null>(null);
  const setStatus = useAuthStore((state) => state.setStatus);
  const setSettings = useAuthStore((state) => state.setSettings);

  async function handlePinChange(value: string) {
    setError(null);
    setPin(value);

    if (value.length < PIN_LENGTH) {
      return;
    }

    if (step === 'create') {
      setFirstPin(value);
      setPin('');
      setStep('confirm');
      return;
    }

    if (step === 'confirm') {
      if (value !== firstPin) {
        setError('Os PINs não coincidem. Tente novamente.');
        setPin('');
        setFirstPin('');
        setStep('create');
        return;
      }

      const result = await setupPin(value);
      if (!result.success) {
        setError(result.reason ?? 'Não foi possível salvar o PIN.');
        setPin('');
        setFirstPin('');
        setStep('create');
        return;
      }

      const canUseBiometrics = await isBiometricAvailable();
      if (canUseBiometrics) {
        setStep('biometric');
      } else {
        finishSetup(false);
      }
    }
  }

  function finishSetup(biometricEnabled: boolean) {
    setSettings({ biometricEnabled, autoLockMinutes: DEFAULT_AUTO_LOCK_MINUTES });
    setStatus('unlocked');
  }

  async function handleEnableBiometric(enabled: boolean) {
    if (!enabled) {
      finishSetup(false);
      return;
    }

    try {
      await setBiometricEnabled(true);
      finishSetup(true);
    } catch {
      // The PIN itself was already saved successfully — a failure to enable
      // the optional biometric factor shouldn't block access to the app, but
      // finishSetup() below unmounts this screen immediately, so the error
      // must be shown and acknowledged first rather than set and discarded.
      setBiometricError(
        'Não foi possível ativar a biometria agora. Você pode continuar só com o PIN e tentar de novo depois em Ajustes → Segurança.',
      );
    }
  }

  if (step === 'biometric') {
    return (
      <View style={styles.container}>
        <Text variant="headlineSmall" style={styles.title}>
          Usar biometria também?
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Com a autenticação em duas etapas ativada, além do PIN você também vai precisar
          confirmar sua digital ou reconhecimento facial para abrir o app.
        </Text>
        {biometricError && (
          <Text variant="bodyMedium" style={styles.error}>
            {biometricError}
          </Text>
        )}
        {!biometricError && (
          <Button mode="contained" style={styles.actionButton} onPress={() => handleEnableBiometric(true)}>
            Ativar biometria (recomendado)
          </Button>
        )}
        <Button mode="outlined" onPress={() => finishSetup(false)}>
          {biometricError ? 'Continuar sem biometria' : 'Usar apenas PIN'}
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        {step === 'create' ? 'Crie um PIN' : 'Confirme o PIN'}
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        {step === 'create'
          ? 'Esse PIN protege o acesso aos seus dados financeiros neste aparelho.'
          : 'Digite o mesmo PIN novamente.'}
      </Text>
      {error && (
        <Text variant="bodyMedium" style={styles.error}>
          {error}
        </Text>
      )}
      <PinPad value={pin} onChange={handlePinChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  error: {
    textAlign: 'center',
    color: colors.expense,
  },
  actionButton: {
    marginBottom: spacing.sm,
  },
});
