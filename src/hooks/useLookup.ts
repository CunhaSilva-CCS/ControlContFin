import { useMemo } from 'react';

export function useLookup<T extends { id: number }>(items: T[]): Map<number, T> {
  return useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);
}
