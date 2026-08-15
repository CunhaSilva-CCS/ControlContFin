import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DashboardScreen } from '@/screens/Dashboard/DashboardScreen';

import { stackScreenOptions } from '../navigationTheme';
import type { DashboardStackParamList } from '../types';

const Stack = createNativeStackNavigator<DashboardStackParamList>();

export function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="DashboardHome" component={DashboardScreen} options={{ title: 'Início' }} />
    </Stack.Navigator>
  );
}
