import { MaterialCommunityIcons } from '@expo/vector-icons';
import { memo } from 'react';
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
  accountName: string | null;
  transferAccountName: string | null;
};

type TransactionRowProps = {
  transaction: TransactionRowData;
  /** Receives the transaction id, so callers can pass one stable function
   *  reference instead of a new closure per row on every render. */
  onPress: (id: number) => void;
};

export const TransactionRow = memo(function TransactionRow({ transaction, onPress }: TransactionRowProps) {
  const amountColor =
    transaction.type === 'income'
      ? colors.income
      : transaction.type === 'expense'
        ? colors.expense
        : colors.textPrimary;
  const sign = transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : '';
  const isTransfer = transaction.type === 'transfer';
  const primaryText =
    transaction.description ||
    (isTransfer ? `Transferência para ${transaction.transferAccountName ?? '...'}` : transaction.categoryName) ||
    'Transação';
  const subtitleText = isTransfer
    ? `${transaction.accountName ?? '...'} → ${transaction.transferAccountName ?? '...'}`
    : `${transaction.categoryName ?? 'Sem categoria'} · ${transaction.accountName ?? '...'}`;

  const label = `${primaryText}, ${sign}${centsToBRL(transaction.amountCents)}, ${formatDatePtBR(transaction.date)}`;

  function handlePress() {
    onPress(transaction.id);
  }

  return (
    <Pressable onPress={handlePress} style={styles.row} accessibilityRole="button" accessibilityLabel={label}>
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
        <Text variant="bodyMedium">{primaryText}</Text>
        <Text variant="bodySmall" style={styles.subtitle}>
          {subtitleText} · {formatDatePtBR(transaction.date)}
        </Text>
      </View>
      <Text variant="bodyMedium" style={{ color: amountColor }}>
        {sign}
        {centsToBRL(transaction.amountCents)}
      </Text>
    </Pressable>
  );
});

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
