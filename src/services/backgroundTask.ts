import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';

import { db } from '@/db/client';
import { todayISODate } from '@/utils/date';

import { runAutomaticBackupIfDue } from './backupService';
import { runRecurringGeneration } from './runRecurringGeneration';

export const RECURRING_GENERATION_TASK = 'recurring-generation-task';

TaskManager.defineTask(RECURRING_GENERATION_TASK, async () => {
  try {
    const today = todayISODate();
    await runRecurringGeneration(today);
    await runAutomaticBackupIfDue(db, today);
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (error) {
    console.error('Falha ao executar tarefas em segundo plano', error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

/**
 * Best-effort background generation/backup: the OS decides when (or
 * whether) this actually runs, so the foreground triggers on app
 * launch/resume remain the primary guarantee for both.
 */
export async function registerRecurringBackgroundTask() {
  await BackgroundTask.registerTaskAsync(RECURRING_GENERATION_TASK, {
    minimumInterval: 60 * 12,
  });
}
