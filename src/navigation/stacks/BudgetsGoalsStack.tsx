import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { BudgetFormScreen } from '@/screens/BudgetsGoals/BudgetFormScreen';
import { BudgetsGoalsScreen } from '@/screens/BudgetsGoals/BudgetsGoalsScreen';

import { stackScreenOptions } from '../navigationTheme';
import type { BudgetsGoalsStackParamList } from '../types';

const Stack = createNativeStackNavigator<BudgetsGoalsStackParamList>();

export function BudgetsGoalsStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen
        name="BudgetsGoalsHome"
        component={BudgetsGoalsScreen}
        options={{ title: 'Orçamentos' }}
      />
      <Stack.Screen
        name="BudgetForm"
        component={BudgetFormScreen}
        options={{ title: 'Orçamento' }}
      />
    </Stack.Navigator>
  );
}
