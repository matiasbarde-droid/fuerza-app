import { Icon } from '../../components/Icon';
import { Card, PageHeader } from '../../components/ui';
import { updateSettings, useSettings } from '../../db/settings';
import type { Unit } from '../../domain/units';
import { snapAllRoutineWeights } from '../../db/routines';
import { useExerciseMap } from '../exercises/library';
import BackupCard from './BackupCard';
import OfflineCard from './OfflineCard';

const RESTS = [60, 90, 120, 180];

export default function SettingsPage() {
  const settings = useSettings();
  const exercises = useExerciseMap();

  return (
    <>
      <PageHeader title="Ajustes" />
      <div className="space-y-4 px-4">
        <Card>
          <h2 className="mb-1 font-semibold">Unidad de peso</h2>
          <p className="mb-3 text-sm text-muted">
            Global. Podrás cambiarla para un ejercicio concreto en la rutina.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(['kg', 'lb'] as Unit[]).map((u) => (
              <button
                key={u}
                onClick={async () => {
                  if (u === settings.unit) return;
                  await updateSettings({ unit: u });
                  // Los pesos de las rutinas se ajustan a incrementos de la nueva unidad.
                  await snapAllRoutineWeights(u, (id) => exercises?.get(id)?.equipment);
                }}
                className={`h-12 rounded-xl text-lg font-bold ${
                  settings.unit === u ? 'bg-accent text-accent-ink' : 'bg-surface-2'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 font-semibold">Descanso por defecto</h2>
          <div className="grid grid-cols-4 gap-2">
            {RESTS.map((s) => (
              <button
                key={s}
                onClick={() => updateSettings({ defaultRestSec: s })}
                className={`h-12 rounded-xl font-semibold ${
                  settings.defaultRestSec === s ? 'bg-accent text-accent-ink' : 'bg-surface-2'
                }`}
              >
                {s < 120 ? `${s}s` : `${s / 60}min`}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 font-semibold">Aviso al terminar el descanso</h2>
          <div className="grid grid-cols-2 gap-2">
            {([
              ['vibration', 'Vibración'],
              ['sound', 'Sonido'],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => updateSettings({ [key]: !settings[key] })}
                aria-pressed={settings[key]}
                className={`h-12 rounded-xl font-semibold ${settings[key] ? 'bg-accent text-accent-ink' : 'bg-surface-2 text-muted'}`}
              >
                {label}: {settings[key] ? 'sí' : 'no'}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-2 flex items-center gap-2 font-semibold">
            <Icon name="shield" className="h-5 w-5 text-accent" /> Privacidad y seguridad
          </h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
            <li>Tus datos se guardan solo en este teléfono. No hay cuentas ni servidores.</li>
            <li>La app no pide permisos: ni ubicación, ni contactos, ni micrófono, ni notificaciones.</li>
            <li>Las fotos se eligen con el selector de Android; la app solo ve la foto que tú eliges y le quita los metadatos (GPS).</li>
            <li>La única conexión externa es para descargar las imágenes de ejercicios (GitHub). El resto funciona sin internet.</li>
          </ul>
        </Card>

        <OfflineCard />

        <BackupCard />
      </div>
    </>
  );
}
