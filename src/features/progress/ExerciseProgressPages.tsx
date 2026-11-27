import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useExerciseHistory, useTrainedExercises } from '../../db/history';
import { useSettings } from '../../db/settings';
import { formatWeight, kgToDisplay } from '../../domain/units';
import { ExerciseImage } from '../../components/ExerciseImage';
import { Card, Chip, PageHeader } from '../../components/ui';
import TrendChart from '../../components/TrendChart';
import { useExerciseMap } from '../exercises/library';
import { relativeDay } from '../workout/TrainPage';
import ProgressTabs from './ProgressTabs';

/** Lista de ejercicios que has entrenado. */
export function ExerciseProgressListPage() {
  const trained = useTrainedExercises();
  const exercises = useExerciseMap();
  return (
    <>
      <ProgressTabs />
      <ul className="space-y-2 px-4">
        {trained?.length === 0 && (
          <li className="rounded-2xl border border-dashed border-line p-6 text-center text-muted">
            Cuando registres series, aquí verás la evolución de cada ejercicio.
          </li>
        )}
        {trained?.map((t) => {
          const ex = exercises?.get(t.exerciseId);
          return (
            <li key={t.exerciseId}>
              <Link
                to={`/progreso/ejercicios/${encodeURIComponent(t.exerciseId)}`}
                className="flex items-center gap-3 rounded-2xl bg-surface p-2 active:bg-surface-2"
              >
                {ex ? <ExerciseImage exercise={ex} className="h-12 w-12 shrink-0 rounded-lg" /> : <div className="h-12 w-12 rounded-lg bg-surface-2" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{ex?.name ?? t.exerciseId}</p>
                  <p className="text-sm text-muted">
                    {t.sessions} {t.sessions === 1 ? 'sesión' : 'sesiones'} · última {relativeDay(t.lastDate)}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}

type Metric = 'e1rm' | 'max' | 'volume' | 'reps';
const METRICS: { key: Metric; label: string; help: string }[] = [
  { key: 'e1rm', label: '1RM estimado', help: 'Máximo teórico a 1 repetición (fórmula de Epley) de tu mejor serie de cada día. Compara sesiones con distinto peso y reps.' },
  { key: 'max', label: 'Peso máximo', help: 'El mayor peso que usaste en cada sesión.' },
  { key: 'volume', label: 'Volumen', help: 'Peso × repeticiones sumado en todas las series de la sesión.' },
  { key: 'reps', label: 'Reps totales', help: 'Repeticiones totales por sesión (útil en ejercicios con peso corporal).' },
];

/** Gráficos de un ejercicio. */
export function ExerciseProgressPage() {
  const { id } = useParams();
  const exerciseId = id ? decodeURIComponent(id) : undefined;
  const history = useExerciseHistory(exerciseId);
  const exercises = useExerciseMap();
  const { unit } = useSettings();
  const ex = exerciseId ? exercises?.get(exerciseId) : undefined;

  // Sin peso registrado (peso corporal) → por defecto se muestran las reps.
  const weighted = history?.some((p) => p.maxWeightKg > 0) ?? true;
  const [metric, setMetric] = useState<Metric | null>(null);
  const m = metric ?? (weighted ? 'e1rm' : 'reps');
  const meta = METRICS.find((x) => x.key === m)!;

  const data = (history ?? []).map((p) => ({
    t: p.date,
    v:
      m === 'reps'
        ? p.totalReps
        : kgToDisplay(m === 'e1rm' ? p.e1rmKg : m === 'max' ? p.maxWeightKg : p.volumeKg, unit),
  }));

  const best = history?.length ? history.reduce((a, b) => (b.e1rmKg > a.e1rmKg ? b : a)) : undefined;
  const first = history?.[0];
  const last = history?.at(-1);

  return (
    <>
      <PageHeader title={ex?.name ?? 'Ejercicio'} back />
      <div className="space-y-4 px-4 pb-6">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {METRICS.filter((x) => weighted || x.key === 'reps').map((x) => (
            <Chip key={x.key} active={m === x.key} onClick={() => setMetric(x.key)}>
              {x.label}
            </Chip>
          ))}
        </div>

        <Card className="px-3">
          <h2 className="mb-1 px-1 font-semibold">
            {meta.label} {m !== 'reps' && <span className="font-normal text-muted">({unit})</span>}
          </h2>
          <p className="mb-3 px-1 text-xs text-muted">{meta.help}</p>
          <TrendChart data={data} unit={m === 'reps' ? 'reps' : unit} />
        </Card>

        {weighted && best && first && last && (
          <div className="grid grid-cols-2 gap-2">
            <Card className="p-3">
              <p className="text-xs text-muted">Mejor serie</p>
              <p className="text-lg font-bold tabular-nums">
                {formatWeight(best.bestSet.weightKg, unit)} × {best.bestSet.reps}
              </p>
              <p className="text-xs text-muted">1RM≈{formatWeight(best.e1rmKg, unit)}</p>
            </Card>
            <Card className="p-3">
              <p className="text-xs text-muted">Cambio de 1RM</p>
              <p className="text-lg font-bold tabular-nums">
                {last.e1rmKg >= first.e1rmKg ? '+' : '−'}
                {formatWeight(Math.abs(last.e1rmKg - first.e1rmKg), unit)}
              </p>
              <p className="text-xs text-muted">desde {relativeDay(first.date)}</p>
            </Card>
          </div>
        )}

        {/* Vista de tabla: los mismos datos en texto (accesibilidad). */}
        {history && history.length > 0 && (
          <details className="rounded-2xl bg-surface p-4">
            <summary className="cursor-pointer font-semibold">Ver como tabla</summary>
            <table className="mt-3 w-full text-sm tabular-nums">
              <thead className="text-left text-xs text-muted">
                <tr>
                  <th className="py-1 font-medium">Fecha</th>
                  <th className="font-medium">Mejor serie</th>
                  <th className="text-right font-medium">{meta.label}</th>
                </tr>
              </thead>
              <tbody>
                {[...history].reverse().map((p, i, arr) => (
                  <tr key={p.sessionId} className="border-t border-line">
                    <td className="py-1.5">
                      <Link to={`/progreso/sesion/${p.sessionId}`} className="text-accent">
                        {new Date(p.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      </Link>
                    </td>
                    <td>{p.bestSet.weightKg > 0 ? `${formatWeight(p.bestSet.weightKg, unit)} × ${p.bestSet.reps}` : `${p.bestSet.reps} reps`}</td>
                    <td className="text-right">{data[arr.length - 1 - i]?.v.toLocaleString('es-ES', { maximumFractionDigits: 1 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        )}
      </div>
    </>
  );
}
