import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { useRoutines } from '../../db/routines';
import { startFreeSession, startSessionFromDay, useActiveSession, useNextDayId } from '../../db/session';
import { formatReps } from '../../components/fields';
import { Button, Card, Chip, PageHeader } from '../../components/ui';
import { useExerciseMap } from '../exercises/library';
import WorkoutSession from './WorkoutSession';
import { usePrefetchImages } from '../../lib/offlineImages';

/** Pestaña Entrenar: muestra la sesión en curso o permite empezar una. */
export default function TrainPage() {
  const active = useActiveSession();
  if (active === undefined) return <PageHeader title="Entrenar" />;
  return active ? <WorkoutSession session={active} /> : <StartWorkout />;
}

function StartWorkout() {
  const routines = useRoutines();
  const exercises = useExerciseMap();
  const routine = routines?.find((r) => r.active) ?? routines?.[0];
  const suggestedDay = useNextDayId(routine);
  const [dayId, setDayId] = useState<string>();
  const [busy, setBusy] = useState(false);
  const lastSession = useLiveQuery(() => db.sessions.orderBy('startedAt').last(), []);

  // Al cargar, preselecciona el siguiente día de la rotación.
  useEffect(() => setDayId(suggestedDay), [suggestedDay]);
  const day = routine?.days.find((d) => d.id === dayId) ?? routine?.days[0];
  usePrefetchImages((day?.items ?? []).flatMap((i) => exercises?.get(i.exerciseId)?.images ?? []));

  async function start() {
    if (!routine || !day || !exercises) return;
    setBusy(true);
    await startSessionFromDay(routine, day.id, (id) => exercises.get(id));
  }

  return (
    <>
      <PageHeader title="Entrenar" />
      <div className="space-y-4 px-4">
        {lastSession && (
          <p className="text-sm text-muted">
            Último entrenamiento: <b className="text-text">{lastSession.name.split(' · ')[0]}</b>,{' '}
            {relativeDay(lastSession.startedAt)}.
          </p>
        )}

        {routines && !routine && (
          <Card>
            <p className="font-semibold">Aún no tienes rutinas</p>
            <p className="mt-1 text-sm text-muted">Crea una desde un plan o con el cuestionario.</p>
            <Link to="/rutinas" className="mt-3 inline-block font-semibold text-accent">Ir a Rutinas →</Link>
          </Card>
        )}

        {routine && day && (
          <>
            <div>
              <p className="text-sm text-muted">Rutina activa</p>
              <p className="text-lg font-bold">{routine.name}</p>
            </div>
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
              {routine.days.map((d) => (
                <Chip key={d.id} active={d.id === day.id} onClick={() => setDayId(d.id)}>
                  {d.name}
                  {d.id === suggestedDay && ' ★'}
                </Chip>
              ))}
            </div>
            <Card>
              <ul className="space-y-1.5 text-sm">
                {day.items.map((i) => (
                  <li key={i.id} className="flex gap-2">
                    <span className="flex-1 truncate">{exercises?.get(i.exerciseId)?.name ?? '…'}</span>
                    <span className="shrink-0 tabular-nums text-muted">
                      {i.sets} × {formatReps(i.repsMin, i.repsMax)}
                    </span>
                  </li>
                ))}
                {day.items.length === 0 && <li className="text-muted">Este día no tiene ejercicios.</li>}
              </ul>
            </Card>
            <Button className="h-16 w-full text-xl" onClick={start} disabled={busy || !exercises || day.items.length === 0}>
              Empezar {day.name}
            </Button>
            <p className="text-center text-xs text-muted">★ = siguiente día según tu rotación</p>
          </>
        )}

        <Button variant="secondary" className="w-full" onClick={() => startFreeSession()}>
          Entrenamiento libre
        </Button>
      </div>
    </>
  );
}

export function relativeDay(ts: number): string {
  const days = Math.round((startOfDay(Date.now()) - startOfDay(ts)) / 86_400_000);
  if (days === 0) return 'hoy';
  if (days === 1) return 'ayer';
  if (days < 7) return `hace ${days} días`;
  return new Date(ts).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
