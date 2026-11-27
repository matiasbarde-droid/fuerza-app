/**
 * Descarga la base de ejercicios free-exercise-db (dominio público, Unlicense)
 * y genera src/data/exercises.json con solo los campos que usa la app.
 *
 * Uso:  npm run sync-exercises
 *
 * Solo se descarga un archivo JSON (datos). No se ejecuta nada de lo descargado.
 * Las imágenes NO se descargan aquí: la app las pide a GitHub bajo demanda y
 * las guarda en caché para uso offline (fase 5).
 */
import { writeFile, mkdir } from 'node:fs/promises';

const SOURCE =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const OUT = new URL('../src/data/exercises.json', import.meta.url);

const res = await fetch(SOURCE);
if (!res.ok) throw new Error(`Error al descargar: HTTP ${res.status}`);
const raw = await res.json();
if (!Array.isArray(raw)) throw new Error('Formato inesperado: se esperaba un array');

// Validación mínima y recorte de campos (todo como texto plano, nunca HTML).
const str = (v) => (typeof v === 'string' ? v.slice(0, 2000) : null);
const arr = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []);

const exercises = raw
  .filter((e) => typeof e?.id === 'string' && typeof e?.name === 'string')
  .map((e) => ({
    id: e.id,
    name: str(e.name),
    level: str(e.level),
    mechanic: str(e.mechanic),
    force: str(e.force),
    equipment: str(e.equipment),
    category: str(e.category),
    primaryMuscles: arr(e.primaryMuscles),
    secondaryMuscles: arr(e.secondaryMuscles),
    instructions: arr(e.instructions),
    // Rutas relativas tipo "Air_Bike/0.jpg"; solo se aceptan caracteres seguros.
    images: arr(e.images).filter((p) => /^[\w\-./]+\.(jpe?g|png|gif|webp)$/i.test(p)),
  }));

await mkdir(new URL('../src/data/', import.meta.url), { recursive: true });
await writeFile(OUT, JSON.stringify(exercises));
console.log(`OK: ${exercises.length} ejercicios guardados en src/data/exercises.json`);

// Resumen de valores para mantener las traducciones al día.
const uniq = (k) => [...new Set(exercises.flatMap((e) => [e[k]].flat()).filter(Boolean))].sort();
console.log('equipment:', uniq('equipment').join(' | '));
console.log('category:', uniq('category').join(' | '));
console.log('muscles:', [...new Set(exercises.flatMap((e) => [...e.primaryMuscles, ...e.secondaryMuscles]))].sort().join(' | '));
