import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ReportsScreen } from '@/screens/Reports/ReportsScreen';

import { stackScreenOptions } from '../navigationTheme';
import type { ReportsStackParamList } from '../types';

const Stack = createNativeStackNavigator<ReportsStackParamList>();

export function ReportsStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="ReportsHome" component={ReportsScreen} options={{ title: 'Relatórios' }} />
    </Stack.Navigator>
  );
}
