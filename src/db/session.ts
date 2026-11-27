/**
 * Ciclo de vida de un entrenamiento: empezar → registrar series → terminar.
 */
import Dexie from 'dexie';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  db, newId,
  type ActiveExercise, type ActiveSession, type ActiveSet, type LastPerformance, type Routine,
  type Session, type SetLog,
} from './db';
import { getSettings } from './settings';
import { suggestNext } from '../domain/progression';
import type { Unit } from '../domain/units';

/** Datos del ejercicio que necesita la sugerencia de progresión. */
export interface ExerciseInfo {
  equipment: string | null;
  category: string | null;
}
type InfoOf = (exerciseId: string) => ExerciseInfo | undefined;

export function useActiveSession(): ActiveSession | null | undefined {
  return useLiveQuery(async () => (await db.activeSession.get('current')) ?? null, []);
}

/** Lo que se hizo la última vez (la sesión terminada más reciente con ese ejercicio). */
export async function getLastPerformance(exerciseId: string): Promise<LastPerformance | undefined> {
  const latest = await db.setLogs
    .where('[exerciseId+date]')
    .between([exerciseId, Dexie.minKey], [exerciseId, Dexie.maxKey])
    .last();
  if (!latest) return;
  const logs = await db.setLogs.where('sessionId').equals(latest.sessionId).toArray();
  const sets = logs
    .filter((l) => l.exerciseId === exerciseId && l.done)
    .sort((a, b) => a.order - b.order)
    .map((l) => ({ weightKg: l.weightKg, reps: l.reps }));
  return sets.length ? { date: latest.date, sets } : undefined;
}

/** Siguiente día de la rutina en la rotación (después del último entrenado). */
export async function nextDayId(routine: Routine): Promise<string | undefined> {
  const last = await db.sessions.where('routineId').equals(routine.id).sortBy('startedAt');
  const lastDayId = last.at(-1)?.dayId;
  const idx = routine.days.findIndex((d) => d.id === lastDayId);
  return routine.days[(idx + 1) % routine.days.length]?.id;
}

export function useNextDayId(routine: Routine | undefined): string | undefined {
  return useLiveQuery(async () => (routine ? nextDayId(routine) : undefined), [routine]);
}

/** Prepara un ejercicio de la sesión: series prellenadas con la sugerencia. */
async function buildExercise(
  base: { exerciseId: string; sets: number; repsMin: number; repsMax: number; weightKg: number | null; restSec: number; notes: string; unit?: Unit; routineItemId?: string },
  globalUnit: Unit,
  info: ExerciseInfo | undefined,
): Promise<ActiveExercise> {
  const last = await getLastPerformance(base.exerciseId);
  const s = suggestNext({
    last: last?.sets,
    targetSets: base.sets,
    repsMin: base.repsMin,
    repsMax: base.repsMax,
    fallbackWeightKg: base.weightKg,
    unit: base.unit ?? globalUnit,
    equipment: info?.equipment,
    isCardio: info?.category === 'cardio',
  });
  const weight = s.kind === 'none' ? base.weightKg : s.weightKg;
  const sets: ActiveSet[] = Array.from({ length: base.sets }, () => ({
    id: newId(),
    weightKg: weight,
    reps: s.repsTarget,
    done: false,
  }));
  return {
    id: newId(),
    exerciseId: base.exerciseId,
    repsMin: base.repsMin,
    repsMax: base.repsMax,
    restSec: base.restSec,
    notes: base.notes,
    unit: base.unit,
    routineItemId: base.routineItemId,
    sets,
    last,
    suggestion: s.message ? { kind: s.kind, message: s.message } : undefined,
  };
}

export async function startSessionFromDay(routine: Routine, dayId: string, infoOf: InfoOf): Promise<void> {
  const day = routine.days.find((d) => d.id === dayId);
  if (!day) return;
  const { unit } = await getSettings();
  const exercises = await Promise.all(
    day.items.map((i) =>
      buildExercise({ ...i, routineItemId: i.id }, unit, infoOf(i.exerciseId)),
    ),
  );
  await db.activeSession.put({
    key: 'current',
    id: newId(),
    routineId: routine.id,
    dayId,
    name: `${day.name} · ${routine.name}`,
    startedAt: Date.now(),
    exercises,
    currentExerciseId: exercises[0]?.id,
    currentSetId: exercises[0]?.sets[0]?.id,
  });
}

export async function startFreeSession(): Promise<void> {
  await db.activeSession.put({
    key: 'current',
    id: newId(),
    name: 'Entrenamiento libre',
    startedAt: Date.now(),
    exercises: [],
  });
}

/** Modifica la sesión en curso (recibe una copia que se puede mutar). */
export async function updateSession(mutate: (s: ActiveSession) => void): Promise<void> {
  await db.transaction('rw', db.activeSession, async () => {
    const s = await db.activeSession.get('current');
    if (!s) return;
    const copy = structuredClone(s);
    mutate(copy);
    await db.activeSession.put(copy);
  });
}

export async function addExerciseToSession(exerciseId: string, info: ExerciseInfo | undefined): Promise<void> {
  const { unit, defaultRestSec } = await getSettings();
  const isCardio = info?.category === 'cardio';
  const ex = await buildExercise(
    { exerciseId, sets: isCardio ? 1 : 3, repsMin: 8, repsMax: 12, weightKg: null, restSec: isCardio ? 0 : defaultRestSec, notes: '' },
    unit,
    info,
  );
  await updateSession((s) => {
    s.exercises.push(ex);
    s.currentExerciseId = ex.id;
    s.currentSetId = ex.sets[0]?.id;
  });
}

/**
 * Marca/desmarca una serie. Al completarla arranca el descanso y selecciona
 * la siguiente serie pendiente (del mismo ejercicio o del siguiente).
 */
export async function toggleSetDone(exerciseId: string, setId: string): Promise<boolean> {
  let completed = false;
  await updateSession((s) => {
    const exIdx = s.exercises.findIndex((e) => e.id === exerciseId);
    const ex = s.exercises[exIdx];
    const set = ex?.sets.find((x) => x.id === setId);
    if (!ex || !set) return;

    set.done = !set.done;
    set.doneAt = set.done ? Date.now() : undefined;
    completed = set.done;
    if (!set.done) return;

    if (set.reps == null) set.reps = ex.repsMin;

    // Siguiente serie pendiente: primero en este ejercicio, luego en los siguientes.
    const ordered = [...s.exercises.slice(exIdx), ...s.exercises.slice(0, exIdx)];
    for (const e of ordered) {
      const pending = e.sets.find((x) => !x.done);
      if (pending) {
        s.currentExerciseId = e.id;
        s.currentSetId = pending.id;
        break;
      }
    }

    const allDone = s.exercises.every((e) => e.sets.every((x) => x.done));
    if (ex.restSec > 0 && !allDone) {
      s.restEndsAt = Date.now() + ex.restSec * 1000;
      s.restTotalSec = ex.restSec;
    } else {
      s.restEndsAt = undefined;
    }
  });
  return completed;
}

/** Guarda el entrenamiento en el historial y borra la sesión en curso. */
export async function finishSession(): Promise<string | undefined> {
  return db.transaction('rw', db.activeSession, db.sessions, db.setLogs, async () => {
    const s = await db.activeSession.get('current');
    if (!s) return;
    const now = Date.now();
    const session: Session = {
      id: s.id,
      routineId: s.routineId,
      dayId: s.dayId,
      name: s.name,
      startedAt: s.startedAt,
      endedAt: now,
    };
    const logs: SetLog[] = [];
    let order = 0;
    for (const e of s.exercises)
      for (const set of e.sets)
        if (set.done)
          logs.push({
            id: newId(),
            sessionId: s.id,
            exerciseId: e.exerciseId,
            date: set.doneAt ?? now,
            order: order++,
            weightKg: set.weightKg ?? 0,
            reps: set.reps ?? 0,
            done: true,
          });
    await db.sessions.put(session);
    await db.setLogs.bulkPut(logs);
    await db.activeSession.delete('current');
    return s.id;
  });
}

export async function discardSession(): Promise<void> {
  await db.activeSession.delete('current');
}

/**
 * Copia a la rutina el peso usado hoy (última serie completada de cada
 * ejercicio), para que la próxima vez arranque desde ahí.
 */
export async function saveWeightsToRoutine(sessionId: string): Promise<number> {
  const session = await db.sessions.get(sessionId);
  if (!session?.routineId) return 0;
  const logs = await db.setLogs.where('sessionId').equals(sessionId).sortBy('order');
  const lastWeight = new Map<string, number>();
  for (const l of logs) if (l.weightKg > 0) lastWeight.set(l.exerciseId, l.weightKg);
  let changed = 0;
  await db.transaction('rw', db.routines, async () => {
    const r = await db.routines.get(session.routineId!);
    if (!r) return;
    for (const d of r.days)
      if (d.id === session.dayId)
        for (const i of d.items) {
          const w = lastWeight.get(i.exerciseId);
          if (w != null && w !== i.weightKg) {
            i.weightKg = w;
            changed++;
          }
        }
    r.updatedAt = Date.now();
    await db.routines.put(r);
  });
  return changed;
}
