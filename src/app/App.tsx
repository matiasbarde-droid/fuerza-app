import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import BottomNav from './BottomNav';
import UpdateBanner from './UpdateBanner';
import ExerciseListPage from '../features/exercises/ExerciseListPage';
import ExerciseDetailPage from '../features/exercises/ExerciseDetailPage';
import CustomExerciseForm from '../features/exercises/CustomExerciseForm';
import RoutinesPage from '../features/routines/RoutinesPage';
import PlansPage from '../features/routines/PlansPage';
import PlanDetailPage from '../features/routines/PlanDetailPage';
import QuizPage from '../features/routines/QuizPage';
import RoutineEditorPage from '../features/routines/RoutineEditorPage';
import ExercisePickerPage from '../features/routines/ExercisePickerPage';
import SettingsPage from '../features/settings/SettingsPage';
import TrainPage from '../features/workout/TrainPage';
import SessionPickerPage from '../features/workout/SessionPickerPage';
import SummaryPage from '../features/workout/SummaryPage';

// Progreso (con la librería de gráficos) se carga solo al abrir esa pestaña.
const HistoryPage = lazy(() => import('../features/progress/HistoryPage'));
const SessionDetailPage = lazy(() => import('../features/progress/SessionDetailPage'));
const ExerciseProgressListPage = lazy(() =>
  import('../features/progress/ExerciseProgressPages').then((m) => ({ default: m.ExerciseProgressListPage })),
);
const ExerciseProgressPage = lazy(() =>
  import('../features/progress/ExerciseProgressPages').then((m) => ({ default: m.ExerciseProgressPage })),
);
const BodyWeightPage = lazy(() => import('../features/progress/LogPages').then((m) => ({ default: m.BodyWeightPage })));
const CardioPage = lazy(() => import('../features/progress/LogPages').then((m) => ({ default: m.CardioPage })));

export default function App() {
  return (
    <div className="mx-auto flex h-full max-w-xl flex-col">
      <main className="flex-1 overflow-y-auto pb-24">
        <Suspense fallback={<p className="p-4 text-muted">Cargando…</p>}>
          <Routes>
            <Route path="/" element={<Navigate to="/entrenar" replace />} />
            <Route path="/entrenar" element={<TrainPage />} />
            <Route path="/entrenar/agregar" element={<SessionPickerPage />} />
            <Route path="/entrenar/resumen/:id" element={<SummaryPage />} />

            <Route path="/rutinas" element={<RoutinesPage />} />
            <Route path="/rutinas/planes" element={<PlansPage />} />
            <Route path="/rutinas/planes/:planId" element={<PlanDetailPage />} />
            <Route path="/rutinas/cuestionario" element={<QuizPage />} />
            <Route path="/rutinas/:id" element={<RoutineEditorPage />} />
            <Route path="/rutinas/:id/dia/:dayId/agregar" element={<ExercisePickerPage />} />

            <Route path="/ejercicios" element={<ExerciseListPage />} />
            <Route path="/ejercicios/nuevo" element={<CustomExerciseForm />} />
            <Route path="/ejercicios/:id/editar" element={<CustomExerciseForm />} />
            <Route path="/ejercicios/:id" element={<ExerciseDetailPage />} />

            <Route path="/progreso" element={<HistoryPage />} />
            <Route path="/progreso/sesion/:id" element={<SessionDetailPage />} />
            <Route path="/progreso/ejercicios" element={<ExerciseProgressListPage />} />
            <Route path="/progreso/ejercicios/:id" element={<ExerciseProgressPage />} />
            <Route path="/progreso/peso" element={<BodyWeightPage />} />
            <Route path="/progreso/cardio" element={<CardioPage />} />

            <Route path="/ajustes" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/entrenar" replace />} />
          </Routes>
        </Suspense>
      </main>
      <BottomNav />
      <UpdateBanner />
    </div>
  );
}
