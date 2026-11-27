import { describe, expect, it } from 'vitest';
import exercises from './exercises.json';
import { EQUIPMENT_ES, EXERCISES_ES, MUSCLES_ES } from './translations.es';

describe('traducciones', () => {
  const ids = new Set((exercises as { id: string }[]).map((e) => e.id));

  it('todas las traducciones apuntan a ejercicios existentes', () => {
    const missing = Object.keys(EXERCISES_ES).filter((id) => !ids.has(id));
    expect(missing).toEqual([]);
  });

  it('todos los músculos y equipamientos tienen traducción', () => {
    const ex = exercises as { equipment: string | null; primaryMuscles: string[]; secondaryMuscles: string[] }[];
    const muscles = new Set(ex.flatMap((e) => [...e.primaryMuscles, ...e.secondaryMuscles]));
    const equip = new Set(ex.map((e) => e.equipment).filter((x): x is string => !!x));
    expect([...muscles].filter((m) => !MUSCLES_ES[m])).toEqual([]);
    expect([...equip].filter((q) => !EQUIPMENT_ES[q])).toEqual([]);
  });
});
