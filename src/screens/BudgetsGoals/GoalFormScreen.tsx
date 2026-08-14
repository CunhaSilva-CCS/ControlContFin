import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, TextInput } from 'react-native-paper';

import { AmountInput } from '@/components/common/AmountInput';
import { ColorSwatchPicker } from '@/components/common/ColorSwatchPicker';
import { DateField } from '@/components/common/DateField';
import { accountColorPalette } from '@/constants/accountPresets';
import { spacing } from '@/constants/theme';
import { db } from '@/db/client';
import { createGoal, getGoal, updateGoal } from '@/db/repositories/goals';
import type { BudgetsGoalsStackParamList } from '@/navigation/types';
import { todayISODate } from '@/utils/date';

type Props = NativeStackScreenProps<BudgetsGoalsStackParamList, 'GoalForm'>;

const DEFAULT_ICON = 'flag';

export function GoalFormScreen({ route, navigation }: Props) {
  const goalId = route.params?.goalId;
  const isEditing = goalId !== undefined;

  const [name, setName] = useState('');
  const [targetCents, setTargetCents] = useState(0);
  const [deadline, setDeadline] = useState(todayISODate());
  const [hasDeadline, setHasDeadline] = useState(false);
  const [color, setColor] = useState(accountColorPalette[0]);

  useEffect(() => {
    if (!isEditing || !goalId) {
      return;
    }
    getGoal(db, goalId).then((existing) => {
      if (existing) {
        setName(existing.name);
        setTargetCents(existing.targetCents);
        setColor(existing.color);
        if (existing.deadline) {
          setDeadline(existing.deadline);
          setHasDeadline(true);
        }
      }
    });
  }, [isEditing, goalId]);

  const canSave = name.trim().length > 0 && targetCents > 0;

  async function handleSave() {
    if (!canSave) {
      return;
    }
    const input = {
      name: name.trim(),
      targetCents,
      deadline: hasDeadline ? deadline : null,
      color,
      icon: DEFAULT_ICON,
    };
    if (isEditing && goalId) {
      await updateGoal(db, goalId, input);
    } else {
      await createGoal(db, input);
    }
    navigation.goBack();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput label="Nome da meta" mode="outlined" value={name} onChangeText={setName} />

      <AmountInput label="Valor alvo" valueCents={targetCents} onChangeCents={setTargetCents} />

      <Button mode={hasDeadline ? 'contained-tonal' : 'outlined'} onPress={() => setHasDeadline((v) => !v)}>
        {hasDeadline ? 'Com prazo' : 'Definir prazo (opcional)'}
      </Button>

      {hasDeadline && <DateField valueISODate={deadline} onChange={setDeadline} label="Prazo" />}

      <ColorSwatchPicker colors={accountColorPalette} selectedColor={color} onSelect={setColor} />

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
  saveButton: {
    marginTop: spacing.md,
  },
});
