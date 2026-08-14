import { createNativeStackNavigator } from '@react-navigation/native-stack';

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
    </Stack.Navigator>
  );
}
