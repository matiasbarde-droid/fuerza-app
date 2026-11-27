/**
 * Cuestionario inicial → plan recomendado.
 * Lógica pura (sin interfaz) para poder testearla.
 */
import { PLANS, planDayOptions, type Plan } from '../data/plans';

export type Experience = 'none' | 'beginner' | 'intermediate' | 'returning';
export type EquipmentAccess = 'gym' | 'home';
export type Goal = 'muscle' | 'fat_loss' | 'health';

export interface QuizAnswers {
  experience: Experience;
  daysPerWeek: number; // días que estás dispuesto a entrenar (2–6)
  equipment: EquipmentAccess;
  goal: Goal;
}

export interface Recommendation {
  plan: Plan;
  /** Días/semana con los que se creará la rutina (ajustados a lo que admite el plan). */
  daysPerWeek: number;
  reasons: string[];
  alternatives: Plan[];
}

const byId = (id: string) => PLANS.find((p) => p.id === id)!;

/** Ajusta los días pedidos al valor admitido más cercano (sin pasarse si es posible). */
function fitDays(plan: Plan, wanted: number): number {
  const options = planDayOptions(plan);
  const notAbove = options.filter((d) => d <= wanted);
  return notAbove.length ? Math.max(...notAbove) : Math.min(...options);
}

export function recommendPlan(a: QuizAnswers): Recommendation {
  const reasons: string[] = [];
  let id: string;
  let alternatives: string[] = [];

  if (a.equipment === 'home') {
    id = 'principiante-casa-kettlebell';
    reasons.push('Entrenas en casa: el plan usa solo kettlebell y peso corporal.');
    if (a.daysPerWeek > 3)
      reasons.push(
        'Tienes más de 3 días: usa los días extra para trotar o caminar a paso rápido (30–45 min). Ayuda a la salud y, si quieres bajar grasa, al gasto calórico.',
      );
    if (a.experience === 'returning')
      reasons.push('Al volver tras años sin entrenar, las 2 primeras semanas haz 2 series por ejercicio y deja 3–4 reps en reserva.');
  } else if (a.goal === 'fat_loss') {
    id = 'recomposicion-fuerza-cardio';
    reasons.push('Tu objetivo es bajar grasa: la fuerza conserva el músculo y el trote suma gasto calórico.');
    if (a.experience === 'returning')
      reasons.push('Como vuelves tras una pausa larga, las primeras 2–4 semanas sigue la progresión del plan "Regreso" (2 series, RIR 3–4) antes de usar el volumen completo.');
    alternatives = a.experience === 'returning' ? ['regreso-al-entrenamiento'] : ['principiante-fullbody-gym'];
  } else if (a.experience === 'returning') {
    id = 'regreso-al-entrenamiento';
    reasons.push('Ya entrenaste antes: recuperarás rápido, pero el volumen debe subir poco a poco las primeras semanas.');
    alternatives = a.daysPerWeek >= 4 ? ['intermedio-upper-lower'] : ['principiante-fullbody-gym'];
  } else if (a.experience === 'intermediate' && a.daysPerWeek >= 5) {
    id = 'intermedio-ppl';
    reasons.push('Con experiencia y 5–6 días, PPL permite más volumen por sesión manteniendo 2x por semana.');
    alternatives = ['intermedio-upper-lower'];
  } else if (a.experience === 'intermediate' && a.daysPerWeek === 4) {
    id = 'intermedio-upper-lower';
    reasons.push('Con 4 días, Upper/Lower da frecuencia 2x con sesiones de duración razonable.');
    alternatives = ['intermedio-ppl'];
  } else {
    id = 'principiante-fullbody-gym';
    if (a.experience === 'intermediate')
      reasons.push('Con 2–3 días, el Full Body es lo más eficiente aunque tengas experiencia: mantiene la frecuencia de 2–3x por músculo.');
    else reasons.push('Para empezar, el Full Body permite practicar cada ejercicio varias veces por semana y progresar rápido.');
    if (a.daysPerWeek > 3)
      reasons.push('Si te sobran días, úsalos para cardio suave o para descansar. Al principio 3 días de fuerza son suficientes.');
    alternatives = a.daysPerWeek >= 4 ? ['intermedio-upper-lower'] : [];
  }

  const plan = byId(id);
  const daysPerWeek = fitDays(plan, a.daysPerWeek);
  if (daysPerWeek !== a.daysPerWeek)
    reasons.push(`El plan se ajusta a ${daysPerWeek} días por semana (elegiste ${a.daysPerWeek}).`);
  else reasons.push(`Rutina ajustada a ${daysPerWeek} días por semana.`);

  if (a.goal === 'health' && id !== 'recomposicion-fuerza-cardio')
    reasons.push('Para la salud general, suma 150 min/semana de actividad aeróbica moderada (caminar rápido, trotar, bici), como recomienda la OMS.');

  return { plan, daysPerWeek, reasons, alternatives: alternatives.map(byId) };
}
