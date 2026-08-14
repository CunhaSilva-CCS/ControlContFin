import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FAB, SegmentedButtons } from 'react-native-paper';

import { spacing } from '@/constants/theme';
import type { BudgetsGoalsStackParamList } from '@/navigation/types';

import { BudgetsTab } from './BudgetsTab';
import { GoalsTab } from './GoalsTab';

type Props = NativeStackScreenProps<BudgetsGoalsStackParamList, 'BudgetsGoalsHome'>;

export function BudgetsGoalsScreen({ navigation }: Props) {
  const [view, setView] = useState<'budgets' | 'goals'>('budgets');

  return (
    <View style={styles.container}>
      <SegmentedButtons
        value={view}
        onValueChange={(value) => setView(value as 'budgets' | 'goals')}
        style={styles.segmented}
        buttons={[
          { value: 'budgets', label: 'Orçamentos' },
          { value: 'goals', label: 'Metas' },
        ]}
      />

      {view === 'budgets' ? (
        <BudgetsTab
          onSelectBudget={(categoryId) => navigation.navigate('BudgetForm', { categoryId })}
        />
      ) : (
        <GoalsTab onSelectGoal={(goalId) => navigation.navigate('GoalContribute', { goalId })} />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() =>
          view === 'budgets'
            ? navigation.navigate('BudgetForm', undefined)
            : navigation.navigate('GoalForm', undefined)
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  segmented: {
    margin: spacing.md,
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
  },
});
