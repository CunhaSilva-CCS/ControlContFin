import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { BudgetFormScreen } from '@/screens/BudgetsGoals/BudgetFormScreen';
import { BudgetsGoalsScreen } from '@/screens/BudgetsGoals/BudgetsGoalsScreen';
import { GoalContributeScreen } from '@/screens/BudgetsGoals/GoalContributeScreen';
import { GoalFormScreen } from '@/screens/BudgetsGoals/GoalFormScreen';

import { stackScreenOptions } from '../navigationTheme';
import type { BudgetsGoalsStackParamList } from '../types';

const Stack = createNativeStackNavigator<BudgetsGoalsStackParamList>();

export function BudgetsGoalsStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen
        name="BudgetsGoalsHome"
        component={BudgetsGoalsScreen}
        options={{ title: 'Orçamentos & Metas' }}
      />
      <Stack.Screen
        name="BudgetForm"
        component={BudgetFormScreen}
        options={{ title: 'Orçamento' }}
      />
      <Stack.Screen name="GoalForm" component={GoalFormScreen} options={{ title: 'Meta' }} />
      <Stack.Screen
        name="GoalContribute"
        component={GoalContributeScreen}
        options={{ title: 'Meta' }}
      />
    </Stack.Navigator>
  );
}
