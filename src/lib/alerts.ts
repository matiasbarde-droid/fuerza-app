/**
 * Avisos de fin de descanso: vibración (Vibration API) y pitido (Web Audio).
 * Ninguno pide permisos. El audio se "desbloquea" con un toque del usuario,
 * por eso se llama a unlockAudio() al marcar una serie.
 */
let ctx: AudioContext | null = null;

export function unlockAudio(): void {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    /* sin audio: no pasa nada */
  }
}

/** Tres pitidos cortos y agudos, audibles en el gimnasio. */
export function beep(): void {
  if (!ctx) return;
  const t0 = ctx.currentTime;
  for (let i = 0; i < 3; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = i === 2 ? 1320 : 880;
    const start = t0 + i * 0.25;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.3, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.2);
  }
}

export function vibrate(): void {
  try {
    navigator.vibrate?.([300, 150, 300, 150, 500]);
  } catch {
    /* no soportado */
  }
}
