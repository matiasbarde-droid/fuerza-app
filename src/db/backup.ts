/**
 * Respaldo: exportar e importar TODOS los datos en un archivo JSON.
 * Las fotos de ejercicios propios van incluidas en base64.
 */
import { db, DEFAULT_SETTINGS, type CustomExercise } from './db';

const APP = 'fuerza';
const FORMAT_VERSION = 1;
const MAX_IMPORT_BYTES = 100 * 1024 * 1024;

const TABLES = ['customExercises', 'routines', 'sessions', 'setLogs', 'bodyweight', 'cardio', 'settings'] as const;
type TableName = (typeof TABLES)[number];

interface BackupFile {
  app: typeof APP;
  version: number;
  exportedAt: string;
  data: Record<TableName, unknown[]>;
}

// ----- Blob <-> base64 (sin fetch, compatible con la CSP de la app) -----

async function blobToDataUrl(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return `data:${blob.type || 'image/jpeg'};base64,${btoa(bin)}`;
}

function dataUrlToBlob(url: string): Blob | undefined {
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(url);
  if (!m) return undefined;
  const bin = atob(m[2]);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: m[1] });
}

// ----- Exportar -----

export async function exportData(): Promise<{ blob: Blob; filename: string; counts: Record<string, number> }> {
  const data = {} as Record<TableName, unknown[]>;
  for (const t of TABLES) data[t] = await db.table(t).toArray();

  // Fotos (Blob) → texto base64.
  data.customExercises = await Promise.all(
    (data.customExercises as CustomExercise[]).map(async (c) => ({
      ...c,
      photo: c.photo ? await blobToDataUrl(c.photo) : undefined,
    })),
  );

  const file: BackupFile = { app: APP, version: FORMAT_VERSION, exportedAt: new Date().toISOString(), data };
  const date = new Date().toISOString().slice(0, 10);
  const counts = Object.fromEntries(TABLES.map((t) => [t, data[t].length]));
  return {
    blob: new Blob([JSON.stringify(file)], { type: 'application/json' }),
    filename: `fuerza-respaldo-${date}.json`,
    counts,
  };
}

/** Dispara la descarga del archivo (en Android va a la carpeta Descargas). */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

// ----- Importar -----

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * Lee y valida un respaldo. Lanza un error con un mensaje claro si el archivo
 * no es válido. No modifica nada.
 */
export async function readBackup(file: File): Promise<{ data: Record<TableName, Record<string, unknown>[]>; exportedAt: string }> {
  if (file.size > MAX_IMPORT_BYTES) throw new Error('El archivo es demasiado grande.');
  let parsed: unknown;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    throw new Error('El archivo no es un JSON válido.');
  }
  if (!isObj(parsed) || parsed.app !== APP || !isObj(parsed.data))
    throw new Error('Este archivo no es un respaldo de esta app.');
  if (typeof parsed.version !== 'number' || parsed.version > FORMAT_VERSION)
    throw new Error('El respaldo es de una versión más nueva de la app. Actualízala primero.');

  const data = {} as Record<TableName, Record<string, unknown>[]>;
  for (const t of TABLES) {
    const rows = (parsed.data as Record<string, unknown>)[t] ?? [];
    if (!Array.isArray(rows)) throw new Error(`Datos dañados en "${t}".`);
    // Cada fila debe ser un objeto con su clave primaria de texto.
    const key = t === 'settings' ? 'key' : 'id';
    data[t] = rows.filter((r): r is Record<string, unknown> => isObj(r) && typeof r[key] === 'string');
  }
  return { data, exportedAt: typeof parsed.exportedAt === 'string' ? parsed.exportedAt : '' };
}

/** Reemplaza TODOS los datos actuales por los del respaldo (en una transacción). */
export async function restoreBackup(data: Record<TableName, Record<string, unknown>[]>): Promise<void> {
  const custom = data.customExercises.map((c) => ({
    ...c,
    photo: typeof c.photo === 'string' ? dataUrlToBlob(c.photo) : undefined,
  }));
  const settings = data.settings.filter((s) => s.key === 'app').map((s) => ({ ...DEFAULT_SETTINGS, ...s, key: 'app' }));

  await db.transaction('rw', TABLES.map((t) => db.table(t)), async () => {
    for (const t of TABLES) await db.table(t).clear();
    await db.customExercises.bulkPut(custom as never[]);
    for (const t of ['routines', 'sessions', 'setLogs', 'bodyweight', 'cardio'] as const)
      await db.table(t).bulkPut(data[t]);
    await db.settings.bulkPut(settings as never[]);
  });
}
