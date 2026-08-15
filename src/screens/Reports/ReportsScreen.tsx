import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-gifted-charts';
import { Button, Card, Text } from 'react-native-paper';

import { PlaceholderScreen } from '@/components/common/PlaceholderScreen';
import { colors, spacing } from '@/constants/theme';
import { useReportsData } from '@/hooks/useReportsData';
import { transactionsToCSV, transactionsToJSON, type ExportableTransaction } from '@/services/exportService';
import { writeAndShareFile } from '@/services/fileShare';
import { centsToBRL } from '@/utils/currency';
import { formatMonthLabelPtBR } from '@/utils/date';

export function ReportsScreen() {
  const { transactions, categoryLookup, accountLookup, categoryBreakdown, monthlyTotals, balanceTrend, loading } =
    useReportsData();

  const pieData = useMemo(
    () =>
      categoryBreakdown.map((item) => ({
        value: item.totalCents,
        color: item.color,
        text: item.percent >= 8 ? `${item.percent.toFixed(0)}%` : '',
      })),
    [categoryBreakdown],
  );

  const barData = useMemo(
    () =>
      monthlyTotals.flatMap((item) => [
        {
          value: item.incomeCents / 100,
          frontColor: colors.income,
          label: formatMonthLabelPtBR(item.month),
          spacing: 2,
        },
        {
          value: item.expenseCents / 100,
          frontColor: colors.expense,
        },
      ]),
    [monthlyTotals],
  );

  const lineData = useMemo(
    () =>
      balanceTrend.map((point) => ({
        value: point.balanceCents / 100,
        label: formatMonthLabelPtBR(point.month),
      })),
    [balanceTrend],
  );

  async function handleExport(format: 'csv' | 'json') {
    const exportable: ExportableTransaction[] = transactions.map((transaction) => ({
      date: transaction.date,
      description: transaction.description,
      categoryName: transaction.categoryId ? categoryLookup.get(transaction.categoryId)?.name ?? null : null,
      accountName: accountLookup.get(transaction.accountId)?.name ?? 'Conta',
      type: transaction.type,
      amountCents: transaction.amountCents,
    }));

    if (format === 'csv') {
      await writeAndShareFile('transacoes.csv', transactionsToCSV(exportable), 'text/csv');
    } else {
      await writeAndShareFile('transacoes.json', transactionsToJSON(exportable), 'application/json');
    }
  }

  if (loading) {
    return null;
  }

  if (transactions.length === 0) {
    return (
      <PlaceholderScreen
        title="Sem dados para relatórios"
        description="Registre suas primeiras transações para ver gráficos aqui."
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card>
        <Card.Title title="Gastos por categoria" />
        <Card.Content style={styles.chartContent}>
          {pieData.length > 0 ? (
            <PieChart data={pieData} donut radius={90} innerRadius={55} />
          ) : (
            <Text variant="bodyMedium">Nenhuma despesa registrada.</Text>
          )}
          <View style={styles.legend}>
            {categoryBreakdown.slice(0, 6).map((item) => (
              <View key={String(item.categoryId)} style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text variant="bodySmall">
                  {item.categoryName} · {centsToBRL(item.totalCents)}
                </Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      <Card>
        <Card.Title title="Receitas x despesas por mês" />
        <Card.Content style={styles.chartContent}>
          <BarChart data={barData} barWidth={14} spacing={18} roundedTop noOfSections={4} />
        </Card.Content>
      </Card>

      <Card>
        <Card.Title title="Evolução do saldo" />
        <Card.Content style={styles.chartContent}>
          <LineChart data={lineData} color={colors.primary} thickness={2} areaChart />
        </Card.Content>
      </Card>

      <Card>
        <Card.Title title="Exportar dados" />
        <Card.Content style={styles.exportRow}>
          <Button mode="outlined" onPress={() => handleExport('csv')}>
            Exportar CSV
          </Button>
          <Button mode="outlined" onPress={() => handleExport('json')}>
            Exportar JSON
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    gap: spacing.md,
  },
  chartContent: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  legend: {
    width: '100%',
    gap: spacing.xs,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  exportRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
  },
});
