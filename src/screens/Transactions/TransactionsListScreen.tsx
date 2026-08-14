import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlatList, StyleSheet, View } from 'react-native';
import { FAB } from 'react-native-paper';

import { PlaceholderScreen } from '@/components/common/PlaceholderScreen';
import { TransactionRow, type TransactionRowData } from '@/components/transactions/TransactionRow';
import { spacing } from '@/constants/theme';
import { useCategories } from '@/hooks/useCategories';
import { useTransactions } from '@/hooks/useTransactions';
import type { TransactionsStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<TransactionsStackParamList, 'TransactionsList'>;

export function TransactionsListScreen({ navigation }: Props) {
  const { transactions } = useTransactions();
  const { categories } = useCategories();

  const categoryById = new Map(categories.map((category) => [category.id, category]));

  const rows: TransactionRowData[] = transactions.map((transaction) => {
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

  return (
    <View style={styles.container}>
      {rows.length === 0 ? (
        <PlaceholderScreen
          title="Nenhuma transação"
          description="Toque no botão + para registrar sua primeira receita ou despesa."
        />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <TransactionRow
              transaction={item}
              onPress={() => navigation.navigate('TransactionDetail', { transactionId: item.id })}
            />
          )}
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
});
