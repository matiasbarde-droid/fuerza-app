/**
 * Base de datos local (IndexedDB vía Dexie). Nada sale del dispositivo.
 *
 * Se definen ya todas las tablas de las 5 fases para no necesitar migraciones
 * tempranas. Todos los pesos se guardan en kg.
 */
import Dexie, { type Table } from 'dexie';
import type { Unit } from '../domain/units';

/** Ejercicio creado por el usuario (con foto opcional guardada como Blob). */
export interface CustomExercise {
  id: string; // "custom:<uuid>"
  name: string;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  photo?: Blob;
  createdAt: number;
}

/** Ejercicio dentro de un día de rutina. */
export interface RoutineItem {
  id: string;
  exerciseId: string;
  sets: number;
  repsMin: number;
  repsMax: number; // = repsMin si no es un rango
  weightKg: number | null;
  restSec: number;
  notes: string;
  unit?: Unit; // si se define, sustituye a la unidad global para este ejercicio
}

export interface RoutineDay {
  id: string;
  name: string; // "Día A"
  items: RoutineItem[];
}

export interface Routine {
  id: string;
  name: string;
  days: RoutineDay[];
  /**
   * Días de entrenamiento por semana. Los días de la rutina se recorren en
   * rotación: una rutina A/B a 3 días/semana da A-B-A, B-A-B…
   */
  daysPerWeek: number;
  sourcePlanId?: string;
  active?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Session {
  id: string;
  routineId?: string;
  dayId?: string;
  name: string;
  startedAt: number;
  endedAt?: number;
  notes?: string;
}

/** Una fila por serie realizada: hace inmediatas las consultas de historial. */
export interface SetLog {
  id: string;
  sessionId: string;
  exerciseId: string;
  date: number;
  order: number;
  weightKg: number;
  reps: number;
  done: boolean;
}

export interface BodyWeight {
  id: string;
  date: number;
  kg: number;
}

export interface Cardio {
  id: string;
  date: number;
  type: string; // "Trote", "Bicicleta"...
  durationMin: number;
  distanceKm?: number;
  notes?: string;
}

export interface Settings {
  key: 'app';
  unit: Unit;
  defaultRestSec: number;
  sound: boolean; // pitido al terminar el descanso
  vibration: boolean; // vibración al terminar el descanso
}

export const DEFAULT_SETTINGS: Settings = {
  key: 'app',
  unit: 'kg',
  defaultRestSec: 90,
  sound: true,
  vibration: true,
};

// ---------------- Sesión en curso (fase 3) ----------------

/** Lo que se hizo la última vez en un ejercicio (instantánea al empezar). */
export interface LastPerformance {
  date: number;
  sets: { weightKg: number; reps: number }[];
}

export interface ActiveSet {
  id: string;
  weightKg: number | null;
  reps: number | null;
  done: boolean;
  doneAt?: number;
}

export interface ActiveExercise {
  id: string;
  exerciseId: string;
  repsMin: number;
  repsMax: number;
  restSec: number;
  notes: string;
  unit?: Unit;
  routineItemId?: string;
  sets: ActiveSet[];
  last?: LastPerformance;
  suggestion?: { kind: string; message: string };
}

/**
 * Entrenamiento en curso. Se guarda en cada toque, así que si Android cierra
 * la app a mitad de sesión no se pierde nada. Al terminar se convierte en
 * Session + SetLogs y se borra.
 */
export interface ActiveSession {
  key: 'current';
  id: string;
  routineId?: string;
  dayId?: string;
  name: string;
  startedAt: number;
  exercises: ActiveExercise[];
  currentExerciseId?: string;
  currentSetId?: string;
  /** Descanso en marcha: momento en que termina (ms) y duración total. */
  restEndsAt?: number;
  restTotalSec?: number;
}

class FuerzaDB extends Dexie {
  customExercises!: Table<CustomExercise, string>;
  routines!: Table<Routine, string>;
  sessions!: Table<Session, string>;
  setLogs!: Table<SetLog, string>;
  bodyweight!: Table<BodyWeight, string>;
  cardio!: Table<Cardio, string>;
  settings!: Table<Settings, string>;
  activeSession!: Table<ActiveSession, string>;

  constructor() {
    super('fuerza');
    this.version(1).stores({
      customExercises: 'id, name, createdAt',
      routines: 'id, updatedAt',
      sessions: 'id, startedAt, routineId',
      setLogs: 'id, sessionId, exerciseId, [exerciseId+date], date',
      bodyweight: 'id, date',
      cardio: 'id, date',
      settings: 'key',
    });
    // v2: sesión en curso (fase 3).
    this.version(2).stores({ activeSession: 'key' });
  }
}

export const db = new FuerzaDB();

/** Identificador único (crypto.randomUUID existe en contextos seguros y en localhost). */
export function newId(prefix = ''): string {
  const uuid =
    typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return prefix + uuid;
}
