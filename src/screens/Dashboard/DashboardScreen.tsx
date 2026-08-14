import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

import { TransactionRow, type TransactionRowData } from '@/components/transactions/TransactionRow';
import { colors, spacing } from '@/constants/theme';
import { useAccounts } from '@/hooks/useAccounts';
import { useAccountBalance, useTotalBalance } from '@/hooks/useAccountBalance';
import { useCategories } from '@/hooks/useCategories';
import { useTransactions } from '@/hooks/useTransactions';
import type { DashboardStackParamList, RootTabParamList } from '@/navigation/types';
import { centsToBRL } from '@/utils/currency';

type Props = CompositeScreenProps<
  NativeStackScreenProps<DashboardStackParamList, 'DashboardHome'>,
  BottomTabScreenProps<RootTabParamList>
>;

function AccountBalanceRow({ accountId, name }: { accountId: number; name: string }) {
  const { balanceCents } = useAccountBalance(accountId);
  return (
    <View style={styles.accountRow}>
      <Text variant="bodyMedium">{name}</Text>
      <Text variant="bodyMedium">{centsToBRL(balanceCents)}</Text>
    </View>
  );
}

export function DashboardScreen({ navigation }: Props) {
  const { totalCents } = useTotalBalance();
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const { transactions } = useTransactions();

  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const recentTransactions: TransactionRowData[] = transactions.slice(0, 5).map((transaction) => {
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
  });

  function openTransaction(transactionId: number) {
    navigation.navigate('Transactions', { screen: 'TransactionDetail', params: { transactionId } });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.balanceCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.balanceLabel}>
            Saldo total
          </Text>
          <Text variant="displaySmall">{centsToBRL(totalCents)}</Text>
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
              <AccountBalanceRow key={account.id} accountId={account.id} name={account.name} />
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
            <TransactionRow
              key={transaction.id}
              transaction={transaction}
              onPress={() => openTransaction(transaction.id)}
            />
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
  },
  balanceLabel: {
    color: colors.textSecondary,
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
});
