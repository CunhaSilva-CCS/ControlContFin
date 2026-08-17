import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo } from 'react';
import { FlatList, type ListRenderItemInfo, StyleSheet, View } from 'react-native';
import { Card, FAB, Text } from 'react-native-paper';

import { PlaceholderScreen } from '@/components/common/PlaceholderScreen';
import { TransactionRow, type TransactionRowData } from '@/components/transactions/TransactionRow';
import { colors, spacing } from '@/constants/theme';
import { useAccounts } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';
import { useLookup } from '@/hooks/useLookup';
import { useTransactions } from '@/hooks/useTransactions';
import type { TransactionsStackParamList } from '@/navigation/types';
import { centsToBRL } from '@/utils/currency';

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

  const accountTotals = useMemo(() => {
    const totalsByAccountId = new Map<number, number>();
    const addToAccount = (accountId: number, deltaCents: number) =>
      totalsByAccountId.set(accountId, (totalsByAccountId.get(accountId) ?? 0) + deltaCents);

    for (const transaction of transactions) {
      if (transaction.type === 'income') {
        addToAccount(transaction.accountId, transaction.amountCents);
      } else if (transaction.type === 'expense') {
        addToAccount(transaction.accountId, -transaction.amountCents);
      } else if (transaction.type === 'transfer') {
        addToAccount(transaction.accountId, -transaction.amountCents);
        if (transaction.transferAccountId !== null) {
          addToAccount(transaction.transferAccountId, transaction.amountCents);
        }
      }
    }

    return accounts
      .filter((account) => totalsByAccountId.has(account.id))
      .map((account) => ({
        accountId: account.id,
        accountName: account.name,
        totalCents: totalsByAccountId.get(account.id) ?? 0,
      }));
  }, [transactions, accounts]);

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
        <FlatList
          data={rows}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ListHeaderComponent={
            accountTotals.length > 0 ? (
              <Card style={styles.summaryCard} mode="contained">
                <Card.Content>
                  <Text variant="titleSmall">Movimentação por conta</Text>
                  <Text variant="bodySmall" style={styles.summarySubtitle}>
                    Soma das transações abaixo — não é o saldo da conta (que inclui o saldo
                    inicial e aparece no Início)
                  </Text>
                  {accountTotals.map(({ accountId, accountName, totalCents }) => (
                    <View key={accountId} style={styles.summaryRow}>
                      <Text variant="bodyMedium">{accountName}</Text>
                      <Text
                        variant="bodyMedium"
                        style={{ color: totalCents < 0 ? colors.expense : colors.income }}
                      >
                        {centsToBRL(totalCents)}
                      </Text>
                    </View>
                  ))}
                </Card.Content>
              </Card>
            ) : null
          }
        />
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
  summaryCard: {
    margin: spacing.md,
    marginBottom: spacing.sm,
  },
  summarySubtitle: {
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  error: {
    color: colors.expense,
    padding: spacing.md,
  },
});
