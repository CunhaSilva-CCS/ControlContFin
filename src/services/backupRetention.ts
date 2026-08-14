/**
 * A new automatic backup is due once the calendar day has changed since the
 * last one (comparing just the date portion of ISO timestamps).
 */
export function shouldCreateBackup(lastBackupISO: string | null, todayISODate: string): boolean {
  if (!lastBackupISO) {
    return true;
  }
  return lastBackupISO.slice(0, 10) < todayISODate;
}

/**
 * Given backup filenames whose names sort chronologically (ISO timestamps),
 * returns the oldest ones that exceed the retention count, to be deleted.
 */
export function filesToPrune(filenames: string[], keepCount: number): string[] {
  const sorted = [...filenames].sort();
  const excess = sorted.length - keepCount;
  if (excess <= 0) {
    return [];
  }
  return sorted.slice(0, excess);
}
