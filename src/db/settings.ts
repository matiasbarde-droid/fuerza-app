import { useLiveQuery } from 'dexie-react-hooks';
import { db, DEFAULT_SETTINGS, type Settings } from './db';

/** Ajustes actuales, completados con los valores por defecto (campos nuevos incluidos). */
export function useSettings(): Settings {
  const stored = useLiveQuery(() => db.settings.get('app'), []);
  return { ...DEFAULT_SETTINGS, ...stored };
}

export async function getSettings(): Promise<Settings> {
  return { ...DEFAULT_SETTINGS, ...(await db.settings.get('app')) };
}

export async function updateSettings(patch: Partial<Omit<Settings, 'key'>>): Promise<void> {
  await db.settings.put({ ...(await getSettings()), ...patch, key: 'app' });
}
