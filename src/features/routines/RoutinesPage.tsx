import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../../components/Icon';
import { PageHeader } from '../../components/ui';
import { createEmptyRoutine, useRoutines } from '../../db/routines';

export default function RoutinesPage() {
  const routines = useRoutines();
  const navigate = useNavigate();

  async function createEmpty() {
    const id = await createEmptyRoutine();
    navigate(`/rutinas/${id}`);
  }

  return (
    <>
      <PageHeader
        title="Rutinas"
        action={
          <button
            onClick={createEmpty}
            className="flex h-11 items-center gap-1 rounded-full bg-surface-2 px-4 text-sm font-semibold"
          >
            <Icon name="plus" /> Vacía
          </button>
        }
      />
      <div className="space-y-3 px-4">
        <div className="grid grid-cols-2 gap-3">
          <Link to="/rutinas/cuestionario" className="rounded-2xl bg-accent p-4 text-accent-ink active:brightness-90">
            <p className="text-lg font-bold leading-tight">¿Qué plan me conviene?</p>
            <p className="mt-1 text-sm opacity-80">4 preguntas</p>
          </Link>
          <Link to="/rutinas/planes" className="rounded-2xl bg-surface p-4 active:bg-surface-2">
            <p className="text-lg font-bold leading-tight">Planes predefinidos</p>
            <p className="mt-1 text-sm text-muted">Basados en evidencia</p>
          </Link>
        </div>

        <h2 className="pt-3 text-sm font-semibold text-muted">Mis rutinas</h2>
        {routines?.length === 0 && (
          <p className="rounded-2xl border border-dashed border-line p-6 text-center text-muted">
            Aún no tienes rutinas. Responde el cuestionario, elige un plan o crea una vacía.
          </p>
        )}
        <ul className="space-y-2">
          {routines?.map((r) => (
            <li key={r.id}>
              <Link to={`/rutinas/${r.id}`} className="block rounded-2xl bg-surface p-4 active:bg-surface-2">
                <div className="flex items-center gap-2">
                  <p className="flex-1 truncate font-semibold">{r.name}</p>
                  {r.active && (
                    <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">Activa</span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted">
                  {r.days.length} {r.days.length === 1 ? 'día' : 'días'} ({r.days.map((d) => d.name).join(', ')}) ·{' '}
                  {r.daysPerWeek}×/semana
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
