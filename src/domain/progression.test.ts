import { describe, expect, it } from 'vitest';
import { estimate1RM, suggestNext } from './progression';
import { kgToDisplay } from './units';

const base = { targetSets: 3, repsMin: 8, repsMax: 12, fallbackWeightKg: 50, unit: 'kg' as const };

describe('doble progresión', () => {
  it('sin historial usa el peso de la rutina', () => {
    const s = suggestNext({ ...base, last: undefined });
    expect(s.kind).toBe('first');
    expect(s.weightKg).toBe(50);
  });

  it('tope del rango en todas las series → sube peso', () => {
    const s = suggestNext({ ...base, last: [{ weightKg: 60, reps: 12 }, { weightKg: 60, reps: 12 }, { weightKg: 60, reps: 13 }] });
    expect(s.kind).toBe('increase');
    expect(s.weightKg).toBe(62.5);
    expect(s.repsTarget).toBe(8);
  });

  it('si falta alguna serie al tope → mismo peso, +1 rep', () => {
    const s = suggestNext({ ...base, last: [{ weightKg: 60, reps: 12 }, { weightKg: 60, reps: 10 }, { weightKg: 60, reps: 9 }] });
    expect(s.kind).toBe('repeat');
    expect(s.weightKg).toBe(60);
    expect(s.repsTarget).toBe(10);
  });

  it('menos series que las objetivo no cuenta como completado', () => {
    const s = suggestNext({ ...base, last: [{ weightKg: 60, reps: 12 }, { weightKg: 60, reps: 12 }] });
    expect(s.kind).toBe('repeat');
  });

  it('en lb sube 5 lb', () => {
    const lb135 = 135 / 2.20462262;
    const s = suggestNext({ ...base, unit: 'lb', last: Array(3).fill({ weightKg: lb135, reps: 12 }) });
    expect(kgToDisplay(s.weightKg!, 'lb')).toBe(140);
  });

  it('kettlebell sube 4 kg', () => {
    const s = suggestNext({ ...base, equipment: 'kettlebells', last: Array(3).fill({ weightKg: 16, reps: 12 }) });
    expect(s.weightKg).toBe(20);
  });

  it('peso corporal al tope → variante más difícil', () => {
    const s = suggestNext({ ...base, last: Array(3).fill({ weightKg: 0, reps: 12 }) });
    expect(s.kind).toBe('bodyweight-up');
    expect(s.weightKg).toBeNull();
  });

  it('por debajo del rango', () => {
    const s = suggestNext({ ...base, last: Array(3).fill({ weightKg: 80, reps: 6 }) });
    expect(s.kind).toBe('below');
  });

  it('1RM Epley', () => {
    expect(estimate1RM(100, 1)).toBe(100);
    expect(estimate1RM(100, 10)).toBeCloseTo(133.3, 1);
  });
});
