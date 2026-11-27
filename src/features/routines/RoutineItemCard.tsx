import type { HTMLAttributes } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { RoutineItem } from '../../db/db';
import type { Unit } from '../../domain/units';
import { formatWeight, snapForUnit } from '../../domain/units';
import { ExerciseImage } from '../../components/ExerciseImage';
import { Icon } from '../../components/Icon';
import { Chip } from '../../components/ui';
import { Stepper, WeightField, clamp, formatReps, formatRest } from '../../components/fields';
import type { Exercise } from '../exercises/library';

/** Asa para arrastrar (seis puntos). Solo desde aquí se arrastra: el resto permite hacer scroll. */
function DragHandle(props: HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="grid h-12 w-8 shrink-0 cursor-grab touch-none place-items-center text-muted active:text-accent"
      aria-label="Arrastrar para reordenar"
    >
      <svg viewBox="0 0 10 16" className="h-5 w-3" fill="currentColor" aria-hidden="true">
        {[2, 8, 14].map((y) => (
          <g key={y}>
            <circle cx="2" cy={y} r="1.6" />
            <circle cx="8" cy={y} r="1.6" />
          </g>
        ))}
      </svg>
    </button>
  );
}

/**
 * Tarjeta de un ejercicio de la rutina. Plegada muestra el resumen
 * (3 × 8–12 · 60 kg); al tocarla se despliega el editor.
 */
export default function RoutineItemCard({
  item,
  exercise,
  globalUnit,
  expanded,
  onToggle,
  onChange,
  onRemove,
}: {
  item: RoutineItem;
  exercise: Exercise | undefined;
  globalUnit: Unit;
  expanded: boolean;
  onToggle: () => void;
  /** Cambio directo (objeto) o relativo al valor guardado (función). */
  onChange: (patch: Partial<RoutineItem> | ((it: RoutineItem) => void)) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const unit = item.unit ?? globalUnit;
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl bg-surface ${isDragging ? 'relative z-10 shadow-2xl ring-2 ring-accent' : ''}`}
    >
      <div className="flex items-center gap-2 p-2">
        <DragHandle {...attributes} {...listeners} />
        <button onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          {exercise ? (
            <ExerciseImage exercise={exercise} className="h-12 w-12 shrink-0 rounded-lg" />
          ) : (
            <div className="h-12 w-12 shrink-0 rounded-lg bg-surface-2" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{exercise?.name ?? 'Ejercicio no encontrado'}</p>
            <p className="truncate text-sm tabular-nums text-muted">
              {item.sets} × {formatReps(item.repsMin, item.repsMax)}
              {item.weightKg != null && ` · ${formatWeight(item.weightKg, unit)}`}
              {` · ${formatRest(item.restSec)}`}
            </p>
          </div>
        </button>
      </div>

      {expanded && (
        <div className="space-y-4 border-t border-line p-4">
          <Stepper label="Series" value={item.sets} min={1} max={20} onStep={(d) => onChange((it) => void (it.sets = clamp(it.sets + d, 1, 20)))} />
          <div className="grid grid-cols-2 gap-3">
            <Stepper
              label="Reps mín."
              value={item.repsMin}
              min={1}
              onStep={(d) =>
                onChange((it) => {
                  it.repsMin = clamp(it.repsMin + d, 1, 999);
                  it.repsMax = Math.max(it.repsMin, it.repsMax);
                })
              }
            />
            <Stepper
              label="Reps máx."
              value={item.repsMax}
              min={1}
              onStep={(d) =>
                onChange((it) => {
                  it.repsMax = clamp(it.repsMax + d, 1, 999);
                  it.repsMin = Math.min(it.repsMin, it.repsMax);
                })
              }
            />
          </div>
          <WeightField
            label={`Peso inicial (${unit})`}
            valueKg={item.weightKg}
            unit={unit}
            equipment={exercise?.equipment}
            onChange={(weightKg) => onChange({ weightKg })}
            onAdjust={(fn) => onChange((it) => void (it.weightKg = fn(it.weightKg)))}
          />
          <div>
            <span className="mb-1 block text-xs font-semibold text-muted">Unidad para este ejercicio</span>
            <div className="flex gap-2">
              {([undefined, 'kg', 'lb'] as const).map((u) => (
                <Chip
                  key={u ?? 'global'}
                  active={item.unit === u}
                  // Al cambiar de unidad, el peso se ajusta al incremento realista.
                  onClick={() =>
                    onChange({ unit: u, weightKg: snapForUnit(item.weightKg, u ?? globalUnit, exercise?.equipment) })
                  }
                >
                  {u ?? `Global (${globalUnit})`}
                </Chip>
              ))}
            </div>
          </div>
          <Stepper
            label="Descanso"
            value={item.restSec}
            step={15}
            max={600}
            format={formatRest}
            onStep={(d) => onChange((it) => void (it.restSec = clamp(it.restSec + d, 0, 600)))}
          />
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-muted">Notas</span>
            <textarea
              defaultValue={item.notes}
              onBlur={(e) => e.target.value !== item.notes && onChange({ notes: e.target.value.slice(0, 500) })}
              rows={2}
              placeholder="Ej. agarre neutro, asiento en posición 4…"
              className="w-full rounded-xl bg-bg p-3 text-sm outline-none focus:ring-2 focus:ring-accent"
            />
          </label>
          <button onClick={onRemove} className="flex h-11 items-center gap-2 text-sm font-semibold text-danger">
            <Icon name="trash" /> Quitar de la rutina
          </button>
        </div>
      )}
    </li>
  );
}
