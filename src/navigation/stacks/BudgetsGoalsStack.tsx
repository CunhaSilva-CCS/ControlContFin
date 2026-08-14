import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { BudgetsGoalsScreen } from '@/screens/BudgetsGoals/BudgetsGoalsScreen';

import type { BudgetsGoalsStackParamList } from '../types';

const Stack = createNativeStackNavigator<BudgetsGoalsStackParamList>();

export function BudgetsGoalsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="BudgetsGoalsHome"
        component={BudgetsGoalsScreen}
        options={{ title: 'Orçamentos & Metas' }}
      />
    </Stack.Navigator>
  );
}
