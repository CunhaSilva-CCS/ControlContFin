import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo } from 'react';
import { FlatList, type ListRenderItemInfo, StyleSheet, View } from 'react-native';
import { FAB, Text } from 'react-native-paper';

import { PlaceholderScreen } from '@/components/common/PlaceholderScreen';
import { TransactionRow, type TransactionRowData } from '@/components/transactions/TransactionRow';
import { colors, spacing } from '@/constants/theme';
import { useAccounts } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';
import { useLookup } from '@/hooks/useLookup';
import { useTransactions } from '@/hooks/useTransactions';
import type { TransactionsStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<TransactionsStackParamList, 'TransactionsList'>;

export function TransactionsListScreen({ navigation }: Props) {
  const { transactions, loading, error } = useTransactions();
  const { categories } = useCategories();
  const { accounts } = useAccounts();

  const categoryById = useLookup(categories);
  const accountById = useLookup(accounts);

  const rows: TransactionRowData[] = useMemo(
    () =>
      transactions.map((transaction) => {
        const category = transaction.categoryId ? categoryById.get(transaction.categoryId) : undefined;
        return {
          id: transaction.id,
          amountCents: transaction.amountCents,
          date: transaction.date,
          description: transaction.description,
          type: transaction.type,
          categoryName: category?.name ?? null,
          categoryIcon: category?.icon ?? null,
          categoryColor: category?.color ?? null,
          accountName: accountById.get(transaction.accountId)?.name ?? null,
          transferAccountName: transaction.transferAccountId
            ? (accountById.get(transaction.transferAccountId)?.name ?? null)
            : null,
        };
      }),
    [transactions, categoryById, accountById],
  );

  const openTransaction = useCallback(
    (transactionId: number) => {
      navigation.navigate('TransactionDetail', { transactionId });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<TransactionRowData>) => (
      <TransactionRow transaction={item} onPress={openTransaction} />
    ),
    [openTransaction],
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
      {rows.length === 0 ? (
        <PlaceholderScreen
          title="Nenhuma transação"
          description="Toque no botão + para registrar sua primeira receita ou despesa."
        />
      ) : (
        <FlatList data={rows} keyExtractor={(item) => String(item.id)} renderItem={renderItem} />
      )}
      <FAB
        icon="plus"
        style={styles.fab}
        accessibilityLabel="Nova transação"
        onPress={() => navigation.navigate('TransactionForm', undefined)}
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
  error: {
    color: colors.expense,
    padding: spacing.md,
  },
});
