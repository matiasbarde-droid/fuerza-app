/** Consultas de historial y progreso (todo calculado en el dispositivo). */
import Dexie from 'dexie';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, newId, type Session, type SetLog } from './db';
import { estimate1RM } from '../domain/progression';

export interface SessionSummary {
  session: Session;
  sets: number;
  volumeKg: number;
  exerciseIds: string[];
}

/** Sesiones terminadas, de la más reciente a la más antigua, con totales. */
export function useSessionHistory(): SessionSummary[] | undefined {
  return useLiveQuery(async () => {
    const [sessions, logs] = await Promise.all([
      db.sessions.orderBy('startedAt').reverse().toArray(),
      db.setLogs.toArray(),
    ]);
    const bySession = groupBy(logs, (l) => l.sessionId);
    return sessions.map((session) => {
      const ls = bySession.get(session.id) ?? [];
      return {
        session,
        sets: ls.length,
        volumeKg: ls.reduce((v, l) => v + l.weightKg * l.reps, 0),
        exerciseIds: [...new Set(ls.map((l) => l.exerciseId))],
      };
    });
  }, []);
}

export function useSessionDetail(id: string | undefined) {
  return useLiveQuery(async () => {
    if (!id) return null;
    const session = await db.sessions.get(id);
    if (!session) return null;
    const logs = await db.setLogs.where('sessionId').equals(id).sortBy('order');
    return { session, logs };
  }, [id]);
}

export async function deleteSession(id: string): Promise<void> {
  await db.transaction('rw', db.sessions, db.setLogs, async () => {
    await db.setLogs.where('sessionId').equals(id).delete();
    await db.sessions.delete(id);
  });
}

/** Un punto por sesión para los gráficos de un ejercicio. */
export interface ExercisePoint {
  date: number;
  sessionId: string;
  maxWeightKg: number;
  volumeKg: number;
  e1rmKg: number;
  bestSet: { weightKg: number; reps: number };
  totalReps: number;
}

export function useExerciseHistory(exerciseId: string | undefined): ExercisePoint[] | undefined {
  return useLiveQuery(async () => {
    if (!exerciseId) return [];
    const logs = await db.setLogs
      .where('[exerciseId+date]')
      .between([exerciseId, Dexie.minKey], [exerciseId, Dexie.maxKey])
      .toArray();
    return [...groupBy(logs, (l) => l.sessionId)].map(([sessionId, ls]) => {
      const best = ls.reduce((a, b) => (estimate1RM(b.weightKg, b.reps) > estimate1RM(a.weightKg, a.reps) ? b : a));
      return {
        sessionId,
        date: Math.min(...ls.map((l) => l.date)),
        maxWeightKg: Math.max(...ls.map((l) => l.weightKg)),
        volumeKg: ls.reduce((v, l) => v + l.weightKg * l.reps, 0),
        e1rmKg: Math.max(...ls.map((l) => estimate1RM(l.weightKg, l.reps))),
        bestSet: { weightKg: best.weightKg, reps: best.reps },
        totalReps: ls.reduce((n, l) => n + l.reps, 0),
      };
    }).sort((a, b) => a.date - b.date);
  }, [exerciseId]);
}

/** Ejercicios que tienen registros, con nº de sesiones y última fecha. */
export function useTrainedExercises() {
  return useLiveQuery(async () => {
    const logs = await db.setLogs.toArray();
    return [...groupBy(logs, (l) => l.exerciseId)]
      .map(([exerciseId, ls]) => ({
        exerciseId,
        sessions: new Set(ls.map((l) => l.sessionId)).size,
        lastDate: Math.max(...ls.map((l) => l.date)),
      }))
      .sort((a, b) => b.lastDate - a.lastDate);
  }, []);
}

// ---------------- Peso corporal ----------------

export function useBodyWeights() {
  return useLiveQuery(() => db.bodyweight.orderBy('date').toArray(), []);
}

export async function addBodyWeight(kg: number, date: number): Promise<void> {
  await db.bodyweight.put({ id: newId(), kg, date });
}

export async function deleteBodyWeight(id: string): Promise<void> {
  await db.bodyweight.delete(id);
}

// ---------------- Cardio ----------------

export function useCardio() {
  return useLiveQuery(() => db.cardio.orderBy('date').reverse().toArray(), []);
}

export async function addCardio(c: { type: string; durationMin: number; distanceKm?: number; notes?: string; date: number }) {
  await db.cardio.put({ id: newId(), ...c });
}

export async function deleteCardio(id: string): Promise<void> {
  await db.cardio.delete(id);
}

function groupBy<T>(items: T[], key: (t: T) => string): Map<string, T[]> {
  const m = new Map<string, T[]>();
  for (const it of items) {
    const k = key(it);
    const arr = m.get(k);
    if (arr) arr.push(it);
    else m.set(k, [it]);
  }
  return m;
}

export type { SetLog };
