import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, List, SegmentedButtons, Switch, Text, TextInput } from 'react-native-paper';

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
import type { TransactionsStackParamList } from '@/navigation/types';
import { cancelRecurringReminder, scheduleRecurringReminder } from '@/services/notifications';
import { runRecurringGeneration } from '@/services/runRecurringGeneration';
import { todayISODate } from '@/utils/date';

type Props = NativeStackScreenProps<TransactionsStackParamList, 'RecurringRuleForm'>;

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
  const [isSubscription, setIsSubscription] = useState(false);
  const [provider, setProvider] = useState('');
  const [existingNotificationId, setExistingNotificationId] = useState<string | null>(null);
  const [existingNextRunDate, setExistingNextRunDate] = useState<string | null>(null);
  const [hasGeneratedBefore, setHasGeneratedBefore] = useState(false);
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
        setIsSubscription(existing.isSubscription);
        setProvider(existing.provider ?? '');
        setExistingNotificationId(existing.notificationId);
        setExistingNextRunDate(existing.nextRunDate);
        setHasGeneratedBefore(existing.lastGeneratedDate !== null);
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

    // If the rule already generated at least one occurrence, its nextRunDate
    // has advanced past startDate — editing must preserve that progress
    // (not rewind it back to startDate), or the immediate
    // runRecurringGeneration() call below would replay/duplicate every past
    // occurrence up to today. But if it has NEVER fired yet, nextRunDate
    // should still track startDate edits (e.g. pushing a not-yet-due rule
    // out by a month), so only pin it once there's real progress to protect.
    const nextRunDate =
      isEditing && hasGeneratedBefore && existingNextRunDate ? existingNextRunDate : startDate;

    await cancelRecurringReminder(existingNotificationId);
    const notificationId = await scheduleRecurringReminder({
      title: 'Lançamento recorrente',
      body: description || 'Você tem uma transação recorrente programada.',
      nextRunDate,
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
      nextRunDate,
      notifyBeforeDays: parsedNotifyBeforeDays,
      active,
      notificationId,
      isSubscription,
      provider: isSubscription ? provider || null : null,
    };

    if (isEditing && ruleId) {
      await updateRecurringRule(db, ruleId, input);
    } else {
      await createRecurringRule(db, input);
    }

    // If the first/next occurrence is already due today (or earlier), generate
    // its transaction right away instead of waiting for the app to be
    // backgrounded/foregrounded again (the usual trigger for this job). The
    // rule itself is already saved at this point, so a failure here (e.g. a
    // notification-scheduling error) must not strand the user on this screen
    // — it'll simply be picked up on the next app foreground instead.
    try {
      await runRecurringGeneration(todayISODate());
    } catch (err) {
      console.error('Falha ao gerar transação imediatamente após salvar recorrência', err);
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
        onValueChange={(value) => {
          setType(value as 'income' | 'expense');
          // The category list is filtered by type (below) — a category id
          // chosen under the old type may not belong to the new one.
          setCategoryId(null);
        }}
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

      <List.Item
        title="É uma assinatura?"
        description="Marque para acompanhar como assinatura (ex: streaming, apps, academia)"
        style={styles.listItem}
        left={(props) => <List.Icon {...props} icon="sync" />}
        right={() => <Switch value={isSubscription} onValueChange={setIsSubscription} />}
      />

      {isSubscription && (
        <TextInput
          label="Fornecedor (opcional)"
          mode="outlined"
          placeholder="Ex: Netflix, Spotify, Academia"
          value={provider}
          onChangeText={setProvider}
        />
      )}

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
  listItem: {
    paddingHorizontal: 0,
  },
});
