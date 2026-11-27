import { describe, expect, it } from 'vitest';
import exercises from './exercises.json';
import { PLANS, planDayOptions, variantFor } from './plans';

const ids = new Set((exercises as { id: string }[]).map((e) => e.id));

describe('planes predefinidos', () => {
  it('todos los ejercicios existen en la base', () => {
    const missing = PLANS.flatMap((p) =>
      p.variants.flatMap((v) => v.days.flatMap((d) => d.items.map((i) => i.exerciseId))),
    ).filter((id) => !ids.has(id));
    expect(missing).toEqual([]);
  });

  it('series y rangos de reps son coherentes', () => {
    for (const p of PLANS)
      for (const v of p.variants)
        for (const d of v.days)
          for (const i of d.items) {
            expect(i.sets).toBeGreaterThan(0);
            expect(i.repsMin).toBeGreaterThan(0);
            expect(i.repsMax).toBeGreaterThanOrEqual(i.repsMin);
          }
  });

  it('ids de plan únicos', () => {
    expect(new Set(PLANS.map((p) => p.id)).size).toBe(PLANS.length);
  });

  it('elige la variante según los días', () => {
    const recomp = PLANS.find((p) => p.id === 'recomposicion-fuerza-cardio')!;
    expect(variantFor(recomp, 3).days).toHaveLength(3);
    expect(variantFor(recomp, 4).days).toHaveLength(4);
    expect(variantFor(recomp, 2).daysPerWeek).toContain(3); // la más cercana
    expect(planDayOptions(recomp)).toEqual([3, 4, 5, 6]);
  });
});
