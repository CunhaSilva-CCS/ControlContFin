import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';
import { FAB } from 'react-native-paper';

import { spacing } from '@/constants/theme';
import type { BudgetsGoalsStackParamList } from '@/navigation/types';

import { BudgetsTab } from './BudgetsTab';

type Props = NativeStackScreenProps<BudgetsGoalsStackParamList, 'BudgetsGoalsHome'>;

export function BudgetsGoalsScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <BudgetsTab
        onSelectBudget={(categoryId) => navigation.navigate('BudgetForm', { categoryId })}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        accessibilityLabel="Novo orçamento"
        onPress={() => navigation.navigate('BudgetForm', undefined)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
  },
});
