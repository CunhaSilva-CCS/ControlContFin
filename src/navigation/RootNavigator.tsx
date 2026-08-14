import { NavigationContainer } from '@react-navigation/native';

import { BottomTabNavigator } from './BottomTabNavigator';

export function RootNavigator() {
  return (
    <NavigationContainer>
      <BottomTabNavigator />
    </NavigationContainer>
  );
}
