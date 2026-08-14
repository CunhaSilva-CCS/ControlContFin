import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AccountFormScreen } from '@/screens/Settings/AccountFormScreen';
import { AccountsListScreen } from '@/screens/Settings/AccountsListScreen';
import { RecurringRuleFormScreen } from '@/screens/Settings/RecurringRuleFormScreen';
import { RecurringRulesListScreen } from '@/screens/Settings/RecurringRulesListScreen';
import { SettingsScreen } from '@/screens/Settings/SettingsScreen';

import type { SettingsStackParamList } from '../types';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export function SettingsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SettingsHome" component={SettingsScreen} options={{ title: 'Ajustes' }} />
      <Stack.Screen name="AccountsList" component={AccountsListScreen} options={{ title: 'Contas' }} />
      <Stack.Screen
        name="AccountForm"
        component={AccountFormScreen}
        options={{ title: 'Nova conta' }}
      />
      <Stack.Screen
        name="RecurringRulesList"
        component={RecurringRulesListScreen}
        options={{ title: 'Transações recorrentes' }}
      />
      <Stack.Screen
        name="RecurringRuleForm"
        component={RecurringRuleFormScreen}
        options={{ title: 'Recorrência' }}
      />
    </Stack.Navigator>
  );
}
