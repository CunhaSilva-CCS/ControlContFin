import { TextInput } from 'react-native-paper';

type AmountInputProps = {
  valueCents: number;
  onChangeCents: (cents: number) => void;
  label?: string;
};

export function AmountInput({ valueCents, onChangeCents, label = 'Valor' }: AmountInputProps) {
  const displayValue = (valueCents / 100).toFixed(2).replace('.', ',');

  function handleChangeText(text: string) {
    const digitsOnly = text.replace(/\D/g, '');
    onChangeCents(digitsOnly ? Number.parseInt(digitsOnly, 10) : 0);
  }

  return (
    <TextInput
      label={label}
      mode="outlined"
      keyboardType="numeric"
      left={<TextInput.Affix text="R$" />}
      value={displayValue}
      onChangeText={handleChangeText}
    />
  );
}
