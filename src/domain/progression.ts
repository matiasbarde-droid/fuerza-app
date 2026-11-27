/**
 * Sugerencia de progresión: DOBLE PROGRESIÓN.
 *
 * Se trabaja en un rango de reps (ej. 8–12):
 *  1. Con el mismo peso, se intenta sumar repeticiones sesión a sesión.
 *  2. Cuando se completa el TOPE del rango en TODAS las series, se sube el
 *     peso al siguiente incremento realista y se vuelve a la parte baja del rango.
 */
import { formatWeight, incrementKg, roundToIncrementKg, type Unit } from './units';

export interface PerformedSet {
  weightKg: number; // 0 = peso corporal
  reps: number;
}

export type SuggestionKind = 'first' | 'increase' | 'repeat' | 'below' | 'bodyweight-up' | 'none';

export interface Suggestion {
  kind: SuggestionKind;
  /** Peso propuesto para hoy (null = sin carga / peso corporal / sin datos). */
  weightKg: number | null;
  /** Reps objetivo por serie para hoy. */
  repsTarget: number;
  message: string;
}

export function suggestNext(p: {
  last: PerformedSet[] | undefined;
  targetSets: number;
  repsMin: number;
  repsMax: number;
  fallbackWeightKg: number | null;
  unit: Unit;
  equipment?: string | null;
  isCardio?: boolean;
}): Suggestion {
  const { last, targetSets, repsMin, repsMax, unit, equipment } = p;

  if (p.isCardio) {
    return { kind: 'none', weightKg: null, repsTarget: repsMin, message: '' };
  }

  if (!last || last.length === 0) {
    return {
      kind: 'first',
      weightKg: p.fallbackWeightKg,
      repsTarget: repsMin,
      message:
        p.fallbackWeightKg == null
          ? `Primera vez: elige un peso con el que podrías hacer ~${repsMax + 2} reps (te quedan 2–3 en reserva).`
          : 'Primera vez con este ejercicio: usa el peso de la rutina y ajusta si es necesario.',
    };
  }

  const top = Math.max(...last.map((s) => s.weightKg));
  const bodyweight = top <= 0;
  const allAtTop = last.length >= targetSets && last.every((s) => s.reps >= repsMax);
  const minReps = Math.min(...last.map((s) => s.reps));

  if (allAtTop) {
    if (bodyweight) {
      return {
        kind: 'bodyweight-up',
        weightKg: null,
        repsTarget: repsMax,
        message: `Completaste ${repsMax} reps en todas las series: usa una variante más difícil, añade lastre o sube el rango de reps.`,
      };
    }
    let next = roundToIncrementKg(top + incrementKg(unit, equipment), unit, equipment);
    if (next <= top + 1e-6) next = top + incrementKg(unit, equipment);
    return {
      kind: 'increase',
      weightKg: next,
      repsTarget: repsMin,
      message: `¡Completaste ${repsMax} reps en todas las series! Sube a ${formatWeight(next, unit)} y vuelve a ${repsMin} reps.`,
    };
  }

  if (last.every((s) => s.reps < repsMin)) {
    return {
      kind: 'below',
      weightKg: bodyweight ? null : top,
      repsTarget: repsMin,
      message: bodyweight
        ? `La última vez quedaste por debajo de ${repsMin} reps: usa una variante más fácil o repite hasta llegar al rango.`
        : `La última vez quedaste por debajo de ${repsMin} reps: repite ${formatWeight(top, unit)} o baja un 5–10 % si la técnica sufrió.`,
    };
  }

  const repsTarget = Math.min(repsMax, Math.max(repsMin, minReps + 1));
  return {
    kind: 'repeat',
    weightKg: bodyweight ? null : top,
    repsTarget,
    message: bodyweight
      ? `Intenta ${repsTarget}+ reps por serie (meta: ${repsMax} en todas).`
      : `Mantén ${formatWeight(top, unit)} e intenta ${repsTarget}+ reps por serie (meta: ${repsMax} en todas para subir).`,
  };
}

/** 1RM estimado (fórmula de Epley). Se usará en los gráficos de la fase 4. */
export function estimate1RM(weightKg: number, reps: number): number {
  if (reps <= 0 || weightKg <= 0) return 0;
  return reps === 1 ? weightKg : weightKg * (1 + reps / 30);
}
