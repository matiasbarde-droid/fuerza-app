import { useRef, useState, type ChangeEvent } from 'react';
import { downloadBlob, exportData, readBackup, restoreBackup } from '../../db/backup';
import { Button, Card } from '../../components/ui';

/** Exportar / importar todos los datos como JSON. */
export default function BackupCard() {
  const [msg, setMsg] = useState<{ ok: boolean; text: string }>();
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  async function doExport() {
    setBusy(true);
    try {
      const { blob, filename, counts } = await exportData();
      downloadBlob(blob, filename);
      setMsg({
        ok: true,
        text: `Exportado "${filename}": ${counts.routines} rutinas, ${counts.sessions} entrenamientos, ${counts.bodyweight} pesos, ${counts.cardio} cardio.`,
      });
    } catch {
      setMsg({ ok: false, text: 'No se pudo exportar.' });
    } finally {
      setBusy(false);
    }
  }

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const { data, exportedAt } = await readBackup(file);
      const when = exportedAt ? new Date(exportedAt).toLocaleString('es-ES') : 'fecha desconocida';
      const ok = confirm(
        `Respaldo del ${when}: ${data.routines.length} rutinas, ${data.sessions.length} entrenamientos, ` +
          `${data.bodyweight.length} registros de peso y ${data.cardio.length} de cardio.\n\n` +
          'Esto REEMPLAZARÁ todos los datos actuales de la app. ¿Continuar?',
      );
      if (!ok) return;
      await restoreBackup(data);
      setMsg({ ok: true, text: 'Datos restaurados correctamente.' });
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : 'No se pudo importar.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <h2 className="mb-1 font-semibold">Respaldo de datos</h2>
      <p className="mb-3 text-sm text-muted">
        Tus datos viven solo en este teléfono. Si borras los datos del navegador o cambias de móvil se pierden, así que
        exporta un respaldo de vez en cuando y guárdalo (Drive, correo…).
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={doExport} disabled={busy}>Exportar</Button>
        <Button variant="secondary" onClick={() => fileInput.current?.click()} disabled={busy}>Importar</Button>
      </div>
      <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={onFile} />
      {msg && <p className={`mt-3 text-sm ${msg.ok ? 'text-accent' : 'text-danger'}`}>{msg.text}</p>}
    </Card>
  );
}
