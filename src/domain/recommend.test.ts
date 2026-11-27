import { describe, expect, it } from 'vitest';
import { recommendPlan } from './recommend';

describe('recomendación de plan', () => {
  it('casa → kettlebell, máx. 3 días', () => {
    const r = recommendPlan({ experience: 'none', daysPerWeek: 5, equipment: 'home', goal: 'muscle' });
    expect(r.plan.id).toBe('principiante-casa-kettlebell');
    expect(r.daysPerWeek).toBe(3);
  });

  it('regreso tras pausa larga en gimnasio', () => {
    const r = recommendPlan({ experience: 'returning', daysPerWeek: 3, equipment: 'gym', goal: 'muscle' });
    expect(r.plan.id).toBe('regreso-al-entrenamiento');
    expect(r.daysPerWeek).toBe(3);
  });

  it('bajar grasa → recomposición', () => {
    const r = recommendPlan({ experience: 'beginner', daysPerWeek: 4, equipment: 'gym', goal: 'fat_loss' });
    expect(r.plan.id).toBe('recomposicion-fuerza-cardio');
    expect(r.daysPerWeek).toBe(4);
  });

  it('intermedio según días', () => {
    const base = { experience: 'intermediate', equipment: 'gym', goal: 'muscle' } as const;
    expect(recommendPlan({ ...base, daysPerWeek: 4 }).plan.id).toBe('intermedio-upper-lower');
    expect(recommendPlan({ ...base, daysPerWeek: 6 }).plan.id).toBe('intermedio-ppl');
    expect(recommendPlan({ ...base, daysPerWeek: 3 }).plan.id).toBe('principiante-fullbody-gym');
  });

  it('principiante con 2 días → full body a 2 días', () => {
    const r = recommendPlan({ experience: 'none', daysPerWeek: 2, equipment: 'gym', goal: 'health' });
    expect(r.plan.id).toBe('principiante-fullbody-gym');
    expect(r.daysPerWeek).toBe(2);
  });
});
