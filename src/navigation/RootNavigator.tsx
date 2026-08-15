import { NavigationContainer } from '@react-navigation/native';

import { BottomTabNavigator } from './BottomTabNavigator';
import { navigationTheme } from './navigationTheme';

export function RootNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <BottomTabNavigator />
    </NavigationContainer>
  );
}
