import { useEffect, useState } from 'react';

export type AsyncQueryResult<T> = {
  data: T;
  loading: boolean;
  error: Error | null;
};

/**
 * Shared fetch+loading+error pattern for hooks that load data from the local
 * database. `deps` drives re-fetching explicitly (usually a Zustand version
 * counter plus any filter values) rather than the `fetcher` closure itself,
 * matching how the call sites already manage their own dependency arrays.
 */
export function useAsyncQuery<T>(fetcher: () => Promise<T>, deps: unknown[], initialValue: T): AsyncQueryResult<T> {
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetcher()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}
