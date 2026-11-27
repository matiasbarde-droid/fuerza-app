import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { db } from './db';
import { exportData, readBackup, restoreBackup } from './backup';

describe('respaldo JSON', () => {
  it('exportar → borrar → importar recupera todo (incluida la foto)', async () => {
    const photo = new Blob([new Uint8Array([255, 216, 255, 1, 2, 3])], { type: 'image/jpeg' });
    await db.customExercises.put({ id: 'custom:1', name: 'Remo T', equipment: 'barbell', primaryMuscles: ['lats'], secondaryMuscles: [], instructions: [], photo, createdAt: 1 });
    await db.routines.put({ id: 'r1', name: 'Mi rutina', daysPerWeek: 3, days: [], createdAt: 1, updatedAt: 1 });
    await db.sessions.put({ id: 's1', name: 'Día A', startedAt: 10, endedAt: 20 });
    await db.setLogs.put({ id: 'l1', sessionId: 's1', exerciseId: 'Barbell_Squat', date: 10, order: 0, weightKg: 60, reps: 8, done: true });
    await db.bodyweight.put({ id: 'b1', date: 5, kg: 80 });
    await db.settings.put({ key: 'app', unit: 'lb', defaultRestSec: 120, sound: false, vibration: true });

    const { blob, counts } = await exportData();
    expect(counts.setLogs).toBe(1);

    await Promise.all(db.tables.map((t) => t.clear()));
    expect(await db.routines.count()).toBe(0);

    const file = new File([await blob.text()], 'r.json', { type: 'application/json' });
    const { data } = await readBackup(file);
    await restoreBackup(data);

    expect((await db.routines.get('r1'))?.name).toBe('Mi rutina');
    expect((await db.setLogs.get('l1'))?.weightKg).toBe(60);
    expect((await db.settings.get('app'))?.unit).toBe('lb');
    const restored = await db.customExercises.get('custom:1');
    expect(restored?.photo).toBeInstanceOf(Blob);
    expect(new Uint8Array(await restored!.photo!.arrayBuffer())).toEqual(new Uint8Array([255, 216, 255, 1, 2, 3]));
  });

  it('rechaza archivos que no son respaldos', async () => {
    const bad = new File(['{"hola":1}'], 'x.json');
    await expect(readBackup(bad)).rejects.toThrow('no es un respaldo');
    const notJson = new File(['abc'], 'x.json');
    await expect(readBackup(notJson)).rejects.toThrow('JSON');
  });
});
