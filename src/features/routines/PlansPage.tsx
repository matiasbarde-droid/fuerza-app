import { Link } from 'react-router-dom';
import { Card, PageHeader } from '../../components/ui';
import { PLANS, PRINCIPLES, planDayOptions } from '../../data/plans';

export function LevelBadge({ level }: { level: string }) {
  const color =
    level === 'Intermedio' ? 'bg-sky-400/15 text-sky-300' : level === 'Regreso' ? 'bg-amber-400/15 text-amber-300' : 'bg-accent/15 text-accent';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}>{level}</span>;
}

export default function PlansPage() {
  return (
    <>
      <PageHeader title="Planes predefinidos" back />
      <div className="space-y-3 px-4 pb-4">
        <details className="rounded-2xl bg-surface p-4">
          <summary className="cursor-pointer font-semibold">Principios comunes a todos los planes</summary>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
            {PRINCIPLES.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </details>

        {PLANS.map((p) => (
          <Link key={p.id} to={`/rutinas/planes/${p.id}`} className="block">
            <Card className="active:bg-surface-2">
              <div className="mb-1 flex items-center gap-2">
                <LevelBadge level={p.level} />
                <span className="text-xs text-muted">{p.durationWeeks}</span>
              </div>
              <p className="text-lg font-bold">{p.name}</p>
              <p className="mt-1 text-sm text-muted">{p.summary}</p>
              <p className="mt-2 text-xs text-muted">
                <b className="text-text">{planDayOptions(p).join(', ')} días/semana</b> · {p.equipmentLabel}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
