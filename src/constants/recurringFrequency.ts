import type { RecurringFrequency } from '@/db/schema';

export const frequencyLabels: Record<RecurringFrequency, string> = {
  daily: 'Diária',
  weekly: 'Semanal',
  monthly: 'Mensal',
  yearly: 'Anual',
};
