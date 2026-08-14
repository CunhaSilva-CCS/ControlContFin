import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { ProgressBar, Text } from 'react-native-paper';

import { PlaceholderScreen } from '@/components/common/PlaceholderScreen';
import { colors, spacing } from '@/constants/theme';
import { useGoals, type GoalWithProgress } from '@/hooks/useGoals';
import { centsToBRL } from '@/utils/currency';

type GoalsTabProps = {
  onSelectGoal: (goalId: number) => void;
};

export function GoalsTab({ onSelectGoal }: GoalsTabProps) {
  const { goals } = useGoals();

  function renderItem({ item }: { item: GoalWithProgress }) {
    return (
      <Pressable onPress={() => onSelectGoal(item.id)} style={styles.row}>
        <Text variant="bodyMedium">{item.name}</Text>
        <ProgressBar
          progress={item.progress.percent / 100}
          color={item.progress.isComplete ? colors.income : colors.primary}
          style={styles.progressBar}
        />
        <Text variant="bodySmall">
          {centsToBRL(item.progress.currentCents)} de {centsToBRL(item.progress.targetCents)}
          {item.progress.isComplete ? ' · concluída' : ''}
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
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
});
