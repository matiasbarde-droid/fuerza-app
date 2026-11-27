import { Link } from 'react-router-dom';
import { useSessionHistory } from '../../db/history';
import { useSettings } from '../../db/settings';
import { formatWeight } from '../../domain/units';
import { formatClock } from '../../lib/hooks';
import { useExerciseMap } from '../exercises/library';
import ProgressTabs from './ProgressTabs';

export default function HistoryPage() {
  const history = useSessionHistory();
  const settings = useSettings();
  const exercises = useExerciseMap();

  // Resumen de los últimos 7 días.
  const weekAgo = Date.now() - 7 * 86_400_000;
  const thisWeek = history?.filter((h) => h.session.startedAt >= weekAgo) ?? [];

  return (
    <>
      <ProgressTabs />
      <div className="space-y-3 px-4">
        {history && history.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-surface p-3">
              <p className="text-xs text-muted">Últimos 7 días</p>
              <p className="text-2xl font-bold tabular-nums">{thisWeek.length}</p>
              <p className="text-xs text-muted">entrenamientos</p>
            </div>
            <div className="rounded-2xl bg-surface p-3">
              <p className="text-xs text-muted">Series (7 días)</p>
              <p className="text-2xl font-bold tabular-nums">{thisWeek.reduce((n, h) => n + h.sets, 0)}</p>
              <p className="text-xs text-muted">completadas</p>
            </div>
          </div>
        )}

        {history?.length === 0 && (
          <p className="rounded-2xl border border-dashed border-line p-6 text-center text-muted">
            Aún no hay entrenamientos. Cuando termines uno aparecerá aquí.
          </p>
        )}

        <ul className="space-y-2">
          {history?.map(({ session, sets, volumeKg, exerciseIds }) => (
            <li key={session.id}>
              <Link to={`/progreso/sesion/${session.id}`} className="block rounded-2xl bg-surface p-4 active:bg-surface-2">
                <div className="flex items-baseline gap-2">
                  <p className="flex-1 truncate font-semibold">{session.name.split(' · ')[0]}</p>
                  <p className="shrink-0 text-sm text-muted">
                    {new Date(session.startedAt).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <p className="mt-1 text-sm tabular-nums text-muted">
                  {formatClock(((session.endedAt ?? session.startedAt) - session.startedAt) / 1000)} · {sets} series ·{' '}
                  {formatWeight(volumeKg, settings.unit)}
                </p>
                <p className="mt-1 truncate text-xs text-muted">
                  {exerciseIds.map((id) => exercises?.get(id)?.name ?? '…').join(', ')}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
