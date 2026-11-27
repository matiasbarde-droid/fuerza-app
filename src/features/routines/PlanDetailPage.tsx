import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button, Card, Chip, PageHeader } from '../../components/ui';
import { formatReps } from '../../components/fields';
import { getPlan, planDayOptions, variantFor } from '../../data/plans';
import { createRoutineFromPlan } from '../../db/routines';
import { useExerciseMap } from '../exercises/library';
import { LevelBadge } from './PlansPage';

export default function PlanDetailPage() {
  const { planId } = useParams();
  const [params] = useSearchParams();
  const plan = getPlan(planId);
  const exercises = useExerciseMap();
  const navigate = useNavigate();

  const options = plan ? planDayOptions(plan) : [];
  const wanted = Number(params.get('dias'));
  const [days, setDays] = useState(options.includes(wanted) ? wanted : (options[0] ?? 3));
  const [busy, setBusy] = useState(false);

  if (!plan) return <PageHeader title="Plan no encontrado" back />;
  const variant = variantFor(plan, days);

  async function use() {
    if (!plan) return;
    setBusy(true);
    const id = await createRoutineFromPlan(plan, days);
    navigate(`/rutinas/${id}`, { replace: true });
  }

  return (
    <>
      <PageHeader title={plan.name} back />
      <div className="space-y-4 px-4 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <LevelBadge level={plan.level} />
          <span className="text-sm text-muted">{plan.durationWeeks}</span>
        </div>
        <p>{plan.summary}</p>
        <p className="text-sm text-muted">
          <b className="text-text">Equipamiento:</b> {plan.equipmentLabel}
        </p>

        <Card>
          <h2 className="mb-2 font-semibold">¿Por qué funciona?</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted">
            {plan.rationale.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </Card>

        {plan.guidelines && (
          <Card>
            <h2 className="mb-2 font-semibold">Pautas</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted">
              {plan.guidelines.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </Card>
        )}

        <div>
          <h2 className="mb-2 font-semibold">¿Cuántos días por semana entrenarás?</h2>
          <div className="flex flex-wrap gap-2">
            {options.map((d) => (
              <Chip key={d} active={d === days} onClick={() => setDays(d)}>
                {d} días
              </Chip>
            ))}
          </div>
          {variant.days.length < days && (
            <p className="mt-2 text-sm text-muted">
              Los {variant.days.length} días de la rutina se alternan en rotación (
              {variant.days.map((d) => d.name).join(' → ')} → …).
            </p>
          )}
        </div>

        {variant.days.map((d) => (
          <Card key={d.name}>
            <h3 className="mb-2 font-semibold">{d.name}</h3>
            <ul className="space-y-1.5 text-sm">
              {d.items.map((i, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="flex-1">{exercises?.get(i.exerciseId)?.name ?? i.exerciseId}</span>
                  <span className="shrink-0 tabular-nums text-muted">
                    {i.sets} × {formatReps(i.repsMin, i.repsMax)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        ))}

        <Button className="sticky bottom-20 w-full shadow-lg" onClick={use} disabled={busy}>
          Usar este plan ({days} días/semana)
        </Button>
        <p className="text-center text-xs text-muted">Se copiará a "Mis rutinas" para que la edites a tu gusto.</p>
      </div>
    </>
  );
}
