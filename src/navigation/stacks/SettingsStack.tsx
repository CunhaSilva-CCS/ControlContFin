import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AccountFormScreen } from '@/screens/Settings/AccountFormScreen';
import { AccountsListScreen } from '@/screens/Settings/AccountsListScreen';
import { BackupScreen } from '@/screens/Settings/BackupScreen';
import { ChangePinScreen } from '@/screens/Settings/ChangePinScreen';
import { SecuritySettingsScreen } from '@/screens/Settings/SecuritySettingsScreen';
import { SettingsScreen } from '@/screens/Settings/SettingsScreen';

import { stackScreenOptions } from '../navigationTheme';
import type { SettingsStackParamList } from '../types';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="SettingsHome" component={SettingsScreen} options={{ title: 'Ajustes' }} />
      <Stack.Screen name="AccountsList" component={AccountsListScreen} options={{ title: 'Contas' }} />
      <Stack.Screen
        name="AccountForm"
        component={AccountFormScreen}
        options={{ title: 'Nova conta' }}
      />
      <Stack.Screen name="Backup" component={BackupScreen} options={{ title: 'Backup' }} />
      <Stack.Screen
        name="SecuritySettings"
        component={SecuritySettingsScreen}
        options={{ title: 'Segurança' }}
      />
      <Stack.Screen name="ChangePin" component={ChangePinScreen} options={{ title: 'Alterar PIN' }} />
    </Stack.Navigator>
  );
}
