import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, Chip, Text } from 'react-native-paper';

import { AmountInput } from '@/components/common/AmountInput';
import { CategoryPicker } from '@/components/transactions/CategoryPicker';
import { colors, spacing } from '@/constants/theme';
import { db } from '@/db/client';
import { listBudgets, upsertBudget } from '@/db/repositories/budgets';
import { useCategories } from '@/hooks/useCategories';
import type { BudgetsGoalsStackParamList } from '@/navigation/types';
import { currentMonth } from '@/utils/date';

type Props = NativeStackScreenProps<BudgetsGoalsStackParamList, 'BudgetForm'>;

export function BudgetFormScreen({ route, navigation }: Props) {
  const month = currentMonth();
  const initialCategoryId = route.params?.categoryId ?? null;

  const [isOverall, setIsOverall] = useState(initialCategoryId === null);
  const [categoryId, setCategoryId] = useState<number | null>(initialCategoryId);
  const [limitCents, setLimitCents] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { categories } = useCategories('expense');

  useEffect(() => {
    listBudgets(db, month)
      .then((budgets) => {
        const existing = budgets.find((budget) => budget.categoryId === initialCategoryId);
        if (existing) {
          setLimitCents(existing.limitCents);
        }
      })
      .catch(() => setLoadError('Não foi possível carregar o orçamento atual.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSave = (isOverall ? true : categoryId !== null) && limitCents > 0;

  async function handleSave() {
    if (!canSave) {
      return;
    }
    await upsertBudget(db, {
      categoryId: isOverall ? null : categoryId,
      month,
      limitCents,
    });
    navigation.goBack();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loadError && (
        <Text variant="bodyMedium" style={styles.error}>
          {loadError}
        </Text>
      )}
      <Chip
        selected={isOverall}
        onPress={() => {
          setIsOverall(true);
          setCategoryId(null);
        }}
      >
        Orçamento geral (todas as categorias)
      </Chip>

      <CategoryPicker
        categories={categories}
        selectedId={isOverall ? null : categoryId}
        onSelect={(id) => {
          setIsOverall(false);
          setCategoryId(id);
        }}
      />

      <AmountInput label="Limite mensal" valueCents={limitCents} onChangeCents={setLimitCents} />

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
  error: {
    color: colors.expense,
  },
});
