import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { ProgressBar, Text } from 'react-native-paper';

import { PlaceholderScreen } from '@/components/common/PlaceholderScreen';
import { colors, spacing } from '@/constants/theme';
import { useBudgets, type BudgetWithProgress } from '@/hooks/useBudgets';
import { useCategories } from '@/hooks/useCategories';
import { centsToBRL } from '@/utils/currency';
import { currentMonth } from '@/utils/date';

type BudgetsTabProps = {
  onSelectBudget: (categoryId: number | null) => void;
};

export function BudgetsTab({ onSelectBudget }: BudgetsTabProps) {
  const month = currentMonth();
  const { budgets } = useBudgets(month);
  const { categories } = useCategories('expense');

  const categoryById = new Map(categories.map((category) => [category.id, category]));

  function renderItem({ item }: { item: BudgetWithProgress }) {
    const category = item.categoryId ? categoryById.get(item.categoryId) : undefined;
    const barColor = item.progress.isOverBudget ? colors.expense : colors.primary;

    return (
      <Pressable onPress={() => onSelectBudget(item.categoryId)} style={styles.row}>
        <Text variant="bodyMedium">{category?.name ?? 'Orçamento geral'}</Text>
        <ProgressBar
          progress={Math.min(item.progress.percent / 100, 1)}
          color={barColor}
          style={styles.progressBar}
        />
        <Text variant="bodySmall" style={item.progress.isOverBudget ? styles.overBudgetText : undefined}>
          {centsToBRL(item.progress.spentCents)} de {centsToBRL(item.progress.limitCents)}
          {item.progress.isOverBudget ? ' · estourado' : ''}
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      {budgets.length === 0 ? (
        <PlaceholderScreen
          title="Nenhum orçamento"
          description="Toque no botão + para definir um limite de gastos por categoria."
        />
      ) : (
        <FlatList data={budgets} keyExtractor={(item) => String(item.id)} renderItem={renderItem} />
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
  overBudgetText: {
    color: colors.expense,
  },
});
