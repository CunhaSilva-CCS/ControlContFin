import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { PinPad } from '@/components/auth/PinPad';
import { colors, spacing } from '@/constants/theme';
import type { SettingsStackParamList } from '@/navigation/types';
import { changePin } from '@/services/auth/authService';
import { PIN_LENGTH } from '@/services/auth/pinPolicy';

type Props = NativeStackScreenProps<SettingsStackParamList, 'ChangePin'>;

type Step = 'current' | 'new' | 'confirm';

export function ChangePinScreen({ navigation }: Props) {
  const [step, setStep] = useState<Step>('current');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handlePinChange(value: string) {
    setError(null);
    setPin(value);

    if (value.length < PIN_LENGTH) {
      return;
    }

    if (step === 'current') {
      setCurrentPin(value);
      setPin('');
      setStep('new');
      return;
    }

    if (step === 'new') {
      setNewPin(value);
      setPin('');
      setStep('confirm');
      return;
    }

    if (step === 'confirm') {
      if (value !== newPin) {
        setError('Os PINs não coincidem. Tente novamente.');
        setPin('');
        setNewPin('');
        setStep('new');
        return;
      }

      const result = await changePin(currentPin, value);
      if (!result.success) {
        setError(result.reason ?? 'Não foi possível alterar o PIN.');
        setPin('');
        setCurrentPin('');
        setNewPin('');
        setStep('current');
        return;
      }

      navigation.goBack();
    }
  }

  const titles: Record<Step, string> = {
    current: 'Digite seu PIN atual',
    new: 'Digite o novo PIN',
    confirm: 'Confirme o novo PIN',
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        {titles[step]}
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
  error: {
    textAlign: 'center',
    color: colors.expense,
  },
});
