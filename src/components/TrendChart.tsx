/**
 * Gráfico de línea de una sola serie a lo largo del tiempo.
 * Una serie por gráfico (sin doble eje): el título ya la nombra, así que no
 * lleva leyenda. Tooltip al tocar/pasar sobre los puntos.
 */
import {
  CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
  type TooltipProps,
} from 'recharts';

export interface TrendPoint {
  t: number; // fecha (ms)
  v: number; // valor ya convertido a la unidad mostrada
}

// Colores del tema (mismos tokens que index.css).
const ACCENT = '#a3e635';
const GRID = '#2a3140';
const AXIS = '#8d96a8';
const SURFACE = '#151922';

const fmtDate = (t: number) => new Date(t).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
const fmtNum = (v: number) => v.toLocaleString('es-ES', { maximumFractionDigits: 1 });

export default function TrendChart({
  data,
  unit,
  height = 200,
}: {
  data: TrendPoint[];
  unit: string;
  height?: number;
}) {
  if (data.length < 2) {
    return (
      <div className="grid place-items-center rounded-xl border border-dashed border-line text-center text-sm text-muted" style={{ height }}>
        {data.length === 0 ? 'Sin datos todavía.' : 'Con un registro más verás la tendencia.'}
      </div>
    );
  }

  const Tip = ({ active, payload }: TooltipProps<number, string>) => {
    if (!active || !payload?.length) return null;
    const p = payload[0].payload as TrendPoint;
    return (
      <div className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm shadow-lg">
        <p className="text-muted">{fmtDate(p.t)}</p>
        <p className="font-bold tabular-nums">
          {fmtNum(p.v)} {unit}
        </p>
      </div>
    );
  };

  return (
    <div style={{ height }} className="-ml-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke={GRID} strokeDasharray="0" vertical={false} />
          <XAxis
            dataKey="t"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            tickFormatter={fmtDate}
            tick={{ fill: AXIS, fontSize: 11 }}
            stroke={GRID}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            domain={['auto', 'auto']}
            tickFormatter={fmtNum}
            tick={{ fill: AXIS, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={44}
          />
          <Tooltip content={<Tip />} cursor={{ stroke: AXIS, strokeWidth: 1 }} />
          <Line
            type="monotone"
            dataKey="v"
            stroke={ACCENT}
            strokeWidth={2}
            dot={{ r: 4, fill: ACCENT, stroke: SURFACE, strokeWidth: 2 }}
            activeDot={{ r: 6, fill: ACCENT, stroke: SURFACE, strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
