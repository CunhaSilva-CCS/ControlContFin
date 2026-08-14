import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { colors, spacing } from '@/constants/theme';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'backspace'];

type PinPadProps = {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  dotsCount?: number;
};

export function PinPad({ value, onChange, maxLength = 6, dotsCount = 6 }: PinPadProps) {
  function handleKeyPress(key: string) {
    if (key === '') {
      return;
    }
    if (key === 'backspace') {
      onChange(value.slice(0, -1));
      return;
    }
    if (value.length < maxLength) {
      onChange(value + key);
    }
  }

  return (
    <View>
      <View style={styles.dotsRow}>
        {Array.from({ length: Math.max(dotsCount, value.length) }).map((_, index) => (
          <View
            key={index}
            style={[styles.dot, index < value.length && styles.dotFilled]}
            accessibilityElementsHidden
          />
        ))}
      </View>

      <View style={styles.grid}>
        {KEYS.map((key, index) => {
          if (key === '') {
            return <View key={`empty-${index}`} style={styles.key} />;
          }
          if (key === 'backspace') {
            return (
              <Pressable
                key={key}
                style={styles.key}
                onPress={() => handleKeyPress(key)}
                accessibilityRole="button"
                accessibilityLabel="Apagar"
              >
                <MaterialCommunityIcons name="backspace-outline" size={26} color={colors.textPrimary} />
              </Pressable>
            );
          }
          return (
            <Pressable
              key={key}
              style={styles.key}
              onPress={() => handleKeyPress(key)}
              accessibilityRole="button"
              accessibilityLabel={`Dígito ${key}`}
            >
              <Text variant="headlineSmall">{key}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.textSecondary,
  },
  dotFilled: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 3 * 72,
    alignSelf: 'center',
  },
  key: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
