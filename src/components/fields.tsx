/** Campos numéricos grandes, cómodos con el pulgar. */
import { useEffect, useState } from 'react';
import { displayToKg, incrementKg, kgToDisplay, type Unit } from '../domain/units';

const stepBtn =
  'grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-surface-2 text-2xl font-bold active:bg-line disabled:opacity-30';

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * Contador con botones − / + .
 *
 * Emite un DELTA (±step), no el valor final: quien lo recibe lo suma al valor
 * guardado dentro de la transacción. Así, tocar "+" 7 veces seguidas suma 7
 * aunque la pantalla aún no se haya refrescado entre toque y toque.
 */
export function Stepper({
  label,
  value,
  onStep,
  step = 1,
  min = 0,
  max = 999,
  format = (v) => String(v),
}: {
  label: string;
  value: number;
  onStep: (delta: number) => void;
  step?: number;
  min?: number;
  max?: number;
  format?: (v: number) => string;
}) {
  return (
    <div>
      <span className="mb-1 block text-xs font-semibold text-muted">{label}</span>
      <div className="flex items-center gap-2">
        <button className={stepBtn} onClick={() => onStep(-step)} disabled={value <= min} aria-label={`Restar ${label}`}>
          −
        </button>
        <span className="min-w-0 flex-1 text-center text-lg font-bold tabular-nums">{format(value)}</span>
        <button className={stepBtn} onClick={() => onStep(step)} disabled={value >= max} aria-label={`Sumar ${label}`}>
          +
        </button>
      </div>
    </div>
  );
}

/** Convierte texto del usuario ("62,5") a número; null si está vacío o es inválido. */
export function parseDecimal(s: string): number | null {
  const n = Number(s.replace(',', '.').trim());
  return s.trim() === '' || !Number.isFinite(n) || n < 0 ? null : n;
}

/**
 * Peso: se edita en la unidad visible y se guarda en kg.
 * Los botones ± suman el incremento realista (2,5 kg / 5 lb / 4 kg en kettlebell).
 * Vacío = sin peso asignado.
 */
export function WeightField({
  label = 'Peso',
  valueKg,
  unit,
  equipment,
  onChange,
  onAdjust,
}: {
  label?: string;
  valueKg: number | null;
  unit: Unit;
  equipment?: string | null;
  /** Peso escrito a mano (valor absoluto). */
  onChange: (kg: number | null) => void;
  /** Botones ±: recibe una función que calcula el nuevo peso a partir del guardado. */
  onAdjust: (fn: (currentKg: number | null) => number | null) => void;
}) {
  const shown = valueKg == null ? '' : String(kgToDisplay(valueKg, unit)).replace('.', ',');
  const [text, setText] = useState(shown);
  useEffect(() => setText(shown), [shown]);

  const commit = (s: string) => {
    if (s === shown) return; // sin cambios: no pisar el valor guardado
    const n = parseDecimal(s);
    onChange(n == null ? null : displayToKg(n, unit));
  };

  const inc = incrementKg(unit, equipment);
  const bump = (dir: 1 | -1) =>
    onAdjust((cur) => {
      const next = Math.max(0, (cur ?? 0) + dir * inc);
      return next === 0 ? null : next;
    });

  return (
    <div>
      <span className="mb-1 block text-xs font-semibold text-muted">{label}</span>
      <div className="flex items-center gap-2">
        <button className={stepBtn} onClick={() => bump(-1)} disabled={!valueKg} aria-label="Bajar peso">
          −
        </button>
        <label className="flex h-12 min-w-0 flex-1 items-center justify-center gap-1 rounded-xl bg-bg px-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
            inputMode="decimal"
            placeholder="—"
            className="w-full min-w-0 bg-transparent text-center text-lg font-bold tabular-nums outline-none"
            aria-label={`${label} en ${unit}`}
          />
          <span className="text-sm text-muted">{unit}</span>
        </label>
        <button className={stepBtn} onClick={() => bump(1)} aria-label="Subir peso">
          +
        </button>
      </div>
    </div>
  );
}

export function formatReps(min: number, max: number): string {
  return min === max ? String(min) : `${min}–${max}`;
}

export function formatRest(sec: number): string {
  if (sec <= 0) return 'sin descanso';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m ? `${m}:${String(s).padStart(2, '0')} min` : `${s} s`;
}
