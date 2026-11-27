import { NavLink } from 'react-router-dom';
import { Icon, type IconName } from '../components/Icon';

const TABS: { to: string; label: string; icon: IconName }[] = [
  { to: '/entrenar', label: 'Entrenar', icon: 'play' },
  { to: '/rutinas', label: 'Rutinas', icon: 'list' },
  { to: '/ejercicios', label: 'Ejercicios', icon: 'dumbbell' },
  { to: '/progreso', label: 'Progreso', icon: 'chart' },
  { to: '/ajustes', label: 'Ajustes', icon: 'gear' },
];

/** Barra de pestañas inferior, fija y con zona segura para gestos de Android. */
export default function BottomNav() {
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 backdrop-blur">
      <ul className="mx-auto grid max-w-xl grid-cols-5">
        {TABS.map((t) => (
          <li key={t.to}>
            <NavLink
              to={t.to}
              className={({ isActive }) =>
                `flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium ${
                  isActive ? 'text-accent' : 'text-muted'
                }`
              }
            >
              <Icon name={t.icon} className="h-6 w-6" />
              {t.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
