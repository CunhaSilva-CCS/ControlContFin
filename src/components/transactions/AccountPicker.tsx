import { ScrollView, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';

import { spacing } from '@/constants/theme';
import type { accounts } from '@/db/schema';

type Account = typeof accounts.$inferSelect;

type AccountPickerProps = {
  accounts: Account[];
  selectedId: number | null;
  onSelect: (id: number) => void;
};

export function AccountPicker({ accounts: accountList, selectedId, onSelect }: AccountPickerProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {accountList.map((account) => (
        <Chip
          key={account.id}
          selected={account.id === selectedId}
          onPress={() => onSelect(account.id)}
          style={styles.chip}
          icon={account.icon}
        >
          {account.name}
        </Chip>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  chip: {
    marginRight: spacing.xs,
  },
});
