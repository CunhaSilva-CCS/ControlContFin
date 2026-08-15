import { memo, useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { ProgressBar, Text } from 'react-native-paper';

import { PlaceholderScreen } from '@/components/common/PlaceholderScreen';
import { colors, spacing } from '@/constants/theme';
import type { categories as categoriesTable } from '@/db/schema';
import { useBudgets, type BudgetWithProgress } from '@/hooks/useBudgets';
import { useCategories } from '@/hooks/useCategories';
import { useLookup } from '@/hooks/useLookup';
import { centsToBRL } from '@/utils/currency';
import { currentMonth } from '@/utils/date';

type Category = typeof categoriesTable.$inferSelect;

type BudgetsTabProps = {
  onSelectBudget: (categoryId: number | null) => void;
};

type BudgetRowProps = {
  budget: BudgetWithProgress;
  category: Category | undefined;
  onPress: (categoryId: number | null) => void;
};

const BudgetRow = memo(function BudgetRow({ budget, category, onPress }: BudgetRowProps) {
  const barColor = budget.progress.isOverBudget ? colors.expense : colors.primary;

  return (
    <Pressable onPress={() => onPress(budget.categoryId)} style={styles.row}>
      <Text variant="bodyMedium">{category?.name ?? 'Orçamento geral'}</Text>
      <ProgressBar
        progress={Math.min(budget.progress.percent / 100, 1)}
        color={barColor}
        style={styles.progressBar}
      />
      <Text variant="bodySmall" style={budget.progress.isOverBudget ? styles.overBudgetText : undefined}>
        {centsToBRL(budget.progress.spentCents)} de {centsToBRL(budget.progress.limitCents)}
        {budget.progress.isOverBudget ? ' · estourado' : ''}
      </Text>
    </Pressable>
  );
});

export function BudgetsTab({ onSelectBudget }: BudgetsTabProps) {
  const month = currentMonth();
  const { budgets, loading, error } = useBudgets(month);
  const { categories } = useCategories('expense');

  const categoryById = useLookup(categories);

  const renderItem = useCallback(
    ({ item }: { item: BudgetWithProgress }) => (
      <BudgetRow
        budget={item}
        category={item.categoryId ? categoryById.get(item.categoryId) : undefined}
        onPress={onSelectBudget}
      />
    ),
    [categoryById, onSelectBudget],
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
  error: {
    color: colors.expense,
    padding: spacing.md,
  },
});
