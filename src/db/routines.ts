/** Operaciones sobre rutinas (crear desde plan, editar, duplicar…). */
import { useLiveQuery } from 'dexie-react-hooks';
import { db, newId, type Routine, type RoutineDay, type RoutineItem } from './db';
import { variantFor, type Plan } from '../data/plans';
import { snapForUnit, type Unit } from '../domain/units';

export function useRoutines(): Routine[] | undefined {
  return useLiveQuery(() => db.routines.orderBy('updatedAt').reverse().toArray(), []);
}

export function useRoutine(id: string | undefined): Routine | null | undefined {
  return useLiveQuery(async () => (id ? ((await db.routines.get(id)) ?? null) : null), [id]);
}

/** Copia un plan predefinido a una rutina editable. Devuelve su id. */
export async function createRoutineFromPlan(plan: Plan, daysPerWeek: number): Promise<string> {
  const variant = variantFor(plan, daysPerWeek);
  const now = Date.now();
  const routine: Routine = {
    id: newId(),
    name: plan.name,
    daysPerWeek,
    sourcePlanId: plan.id,
    createdAt: now,
    updatedAt: now,
    days: variant.days.map((d) => ({
      id: newId(),
      name: d.name,
      items: d.items.map((i) => ({
        id: newId(),
        exerciseId: i.exerciseId,
        sets: i.sets,
        repsMin: i.repsMin,
        repsMax: i.repsMax,
        weightKg: null, // el peso lo pones tú (o se propone en el modo entrenamiento)
        restSec: i.restSec,
        notes: i.note ?? '',
      })),
    })),
  };
  await saveAndActivate(routine);
  return routine.id;
}

export async function createEmptyRoutine(): Promise<string> {
  const now = Date.now();
  const routine: Routine = {
    id: newId(),
    name: 'Mi rutina',
    daysPerWeek: 3,
    createdAt: now,
    updatedAt: now,
    days: [
      { id: newId(), name: 'Día A', items: [] },
      { id: newId(), name: 'Día B', items: [] },
    ],
  };
  await saveAndActivate(routine);
  return routine.id;
}

/** Guarda una rutina nueva y la marca como activa si no había ninguna. */
async function saveAndActivate(routine: Routine) {
  await db.transaction('rw', db.routines, async () => {
    const hasActive = (await db.routines.filter((r) => !!r.active).count()) > 0;
    await db.routines.put({ ...routine, active: !hasActive });
  });
}

/**
 * Aplica un cambio a una rutina y la guarda. `mutate` recibe una copia
 * profunda, así que puede modificarla directamente.
 */
export async function updateRoutine(id: string, mutate: (r: Routine) => void): Promise<void> {
  await db.transaction('rw', db.routines, async () => {
    const current = await db.routines.get(id);
    if (!current) return;
    const copy = structuredClone(current);
    mutate(copy);
    copy.updatedAt = Date.now();
    await db.routines.put(copy);
  });
}

export async function setActiveRoutine(id: string): Promise<void> {
  await db.transaction('rw', db.routines, async () => {
    await db.routines.toCollection().modify((r) => {
      r.active = r.id === id;
    });
  });
}

export async function duplicateRoutine(id: string): Promise<string | undefined> {
  const r = await db.routines.get(id);
  if (!r) return;
  const now = Date.now();
  const copy: Routine = {
    ...structuredClone(r),
    id: newId(),
    name: `${r.name} (copia)`,
    active: false,
    createdAt: now,
    updatedAt: now,
  };
  copy.days = copy.days.map((d) => ({ ...d, id: newId(), items: d.items.map((i) => ({ ...i, id: newId() })) }));
  await db.routines.put(copy);
  return copy.id;
}

/**
 * Tras cambiar la unidad global, ajusta los pesos de las rutinas (en los
 * ejercicios que usan la unidad global) al incremento realista de la nueva unidad.
 */
export async function snapAllRoutineWeights(
  unit: Unit,
  equipmentOf: (exerciseId: string) => string | null | undefined,
): Promise<void> {
  await db.routines.toCollection().modify((r) => {
    for (const d of r.days)
      for (const i of d.items)
        if (!i.unit) i.weightKg = snapForUnit(i.weightKg, unit, equipmentOf(i.exerciseId));
  });
}

export async function deleteRoutine(id: string): Promise<void> {
  await db.routines.delete(id);
}

export function newDay(name: string): RoutineDay {
  return { id: newId(), name, items: [] };
}

export function newItem(exerciseId: string, restSec: number): RoutineItem {
  return { id: newId(), exerciseId, sets: 3, repsMin: 8, repsMax: 12, weightKg: null, restSec, notes: '' };
}
