import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, SegmentedButtons, Text, TextInput } from 'react-native-paper';

import { AccountPicker } from '@/components/transactions/AccountPicker';
import { CategoryPicker } from '@/components/transactions/CategoryPicker';
import { AmountInput } from '@/components/common/AmountInput';
import { DateField } from '@/components/common/DateField';
import { colors, spacing } from '@/constants/theme';
import { db } from '@/db/client';
import { useAccounts } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';
import { createTransaction, getTransaction, updateTransaction } from '@/db/repositories/transactions';
import type { TransactionType } from '@/db/schema';
import type { TransactionsStackParamList } from '@/navigation/types';
import { todayISODate } from '@/utils/date';

type Props = NativeStackScreenProps<TransactionsStackParamList, 'TransactionForm'>;

export function TransactionFormScreen({ route, navigation }: Props) {
  const transactionId = route.params?.transactionId;
  const isEditing = transactionId !== undefined;

  const [type, setType] = useState<TransactionType>('expense');
  const [accountId, setAccountId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [amountCents, setAmountCents] = useState(0);
  const [date, setDate] = useState(todayISODate());
  const [description, setDescription] = useState('');
  const [loaded, setLoaded] = useState(!isEditing);
  const [loadError, setLoadError] = useState<string | null>(null);

  const { accounts } = useAccounts();
  const { categories } = useCategories(type === 'transfer' ? undefined : type);

  useEffect(() => {
    if (accountId === null && accounts.length > 0) {
      setAccountId(accounts[0].id);
    }
  }, [accounts, accountId]);

  useEffect(() => {
    if (!isEditing || !transactionId) {
      return;
    }
    getTransaction(db, transactionId)
      .then((existing) => {
        if (existing) {
          setType(existing.type);
          setAccountId(existing.accountId);
          setCategoryId(existing.categoryId);
          setAmountCents(existing.amountCents);
          setDate(existing.date);
          setDescription(existing.description ?? '');
        }
        setLoaded(true);
      })
      .catch(() => {
        setLoadError('Não foi possível carregar esta transação.');
        setLoaded(true);
      });
  }, [isEditing, transactionId]);

  const canSave = accountId !== null && amountCents > 0;

  async function handleSave() {
    if (!canSave || accountId === null) {
      return;
    }
    const input = {
      accountId,
      categoryId,
      type,
      amountCents,
      date,
      description: description || null,
    };
    if (isEditing && transactionId) {
      await updateTransaction(db, transactionId, input);
    } else {
      await createTransaction(db, input);
    }
    navigation.goBack();
  }

  if (!loaded) {
    return null;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loadError && (
        <Text variant="bodyMedium" style={styles.error}>
          {loadError}
        </Text>
      )}
      <SegmentedButtons
        value={type}
        onValueChange={(value) => {
          setType(value as TransactionType);
          // The category list is filtered by type (line 35) — a category id
          // chosen under the old type may not belong to the new one.
          setCategoryId(null);
        }}
        buttons={[
          { value: 'expense', label: 'Despesa' },
          { value: 'income', label: 'Receita' },
        ]}
      />

      <AmountInput valueCents={amountCents} onChangeCents={setAmountCents} />

      <DateField valueISODate={date} onChange={setDate} />

      <TextInput
        label="Descrição"
        mode="outlined"
        value={description}
        onChangeText={setDescription}
      />

      <View style={styles.section}>
        <AccountPicker accounts={accounts} selectedId={accountId} onSelect={setAccountId} />
      </View>

      <View style={styles.section}>
        <CategoryPicker categories={categories} selectedId={categoryId} onSelect={setCategoryId} />
      </View>

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
  section: {
    gap: spacing.xs,
  },
  saveButton: {
    marginTop: spacing.md,
  },
  error: {
    color: colors.expense,
  },
});
