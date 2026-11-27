import { useEffect, useRef } from 'react';
import { updateSession } from '../../db/session';
import { useSettings } from '../../db/settings';
import { beep, vibrate } from '../../lib/alerts';
import { formatClock, useNow } from '../../lib/hooks';

/**
 * Barra de descanso fija sobre la navegación. El tiempo se calcula desde la
 * hora de fin guardada, así sigue siendo correcto si bloqueas la pantalla
 * o cambias de app.
 */
export default function RestTimer({ endsAt, totalSec }: { endsAt: number; totalSec: number }) {
  const now = useNow(250);
  const settings = useSettings();
  const remaining = (endsAt - now) / 1000;
  const alerted = useRef<number | null>(null);

  // Aviso una sola vez por descanso.
  useEffect(() => {
    if (remaining <= 0 && alerted.current !== endsAt) {
      alerted.current = endsAt;
      if (settings.vibration) vibrate();
      if (settings.sound) beep();
    }
  }, [remaining, endsAt, settings.vibration, settings.sound]);

  const finished = remaining <= 0;
  const pct = Math.min(100, Math.max(0, (1 - remaining / totalSec) * 100));

  const adjust = (sec: number) =>
    updateSession((s) => {
      if (s.restEndsAt) s.restEndsAt = Math.max(Date.now(), s.restEndsAt + sec * 1000);
    });
  const stop = () => updateSession((s) => void (s.restEndsAt = undefined));

  return (
    <div className="fixed inset-x-0 bottom-16 z-30 mx-auto max-w-xl px-3 pb-[env(safe-area-inset-bottom)]">
      <div className={`overflow-hidden rounded-2xl shadow-2xl ${finished ? 'bg-accent text-accent-ink' : 'bg-surface-2'}`}>
        {!finished && <div className="h-1.5 bg-accent transition-[width] duration-200" style={{ width: `${pct}%` }} />}
        <div className="flex items-center gap-2 p-3">
          <div className="flex-1">
            <p className={`text-xs font-semibold ${finished ? '' : 'text-muted'}`}>
              {finished ? '¡A por la siguiente serie!' : 'Descanso'}
            </p>
            <p className="text-3xl font-bold tabular-nums">{finished ? formatClock(-remaining) : formatClock(remaining)}</p>
          </div>
          {!finished && (
            <>
              <button onClick={() => adjust(-15)} className="h-12 rounded-xl bg-bg/60 px-3 font-semibold">−15</button>
              <button onClick={() => adjust(15)} className="h-12 rounded-xl bg-bg/60 px-3 font-semibold">+15</button>
            </>
          )}
          <button
            onClick={stop}
            className={`h-12 rounded-xl px-4 font-semibold ${finished ? 'bg-accent-ink text-accent' : 'bg-bg/60'}`}
          >
            {finished ? 'OK' : 'Saltar'}
          </button>
        </div>
      </div>
    </div>
  );
}
