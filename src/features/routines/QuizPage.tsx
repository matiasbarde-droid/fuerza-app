import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, PageHeader } from '../../components/ui';
import { createRoutineFromPlan } from '../../db/routines';
import { recommendPlan, type QuizAnswers } from '../../domain/recommend';
import { LevelBadge } from './PlansPage';

interface Question<K extends keyof QuizAnswers> {
  key: K;
  title: string;
  options: { value: QuizAnswers[K]; label: string; hint?: string }[];
}

const QUESTIONS: [
  Question<'experience'>,
  Question<'daysPerWeek'>,
  Question<'equipment'>,
  Question<'goal'>,
] = [
  {
    key: 'experience',
    title: '¿Cuál es tu experiencia con las pesas?',
    options: [
      { value: 'none', label: 'Nunca he entrenado' },
      { value: 'beginner', label: 'Menos de 1 año', hint: 'O entreno de forma irregular' },
      { value: 'intermediate', label: '1 año o más, de forma constante' },
      { value: 'returning', label: 'Entrené años, pero llevo mucho tiempo sin hacerlo', hint: 'Por ejemplo, más de 5 años parado' },
    ],
  },
  {
    key: 'daysPerWeek',
    title: '¿Cuántos días por semana estás dispuesto a entrenar?',
    options: [
      { value: 2, label: '2 días' },
      { value: 3, label: '3 días' },
      { value: 4, label: '4 días' },
      { value: 5, label: '5 días' },
      { value: 6, label: '6 días' },
    ],
  },
  {
    key: 'equipment',
    title: '¿Dónde vas a entrenar?',
    options: [
      { value: 'gym', label: 'Gimnasio', hint: 'Barras, mancuernas y máquinas' },
      { value: 'home', label: 'En casa', hint: 'Kettlebell y peso corporal' },
    ],
  },
  {
    key: 'goal',
    title: '¿Cuál es tu objetivo principal?',
    options: [
      { value: 'muscle', label: 'Ganar fuerza y músculo' },
      { value: 'fat_loss', label: 'Bajar grasa manteniendo músculo' },
      { value: 'health', label: 'Salud y estar en forma' },
    ],
  },
];

export default function QuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const done = step >= QUESTIONS.length;
  const rec = done ? recommendPlan(answers as QuizAnswers) : null;

  function answer(key: keyof QuizAnswers, value: QuizAnswers[keyof QuizAnswers]) {
    setAnswers((a) => ({ ...a, [key]: value }));
    setStep((s) => s + 1);
  }

  async function create() {
    if (!rec) return;
    setBusy(true);
    const id = await createRoutineFromPlan(rec.plan, rec.daysPerWeek);
    navigate(`/rutinas/${id}`, { replace: true });
  }

  return (
    <>
      <PageHeader title="Cuestionario" back />
      <div className="px-4 pb-6">
        {/* Barra de progreso */}
        <div className="mb-5 flex gap-1.5">
          {QUESTIONS.map((q, i) => (
            <div key={q.key} className={`h-1.5 flex-1 rounded-full ${i < step ? 'bg-accent' : 'bg-surface-2'}`} />
          ))}
        </div>

        {!done && (
          <>
            <h2 className="mb-4 text-2xl font-bold leading-tight">{QUESTIONS[step].title}</h2>
            <div className="space-y-2">
              {QUESTIONS[step].options.map((o) => (
                <button
                  key={String(o.value)}
                  onClick={() => answer(QUESTIONS[step].key, o.value)}
                  className={`block w-full rounded-2xl border p-4 text-left active:bg-surface-2 ${
                    answers[QUESTIONS[step].key] === o.value ? 'border-accent bg-surface' : 'border-line bg-surface'
                  }`}
                >
                  <span className="block font-semibold">{o.label}</span>
                  {o.hint && <span className="mt-0.5 block text-sm text-muted">{o.hint}</span>}
                </button>
              ))}
            </div>
            {step > 0 && (
              <Button variant="ghost" className="mt-4 w-full" onClick={() => setStep((s) => s - 1)}>
                Anterior
              </Button>
            )}
          </>
        )}

        {rec && (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-muted">Te recomendamos</p>
            <Card>
              <div className="mb-1">
                <LevelBadge level={rec.plan.level} />
              </div>
              <p className="text-xl font-bold">{rec.plan.name}</p>
              <p className="mt-1 text-sm text-muted">{rec.plan.summary}</p>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm">
                {rec.reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </Card>
            <Button className="w-full" onClick={create} disabled={busy}>
              Crear rutina ({rec.daysPerWeek} días/semana)
            </Button>
            <Link
              to={`/rutinas/planes/${rec.plan.id}?dias=${rec.daysPerWeek}`}
              className="block text-center font-semibold text-accent"
            >
              Ver detalles y justificación
            </Link>

            {rec.alternatives.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-semibold text-muted">También podría servirte</p>
                {rec.alternatives.map((p) => (
                  <Link
                    key={p.id}
                    to={`/rutinas/planes/${p.id}?dias=${answers.daysPerWeek}`}
                    className="mb-2 block rounded-2xl bg-surface p-4 active:bg-surface-2"
                  >
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-sm text-muted">{p.summary}</p>
                  </Link>
                ))}
              </div>
            )}
            <Button variant="ghost" className="w-full" onClick={() => { setStep(0); setAnswers({}); }}>
              Repetir cuestionario
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
