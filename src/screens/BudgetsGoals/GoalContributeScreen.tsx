import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, ProgressBar, Text } from 'react-native-paper';

import { AmountInput } from '@/components/common/AmountInput';
import { colors, spacing } from '@/constants/theme';
import { db } from '@/db/client';
import { contributeToGoal, deleteGoal, getGoal } from '@/db/repositories/goals';
import type { BudgetsGoalsStackParamList } from '@/navigation/types';
import { calculateGoalProgress } from '@/services/goalCalculations';
import { useDataStore } from '@/store/dataStore';
import { centsToBRL } from '@/utils/currency';
import { todayISODate } from '@/utils/date';
import type { goals } from '@/db/schema';

type Props = NativeStackScreenProps<BudgetsGoalsStackParamList, 'GoalContribute'>;

type Goal = typeof goals.$inferSelect;

export function GoalContributeScreen({ route, navigation }: Props) {
  const { goalId } = route.params;
  const [goal, setGoal] = useState<Goal | null>(null);
  const [contributionCents, setContributionCents] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const goalsVersion = useDataStore((state) => state.version.goals);

  useEffect(() => {
    getGoal(db, goalId)
      .then((row) => {
        setGoal(row ?? null);
        setLoaded(true);
      })
      .catch(() => {
        setLoadError('Não foi possível carregar esta meta.');
        setLoaded(true);
      });
  }, [goalId, goalsVersion]);

  async function handleContribute() {
    if (contributionCents <= 0) {
      return;
    }
    await contributeToGoal(db, goalId, contributionCents, todayISODate());
    navigation.goBack();
  }

  async function handleDelete() {
    await deleteGoal(db, goalId);
    navigation.goBack();
  }

  if (!loaded) {
    return null;
  }

  if (loadError) {
    return (
      <View style={styles.container}>
        <Text variant="bodyMedium" style={styles.error}>
          {loadError}
        </Text>
      </View>
    );
  }

  if (!goal) {
    return (
      <View style={styles.container}>
        <Text variant="bodyMedium">Meta não encontrada.</Text>
      </View>
    );
  }

  const progress = calculateGoalProgress(goal.currentCents, goal.targetCents);

  return (
    <View style={styles.container}>
      <Text variant="titleLarge">{goal.name}</Text>
      <ProgressBar
        progress={progress.percent / 100}
        color={progress.isComplete ? colors.income : colors.primary}
        style={styles.progressBar}
      />
      <Text variant="bodyMedium">
        {centsToBRL(goal.currentCents)} de {centsToBRL(goal.targetCents)}
      </Text>

      <AmountInput label="Adicionar valor" valueCents={contributionCents} onChangeCents={setContributionCents} />

      <Button mode="contained" onPress={handleContribute} disabled={contributionCents <= 0}>
        Contribuir
      </Button>
      <Button
        mode="outlined"
        onPress={() => navigation.navigate('GoalForm', { goalId })}
        style={styles.secondaryButton}
      >
        Editar meta
      </Button>
      <Button mode="outlined" textColor={colors.expense} onPress={handleDelete}>
        Excluir meta
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
  },
  secondaryButton: {
    marginTop: spacing.sm,
  },
  error: {
    color: colors.expense,
  },
});
