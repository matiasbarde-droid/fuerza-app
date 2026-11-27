/**
 * Biblioteca de ejercicios: une la base free-exercise-db (empaquetada con la
 * app) con las traducciones y con los ejercicios propios guardados en Dexie.
 */
import { useEffect, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type CustomExercise } from '../../db/db';
import { EXERCISES_ES } from '../../data/translations.es';

/** Base pública de las imágenes (dominio público). */
export const IMAGE_BASE =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

interface RawExercise {
  id: string;
  name: string;
  level: string | null;
  mechanic: string | null;
  force: string | null;
  equipment: string | null;
  category: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  images: string[];
}

/** Modelo unificado que usa toda la interfaz. */
export interface Exercise {
  id: string;
  name: string; // en español si hay traducción
  nameEn: string | null;
  translated: boolean; // instrucciones en español
  level: string | null;
  mechanic: string | null;
  force: string | null;
  equipment: string | null;
  category: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  images: string[]; // URLs absolutas
  custom: boolean;
  photo?: Blob;
  /** Texto normalizado para búsqueda (sin tildes, minúsculas). */
  search: string;
}

/** Quita tildes y pasa a minúsculas para búsquedas tolerantes. */
export function normalize(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function fromRaw(e: RawExercise): Exercise {
  const es = EXERCISES_ES[e.id];
  const name = es?.name ?? e.name;
  return {
    id: e.id,
    name,
    nameEn: es ? e.name : null,
    translated: Boolean(es?.instructions),
    level: e.level,
    mechanic: e.mechanic,
    force: e.force,
    equipment: e.equipment,
    category: e.category,
    primaryMuscles: e.primaryMuscles,
    secondaryMuscles: e.secondaryMuscles,
    instructions: es?.instructions ?? e.instructions,
    images: e.images.map((p) => IMAGE_BASE + p),
    custom: false,
    search: normalize(`${name} ${e.name}`),
  };
}

function fromCustom(c: CustomExercise): Exercise {
  return {
    id: c.id,
    name: c.name,
    nameEn: null,
    translated: true,
    level: null,
    mechanic: null,
    force: null,
    equipment: c.equipment,
    category: 'strength',
    primaryMuscles: c.primaryMuscles,
    secondaryMuscles: c.secondaryMuscles,
    instructions: c.instructions,
    images: [],
    custom: true,
    photo: c.photo,
    search: normalize(c.name),
  };
}

// El JSON (~850 KB) se carga una sola vez y en un fragmento aparte,
// para que la app arranque rápido.
let basePromise: Promise<Exercise[]> | null = null;
function loadBase(): Promise<Exercise[]> {
  basePromise ??= import('../../data/exercises.json').then((m) =>
    (m.default as RawExercise[])
      .map(fromRaw)
      // Los traducidos (más comunes) primero; luego orden alfabético.
      .sort((a, b) => Number(!!b.nameEn) - Number(!!a.nameEn) || a.name.localeCompare(b.name, 'es')),
  );
  return basePromise;
}

/** Todos los ejercicios (propios primero). `undefined` mientras carga. */
export function useExercises(): Exercise[] | undefined {
  const [base, setBase] = useState<Exercise[]>();
  useEffect(() => {
    let alive = true;
    loadBase().then((b) => alive && setBase(b));
    return () => {
      alive = false;
    };
  }, []);
  const custom = useLiveQuery(() => db.customExercises.orderBy('createdAt').reverse().toArray(), []);

  return useMemo(() => {
    if (!base || !custom) return undefined;
    return [...custom.map(fromCustom), ...base];
  }, [base, custom]);
}

/** Índice id → ejercicio, para mostrar nombres e imágenes en rutinas. */
export function useExerciseMap(): Map<string, Exercise> | undefined {
  const all = useExercises();
  return useMemo(() => (all ? new Map(all.map((e) => [e.id, e])) : undefined), [all]);
}

/** Un ejercicio por id. `null` si no existe, `undefined` mientras carga. */
export function useExercise(id: string | undefined): Exercise | null | undefined {
  const all = useExercises();
  return useMemo(() => (all ? (all.find((e) => e.id === id) ?? null) : undefined), [all, id]);
}
