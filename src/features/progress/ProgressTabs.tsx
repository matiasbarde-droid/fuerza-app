import { NavLink } from 'react-router-dom';
import { PageHeader } from '../../components/ui';

const TABS = [
  { to: '/progreso', label: 'Historial', end: true },
  { to: '/progreso/ejercicios', label: 'Ejercicios' },
  { to: '/progreso/peso', label: 'Peso' },
  { to: '/progreso/cardio', label: 'Cardio' },
];

/** Cabecera común de la pestaña Progreso con sus 4 secciones. */
export default function ProgressTabs() {
  return (
    <>
      <PageHeader title="Progreso" />
      <nav className="no-scrollbar mb-4 flex gap-2 overflow-x-auto px-4">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            replace
            className={({ isActive }) =>
              `flex h-9 shrink-0 items-center rounded-full border px-4 text-sm font-medium ${
                isActive ? 'border-accent bg-accent text-accent-ink' : 'border-line bg-surface'
              }`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
