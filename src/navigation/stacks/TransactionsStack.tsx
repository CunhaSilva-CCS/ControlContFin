import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { TransactionDetailScreen } from '@/screens/Transactions/TransactionDetailScreen';
import { TransactionFormScreen } from '@/screens/Transactions/TransactionFormScreen';
import { TransactionsListScreen } from '@/screens/Transactions/TransactionsListScreen';

import type { TransactionsStackParamList } from '../types';

const Stack = createNativeStackNavigator<TransactionsStackParamList>();

export function TransactionsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TransactionsList"
        component={TransactionsListScreen}
        options={{ title: 'Transações' }}
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
    </Stack.Navigator>
  );
}
