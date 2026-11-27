import { useNavigate, useParams } from 'react-router-dom';
import { updateRoutine, newItem } from '../../db/routines';
import { useSettings } from '../../db/settings';
import ExerciseListPage from '../exercises/ExerciseListPage';
import type { Exercise } from '../exercises/library';

/** Elige un ejercicio de la biblioteca y lo añade al final del día. */
export default function ExercisePickerPage() {
  const { id, dayId } = useParams();
  const settings = useSettings();
  const navigate = useNavigate();

  async function pick(e: Exercise) {
    if (!id) return;
    // Ejercicios de cardio/estiramiento empiezan sin descanso entre series.
    const rest = e.category === 'cardio' || e.category === 'stretching' ? 0 : settings.defaultRestSec;
    await updateRoutine(id, (r) => {
      r.days.find((d) => d.id === dayId)?.items.push(newItem(e.id, rest));
    });
    navigate(-1);
  }

  return <ExerciseListPage onPick={pick} title="Agregar ejercicio" />;
}
