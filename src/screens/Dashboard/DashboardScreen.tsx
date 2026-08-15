import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

import { TransactionRow, type TransactionRowData } from '@/components/transactions/TransactionRow';
import { colors, fontFamily, spacing } from '@/constants/theme';
import { useAccounts } from '@/hooks/useAccounts';
import { useAccountBalances } from '@/hooks/useAccountBalance';
import { useCategories } from '@/hooks/useCategories';
import { useTransactions } from '@/hooks/useTransactions';
import type { DashboardStackParamList, RootTabParamList } from '@/navigation/types';
import { centsToBRL } from '@/utils/currency';

type Props = CompositeScreenProps<
  NativeStackScreenProps<DashboardStackParamList, 'DashboardHome'>,
  BottomTabScreenProps<RootTabParamList>
>;

function AccountBalanceRow({ name, balanceCents }: { name: string; balanceCents: number }) {
  return (
    <View style={styles.accountRow}>
      <Text variant="bodyMedium">{name}</Text>
      <Text variant="bodyMedium">{centsToBRL(balanceCents)}</Text>
    </View>
  );
}

export function DashboardScreen({ navigation }: Props) {
  const { balances } = useAccountBalances();
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const { transactions } = useTransactions({ limit: 5 });

  const totalCents = Array.from(balances.values()).reduce((sum, cents) => sum + cents, 0);

  const categoryById = useMemo(() => new Map(categories.map((category) => [category.id, category])), [categories]);
  const recentTransactions: TransactionRowData[] = useMemo(
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
        };
      }),
    [transactions, categoryById],
  );

  const openTransaction = useCallback(
    (transactionId: number) => {
      navigation.navigate('Transactions', { screen: 'TransactionDetail', params: { transactionId } });
    },
    [navigation],
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.balanceCard} mode="contained">
        <Card.Content>
          <Text variant="titleMedium" style={styles.balanceLabel}>
            Saldo total
          </Text>
          <Text variant="displaySmall" style={styles.balanceAmount}>
            {centsToBRL(totalCents)}
          </Text>
        </Card.Content>
      </Card>

      <Text variant="titleMedium">Contas</Text>
      <Card>
        <Card.Content>
          {accounts.length === 0 ? (
            <Text variant="bodyMedium">
              Nenhuma conta cadastrada ainda. Vá em Ajustes {'>'} Contas para criar a primeira.
            </Text>
          ) : (
            accounts.map((account) => (
              <AccountBalanceRow
                key={account.id}
                name={account.name}
                balanceCents={balances.get(account.id) ?? 0}
              />
            ))
          )}
        </Card.Content>
      </Card>

      <Text variant="titleMedium">Últimas transações</Text>
      <Card>
        {recentTransactions.length === 0 ? (
          <Card.Content>
            <Text variant="bodyMedium">Nenhuma transação registrada ainda.</Text>
          </Card.Content>
        ) : (
          recentTransactions.map((transaction) => (
            <TransactionRow key={transaction.id} transaction={transaction} onPress={openTransaction} />
          ))
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  balanceCard: {
    marginBottom: spacing.sm,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  balanceLabel: {
    color: colors.surface,
    opacity: 0.8,
  },
  balanceAmount: {
    color: colors.surface,
    fontFamily: fontFamily.serif,
    marginTop: spacing.xs,
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
});
