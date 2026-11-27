import { useEffect, useState } from 'react';

/** Hora actual que se refresca cada `ms` (para cronómetros). */
export function useNow(ms = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

export type WakeLockState = 'on' | 'unsupported' | 'off';

/**
 * Mantiene la pantalla encendida mientras `active` sea true (Wake Lock API).
 * Android libera el bloqueo al salir de la app; se vuelve a pedir al regresar.
 * Requiere HTTPS o localhost (no funciona por la IP de la red local).
 */
export function useWakeLock(active: boolean): WakeLockState {
  const supported = typeof navigator !== 'undefined' && 'wakeLock' in navigator && window.isSecureContext;
  const [state, setState] = useState<WakeLockState>(supported ? 'off' : 'unsupported');

  useEffect(() => {
    if (!active || !supported) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;

    const request = async () => {
      try {
        lock = await navigator.wakeLock.request('screen');
        if (cancelled) return void lock.release();
        setState('on');
        lock.addEventListener('release', () => setState('off'));
      } catch {
        setState('off');
      }
    };
    const onVisible = () => document.visibilityState === 'visible' && request();

    void request();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      void lock?.release();
    };
  }, [active, supported]);

  return state;
}

/** mm:ss */
export function formatClock(totalSec: number): string {
  const s = Math.max(0, Math.round(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}
