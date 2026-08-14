import { MD3LightTheme, type MD3Theme } from 'react-native-paper';

export const colors = {
  primary: '#1B5E4F',
  primaryContainer: '#CFEFE3',
  secondary: '#3F6B5C',
  background: '#F7F8F6',
  surface: '#FFFFFF',
  textPrimary: '#1A1C1B',
  textSecondary: '#5C635F',
  income: '#2E7D32',
  expense: '#C62828',
  warning: '#B8860B',
  border: '#E1E4E1',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const typography = {
  display: { fontSize: 32, fontWeight: '700' as const },
  title: { fontSize: 20, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
};

export const paperTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryContainer,
    secondary: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    error: colors.expense,
  },
};
