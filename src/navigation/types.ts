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
  TransactionForm: { transactionId?: number } | undefined;
  TransactionDetail: { transactionId: number };
};

export type BudgetsGoalsStackParamList = {
  BudgetsGoalsHome: undefined;
  BudgetForm: { categoryId: number | null } | undefined;
  GoalForm: { goalId?: number } | undefined;
  GoalContribute: { goalId: number };
};

export type ReportsStackParamList = {
  ReportsHome: undefined;
};

export type SettingsStackParamList = {
  SettingsHome: undefined;
  AccountsList: undefined;
  AccountForm: { accountId?: number } | undefined;
};
