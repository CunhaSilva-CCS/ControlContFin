import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { colors, spacing } from '@/constants/theme';
import { centsToBRL } from '@/utils/currency';
import { formatDatePtBR } from '@/utils/date';

export type TransactionRowData = {
  id: number;
  amountCents: number;
  date: string;
  description: string | null;
  type: 'income' | 'expense' | 'transfer';
  categoryName: string | null;
  categoryIcon: string | null;
  categoryColor: string | null;
};

type TransactionRowProps = {
  transaction: TransactionRowData;
  onPress: () => void;
};

export function TransactionRow({ transaction, onPress }: TransactionRowProps) {
  const amountColor =
    transaction.type === 'income'
      ? colors.income
      : transaction.type === 'expense'
        ? colors.expense
        : colors.textPrimary;
  const sign = transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : '';

  const label = `${transaction.description || transaction.categoryName || 'Transação'}, ${sign}${centsToBRL(
    transaction.amountCents,
  )}, ${formatDatePtBR(transaction.date)}`;

  return (
    <Pressable onPress={onPress} style={styles.row} accessibilityRole="button" accessibilityLabel={label}>
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: transaction.categoryColor ?? colors.textSecondary },
        ]}
      >
        <MaterialCommunityIcons
          name={(transaction.categoryIcon as keyof typeof MaterialCommunityIcons.glyphMap) ?? 'cash'}
          size={20}
          color="#FFFFFF"
        />
      </View>
      <View style={styles.info}>
        <Text variant="bodyMedium">{transaction.description || transaction.categoryName || 'Transação'}</Text>
        <Text variant="bodySmall" style={styles.subtitle}>
          {transaction.categoryName ?? 'Sem categoria'} · {formatDatePtBR(transaction.date)}
        </Text>
      </View>
      <Text variant="bodyMedium" style={{ color: amountColor }}>
        {sign}
        {centsToBRL(transaction.amountCents)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  subtitle: {
    color: colors.textSecondary,
  },
});
