import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card } from '../../components/ui';
import { useRoutines } from '../../db/routines';
import {
  cacheImages, cacheSupported, clearImageCache, countCached, requestPersistence, storageUsage,
  type CacheProgress,
} from '../../lib/offlineImages';
import { useExercises } from '../exercises/library';

/** Ajustes → Uso sin conexión: descarga de imágenes y espacio usado. */
export default function OfflineCard() {
  const all = useExercises();
  const routines = useRoutines();
  const [progress, setProgress] = useState<CacheProgress | null>(null);
  const [cached, setCached] = useState<{ mine: number; all: number } | null>(null);
  const [usage, setUsage] = useState<{ usedMB: number; persisted: boolean } | null>(null);
  const abort = useRef<AbortController | null>(null);

  // URLs de imágenes: las de tus rutinas y las de toda la biblioteca.
  const { mineUrls, allUrls } = useMemo(() => {
    const byId = new Map((all ?? []).map((e) => [e.id, e]));
    const ids = new Set((routines ?? []).flatMap((r) => r.days.flatMap((d) => d.items.map((i) => i.exerciseId))));
    return {
      mineUrls: [...ids].flatMap((id) => byId.get(id)?.images ?? []),
      allUrls: (all ?? []).flatMap((e) => e.images),
    };
  }, [all, routines]);

  async function refresh() {
    setCached({ mine: await countCached(mineUrls), all: await countCached(allUrls) });
    setUsage(await storageUsage());
  }
  useEffect(() => {
    if (all && routines) void refresh();
  }, [all, routines]);

  async function download(urls: string[]) {
    abort.current = new AbortController();
    setProgress({ done: 0, total: urls.length, failed: 0 });
    await requestPersistence();
    await cacheImages(urls, { onProgress: setProgress, signal: abort.current.signal });
    abort.current = null;
    setProgress(null);
    await refresh();
  }

  async function clear() {
    if (!confirm('¿Borrar las imágenes guardadas? Se volverán a descargar cuando las veas con conexión.')) return;
    await clearImageCache();
    await refresh();
  }

  return (
    <Card>
      <h2 className="mb-1 font-semibold">Uso sin conexión</h2>
      {!cacheSupported() ? (
        <p className="text-sm text-muted">
          Disponible al abrir la app instalada (HTTPS). Por la red local de desarrollo no se pueden guardar imágenes.
        </p>
      ) : (
        <>
          <p className="mb-3 text-sm text-muted">
            La app y tus datos ya funcionan sin internet. Las imágenes de ejercicios se guardan al verlas; aquí puedes
            descargarlas por adelantado.
          </p>
          {cached && (
            <ul className="mb-3 space-y-1 text-sm tabular-nums">
              <li>
                De tus rutinas: <b>{cached.mine}</b> / {new Set(mineUrls).size} imágenes
              </li>
              <li>
                Biblioteca completa: <b>{cached.all}</b> / {new Set(allUrls).size} imágenes
              </li>
              {usage && (
                <li className="text-muted">
                  Espacio usado por la app: {usage.usedMB.toLocaleString('es-ES', { maximumFractionDigits: 1 })} MB
                  {usage.persisted && ' · datos protegidos contra borrado automático'}
                </li>
              )}
            </ul>
          )}

          {progress ? (
            <div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                <div className="h-full bg-accent" style={{ width: `${(progress.done / Math.max(1, progress.total)) * 100}%` }} />
              </div>
              <p className="mt-2 text-sm tabular-nums text-muted">
                {progress.done} / {progress.total}
                {progress.failed > 0 && ` · ${progress.failed} fallidas`}
              </p>
              <Button variant="secondary" className="mt-2 w-full" onClick={() => abort.current?.abort()}>
                Cancelar
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Button className="w-full" onClick={() => download(mineUrls)} disabled={!mineUrls.length}>
                Descargar imágenes de mis rutinas
              </Button>
              <Button variant="secondary" className="w-full" onClick={() => download(allUrls)} disabled={!allUrls.length}>
                Descargar toda la biblioteca (~1.700, usa Wi-Fi)
              </Button>
              {cached && cached.all > 0 && (
                <Button variant="ghost" className="w-full text-sm" onClick={clear}>
                  Borrar imágenes guardadas
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </Card>
  );
}
