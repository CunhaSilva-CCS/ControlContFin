import { memo, useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { ProgressBar, Text } from 'react-native-paper';

import { PlaceholderScreen } from '@/components/common/PlaceholderScreen';
import { colors, spacing } from '@/constants/theme';
import { useGoals, type GoalWithProgress } from '@/hooks/useGoals';
import { centsToBRL } from '@/utils/currency';

type GoalsTabProps = {
  onSelectGoal: (goalId: number) => void;
};

type GoalRowProps = {
  goal: GoalWithProgress;
  onPress: (goalId: number) => void;
};

const GoalRow = memo(function GoalRow({ goal, onPress }: GoalRowProps) {
  return (
    <Pressable onPress={() => onPress(goal.id)} style={styles.row}>
      <Text variant="bodyMedium">{goal.name}</Text>
      <ProgressBar
        progress={goal.progress.percent / 100}
        color={goal.progress.isComplete ? colors.income : colors.primary}
        style={styles.progressBar}
      />
      <Text variant="bodySmall">
        {centsToBRL(goal.progress.currentCents)} de {centsToBRL(goal.progress.targetCents)}
        {goal.progress.isComplete ? ' · concluída' : ''}
      </Text>
    </Pressable>
  );
});

export function GoalsTab({ onSelectGoal }: GoalsTabProps) {
  const { goals, loading, error } = useGoals();

  const renderItem = useCallback(
    ({ item }: { item: GoalWithProgress }) => <GoalRow goal={item} onPress={onSelectGoal} />,
    [onSelectGoal],
  );

  if (loading) {
    return null;
  }

  return (
    <View style={styles.container}>
      {error && (
        <Text variant="bodyMedium" style={styles.error}>
          {error.message}
        </Text>
      )}
      {goals.length === 0 ? (
        <PlaceholderScreen
          title="Nenhuma meta"
          description="Toque no botão + para criar sua primeira meta de economia."
        />
      ) : (
        <FlatList data={goals} keyExtractor={(item) => String(item.id)} renderItem={renderItem} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  error: {
    color: colors.expense,
    padding: spacing.md,
  },
});
