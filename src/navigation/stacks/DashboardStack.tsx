import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DashboardScreen } from '@/screens/Dashboard/DashboardScreen';

import type { DashboardStackParamList } from '../types';

const Stack = createNativeStackNavigator<DashboardStackParamList>();

export function DashboardStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="DashboardHome" component={DashboardScreen} options={{ title: 'Início' }} />
    </Stack.Navigator>
  );
}
