import { TextInput } from 'react-native-paper';

type AmountInputProps = {
  valueCents: number;
  onChangeCents: (cents: number) => void;
  label?: string;
  /** Allows a leading '-' to produce a negative value (e.g. credit card debt as initial balance). */
  allowNegative?: boolean;
};

export function AmountInput({ valueCents, onChangeCents, label = 'Valor', allowNegative = false }: AmountInputProps) {
  const displayValue = (valueCents / 100).toFixed(2).replace('.', ',');

  function handleChangeText(text: string) {
    const isNegative = allowNegative && text.trim().startsWith('-');
    const digitsOnly = text.replace(/\D/g, '');
    const magnitude = digitsOnly ? Number.parseInt(digitsOnly, 10) : 0;
    onChangeCents(isNegative ? -magnitude : magnitude);
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
