import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, SegmentedButtons, TextInput } from 'react-native-paper';

import { AmountInput } from '@/components/common/AmountInput';
import { accountColorPalette, accountIconByType, accountTypeLabels } from '@/constants/accountPresets';
import { spacing } from '@/constants/theme';
import { db } from '@/db/client';
import { createAccount, getAccount, updateAccount } from '@/db/repositories/accounts';
import { accountTypeValues, type AccountType } from '@/db/schema';
import type { SettingsStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<SettingsStackParamList, 'AccountForm'>;

export function AccountFormScreen({ route, navigation }: Props) {
  const accountId = route.params?.accountId;
  const isEditing = accountId !== undefined;

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('checking');
  const [initialBalanceCents, setInitialBalanceCents] = useState(0);
  const [color, setColor] = useState(accountColorPalette[0]);

  useEffect(() => {
    if (!isEditing || !accountId) {
      return;
    }
    getAccount(db, accountId).then((existing) => {
      if (existing) {
        setName(existing.name);
        setType(existing.type);
        setInitialBalanceCents(existing.initialBalanceCents);
        setColor(existing.color);
      }
    });
  }, [isEditing, accountId]);

  const canSave = name.trim().length > 0;

  async function handleSave() {
    if (!canSave) {
      return;
    }
    const input = {
      name: name.trim(),
      type,
      initialBalanceCents,
      color,
      icon: accountIconByType[type],
    };
    if (isEditing && accountId) {
      await updateAccount(db, accountId, input);
    } else {
      await createAccount(db, input);
    }
    navigation.goBack();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput label="Nome da conta" mode="outlined" value={name} onChangeText={setName} />

      <SegmentedButtons
        value={type}
        onValueChange={(value) => setType(value as AccountType)}
        buttons={accountTypeValues.map((value) => ({
          value,
          label: accountTypeLabels[value],
        }))}
      />

      <AmountInput
        label="Saldo inicial"
        valueCents={initialBalanceCents}
        onChangeCents={setInitialBalanceCents}
      />

      <View style={styles.colorRow}>
        {accountColorPalette.map((paletteColor) => (
          <View
            key={paletteColor}
            onTouchEnd={() => setColor(paletteColor)}
            style={[
              styles.colorSwatch,
              { backgroundColor: paletteColor },
              color === paletteColor && styles.colorSwatchSelected,
            ]}
          />
        ))}
      </View>

      <Button mode="contained" onPress={handleSave} disabled={!canSave} style={styles.saveButton}>
        Salvar
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    gap: spacing.md,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorSwatchSelected: {
    borderWidth: 3,
    borderColor: '#000000',
  },
  saveButton: {
    marginTop: spacing.md,
  },
});
