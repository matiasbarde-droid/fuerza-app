import { useEffect, useState } from 'react';
import type { Exercise } from '../features/exercises/library';
import { Icon } from './Icon';

/** Crea una URL temporal para un Blob y la libera al desmontar. */
export function useObjectUrl(blob: Blob | undefined): string | undefined {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    if (!blob) return setUrl(undefined);
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  return url;
}

/**
 * Imagen de un ejercicio: foto propia (Blob local) o imagen de free-exercise-db.
 * Si no hay imagen o falla la carga (sin conexión), muestra un icono.
 */
export function ExerciseImage({
  exercise,
  index = 0,
  className = '',
}: {
  exercise: Exercise;
  index?: number;
  className?: string;
}) {
  const photoUrl = useObjectUrl(exercise.photo);
  const src = photoUrl ?? exercise.images[index];
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  if (!src || failed) {
    return (
      <div className={`grid place-items-center bg-surface-2 text-muted ${className}`}>
        <Icon name="dumbbell" className="h-1/3 w-1/3" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`bg-surface-2 object-cover ${className}`}
    />
  );
}
