import { useNavigate } from 'react-router-dom';
import { addExerciseToSession } from '../../db/session';
import ExerciseListPage from '../exercises/ExerciseListPage';
import type { Exercise } from '../exercises/library';

/** Añade un ejercicio a la sesión en curso. */
export default function SessionPickerPage() {
  const navigate = useNavigate();
  async function pick(e: Exercise) {
    await addExerciseToSession(e.id, { equipment: e.equipment, category: e.category });
    navigate('/entrenar', { replace: true });
  }
  return <ExerciseListPage onPick={pick} title="Agregar a la sesión" />;
}
