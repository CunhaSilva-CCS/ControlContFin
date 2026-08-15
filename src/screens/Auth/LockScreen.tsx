import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

import { PinPad } from '@/components/auth/PinPad';
import { colors, fontFamily, spacing } from '@/constants/theme';
import { resetAppLock, verifyPinAttempt } from '@/services/auth/authService';
import { authenticateWithBiometrics } from '@/services/auth/biometricAuth';
import { PIN_LENGTH } from '@/services/auth/pinPolicy';
import { useAuthStore } from '@/store/authStore';

function formatRemaining(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }
  const minutes = Math.ceil(totalSeconds / 60);
  return `${minutes} min`;
}

export function LockScreen() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [lockedUntilMs, setLockedUntilMs] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const biometricEnabled = useAuthStore((state) => state.biometricEnabled);
  const setStatus = useAuthStore((state) => state.setStatus);

  useEffect(() => {
    if (lockedUntilMs === null) {
      return;
    }
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [lockedUntilMs]);

  const isLockedOut = lockedUntilMs !== null && now < lockedUntilMs;

  async function requestBiometrics() {
    const success = await authenticateWithBiometrics('Confirme sua identidade para abrir o ControlContFin');
    if (success) {
      setStatus('unlocked');
    } else {
      setError('Autenticação biométrica não confirmada. Digite o PIN novamente.');
      setPin('');
    }
  }

  async function handlePinChange(value: string) {
    if (isLockedOut || checking) {
      return;
    }
    setError(null);
    setPin(value);

    if (value.length < PIN_LENGTH) {
      return;
    }

    setChecking(true);
    try {
      const result = await verifyPinAttempt(value);
      if (result.outcome === 'success') {
        setPin('');
        if (biometricEnabled) {
          await requestBiometrics();
        } else {
          setStatus('unlocked');
        }
        return;
      }

      setPin('');
      if (result.outcome === 'locked_out' || result.outcome === 'incorrect') {
        if (result.remainingMs > 0) {
          setLockedUntilMs(Date.now() + result.remainingMs);
          setNow(Date.now());
        }
        setError(
          result.outcome === 'locked_out'
            ? `Muitas tentativas. Tente novamente em ${formatRemaining(result.remainingMs)}.`
            : 'PIN incorreto.',
        );
      }
    } finally {
      setChecking(false);
    }
  }

  function handleForgotPin() {
    Alert.alert(
      'Esqueceu seu PIN?',
      'Seus dados financeiros não serão apagados, mas a proteção por PIN será removida e você precisará criar um novo PIN para continuar usando o app.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover PIN e criar um novo',
          style: 'destructive',
          onPress: async () => {
            await resetAppLock();
            setStatus('needs_setup');
          },
        },
      ],
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card} mode="contained">
        <Card.Content style={styles.cardContent}>
          <View style={styles.iconBadge}>
            <MaterialCommunityIcons name="lock" size={32} color={colors.accent} />
          </View>
          <Text variant="headlineSmall" style={styles.title}>
            Digite seu PIN
          </Text>

          {error && (
            <Text variant="bodyMedium" style={styles.error}>
              {error}
            </Text>
          )}
          {isLockedOut && (
            <Text variant="bodyMedium" style={styles.error}>
              Bloqueado por mais {formatRemaining(lockedUntilMs - now)}.
            </Text>
          )}

          <PinPad value={pin} onChange={handlePinChange} />

          {biometricEnabled && !isLockedOut && (
            <Pressable
              onPress={requestBiometrics}
              style={styles.biometricButton}
              accessibilityRole="button"
              accessibilityLabel="Usar biometria"
            >
              <MaterialCommunityIcons name="fingerprint" size={28} color={colors.surface} />
              <Text variant="bodyMedium" style={styles.biometricLabel}>
                Usar biometria
              </Text>
            </Pressable>
          )}
        </Card.Content>
      </Card>

      <Pressable onPress={handleForgotPin} accessibilityRole="button">
        <Text variant="bodySmall" style={styles.forgotPin}>
          Esqueci meu PIN
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.lg,
    backgroundColor: colors.primary,
  },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  cardContent: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  title: {
    textAlign: 'center',
    fontFamily: fontFamily.serifSemiBold,
  },
  error: {
    textAlign: 'center',
    color: colors.expense,
  },
  biometricButton: {
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 24,
  },
  biometricLabel: {
    color: colors.surface,
  },
  forgotPin: {
    color: colors.surface,
    textDecorationLine: 'underline',
  },
});
