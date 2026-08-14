import { useEffect } from 'react';

import { db } from '@/db/client';
import { runAutomaticBackupIfDue } from '@/services/backupService';
import { todayISODate } from '@/utils/date';

/**
 * Writes a local automatic backup once per calendar day, checked on app
 * launch (mirrors the recurring-generation foreground trigger).
 */
export function useAutomaticBackup(enabled: boolean) {
  useEffect(() => {
    if (!enabled) {
      return;
    }
    runAutomaticBackupIfDue(db, todayISODate()).catch((err: unknown) =>
      console.error('Falha ao criar backup automático', err),
    );
  }, [enabled]);
}
