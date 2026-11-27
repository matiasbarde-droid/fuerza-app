import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db, newId } from '../../db/db';
import { Icon } from '../../components/Icon';
import { Button, Chip, PageHeader } from '../../components/ui';
import { useObjectUrl } from '../../components/ExerciseImage';
import { EQUIPMENT_ES, EQUIPMENT_ORDER, MUSCLES_ES } from '../../data/translations.es';
import { compressImage } from '../../domain/image';

const MUSCLES = Object.keys(MUSCLES_ES);

/**
 * Crear o editar un ejercicio propio.
 *
 * Fotos: se usa <input type="file">, NO la API de cámara. La app nunca accede
 * a la cámara ni a la galería directamente: Android abre su propio selector
 * y la app solo recibe la foto que el usuario elige.
 */
export default function CustomExerciseForm() {
  const { id } = useParams();
  const editingId = id ? decodeURIComponent(id) : undefined;
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [equipment, setEquipment] = useState<string | null>(null);
  const [primary, setPrimary] = useState<string[]>([]);
  const [instructions, setInstructions] = useState('');
  const [photo, setPhoto] = useState<Blob>();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const createdAt = useRef(Date.now());
  const photoUrl = useObjectUrl(photo);

  const cameraInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);

  // Modo edición: carga los datos existentes.
  useEffect(() => {
    if (!editingId) return;
    db.customExercises.get(editingId).then((c) => {
      if (!c) return;
      setName(c.name);
      setEquipment(c.equipment);
      setPrimary(c.primaryMuscles);
      setInstructions(c.instructions.join('\n'));
      setPhoto(c.photo);
      createdAt.current = c.createdAt;
    });
  }, [editingId]);

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // permite volver a elegir la misma foto
    if (!file) return;
    setError(undefined);
    setBusy(true);
    try {
      setPhoto(await compressImage(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la imagen.');
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    const trimmed = name.trim();
    if (!trimmed) return setError('Escribe un nombre.');
    const exId = editingId ?? newId('custom:');
    await db.customExercises.put({
      id: exId,
      name: trimmed.slice(0, 100),
      equipment,
      primaryMuscles: primary,
      secondaryMuscles: [],
      instructions: instructions.split('\n').map((s) => s.trim()).filter(Boolean),
      photo,
      createdAt: createdAt.current,
    });
    navigate(`/ejercicios/${encodeURIComponent(exId)}`, { replace: true });
  }

  const toggleMuscle = (m: string) =>
    setPrimary((p) => (p.includes(m) ? p.filter((x) => x !== m) : [...p, m]));

  return (
    <>
      <PageHeader title={editingId ? 'Editar ejercicio' : 'Nuevo ejercicio'} back />
      <div className="space-y-5 px-4 pb-6">
        {/* Foto */}
        <div>
          {photoUrl ? (
            <div className="relative">
              <img src={photoUrl} alt="" className="aspect-[4/3] w-full rounded-2xl object-cover" />
              <button
                onClick={() => setPhoto(undefined)}
                className="absolute right-2 top-2 grid h-10 w-10 place-items-center rounded-full bg-black/60"
                aria-label="Quitar foto"
              >
                <Icon name="x" />
              </button>
            </div>
          ) : (
            <div className="grid aspect-[4/3] w-full place-items-center rounded-2xl border border-dashed border-line text-muted">
              {busy ? 'Procesando…' : 'Sin foto'}
            </div>
          )}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => cameraInput.current?.click()}>
              <Icon name="camera" /> Cámara
            </Button>
            <Button variant="secondary" onClick={() => galleryInput.current?.click()}>
              <Icon name="image" /> Galería
            </Button>
          </div>
          {/* capture="environment" abre directamente la cámara trasera en Android. */}
          <input ref={cameraInput} type="file" accept="image/*" capture="environment" hidden onChange={onFile} />
          <input ref={galleryInput} type="file" accept="image/*" hidden onChange={onFile} />
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-muted">Nombre</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            placeholder="Ej. Remo en máquina del gimnasio"
            className="h-12 w-full rounded-xl bg-surface px-3 outline-none focus:ring-2 focus:ring-accent"
          />
        </label>

        <div>
          <span className="mb-2 block text-sm font-semibold text-muted">Equipamiento</span>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT_ORDER.map((k) => (
              <Chip key={k} active={equipment === k} onClick={() => setEquipment(equipment === k ? null : k)}>
                {EQUIPMENT_ES[k]}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-2 block text-sm font-semibold text-muted">Músculos principales</span>
          <div className="flex flex-wrap gap-2">
            {MUSCLES.map((m) => (
              <Chip key={m} active={primary.includes(m)} onClick={() => toggleMuscle(m)}>
                {MUSCLES_ES[m]}
              </Chip>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-muted">Instrucciones (una por línea)</span>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={4}
            maxLength={3000}
            className="w-full rounded-xl bg-surface p-3 outline-none focus:ring-2 focus:ring-accent"
          />
        </label>

        {error && <p className="text-sm text-danger">{error}</p>}
        <Button className="w-full" onClick={save} disabled={busy}>
          Guardar
        </Button>
      </div>
    </>
  );
}
