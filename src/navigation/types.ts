import type { NavigatorScreenParams } from '@react-navigation/native';

export type DashboardStackParamList = {
  DashboardHome: undefined;
};

export type TransactionsStackParamList = {
  TransactionsList: undefined;
  TransactionForm: { transactionId?: number } | undefined;
  TransactionDetail: { transactionId: number };
  RecurringRulesList: undefined;
  RecurringRuleForm: { ruleId?: number } | undefined;
};

export type BudgetsGoalsStackParamList = {
  BudgetsGoalsHome: undefined;
  BudgetForm: { categoryId: number | null } | undefined;
};

export type ReportsStackParamList = {
  ReportsHome: undefined;
};

export type SettingsStackParamList = {
  SettingsHome: undefined;
  AccountsList: undefined;
  AccountForm: { accountId?: number } | undefined;
  Backup: undefined;
  SecuritySettings: undefined;
  ChangePin: undefined;
};

export type RootTabParamList = {
  Dashboard: NavigatorScreenParams<DashboardStackParamList>;
  Transactions: NavigatorScreenParams<TransactionsStackParamList>;
  BudgetsGoals: NavigatorScreenParams<BudgetsGoalsStackParamList>;
  Reports: NavigatorScreenParams<ReportsStackParamList>;
  Settings: NavigatorScreenParams<SettingsStackParamList>;
};
