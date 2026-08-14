import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { FAB, Text } from 'react-native-paper';

import { PlaceholderScreen } from '@/components/common/PlaceholderScreen';
import { frequencyLabels } from '@/constants/recurringFrequency';
import { colors, spacing } from '@/constants/theme';
import { useRecurringRules } from '@/hooks/useRecurringRules';
import type { SettingsStackParamList } from '@/navigation/types';
import { centsToBRL } from '@/utils/currency';
import { formatDatePtBR } from '@/utils/date';

type Props = NativeStackScreenProps<SettingsStackParamList, 'RecurringRulesList'>;

export function RecurringRulesListScreen({ navigation }: Props) {
  const { rules } = useRecurringRules();

  return (
    <View style={styles.container}>
      {rules.length === 0 ? (
        <PlaceholderScreen
          title="Nenhuma transação recorrente"
          description="Toque no botão + para cadastrar uma conta fixa ou assinatura."
        />
      ) : (
        <FlatList
          data={rules}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate('RecurringRuleForm', { ruleId: item.id })}
              style={styles.row}
              accessibilityRole="button"
              accessibilityLabel={`${item.description || 'Recorrência'}, ${frequencyLabels[item.frequency]}, ${centsToBRL(item.amountCents)}`}
            >
              <View>
                <Text variant="bodyMedium">{item.description || 'Recorrência'}</Text>
                <Text variant="bodySmall" style={styles.subtitle}>
                  {frequencyLabels[item.frequency]} · próxima em {formatDatePtBR(item.nextRunDate)}
                  {!item.active ? ' · inativa' : ''}
                </Text>
              </View>
              <Text variant="bodyMedium">{centsToBRL(item.amountCents)}</Text>
            </Pressable>
          )}
        />
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
