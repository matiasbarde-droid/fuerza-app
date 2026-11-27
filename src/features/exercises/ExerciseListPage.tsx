import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Icon } from '../../components/Icon';
import { Chip, PageHeader } from '../../components/ui';
import { ExerciseImage } from '../../components/ExerciseImage';
import { EQUIPMENT_ES, EQUIPMENT_ORDER, MUSCLES_ES } from '../../data/translations.es';
import { normalize, useExercises, type Exercise } from './library';

const PAGE = 40;

/** Grupos musculares en orden anatómico aproximado (arriba → abajo). */
const MUSCLE_ORDER = [
  'chest', 'shoulders', 'lats', 'middle back', 'traps', 'biceps', 'triceps', 'forearms',
  'abdominals', 'lower back', 'glutes', 'quadriceps', 'hamstrings', 'adductors', 'abductors',
  'calves', 'neck',
];

/**
 * Biblioteca de ejercicios. Con `onPick` funciona como selector (para
 * añadir ejercicios a una rutina) en lugar de abrir el detalle.
 */
export default function ExerciseListPage({ onPick, title }: { onPick?: (e: Exercise) => void; title?: string } = {}) {
  const all = useExercises();
  // Los filtros viven en la URL: al volver desde el detalle se conservan.
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const muscle = params.get('m');
  const equipment = params.get('e');

  const setParam = (key: string, value: string | null) =>
    setParams(
      (p) => {
        if (value) p.set(key, value);
        else p.delete(key);
        return p;
      },
      { replace: true },
    );

  const filtered = useMemo(() => {
    if (!all) return [];
    const terms = normalize(q).split(/\s+/).filter(Boolean);
    return all.filter(
      (e) =>
        (!muscle || e.primaryMuscles.includes(muscle)) &&
        (!equipment || e.equipment === equipment) &&
        terms.every((t) => e.search.includes(t)),
    );
  }, [all, q, muscle, equipment]);

  // Render incremental: se añaden más elementos al llegar al final.
  const [visible, setVisible] = useState(PAGE);
  useEffect(() => setVisible(PAGE), [q, muscle, equipment]);
  const sentinel = useRef<HTMLLIElement>(null);
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setVisible((v) => v + PAGE);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [filtered.length, visible]);

  return (
    <>
      <PageHeader
        title={title ?? 'Ejercicios'}
        back={!!onPick}
        action={
          !onPick && <Link
            to="/ejercicios/nuevo"
            className="flex h-11 items-center gap-1 rounded-full bg-surface-2 px-4 text-sm font-semibold"
          >
            <Icon name="plus" /> Propio
          </Link>
        }
      />

      <div className="space-y-3 px-4 pb-3">
        <label className="flex h-12 items-center gap-2 rounded-xl bg-surface px-3">
          <Icon name="search" className="h-5 w-5 text-muted" />
          <input
            value={q}
            onChange={(e) => setParam('q', e.target.value)}
            placeholder="Buscar (ej. sentadilla, press, curl)"
            className="h-full flex-1 bg-transparent outline-none placeholder:text-muted"
            type="search"
            enterKeyHint="search"
          />
          {q && (
            <button onClick={() => setParam('q', null)} aria-label="Borrar búsqueda" className="text-muted">
              <Icon name="x" />
            </button>
          )}
        </label>

        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          <Chip active={!equipment} onClick={() => setParam('e', null)}>Todo equipo</Chip>
          {EQUIPMENT_ORDER.map((k) => (
            <Chip key={k} active={equipment === k} onClick={() => setParam('e', equipment === k ? null : k)}>
              {EQUIPMENT_ES[k]}
            </Chip>
          ))}
        </div>

        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          <Chip active={!muscle} onClick={() => setParam('m', null)}>Todo músculo</Chip>
          {MUSCLE_ORDER.map((k) => (
            <Chip key={k} active={muscle === k} onClick={() => setParam('m', muscle === k ? null : k)}>
              {MUSCLES_ES[k]}
            </Chip>
          ))}
        </div>

        <p className="text-xs text-muted">
          {all ? `${filtered.length} ejercicios` : 'Cargando biblioteca…'}
        </p>
      </div>

      <ul className="space-y-2 px-4">
        {filtered.slice(0, visible).map((e) => {
          const row = (
            <>
              <ExerciseImage exercise={e} className="h-16 w-16 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{e.name}</p>
                <p className="truncate text-sm text-muted">
                  {[e.primaryMuscles.map((m) => MUSCLES_ES[m] ?? m).join(', '), e.equipment && EQUIPMENT_ES[e.equipment]]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                {e.custom && <span className="text-xs font-semibold text-accent">Propio</span>}
              </div>
              {onPick && <Icon name="plus" className="h-6 w-6 shrink-0 text-accent" />}
            </>
          );
          const cls = 'flex w-full items-center gap-3 rounded-2xl bg-surface p-2 text-left active:bg-surface-2';
          return (
            <li key={e.id}>
              {onPick ? (
                <button className={cls} onClick={() => onPick(e)}>{row}</button>
              ) : (
                <Link to={`/ejercicios/${encodeURIComponent(e.id)}`} className={cls}>{row}</Link>
              )}
            </li>
          );
        })}
        {visible < filtered.length && <li ref={sentinel} className="h-10" />}
        {all && filtered.length === 0 && (
          <li className="py-10 text-center text-muted">Sin resultados. Prueba otra palabra o quita filtros.</li>
        )}
      </ul>
    </>
  );
}
