import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { memo, useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { FAB, Text } from 'react-native-paper';

import { PlaceholderScreen } from '@/components/common/PlaceholderScreen';
import { frequencyLabels } from '@/constants/recurringFrequency';
import { colors, spacing } from '@/constants/theme';
import { useRecurringRules, type RecurringRule } from '@/hooks/useRecurringRules';
import type { SettingsStackParamList } from '@/navigation/types';
import { centsToBRL } from '@/utils/currency';
import { formatDatePtBR } from '@/utils/date';

type Props = NativeStackScreenProps<SettingsStackParamList, 'RecurringRulesList'>;

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
        <Text variant="bodyMedium">{rule.description || 'Recorrência'}</Text>
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
  const { rules } = useRecurringRules();

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
      {rules.length === 0 ? (
        <PlaceholderScreen
          title="Nenhuma transação recorrente"
          description="Toque no botão + para cadastrar uma conta fixa ou assinatura."
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
