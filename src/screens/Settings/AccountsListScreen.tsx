import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { FAB, Text } from 'react-native-paper';

import { PlaceholderScreen } from '@/components/common/PlaceholderScreen';
import { accountTypeLabels } from '@/constants/accountPresets';
import { spacing } from '@/constants/theme';
import { useAccounts } from '@/hooks/useAccounts';
import type { SettingsStackParamList } from '@/navigation/types';
import { centsToBRL } from '@/utils/currency';

type Props = NativeStackScreenProps<SettingsStackParamList, 'AccountsList'>;

export function AccountsListScreen({ navigation }: Props) {
  const { accounts } = useAccounts({ includeArchived: true });

  return (
    <View style={styles.container}>
      {accounts.length === 0 ? (
        <PlaceholderScreen
          title="Nenhuma conta"
          description="Toque no botão + para cadastrar sua primeira conta."
        />
      ) : (
        <FlatList
          data={accounts}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate('AccountForm', { accountId: item.id })}
              style={styles.row}
              accessibilityRole="button"
              accessibilityLabel={`${item.name}, ${accountTypeLabels[item.type] ?? item.type}, ${centsToBRL(item.initialBalanceCents)}`}
            >
              <View>
                <Text variant="bodyMedium">{item.name}</Text>
                <Text variant="bodySmall" style={styles.subtitle}>
                  {accountTypeLabels[item.type] ?? item.type}
                </Text>
              </View>
              <Text variant="bodyMedium">{centsToBRL(item.initialBalanceCents)}</Text>
            </Pressable>
          )}
        />
      )}
      <FAB
        icon="plus"
        style={styles.fab}
        accessibilityLabel="Nova conta"
        onPress={() => navigation.navigate('AccountForm', undefined)}
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
    opacity: 0.6,
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
  },
});
