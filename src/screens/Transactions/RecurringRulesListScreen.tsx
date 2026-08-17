import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { memo, useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { FAB, SegmentedButtons, Text } from 'react-native-paper';

import { PlaceholderScreen } from '@/components/common/PlaceholderScreen';
import { frequencyLabels } from '@/constants/recurringFrequency';
import { colors, spacing } from '@/constants/theme';
import { useRecurringRules, type RecurringRule } from '@/hooks/useRecurringRules';
import type { TransactionsStackParamList } from '@/navigation/types';
import { centsToBRL } from '@/utils/currency';
import { formatDatePtBR } from '@/utils/date';

type Props = NativeStackScreenProps<TransactionsStackParamList, 'RecurringRulesList'>;

type RecurringRuleRowProps = {
  rule: RecurringRule;
  onPress: (ruleId: number) => void;
};

const RecurringRuleRow = memo(function RecurringRuleRow({ rule, onPress }: RecurringRuleRowProps) {
  return (
    <Pressable
      onPress={() => onPress(rule.id)}
      style={styles.row}
      accessibilityRole="button"
      accessibilityLabel={`${rule.description || 'Recorrência'}, ${frequencyLabels[rule.frequency]}, ${centsToBRL(rule.amountCents)}`}
    >
      <View>
        <Text variant="bodyMedium">
          {rule.isSubscription && rule.provider ? rule.provider : rule.description || 'Recorrência'}
        </Text>
        <Text variant="bodySmall" style={styles.subtitle}>
          {frequencyLabels[rule.frequency]} · próxima em {formatDatePtBR(rule.nextRunDate)}
          {!rule.active ? ' · inativa' : ''}
        </Text>
      </View>
      <Text variant="bodyMedium">{centsToBRL(rule.amountCents)}</Text>
    </Pressable>
  );
});

export function RecurringRulesListScreen({ navigation }: Props) {
  const [filter, setFilter] = useState<'all' | 'subscriptions'>('all');
  const { rules } = useRecurringRules({ onlySubscriptions: filter === 'subscriptions' });

  const activeSubscriptionsTotalCents = useMemo(
    () =>
      rules
        .filter((rule) => rule.isSubscription && rule.active && rule.type === 'expense')
        .reduce((sum, rule) => sum + rule.amountCents, 0),
    [rules],
  );

  const openRule = useCallback(
    (ruleId: number) => {
      navigation.navigate('RecurringRuleForm', { ruleId });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: RecurringRule }) => <RecurringRuleRow rule={item} onPress={openRule} />,
    [openRule],
  );

  return (
    <View style={styles.container}>
      <SegmentedButtons
        value={filter}
        onValueChange={(value) => setFilter(value as 'all' | 'subscriptions')}
        style={styles.filter}
        buttons={[
          { value: 'all', label: 'Todas' },
          { value: 'subscriptions', label: 'Assinaturas' },
        ]}
      />

      {filter === 'subscriptions' && (
        <Text variant="bodyMedium" style={styles.summary}>
          Total em assinaturas ativas: {centsToBRL(activeSubscriptionsTotalCents)}
        </Text>
      )}

      {rules.length === 0 ? (
        <PlaceholderScreen
          title={filter === 'subscriptions' ? 'Nenhuma assinatura' : 'Nenhuma transação recorrente'}
          description={
            filter === 'subscriptions'
              ? 'Toque no botão + e marque "É uma assinatura?" para acompanhá-la aqui.'
              : 'Toque no botão + para cadastrar uma conta fixa ou assinatura.'
          }
        />
      ) : (
        <FlatList data={rules} keyExtractor={(item) => String(item.id)} renderItem={renderItem} />
      )}
      <FAB
        icon="plus"
        style={styles.fab}
        accessibilityLabel="Nova transação recorrente"
        onPress={() => navigation.navigate('RecurringRuleForm', undefined)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filter: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  summary: {
    marginTop: spacing.sm,
    marginHorizontal: spacing.md,
    color: colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  subtitle: {
    color: colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
  },
});
