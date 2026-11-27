import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * Registra el service worker (modo offline) y muestra un aviso cuando hay
 * una versión nueva publicada. Actualizar recarga la app; si había un
 * entrenamiento en curso, sigue guardado y se retoma.
 */
export default function UpdateBanner() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, reg) {
      // Comprueba si hay versión nueva cada hora mientras la app está abierta.
      if (reg) setInterval(() => void reg.update(), 60 * 60 * 1000);
    },
  });

  if (!needRefresh && !offlineReady) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-50 mx-auto max-w-xl p-3">
      <div className="flex items-center gap-3 rounded-2xl bg-surface-2 p-3 shadow-2xl ring-1 ring-line">
        <p className="flex-1 text-sm">
          {needRefresh ? 'Hay una versión nueva de la app.' : 'Lista para usarse sin conexión.'}
        </p>
        {needRefresh && (
          <button
            onClick={() => updateServiceWorker(true)}
            className="h-10 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-ink"
          >
            Actualizar
          </button>
        )}
        <button
          onClick={() => {
            setNeedRefresh(false);
            setOfflineReady(false);
          }}
          className="h-10 rounded-xl px-3 text-sm text-muted"
        >
          {needRefresh ? 'Luego' : 'OK'}
        </button>
      </div>
    </div>
  );
}
