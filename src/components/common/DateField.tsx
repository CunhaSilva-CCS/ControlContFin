import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';

import { spacing } from '@/constants/theme';
import { formatDatePtBR } from '@/utils/date';

type DateFieldProps = {
  valueISODate: string;
  onChange: (isoDate: string) => void;
  label?: string;
};

export function DateField({ valueISODate, onChange, label = 'Data' }: DateFieldProps) {
  const [show, setShow] = useState(false);

  function handleChange(_event: unknown, date?: Date) {
    if (Platform.OS === 'android') {
      setShow(false);
    }
    if (date) {
      onChange(date.toISOString().slice(0, 10));
    }
  }

  return (
    <View>
      <Pressable onPress={() => setShow(true)}>
        <TextInput
          label={label}
          mode="outlined"
          value={formatDatePtBR(valueISODate)}
          editable={false}
          pointerEvents="none"
        />
      </Pressable>
      {show && (
        <DateTimePicker
          value={new Date(`${valueISODate}T00:00:00`)}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleChange}
        />
      )}
      {show && Platform.OS === 'ios' && (
        <Button onPress={() => setShow(false)} style={styles.doneButton}>
          Concluído
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  doneButton: {
    marginTop: spacing.xs,
  },
});
