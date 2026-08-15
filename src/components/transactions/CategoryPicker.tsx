import { memo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';

import { spacing } from '@/constants/theme';
import type { categories } from '@/db/schema';

type Category = typeof categories.$inferSelect;

type CategoryPickerProps = {
  categories: Category[];
  selectedId: number | null;
  onSelect: (id: number) => void;
};

export const CategoryPicker = memo(function CategoryPicker({
  categories: categoryList,
  selectedId,
  onSelect,
}: CategoryPickerProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {categoryList.map((category) => (
        <Chip
          key={category.id}
          selected={category.id === selectedId}
          onPress={() => onSelect(category.id)}
          style={styles.chip}
          icon={category.icon}
        >
          {category.name}
        </Chip>
      ))}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  chip: {
    marginRight: spacing.xs,
  },
});
