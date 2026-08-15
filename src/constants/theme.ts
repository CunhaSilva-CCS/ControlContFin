import { MD3LightTheme, type MD3Theme } from 'react-native-paper';

export const colors = {
  primary: '#14293D',
  primaryContainer: '#D9E1E8',
  secondary: '#3A4A58',
  /** Muted bronze/gold. Applied only where explicitly chosen (active tab,
   *  balance-card highlight, selection rings) — deliberately NOT wired into
   *  Paper's `secondary`/`secondaryContainer`, which would spread it into
   *  default component states (selected Chip, SegmentedButtons, tonal
   *  buttons) that weren't hand-picked for it. */
  accent: '#B08D57',
  background: '#FAF6EF',
  surface: '#FFFFFF',
  textPrimary: '#1C2530',
  textSecondary: '#5B6773',
  income: '#276A4C',
  expense: '#8C3A3A',
  warning: '#B08D57',
  border: '#E4DECF',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const fontFamily = {
  serif: 'PlayfairDisplay_700Bold',
  serifSemiBold: 'PlayfairDisplay_600SemiBold',
} as const;

export const typography = {
  display: { fontSize: 32, fontWeight: '700' as const },
  title: { fontSize: 20, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
};

export const paperTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: 2,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryContainer,
    secondary: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    error: colors.expense,
    onSurface: colors.textPrimary,
    onSurfaceVariant: colors.textSecondary,
    outline: colors.border,
    onPrimaryContainer: colors.primary,
  },
};
