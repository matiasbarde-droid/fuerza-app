import { useNavigate } from 'react-router-dom';
import type { ActiveExercise, ActiveSession } from '../../db/db';
import { newId } from '../../db/db';
import { useSettings } from '../../db/settings';
import { discardSession, finishSession, toggleSetDone, updateSession } from '../../db/session';
import { formatWeight } from '../../domain/units';
import { ExerciseImage } from '../../components/ExerciseImage';
import { Icon } from '../../components/Icon';
import { Button } from '../../components/ui';
import { Stepper, WeightField, clamp, formatReps, formatRest } from '../../components/fields';
import { unlockAudio } from '../../lib/alerts';
import { formatClock, useNow, useWakeLock } from '../../lib/hooks';
import { useExerciseMap } from '../exercises/library';
import RestTimer from './RestTimer';
import { requestPersistence } from '../../lib/offlineImages';
import { relativeDay } from './TrainPage';

/**
 * Sesión en vivo, pensada para usar con una mano:
 * arriba se elige el ejercicio; en el centro, la serie actual con peso y
 * reps grandes; abajo, un botón enorme para completarla.
 */
export default function WorkoutSession({ session }: { session: ActiveSession }) {
  const settings = useSettings();
  const exercises = useExerciseMap();
  const navigate = useNavigate();
  const now = useNow(1000);
  const wake = useWakeLock(true);

  const ex = session.exercises.find((e) => e.id === session.currentExerciseId) ?? session.exercises[0];
  const set = ex?.sets.find((s) => s.id === session.currentSetId) ?? ex?.sets.find((s) => !s.done) ?? ex?.sets[0];
  const setIndex = ex && set ? ex.sets.indexOf(set) : -1;
  const info = ex ? exercises?.get(ex.exerciseId) : undefined;
  const unit = ex?.unit ?? settings.unit;

  const totalSets = session.exercises.reduce((n, e) => n + e.sets.length, 0);
  const doneSets = session.exercises.reduce((n, e) => n + e.sets.filter((s) => s.done).length, 0);

  /** Cambia un ejercicio de la sesión. */
  const editEx = (fn: (e: ActiveExercise) => void) =>
    updateSession((s) => {
      const e = s.exercises.find((x) => x.id === ex?.id);
      if (e) fn(e);
    });

  /**
   * Cambiar el peso de una serie lo propaga a las siguientes pendientes.
   * Recibe una función sobre el peso GUARDADO, para que los toques rápidos
   * en ± se acumulen bien.
   */
  const adjustWeight = (fn: (current: number | null) => number | null) =>
    editEx((e) => {
      const i = e.sets.findIndex((x) => x.id === set?.id);
      if (i < 0) return;
      const kg = fn(e.sets[i].weightKg);
      e.sets.forEach((x, j) => {
        if (j === i || (j > i && !x.done)) x.weightKg = kg;
      });
    });

  const stepReps = (delta: number) =>
    editEx((e) => {
      const s = e.sets.find((x) => x.id === set?.id);
      if (s) s.reps = clamp((s.reps ?? e.repsMin) + delta, 0, 999);
    });

  async function complete() {
    if (!ex || !set) return;
    unlockAudio(); // el toque del usuario habilita el pitido posterior
    await toggleSetDone(ex.id, set.id);
  }

  const selectSet = (exerciseId: string, setId: string) =>
    updateSession((s) => {
      s.currentExerciseId = exerciseId;
      s.currentSetId = setId;
    });

  const selectExercise = (e: ActiveExercise) =>
    selectSet(e.id, (e.sets.find((s) => !s.done) ?? e.sets[0])?.id ?? '');

  const addSet = () =>
    editEx((e) => {
      const last = e.sets.at(-1);
      e.sets.push({ id: newId(), weightKg: last?.weightKg ?? null, reps: last?.reps ?? e.repsMin, done: false });
    });

  const removeLastSet = () =>
    editEx((e) => {
      if (e.sets.length > 1 && !e.sets.at(-1)!.done) e.sets.pop();
    });

  async function removeExercise() {
    if (!ex || !confirm(`¿Quitar "${info?.name ?? 'este ejercicio'}" de esta sesión?`)) return;
    await updateSession((s) => {
      s.exercises = s.exercises.filter((e) => e.id !== ex.id);
      s.currentExerciseId = s.exercises[0]?.id;
      s.currentSetId = s.exercises[0]?.sets.find((x) => !x.done)?.id;
    });
  }

  async function finish() {
    if (doneSets === 0) {
      if (confirm('No has completado ninguna serie. ¿Descartar el entrenamiento?')) await discardSession();
      return;
    }
    const pending = totalSets - doneSets;
    const msg = pending
      ? `Quedan ${pending} series sin completar (no se guardarán). ¿Terminar el entrenamiento?`
      : '¿Terminar y guardar el entrenamiento?';
    if (!confirm(msg)) return;
    const id = await finishSession();
    void requestPersistence(); // que el navegador no borre el historial por falta de espacio
    if (id) navigate(`/entrenar/resumen/${id}`, { replace: true });
  }

  async function discard() {
    if (confirm('¿Descartar este entrenamiento? No se guardará nada.')) await discardSession();
  }

  const resting = session.restEndsAt != null;

  return (
    <div className={resting ? 'pb-32' : ''}>
      {/* Cabecera: nombre, cronómetro y terminar */}
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-bg/95 px-4 py-2 backdrop-blur">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{session.name}</p>
          <p className="text-xs tabular-nums text-muted">
            {formatClock((now - session.startedAt) / 1000)} · {doneSets}/{totalSets} series
            {wake === 'on' && ' · pantalla encendida'}
          </p>
        </div>
        <Button className="min-h-11 px-4" onClick={finish}>Terminar</Button>
      </header>

      {/* Barra de progreso global */}
      <div className="mx-4 h-1 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full bg-accent transition-[width]" style={{ width: `${totalSets ? (doneSets / totalSets) * 100 : 0}%` }} />
      </div>

      {/* Selector de ejercicio */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3">
        {session.exercises.map((e) => {
          const done = e.sets.filter((s) => s.done).length;
          const complete = done === e.sets.length;
          return (
            <button
              key={e.id}
              onClick={() => selectExercise(e)}
              className={`h-10 max-w-48 shrink-0 truncate rounded-full border px-3 text-sm font-medium ${
                e.id === ex?.id
                  ? 'border-accent bg-accent text-accent-ink'
                  : complete
                    ? 'border-accent/40 bg-surface text-accent'
                    : 'border-line bg-surface'
              }`}
            >
              {complete && '✓ '}
              {exercises?.get(e.exerciseId)?.name ?? '…'} {done}/{e.sets.length}
            </button>
          );
        })}
        <button
          onClick={() => navigate('/entrenar/agregar')}
          className="h-10 shrink-0 rounded-full border border-dashed border-line px-3 text-sm text-muted"
        >
          + Ejercicio
        </button>
      </div>

      {!ex && (
        <p className="px-4 py-10 text-center text-muted">Agrega un ejercicio para empezar.</p>
      )}

      {ex && set && (
        <div className="space-y-4 px-4">
          {/* Ejercicio actual */}
          <div className="flex items-center gap-3">
            {info ? <ExerciseImage exercise={info} className="h-16 w-16 shrink-0 rounded-xl" /> : <div className="h-16 w-16 rounded-xl bg-surface-2" />}
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold leading-tight">{info?.name ?? '…'}</p>
              <p className="text-sm text-muted">
                {ex.sets.length} × {formatReps(ex.repsMin, ex.repsMax)} · {formatRest(ex.restSec)}
              </p>
            </div>
            <a
              href={`#/ejercicios/${encodeURIComponent(ex.exerciseId)}`}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface text-muted"
              aria-label="Ver técnica"
            >
              ?
            </a>
          </div>

          {ex.notes && <p className="rounded-xl bg-surface px-3 py-2 text-sm text-muted">{ex.notes}</p>}

          {/* Última vez + sugerencia */}
          {(ex.last || ex.suggestion) && (
            <div className="space-y-2 rounded-2xl bg-surface p-3 text-sm">
              {ex.last && (
                <p>
                  <span className="text-muted">Última vez ({relativeDay(ex.last.date)}): </span>
                  <b className="tabular-nums">
                    {ex.last.sets
                      .map((s) => (s.weightKg > 0 ? `${formatWeight(s.weightKg, unit)} × ${s.reps}` : `${s.reps} reps`))
                      .join(' · ')}
                  </b>
                </p>
              )}
              {ex.suggestion && (
                <p className={ex.suggestion.kind === 'increase' ? 'font-semibold text-accent' : 'text-muted'}>
                  {ex.suggestion.kind === 'increase' ? '⬆ ' : '→ '}
                  {ex.suggestion.message}
                </p>
              )}
            </div>
          )}

          {/* Series */}
          <ol className="grid grid-cols-1 gap-1.5">
            {ex.sets.map((s, i) => (
              <li key={s.id}>
                <button
                  onClick={() => selectSet(ex.id, s.id)}
                  className={`flex h-12 w-full items-center gap-3 rounded-xl px-3 text-left tabular-nums ${
                    s.id === set.id ? 'bg-surface-2 ring-2 ring-accent' : 'bg-surface'
                  }`}
                >
                  <span className="w-14 text-sm text-muted">Serie {i + 1}</span>
                  <span className={`flex-1 font-semibold ${s.done ? 'text-accent' : ''}`}>
                    {s.weightKg != null && s.weightKg > 0 ? formatWeight(s.weightKg, unit) : 'sin peso'} × {s.reps ?? '—'}
                  </span>
                  <span
                    className={`grid h-8 w-8 place-items-center rounded-full ${s.done ? 'bg-accent text-accent-ink' : 'border-2 border-line'}`}
                    aria-label={s.done ? 'Completada' : 'Pendiente'}
                  >
                    {s.done && '✓'}
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1 min-h-10 text-sm" onClick={addSet}>+ Serie</Button>
            <Button
              variant="ghost"
              className="flex-1 min-h-10 text-sm"
              onClick={removeLastSet}
              disabled={ex.sets.length <= 1 || ex.sets.at(-1)!.done}
            >
              − Serie
            </Button>
            <Button variant="ghost" className="flex-1 min-h-10 text-sm text-danger" onClick={removeExercise}>
              Quitar
            </Button>
          </div>

          {/* Edición de la serie seleccionada */}
          <div className="space-y-4 rounded-2xl bg-surface p-4">
            <p className="text-sm font-semibold text-muted">Serie {setIndex + 1}</p>
            <WeightField
              label={`Peso (${unit})`}
              valueKg={set.weightKg}
              unit={unit}
              equipment={info?.equipment}
              onChange={(kg) => adjustWeight(() => kg)}
              onAdjust={adjustWeight}
            />
            <Stepper
              label={`Repeticiones (objetivo ${formatReps(ex.repsMin, ex.repsMax)})`}
              value={set.reps ?? ex.repsMin}
              min={0}
              onStep={stepReps}
            />
          </div>

          {/* Botón principal fijo abajo (zona del pulgar), sobre el temporizador si está activo. */}
          <div className="sticky z-20 -mx-4 bg-bg/90 px-4 py-2 backdrop-blur" style={{ bottom: resting ? 160 : 64 }}>
            <button
              onClick={complete}
              className={`flex h-16 w-full items-center justify-center gap-3 rounded-2xl text-xl font-bold shadow-lg active:scale-[0.99] ${
                set.done ? 'bg-surface-2 text-muted' : 'bg-accent text-accent-ink'
              }`}
            >
              {set.done ? 'Desmarcar serie' : <>✓ Completar serie {setIndex + 1}</>}
            </button>
          </div>

          <button onClick={discard} className="flex h-12 w-full items-center justify-center gap-2 text-sm text-muted">
            <Icon name="trash" className="h-4 w-4" /> Descartar entrenamiento
          </button>
        </div>
      )}

      {!ex && (
        <div className="px-4">
          <button onClick={discard} className="flex h-12 w-full items-center justify-center gap-2 text-sm text-muted">
            <Icon name="trash" className="h-4 w-4" /> Descartar entrenamiento
          </button>
        </div>
      )}

      {session.restEndsAt != null && (
        <RestTimer endsAt={session.restEndsAt} totalSec={session.restTotalSec ?? 60} />
      )}
    </div>
  );
}
