/**
 * Imágenes de ejercicios sin conexión.
 *
 * El service worker guarda cada imagen la primera vez que se ve. Además, aquí
 * se pueden descargar por adelantado (las de tus rutinas, o todas) en la MISMA
 * caché que usa el service worker, así quedan disponibles offline.
 *
 * La Cache API solo existe en contextos seguros (HTTPS o localhost): por la IP
 * de la red local estas funciones no hacen nada.
 */
import { useEffect } from 'react';

export const IMAGE_CACHE = 'exercise-images'; // igual que en vite.config.ts

export const cacheSupported = () => typeof window !== 'undefined' && 'caches' in window;

export interface CacheProgress {
  done: number;
  total: number;
  failed: number;
}

/** Descarga (si faltan) las URLs indicadas. Se puede cancelar con un AbortSignal. */
export async function cacheImages(
  urls: string[],
  opts: { onProgress?: (p: CacheProgress) => void; signal?: AbortSignal; concurrency?: number } = {},
): Promise<CacheProgress> {
  const unique = [...new Set(urls)];
  const progress: CacheProgress = { done: 0, total: unique.length, failed: 0 };
  if (!cacheSupported() || unique.length === 0) return progress;

  const cache = await caches.open(IMAGE_CACHE);
  let next = 0;

  async function worker() {
    while (next < unique.length && !opts.signal?.aborted) {
      const url = unique[next++];
      try {
        if (!(await cache.match(url))) {
          const res = await fetch(url, { mode: 'cors', signal: opts.signal });
          if (res.ok) await cache.put(url, res);
          else progress.failed++;
        }
      } catch {
        if (opts.signal?.aborted) return;
        progress.failed++;
      }
      progress.done++;
      opts.onProgress?.({ ...progress });
    }
  }

  await Promise.all(Array.from({ length: opts.concurrency ?? 6 }, worker));
  return progress;
}

/** Cuántas de estas URLs ya están guardadas. */
export async function countCached(urls: string[]): Promise<number> {
  if (!cacheSupported()) return 0;
  const cache = await caches.open(IMAGE_CACHE);
  const keys = new Set((await cache.keys()).map((r) => r.url));
  return new Set(urls.filter((u) => keys.has(u))).size;
}

export async function clearImageCache(): Promise<void> {
  if (cacheSupported()) await caches.delete(IMAGE_CACHE);
}

/** Espacio usado por la app en el teléfono (aprox.). */
export async function storageUsage(): Promise<{ usedMB: number; persisted: boolean } | null> {
  if (!navigator.storage?.estimate) return null;
  const { usage = 0 } = await navigator.storage.estimate();
  const persisted = (await navigator.storage.persisted?.()) ?? false;
  return { usedMB: usage / 1024 / 1024, persisted };
}

/**
 * Pide al navegador que no borre los datos de la app al quedarse sin espacio.
 * En Chrome/Android no muestra ningún aviso: lo concede solo (sobre todo si la
 * app está instalada).
 */
export async function requestPersistence(): Promise<boolean> {
  try {
    return (await navigator.storage?.persist?.()) ?? false;
  } catch {
    return false;
  }
}

/**
 * Precarga silenciosa de imágenes (p. ej. las de la rutina que estás viendo).
 * Solo si hay conexión; las ya guardadas no se vuelven a descargar.
 */
export function usePrefetchImages(urls: string[]): void {
  const key = urls.join('|');
  useEffect(() => {
    if (!key || !cacheSupported() || !navigator.onLine) return;
    const ctrl = new AbortController();
    const t = setTimeout(() => void cacheImages(key.split('|'), { signal: ctrl.signal, concurrency: 3 }), 1500);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [key]);
}
