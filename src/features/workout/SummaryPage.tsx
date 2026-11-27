import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type SetLog } from '../../db/db';
import { saveWeightsToRoutine } from '../../db/session';
import { useSettings } from '../../db/settings';
import { estimate1RM } from '../../domain/progression';
import { formatWeight } from '../../domain/units';
import { Button, Card, PageHeader } from '../../components/ui';
import { formatClock } from '../../lib/hooks';
import { useExerciseMap } from '../exercises/library';

/** Resumen al terminar: duración, series, volumen y mejores series. */
export default function SummaryPage() {
  const { id } = useParams();
  const settings = useSettings();
  const exercises = useExerciseMap();
  const data = useLiveQuery(async () => {
    if (!id) return null;
    const session = await db.sessions.get(id);
    const logs = await db.setLogs.where('sessionId').equals(id).sortBy('order');
    return session ? { session, logs } : null;
  }, [id]);
  const [saved, setSaved] = useState<number | null>(null);

  if (data === undefined) return <PageHeader title="Resumen" />;
  if (data === null) return <PageHeader title="Sesión no encontrada" />;
  const { session, logs } = data;

  // Agrupa por ejercicio manteniendo el orden.
  const groups = new Map<string, SetLog[]>();
  for (const l of logs) groups.set(l.exerciseId, [...(groups.get(l.exerciseId) ?? []), l]);
  const volume = logs.reduce((v, l) => v + l.weightKg * l.reps, 0);
  const duration = ((session.endedAt ?? session.startedAt) - session.startedAt) / 1000;

  async function save() {
    setSaved(await saveWeightsToRoutine(session.id));
  }

  return (
    <>
      <PageHeader title="¡Entrenamiento completado!" />
      <div className="space-y-4 px-4 pb-6">
        <p className="text-muted">{session.name}</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            ['Duración', formatClock(duration)],
            ['Series', String(logs.length)],
            ['Volumen', formatWeight(volume, settings.unit)],
          ].map(([label, value]) => (
            <Card key={label} className="px-2">
              <p className="text-xs text-muted">{label}</p>
              <p className="text-lg font-bold tabular-nums">{value}</p>
            </Card>
          ))}
        </div>

        {[...groups].map(([exId, sets]) => {
          const best = Math.max(...sets.map((s) => estimate1RM(s.weightKg, s.reps)));
          return (
            <Card key={exId}>
              <p className="font-semibold">{exercises?.get(exId)?.name ?? '…'}</p>
              <p className="mt-1 text-sm tabular-nums text-muted">
                {sets.map((s) => (s.weightKg > 0 ? `${formatWeight(s.weightKg, settings.unit)} × ${s.reps}` : `${s.reps} reps`)).join(' · ')}
              </p>
              {best > 0 && (
                <p className="mt-1 text-xs text-muted">1RM estimado: {formatWeight(best, settings.unit)}</p>
              )}
            </Card>
          );
        })}

        {session.routineId && (
          <Card>
            <p className="text-sm">
              ¿Guardar los pesos de hoy en la rutina? Así la próxima vez partirá de ellos
              (la sugerencia de progresión ya usa tu historial igualmente).
            </p>
            {saved == null ? (
              <Button variant="secondary" className="mt-3 w-full" onClick={save}>
                Guardar pesos en la rutina
              </Button>
            ) : (
              <p className="mt-3 text-sm font-semibold text-accent">
                {saved ? `Actualizados ${saved} ejercicios.` : 'La rutina ya tenía esos pesos.'}
              </p>
            )}
          </Card>
        )}

        <Link to="/entrenar" className="flex h-14 items-center justify-center rounded-xl bg-accent text-lg font-bold text-accent-ink">
          Listo
        </Link>
      </div>
    </>
  );
}
