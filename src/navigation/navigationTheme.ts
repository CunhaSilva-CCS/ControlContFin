import { DefaultTheme, type Theme } from '@react-navigation/native';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import { colors } from '@/constants/theme';

/**
 * Passed to `NavigationContainer`. Without this, react-navigation falls back
 * to its own default theme (a light-blue chrome unrelated to Paper's theme)
 * for anything it controls directly, like the native-stack header background
 * before per-screen options apply.
 */
export const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
  },
};

/** Spread into every stack navigator's `screenOptions` for a consistent header. */
export const stackScreenOptions: NativeStackNavigationOptions = {
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: colors.surface,
  headerTitleStyle: { fontWeight: '600' },
  headerShadowVisible: false,
};
