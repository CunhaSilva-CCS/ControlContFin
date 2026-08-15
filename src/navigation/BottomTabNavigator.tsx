import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { colors } from '@/constants/theme';

import { BudgetsGoalsStack } from './stacks/BudgetsGoalsStack';
import { DashboardStack } from './stacks/DashboardStack';
import { ReportsStack } from './stacks/ReportsStack';
import { SettingsStack } from './stacks/SettingsStack';
import { TransactionsStack } from './stacks/TransactionsStack';
import type { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();

const TAB_ICONS: Record<keyof RootTabParamList, keyof typeof MaterialCommunityIcons.glyphMap> = {
  Dashboard: 'view-dashboard',
  Transactions: 'swap-vertical',
  BudgetsGoals: 'target',
  Reports: 'chart-donut',
  Settings: 'cog',
};

export function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name={TAB_ICONS[route.name]} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} options={{ title: 'Início' }} />
      <Tab.Screen
        name="Transactions"
        component={TransactionsStack}
        options={{ title: 'Transações' }}
      />
      <Tab.Screen
        name="BudgetsGoals"
        component={BudgetsGoalsStack}
        options={{ title: 'Orç. & Metas' }}
      />
      <Tab.Screen name="Reports" component={ReportsStack} options={{ title: 'Relatórios' }} />
      <Tab.Screen name="Settings" component={SettingsStack} options={{ title: 'Ajustes' }} />
    </Tab.Navigator>
  );
}
