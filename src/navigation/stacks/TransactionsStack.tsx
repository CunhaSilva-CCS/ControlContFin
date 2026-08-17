import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { IconButton } from 'react-native-paper';

import { colors } from '@/constants/theme';
import { RecurringRuleFormScreen } from '@/screens/Transactions/RecurringRuleFormScreen';
import { RecurringRulesListScreen } from '@/screens/Transactions/RecurringRulesListScreen';
import { TransactionDetailScreen } from '@/screens/Transactions/TransactionDetailScreen';
import { TransactionFormScreen } from '@/screens/Transactions/TransactionFormScreen';
import { TransactionsListScreen } from '@/screens/Transactions/TransactionsListScreen';

import { stackScreenOptions } from '../navigationTheme';
import type { TransactionsStackParamList } from '../types';

const Stack = createNativeStackNavigator<TransactionsStackParamList>();

export function TransactionsStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen
        name="TransactionsList"
        component={TransactionsListScreen}
        options={({ navigation }) => ({
          title: 'Transações',
          headerRight: () => (
            <IconButton
              icon="sync"
              iconColor={colors.surface}
              accessibilityLabel="Transações recorrentes"
              onPress={() => navigation.navigate('RecurringRulesList')}
            />
          ),
        })}
      />
      <Stack.Screen
        name="TransactionForm"
        component={TransactionFormScreen}
        options={{ title: 'Nova transação' }}
      />
      <Stack.Screen
        name="TransactionDetail"
        component={TransactionDetailScreen}
        options={{ title: 'Detalhe' }}
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
