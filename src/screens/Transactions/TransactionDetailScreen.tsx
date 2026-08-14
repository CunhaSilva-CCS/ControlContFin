import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { colors, spacing } from '@/constants/theme';
import { db } from '@/db/client';
import { deleteTransaction, getTransaction } from '@/db/repositories/transactions';
import type { transactions } from '@/db/schema';
import type { TransactionsStackParamList } from '@/navigation/types';
import { useDataStore } from '@/store/dataStore';
import { centsToBRL } from '@/utils/currency';
import { formatDatePtBR } from '@/utils/date';

type Props = NativeStackScreenProps<TransactionsStackParamList, 'TransactionDetail'>;

type Transaction = typeof transactions.$inferSelect;

export function TransactionDetailScreen({ route, navigation }: Props) {
  const { transactionId } = route.params;
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const transactionsVersion = useDataStore((state) => state.version.transactions);

  useEffect(() => {
    getTransaction(db, transactionId)
      .then((row) => setTransaction(row ?? null))
      .catch(() => setLoadError('Não foi possível carregar esta transação.'));
  }, [transactionId, transactionsVersion]);

  async function handleDelete() {
    await deleteTransaction(db, transactionId);
    navigation.goBack();
  }

  if (loadError) {
    return (
      <View style={styles.container}>
        <Text variant="bodyMedium" style={styles.error}>
          {loadError}
        </Text>
      </View>
    );
  }

  if (!transaction) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text variant="displaySmall">{centsToBRL(transaction.amountCents)}</Text>
      <Text variant="bodyLarge">{transaction.description || 'Sem descrição'}</Text>
      <Text variant="bodyMedium">{formatDatePtBR(transaction.date)}</Text>

      <View style={styles.actions}>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('TransactionForm', { transactionId })}
        >
          Editar
        </Button>
        <Button mode="outlined" textColor="#C62828" onPress={handleDelete}>
          Excluir
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  error: {
    color: colors.expense,
  },
});
