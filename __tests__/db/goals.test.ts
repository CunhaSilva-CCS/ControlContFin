import { contributeToGoal, createGoal, deleteGoal, getGoal } from '@/db/repositories/goals';
import { createTestDatabase } from '@/db/testClient';
import { goalContributions } from '@/db/schema';
import type { AppDatabase } from '@/db/types';

describe('goals repository', () => {
  let db: AppDatabase;

  beforeEach(() => {
    db = createTestDatabase();
  });

  it('creates a goal with zero progress', async () => {
    const goal = await createGoal(db, {
      name: 'Viagem',
      targetCents: 500000,
      color: '#1B5E4F',
      icon: 'airplane',
    });
    expect(goal.currentCents).toBe(0);
    expect(goal.status).toBe('active');
  });

  it('accumulates contributions and stays active while under target', async () => {
    const goal = await createGoal(db, {
      name: 'Viagem',
      targetCents: 100000,
      color: '#1B5E4F',
      icon: 'airplane',
    });

    await contributeToGoal(db, goal.id, 30000, '2026-08-01');
    const afterFirst = await getGoal(db, goal.id);
    expect(afterFirst?.currentCents).toBe(30000);
    expect(afterFirst?.status).toBe('active');
  });

  it('marks the goal as completed once contributions reach the target', async () => {
    const goal = await createGoal(db, {
      name: 'Reserva de emergência',
      targetCents: 100000,
      color: '#1B5E4F',
      icon: 'shield',
    });

    await contributeToGoal(db, goal.id, 60000, '2026-08-01');
    await contributeToGoal(db, goal.id, 50000, '2026-08-15');

    const finalGoal = await getGoal(db, goal.id);
    expect(finalGoal?.currentCents).toBe(110000);
    expect(finalGoal?.status).toBe('completed');
  });

  it('deleting a goal cascades to delete its contributions (no orphaned rows)', async () => {
    const goal = await createGoal(db, {
      name: 'Viagem',
      targetCents: 100000,
      color: '#1B5E4F',
      icon: 'airplane',
    });
    await contributeToGoal(db, goal.id, 30000, '2026-08-01');

    await deleteGoal(db, goal.id);

    const remainingContributions = await db.select().from(goalContributions);
    expect(remainingContributions).toHaveLength(0);
  });
});
