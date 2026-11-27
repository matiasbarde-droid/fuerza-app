/**
 * Conversión y redondeo de pesos.
 *
 * Regla: TODO se guarda en kg. Solo se convierte al mostrar.
 * - Lo que escribe el usuario no se redondea a incrementos (135 lb se ve 135 lb).
 * - Las sugerencias (progresión, conversión de planes) sí se redondean a
 *   incrementos realistas: 2,5 kg · 5 lb · kettlebell en saltos de 4 kg.
 */

export type Unit = 'kg' | 'lb';

export const LB_PER_KG = 2.20462262;

/** Redondea a un número de decimales (evita 61.23499999). */
function round(n: number, decimals = 1): number {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}

/** kg → valor en la unidad de visualización (1 decimal). */
export function kgToDisplay(kg: number, unit: Unit): number {
  return round(unit === 'kg' ? kg : kg * LB_PER_KG, 1);
}

/** Valor introducido en la unidad de visualización → kg (sin perder precisión). */
export function displayToKg(value: number, unit: Unit): number {
  return unit === 'kg' ? value : value / LB_PER_KG;
}

/** Incremento realista según unidad y equipamiento. Devuelve el paso EN KG. */
export function incrementKg(unit: Unit, equipment?: string | null): number {
  if (equipment === 'kettlebells') return 4; // las pesas rusas vienen en saltos de 4 kg
  return unit === 'kg' ? 2.5 : 5 / LB_PER_KG;
}

/**
 * Redondea un peso (en kg) al incremento realista más cercano, trabajando en
 * la unidad que ve el usuario para que el número mostrado sea "limpio".
 */
export function roundToIncrementKg(kg: number, unit: Unit, equipment?: string | null): number {
  if (kg <= 0) return 0;
  if (equipment === 'kettlebells') return Math.max(4, Math.round(kg / 4) * 4);
  const stepDisplay = unit === 'kg' ? 2.5 : 5;
  const display = unit === 'kg' ? kg : kg * LB_PER_KG;
  const rounded = Math.round(display / stepDisplay) * stepDisplay;
  return displayToKg(rounded, unit);
}

/**
 * Al cambiar de unidad, ajusta un peso al incremento realista de la nueva
 * unidad (65 kg → 145 lb, no 143,3 lb). Las kettlebells no se tocan: sus
 * saltos de 4 kg no dependen de la unidad.
 */
export function snapForUnit(kg: number | null, unit: Unit, equipment?: string | null): number | null {
  if (kg == null || equipment === 'kettlebells') return kg;
  return roundToIncrementKg(kg, unit, equipment);
}

/** Texto listo para mostrar, con coma decimal (es-ES). */
export function formatWeight(kg: number | null | undefined, unit: Unit): string {
  if (kg == null) return '—';
  const v = kgToDisplay(kg, unit);
  return `${v.toLocaleString('es-ES', { maximumFractionDigits: 1 })} ${unit}`;
}
