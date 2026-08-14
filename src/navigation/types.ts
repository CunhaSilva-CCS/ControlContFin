export type RootTabParamList = {
  Dashboard: undefined;
  Transactions: undefined;
  BudgetsGoals: undefined;
  Reports: undefined;
  Settings: undefined;
};

export type DashboardStackParamList = {
  DashboardHome: undefined;
};

export type TransactionsStackParamList = {
  TransactionsList: undefined;
  TransactionForm: { transactionId?: string } | undefined;
  TransactionDetail: { transactionId: string };
};

export type BudgetsGoalsStackParamList = {
  BudgetsGoalsHome: undefined;
};

export type ReportsStackParamList = {
  ReportsHome: undefined;
};

export type SettingsStackParamList = {
  SettingsHome: undefined;
};
