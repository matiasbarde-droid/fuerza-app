import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { db } from '../../db/db';
import { Icon } from '../../components/Icon';
import { Button, Card, PageHeader } from '../../components/ui';
import { ExerciseImage } from '../../components/ExerciseImage';
import {
  CATEGORY_ES, EQUIPMENT_ES, FORCE_ES, LEVEL_ES, MECHANIC_ES, MUSCLES_ES,
} from '../../data/translations.es';
import { useExercise } from './library';

export default function ExerciseDetailPage() {
  const { id } = useParams();
  const exercise = useExercise(id ? decodeURIComponent(id) : undefined);
  const navigate = useNavigate();
  const [img, setImg] = useState(0);

  if (exercise === undefined) return <PageHeader title="Cargando…" back />;
  if (exercise === null) {
    return (
      <>
        <PageHeader title="No encontrado" back />
        <p className="px-4 text-muted">Este ejercicio no existe.</p>
      </>
    );
  }

  const imageCount = exercise.photo ? 1 : exercise.images.length;
  const tags = [
    exercise.equipment && EQUIPMENT_ES[exercise.equipment],
    exercise.level && LEVEL_ES[exercise.level],
    exercise.mechanic && MECHANIC_ES[exercise.mechanic],
    exercise.force && FORCE_ES[exercise.force],
    exercise.category && !exercise.custom && CATEGORY_ES[exercise.category],
  ].filter(Boolean) as string[];

  async function remove() {
    if (!exercise || !confirm(`¿Eliminar "${exercise.name}"? No se puede deshacer.`)) return;
    await db.customExercises.delete(exercise.id);
    navigate('/ejercicios', { replace: true });
  }

  return (
    <>
      <PageHeader
        title={exercise.name}
        back
        action={
          exercise.custom && (
            <Link
              to={`/ejercicios/${encodeURIComponent(exercise.id)}/editar`}
              className="grid h-11 w-11 place-items-center rounded-full text-muted"
              aria-label="Editar"
            >
              <Icon name="edit" />
            </Link>
          )
        }
      />

      <div className="space-y-4 px-4">
        {/* Las imágenes de free-exercise-db son 2 fotogramas: inicio y final. */}
        <button
          className="relative block w-full"
          onClick={() => imageCount > 1 && setImg((i) => (i + 1) % imageCount)}
          aria-label={imageCount > 1 ? 'Ver siguiente posición' : undefined}
        >
          <ExerciseImage exercise={exercise} index={img} className="aspect-[4/3] w-full rounded-2xl" />
          {imageCount > 1 && (
            <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-3 py-1 text-xs">
              {img === 0 ? 'Inicio' : 'Final'} · toca para cambiar
            </span>
          )}
        </button>

        {exercise.nameEn && <p className="-mt-2 text-sm text-muted">{exercise.nameEn}</p>}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span key={t} className="rounded-full bg-surface-2 px-3 py-1 text-sm">{t}</span>
            ))}
          </div>
        )}

        <Card>
          <h2 className="mb-1 text-sm font-semibold text-muted">Músculos principales</h2>
          <p>{exercise.primaryMuscles.map((m) => MUSCLES_ES[m] ?? m).join(', ') || '—'}</p>
          {exercise.secondaryMuscles.length > 0 && (
            <>
              <h2 className="mb-1 mt-3 text-sm font-semibold text-muted">Secundarios</h2>
              <p>{exercise.secondaryMuscles.map((m) => MUSCLES_ES[m] ?? m).join(', ')}</p>
            </>
          )}
        </Card>

        {exercise.instructions.length > 0 && (
          <Card>
            <h2 className="mb-2 text-sm font-semibold text-muted">
              Instrucciones{!exercise.translated && ' (en inglés)'}
            </h2>
            <ol className="list-decimal space-y-2 pl-5">
              {exercise.instructions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </Card>
        )}

        {exercise.custom && (
          <Button variant="danger" className="w-full" onClick={remove}>
            <Icon name="trash" /> Eliminar ejercicio
          </Button>
        )}
        {!exercise.custom && (
          <p className="pb-4 text-center text-xs text-muted">
            Imágenes y datos: free-exercise-db (dominio público)
          </p>
        )}
      </div>
    </>
  );
}
