import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteSession, useSessionDetail, type SetLog } from '../../db/history';
import { useSettings } from '../../db/settings';
import { estimate1RM } from '../../domain/progression';
import { formatWeight } from '../../domain/units';
import { Icon } from '../../components/Icon';
import { Button, Card, PageHeader } from '../../components/ui';
import { formatClock } from '../../lib/hooks';
import { useExerciseMap } from '../exercises/library';

export default function SessionDetailPage() {
  const { id } = useParams();
  const data = useSessionDetail(id);
  const settings = useSettings();
  const exercises = useExerciseMap();
  const navigate = useNavigate();

  if (data === undefined) return <PageHeader title="Cargando…" back />;
  if (data === null) return <PageHeader title="Sesión no encontrada" back />;
  const { session, logs } = data;

  const groups = new Map<string, SetLog[]>();
  for (const l of logs) groups.set(l.exerciseId, [...(groups.get(l.exerciseId) ?? []), l]);

  async function remove() {
    if (!confirm('¿Eliminar este entrenamiento del historial? No se puede deshacer.')) return;
    await deleteSession(session.id);
    navigate('/progreso', { replace: true });
  }

  return (
    <>
      <PageHeader title={session.name.split(' · ')[0]} back />
      <div className="space-y-3 px-4 pb-6">
        <p className="text-sm text-muted">
          {new Date(session.startedAt).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })} ·{' '}
          {formatClock(((session.endedAt ?? session.startedAt) - session.startedAt) / 1000)}
        </p>
        {[...groups].map(([exId, sets]) => (
          <Card key={exId}>
            <Link to={`/progreso/ejercicios/${encodeURIComponent(exId)}`} className="font-semibold text-accent">
              {exercises?.get(exId)?.name ?? exId} →
            </Link>
            <ol className="mt-2 space-y-1 text-sm tabular-nums">
              {sets.map((s, i) => (
                <li key={s.id} className="flex gap-3">
                  <span className="w-14 text-muted">Serie {i + 1}</span>
                  <span className="flex-1">
                    {s.weightKg > 0 ? `${formatWeight(s.weightKg, settings.unit)} × ${s.reps}` : `${s.reps} reps`}
                  </span>
                  {s.weightKg > 0 && (
                    <span className="text-xs text-muted">1RM≈{formatWeight(estimate1RM(s.weightKg, s.reps), settings.unit)}</span>
                  )}
                </li>
              ))}
            </ol>
          </Card>
        ))}
        <Button variant="danger" className="w-full" onClick={remove}>
          <Icon name="trash" /> Eliminar del historial
        </Button>
      </div>
    </>
  );
}
