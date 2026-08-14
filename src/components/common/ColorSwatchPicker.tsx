import { Pressable, StyleSheet, View } from 'react-native';

import { spacing } from '@/constants/theme';

type ColorSwatchPickerProps = {
  colors: readonly string[];
  selectedColor: string;
  onSelect: (color: string) => void;
};

export function ColorSwatchPicker({ colors, selectedColor, onSelect }: ColorSwatchPickerProps) {
  return (
    <View style={styles.row}>
      {colors.map((color) => (
        <Pressable
          key={color}
          onPress={() => onSelect(color)}
          accessibilityRole="button"
          accessibilityLabel={`Cor ${color}`}
          accessibilityState={{ selected: color === selectedColor }}
          style={[
            styles.swatch,
            { backgroundColor: color },
            color === selectedColor && styles.swatchSelected,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  swatchSelected: {
    borderWidth: 3,
    borderColor: '#000000',
  },
});
