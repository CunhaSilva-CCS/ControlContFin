import { filesToPrune, shouldCreateBackup } from '@/services/backupRetention';

describe('shouldCreateBackup', () => {
  it('is true when there is no previous backup', () => {
    expect(shouldCreateBackup(null, '2026-08-14')).toBe(true);
  });

  it('is false when the last backup was already made today', () => {
    expect(shouldCreateBackup('2026-08-14T08:00:00.000Z', '2026-08-14')).toBe(false);
  });

  it('is true once the calendar day has changed', () => {
    expect(shouldCreateBackup('2026-08-13T23:59:00.000Z', '2026-08-14')).toBe(true);
  });
});

describe('filesToPrune', () => {
  it('returns nothing when under the retention count', () => {
    expect(filesToPrune(['backup-2026-08-12', 'backup-2026-08-13'], 5)).toEqual([]);
  });

  it('returns the oldest files beyond the retention count', () => {
    const files = [
      'backup-2026-08-10',
      'backup-2026-08-13',
      'backup-2026-08-11',
      'backup-2026-08-12',
      'backup-2026-08-14',
    ];
    expect(filesToPrune(files, 3)).toEqual(['backup-2026-08-10', 'backup-2026-08-11']);
  });

  it('handles an empty list', () => {
    expect(filesToPrune([], 5)).toEqual([]);
  });
});
