/** Registro de peso corporal y de cardio. */
import { useState } from 'react';
import { addBodyWeight, addCardio, deleteBodyWeight, deleteCardio, useBodyWeights, useCardio } from '../../db/history';
import { useSettings } from '../../db/settings';
import { displayToKg, formatWeight, kgToDisplay } from '../../domain/units';
import { parseDecimal } from '../../components/fields';
import { Icon } from '../../components/Icon';
import { Button, Card, Chip } from '../../components/ui';
import TrendChart from '../../components/TrendChart';
import ProgressTabs from './ProgressTabs';

/** yyyy-mm-dd de hoy en hora local (para <input type="date">). */
function todayISO(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}
/**
 * yyyy-mm-dd → ms. Hoy usa la hora actual (para que el último registro sea
 * el más reciente); otros días, el mediodía local (evita saltos por zona horaria).
 */
function isoToMs(iso: string): number {
  if (iso === todayISO()) return Date.now();
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d, 12).getTime();
}
const fmtDay = (t: number) => new Date(t).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });

const inputCls = 'h-12 w-full min-w-0 rounded-xl bg-bg px-3 outline-none focus:ring-2 focus:ring-accent';

// ---------------------------------------------------------------------------

export function BodyWeightPage() {
  const entries = useBodyWeights();
  const { unit } = useSettings();
  const [value, setValue] = useState('');
  const [date, setDate] = useState(todayISO);
  const [error, setError] = useState<string>();

  async function add() {
    const n = parseDecimal(value);
    if (n == null || n <= 0 || n > 700) return setError('Escribe un peso válido.');
    await addBodyWeight(displayToKg(n, unit), isoToMs(date));
    setValue('');
    setError(undefined);
  }

  const data = (entries ?? []).map((e) => ({ t: e.date, v: kgToDisplay(e.kg, unit) }));
  const last = entries?.at(-1);
  // Cambio en ~30 días respecto al registro más cercano a esa fecha.
  const monthAgo = entries?.filter((e) => e.date <= Date.now() - 28 * 86_400_000).at(-1);

  return (
    <>
      <ProgressTabs />
      <div className="space-y-4 px-4 pb-6">
        <Card>
          <h2 className="mb-3 font-semibold">Registrar peso</h2>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <label className="flex h-12 items-center gap-2 rounded-xl bg-bg px-3">
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                inputMode="decimal"
                placeholder={last ? String(kgToDisplay(last.kg, unit)).replace('.', ',') : 'Ej. 78,5'}
                className="w-full min-w-0 bg-transparent text-lg font-bold outline-none"
                aria-label={`Peso en ${unit}`}
              />
              <span className="text-muted">{unit}</span>
            </label>
            <input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} className={inputCls} aria-label="Fecha" />
          </div>
          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
          <Button className="mt-3 w-full" onClick={add}>Guardar</Button>
        </Card>

        {last && (
          <div className="grid grid-cols-2 gap-2">
            <Card className="p-3">
              <p className="text-xs text-muted">Actual</p>
              <p className="text-2xl font-bold tabular-nums">{formatWeight(last.kg, unit)}</p>
            </Card>
            <Card className="p-3">
              <p className="text-xs text-muted">Cambio en ~4 semanas</p>
              <p className="text-2xl font-bold tabular-nums">
                {monthAgo ? `${last.kg >= monthAgo.kg ? '+' : '−'}${formatWeight(Math.abs(last.kg - monthAgo.kg), unit)}` : '—'}
              </p>
            </Card>
          </div>
        )}

        <Card className="px-3">
          <h2 className="mb-3 px-1 font-semibold">
            Peso corporal <span className="font-normal text-muted">({unit})</span>
          </h2>
          <TrendChart data={data} unit={unit} />
        </Card>

        <ul className="space-y-1">
          {[...(entries ?? [])].reverse().map((e) => (
            <li key={e.id} className="flex items-center gap-3 rounded-xl bg-surface px-4 py-2">
              <span className="flex-1 text-sm text-muted">{fmtDay(e.date)}</span>
              <span className="font-semibold tabular-nums">{formatWeight(e.kg, unit)}</span>
              <button
                onClick={() => confirm('¿Eliminar este registro?') && deleteBodyWeight(e.id)}
                className="grid h-10 w-10 place-items-center text-muted"
                aria-label="Eliminar registro"
              >
                <Icon name="trash" className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------

const CARDIO_TYPES = ['Trote', 'Caminata', 'Bicicleta', 'Natación', 'Elíptica', 'Remo', 'Otro'];

export function CardioPage() {
  const entries = useCardio();
  const [type, setType] = useState('Trote');
  const [minutes, setMinutes] = useState('');
  const [km, setKm] = useState('');
  const [date, setDate] = useState(todayISO);
  const [error, setError] = useState<string>();

  async function add() {
    const dur = parseDecimal(minutes);
    const dist = km.trim() ? parseDecimal(km) : undefined;
    if (dur == null || dur <= 0 || dur > 1440) return setError('Escribe la duración en minutos.');
    if (dist === null || (dist != null && dist > 500)) return setError('Distancia no válida.');
    await addCardio({ type, durationMin: dur, distanceKm: dist ?? undefined, date: isoToMs(date) });
    setMinutes('');
    setKm('');
    setError(undefined);
  }

  // Minutos de los últimos 7 días (la OMS recomienda 150–300 min/semana moderados).
  const weekAgo = Date.now() - 7 * 86_400_000;
  const week = entries?.filter((e) => e.date >= weekAgo) ?? [];
  const weekMin = week.reduce((n, e) => n + e.durationMin, 0);
  const weekKm = week.reduce((n, e) => n + (e.distanceKm ?? 0), 0);

  return (
    <>
      <ProgressTabs />
      <div className="space-y-4 px-4 pb-6">
        <div className="grid grid-cols-2 gap-2">
          <Card className="p-3">
            <p className="text-xs text-muted">Últimos 7 días</p>
            <p className="text-2xl font-bold tabular-nums">{Math.round(weekMin)} min</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
              <div className="h-full bg-accent" style={{ width: `${Math.min(100, (weekMin / 150) * 100)}%` }} />
            </div>
            <p className="mt-1 text-xs text-muted">Meta OMS: 150 min</p>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-muted">Distancia (7 días)</p>
            <p className="text-2xl font-bold tabular-nums">{weekKm.toLocaleString('es-ES', { maximumFractionDigits: 1 })} km</p>
          </Card>
        </div>

        <Card>
          <h2 className="mb-3 font-semibold">Registrar cardio</h2>
          <div className="mb-3 flex flex-wrap gap-2">
            {CARDIO_TYPES.map((t) => (
              <Chip key={t} active={type === t} onClick={() => setType(t)}>{t}</Chip>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex h-12 items-center gap-2 rounded-xl bg-bg px-3">
              <input value={minutes} onChange={(e) => setMinutes(e.target.value)} inputMode="decimal" placeholder="30" className="w-full min-w-0 bg-transparent font-bold outline-none" aria-label="Duración en minutos" />
              <span className="text-sm text-muted">min</span>
            </label>
            <label className="flex h-12 items-center gap-2 rounded-xl bg-bg px-3">
              <input value={km} onChange={(e) => setKm(e.target.value)} inputMode="decimal" placeholder="opcional" className="w-full min-w-0 bg-transparent font-bold outline-none" aria-label="Distancia en km" />
              <span className="text-sm text-muted">km</span>
            </label>
          </div>
          <input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} className={`${inputCls} mt-2`} aria-label="Fecha" />
          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
          <Button className="mt-3 w-full" onClick={add}>Guardar</Button>
        </Card>

        {entries?.length === 0 && <p className="text-center text-sm text-muted">Sin registros de cardio todavía.</p>}
        <ul className="space-y-1">
          {entries?.map((e) => (
            <li key={e.id} className="flex items-center gap-3 rounded-xl bg-surface px-4 py-2">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{e.type}</p>
                <p className="text-xs text-muted">{fmtDay(e.date)}</p>
              </div>
              <p className="text-right text-sm tabular-nums">
                {e.durationMin} min
                {e.distanceKm != null && (
                  <>
                    {' · '}
                    {e.distanceKm.toLocaleString('es-ES', { maximumFractionDigits: 2 })} km
                    <span className="block text-xs text-muted">{pace(e.durationMin, e.distanceKm)}</span>
                  </>
                )}
              </p>
              <button
                onClick={() => confirm('¿Eliminar este registro?') && deleteCardio(e.id)}
                className="grid h-10 w-10 place-items-center text-muted"
                aria-label="Eliminar registro"
              >
                <Icon name="trash" className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

/** Ritmo en min/km (ej. "6:15 /km"). */
function pace(min: number, km: number): string {
  if (!km) return '';
  const secPerKm = (min * 60) / km;
  return `${Math.floor(secPerKm / 60)}:${String(Math.round(secPerKm % 60)).padStart(2, '0')} /km`;
}
