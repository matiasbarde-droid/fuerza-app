import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Icon } from '../../components/Icon';
import { Button, Chip, PageHeader } from '../../components/ui';
import type { RoutineItem } from '../../db/db';
import { useSettings } from '../../db/settings';
import {
  deleteRoutine, duplicateRoutine, newDay, setActiveRoutine, updateRoutine, useRoutine,
} from '../../db/routines';
import { getPlan } from '../../data/plans';
import { useExerciseMap } from '../exercises/library';
import RoutineItemCard from './RoutineItemCard';
import { usePrefetchImages } from '../../lib/offlineImages';

export default function RoutineEditorPage() {
  const { id } = useParams();
  const routine = useRoutine(id);
  const exercises = useExerciseMap();
  const settings = useSettings();
  const navigate = useNavigate();

  // Día seleccionado (se recuerda al volver del selector de ejercicios).
  const storageKey = `rutina-dia-${id}`;
  const [dayId, setDayId] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(storageKey);
    } catch {
      return null;
    }
  });
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (dayId) sessionStorage.setItem(storageKey, dayId);
    } catch {
      /* almacenamiento no disponible: no pasa nada */
    }
  }, [dayId, storageKey]);

  // Guarda para uso offline las imágenes de los ejercicios de esta rutina.
  usePrefetchImages(
    (routine?.days ?? []).flatMap((d) => d.items.flatMap((i) => exercises?.get(i.exerciseId)?.images ?? [])),
  );

  // Arrastrar: con ratón tras moverse 5 px; en táctil desde el asa (touch-none).
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  if (routine === undefined) return <PageHeader title="Cargando…" back />;
  if (routine === null) {
    return (
      <>
        <PageHeader title="Rutina no encontrada" back />
        <p className="px-4 text-muted">Puede que la hayas eliminado.</p>
      </>
    );
  }

  const day = routine.days.find((d) => d.id === dayId) ?? routine.days[0];
  const plan = getPlan(routine.sourcePlanId);
  const rid = routine.id;

  const update = (fn: Parameters<typeof updateRoutine>[1]) => updateRoutine(rid, fn);

  /** Cambia un ejercicio del día: con un objeto (valor fijo) o una función (relativo al valor guardado). */
  const updateItem = (itemId: string, patch: Partial<RoutineItem> | ((it: RoutineItem) => void)) =>
    update((r) => {
      const it = r.days.find((d) => d.id === day?.id)?.items.find((i) => i.id === itemId);
      if (!it) return;
      if (typeof patch === 'function') patch(it);
      else Object.assign(it, patch);
    });

  const removeItem = (itemId: string) =>
    update((r) => {
      const d = r.days.find((x) => x.id === day?.id);
      if (d) d.items = d.items.filter((i) => i.id !== itemId);
    });

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id || !day) return;
    update((r) => {
      const d = r.days.find((x) => x.id === day.id);
      if (!d) return;
      const from = d.items.findIndex((i) => i.id === active.id);
      const to = d.items.findIndex((i) => i.id === over.id);
      d.items = arrayMove(d.items, from, to);
    });
  }

  function addDay() {
    const letter = String.fromCharCode(65 + routine!.days.length); // A, B, C…
    const d = newDay(`Día ${letter}`);
    update((r) => {
      r.days.push(d);
    });
    setDayId(d.id);
  }

  function removeDay() {
    if (!day || routine!.days.length <= 1) return;
    if (!confirm(`¿Eliminar "${day.name}" y sus ${day.items.length} ejercicios?`)) return;
    update((r) => {
      r.days = r.days.filter((d) => d.id !== day.id);
    });
    setDayId(null);
  }

  async function remove() {
    if (!confirm(`¿Eliminar la rutina "${routine!.name}"? No se puede deshacer.`)) return;
    await deleteRoutine(rid);
    navigate('/rutinas', { replace: true });
  }

  async function duplicate() {
    const newId = await duplicateRoutine(rid);
    if (newId) navigate(`/rutinas/${newId}`, { replace: true });
  }

  return (
    <>
      <PageHeader title="Editar rutina" back />
      <div className="space-y-4 px-4 pb-6">
        <input
          key={routine.id}
          defaultValue={routine.name}
          onBlur={(e) => {
            const name = e.target.value.trim().slice(0, 80);
            if (name && name !== routine.name) update((r) => void (r.name = name));
          }}
          className="h-12 w-full rounded-xl bg-surface px-3 text-lg font-bold outline-none focus:ring-2 focus:ring-accent"
          aria-label="Nombre de la rutina"
        />

        <div className="flex flex-wrap items-center gap-2">
          {routine.active ? (
            <span className="rounded-full bg-accent/15 px-3 py-1.5 text-sm font-semibold text-accent">Rutina activa</span>
          ) : (
            <Chip active={false} onClick={() => setActiveRoutine(rid)}>Marcar como activa</Chip>
          )}
          {plan && (
            <Link to={`/rutinas/planes/${plan.id}`} className="text-sm font-semibold text-accent">
              Ver justificación del plan
            </Link>
          )}
        </div>

        <div>
          <span className="mb-2 block text-sm font-semibold text-muted">Días de entrenamiento por semana</span>
          <div className="flex gap-2">
            {[2, 3, 4, 5, 6].map((n) => (
              <Chip key={n} active={routine.daysPerWeek === n} onClick={() => update((r) => void (r.daysPerWeek = n))}>
                {n}
              </Chip>
            ))}
          </div>
          {routine.days.length !== routine.daysPerWeek && (
            <p className="mt-2 text-xs text-muted">
              Los días se recorren en rotación: {routine.days.map((d) => d.name).join(' → ')} → …
            </p>
          )}
        </div>

        {/* Pestañas de días */}
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {routine.days.map((d) => (
            <Chip key={d.id} active={d.id === day?.id} onClick={() => { setDayId(d.id); setExpanded(null); }}>
              {d.name}
            </Chip>
          ))}
          <Chip active={false} onClick={addDay}>+ Día</Chip>
        </div>

        {day && (
          <>
            <div className="flex items-center gap-2">
              <input
                key={day.id}
                defaultValue={day.name}
                onBlur={(e) => {
                  const name = e.target.value.trim().slice(0, 40);
                  if (name && name !== day.name)
                    update((r) => {
                      const d = r.days.find((x) => x.id === day.id);
                      if (d) d.name = name;
                    });
                }}
                className="h-11 min-w-0 flex-1 rounded-xl bg-surface px-3 font-semibold outline-none focus:ring-2 focus:ring-accent"
                aria-label="Nombre del día"
              />
              {routine.days.length > 1 && (
                <button
                  onClick={removeDay}
                  className="grid h-11 w-11 place-items-center rounded-xl bg-surface text-danger"
                  aria-label="Eliminar día"
                >
                  <Icon name="trash" />
                </button>
              )}
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={day.items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                <ul className="space-y-2">
                  {day.items.map((item) => (
                    <RoutineItemCard
                      key={item.id}
                      item={item}
                      exercise={exercises?.get(item.exerciseId)}
                      globalUnit={settings.unit}
                      expanded={expanded === item.id}
                      onToggle={() => setExpanded((x) => (x === item.id ? null : item.id))}
                      onChange={(patch) => updateItem(item.id, patch)}
                      onRemove={() => removeItem(item.id)}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
            {day.items.length === 0 && (
              <p className="rounded-2xl border border-dashed border-line p-6 text-center text-muted">Este día está vacío.</p>
            )}

            <Link
              to={`/rutinas/${rid}/dia/${day.id}/agregar`}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent font-semibold text-accent-ink"
            >
              <Icon name="plus" /> Agregar ejercicio
            </Link>
          </>
        )}

        <div className="grid grid-cols-2 gap-2 pt-4">
          <Button variant="secondary" onClick={duplicate}>Duplicar</Button>
          <Button variant="danger" onClick={remove}>
            <Icon name="trash" /> Eliminar
          </Button>
        </div>
      </div>
    </>
  );
}
