import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, SegmentedButtons, Text, TextInput } from 'react-native-paper';

import { AccountPicker } from '@/components/transactions/AccountPicker';
import { AmountInput } from '@/components/common/AmountInput';
import { CategoryPicker } from '@/components/transactions/CategoryPicker';
import { DateField } from '@/components/common/DateField';
import { frequencyLabels } from '@/constants/recurringFrequency';
import { colors, spacing } from '@/constants/theme';
import { db } from '@/db/client';
import {
  createRecurringRule,
  deleteRecurringRule,
  getRecurringRule,
  updateRecurringRule,
} from '@/db/repositories/recurringRules';
import { recurringFrequencyValues, type RecurringFrequency } from '@/db/schema';
import { useAccounts } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';
import type { SettingsStackParamList } from '@/navigation/types';
import { cancelRecurringReminder, scheduleRecurringReminder } from '@/services/notifications';
import { todayISODate } from '@/utils/date';

type Props = NativeStackScreenProps<SettingsStackParamList, 'RecurringRuleForm'>;

export function RecurringRuleFormScreen({ route, navigation }: Props) {
  const ruleId = route.params?.ruleId;
  const isEditing = ruleId !== undefined;

  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [accountId, setAccountId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [amountCents, setAmountCents] = useState(0);
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<RecurringFrequency>('monthly');
  const [interval, setInterval] = useState('1');
  const [startDate, setStartDate] = useState(todayISODate());
  const [notifyBeforeDays, setNotifyBeforeDays] = useState('1');
  const [active, setActive] = useState(true);
  const [existingNotificationId, setExistingNotificationId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const { accounts } = useAccounts();
  const { categories } = useCategories(type);

  useEffect(() => {
    if (accountId === null && accounts.length > 0) {
      setAccountId(accounts[0].id);
    }
  }, [accounts, accountId]);

  useEffect(() => {
    if (!isEditing || !ruleId) {
      return;
    }
    getRecurringRule(db, ruleId)
      .then((existing) => {
        if (!existing) {
          return;
        }
        setType(existing.type === 'income' ? 'income' : 'expense');
        setAccountId(existing.accountId);
        setCategoryId(existing.categoryId);
        setAmountCents(existing.amountCents);
        setDescription(existing.description ?? '');
        setFrequency(existing.frequency);
        setInterval(String(existing.interval));
        setStartDate(existing.startDate);
        setNotifyBeforeDays(String(existing.notifyBeforeDays));
        setActive(existing.active);
        setExistingNotificationId(existing.notificationId);
      })
      .catch(() => setLoadError('Não foi possível carregar esta recorrência.'));
  }, [isEditing, ruleId]);

  const parsedInterval = Math.max(1, Number.parseInt(interval, 10) || 1);
  const parsedNotifyBeforeDays = Math.max(0, Number.parseInt(notifyBeforeDays, 10) || 0);
  const canSave = accountId !== null && amountCents > 0;

  async function handleSave() {
    if (!canSave || accountId === null) {
      return;
    }

    await cancelRecurringReminder(existingNotificationId);
    const notificationId = await scheduleRecurringReminder({
      title: 'Lançamento recorrente',
      body: description || 'Você tem uma transação recorrente programada.',
      nextRunDate: startDate,
      notifyBeforeDays: parsedNotifyBeforeDays,
    });

    const input = {
      accountId,
      categoryId,
      type,
      amountCents,
      description: description || null,
      frequency,
      interval: parsedInterval,
      startDate,
      nextRunDate: startDate,
      notifyBeforeDays: parsedNotifyBeforeDays,
      active,
      notificationId,
    };

    if (isEditing && ruleId) {
      await updateRecurringRule(db, ruleId, input);
    } else {
      await createRecurringRule(db, input);
    }
    navigation.goBack();
  }

  async function handleDelete() {
    if (!ruleId) {
      return;
    }
    await cancelRecurringReminder(existingNotificationId);
    await deleteRecurringRule(db, ruleId);
    navigation.goBack();
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
        onValueChange={(value) => setType(value as 'income' | 'expense')}
        buttons={[
          { value: 'expense', label: 'Despesa' },
          { value: 'income', label: 'Receita' },
        ]}
      />

      <AmountInput valueCents={amountCents} onChangeCents={setAmountCents} />

      <TextInput
        label="Descrição"
        mode="outlined"
        value={description}
        onChangeText={setDescription}
      />

      <AccountPicker accounts={accounts} selectedId={accountId} onSelect={setAccountId} />
      <CategoryPicker categories={categories} selectedId={categoryId} onSelect={setCategoryId} />

      <SegmentedButtons
        value={frequency}
        onValueChange={(value) => setFrequency(value as RecurringFrequency)}
        buttons={recurringFrequencyValues.map((value) => ({
          value,
          label: frequencyLabels[value],
        }))}
      />

      <TextInput
        label="Repetir a cada (intervalo)"
        mode="outlined"
        keyboardType="numeric"
        value={interval}
        onChangeText={setInterval}
      />

      <DateField valueISODate={startDate} onChange={setStartDate} label="Primeira ocorrência" />

      <TextInput
        label="Avisar quantos dias antes"
        mode="outlined"
        keyboardType="numeric"
        value={notifyBeforeDays}
        onChangeText={setNotifyBeforeDays}
      />

      <SegmentedButtons
        value={active ? 'active' : 'paused'}
        onValueChange={(value) => setActive(value === 'active')}
        buttons={[
          { value: 'active', label: 'Ativa' },
          { value: 'paused', label: 'Pausada' },
        ]}
      />
      <Button mode="contained" onPress={handleSave} disabled={!canSave} style={styles.saveButton}>
        Salvar
      </Button>

      {isEditing && (
        <Button mode="outlined" textColor={colors.expense} onPress={handleDelete}>
          Excluir
        </Button>
      )}
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
