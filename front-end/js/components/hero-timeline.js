/**
 * Timeline decorativa do hero: move a agulha (playhead) e atualiza o timecode
 * em tempo real, como em um software de edição. Pausa fora da tela.
 */
import { prefersReducedMotion } from '../utils/motion.js';

const FPS = 24;
const LOOP_SECONDS = 24;

const pad = (n) => String(n).padStart(2, '0');

function toTimecode(seconds) {
  const totalFrames = Math.floor(seconds * FPS);
  const frames = totalFrames % FPS;
  const totalSeconds = Math.floor(totalFrames / FPS);
  const s = totalSeconds % 60;
  const m = Math.floor(totalSeconds / 60) % 60;
  const h = Math.floor(totalSeconds / 3600);
  return `${pad(h)}:${pad(m)}:${pad(s)}:${pad(frames)}`;
}

export function initHeroTimeline(root) {
  if (!root) return;

  const timecode = root.querySelector('[data-timecode]');
  const tracks = root.querySelector('.timeline__tracks');
  if (!timecode || !tracks) return;

  // Movimento reduzido: quadro estático
  if (prefersReducedMotion()) {
    tracks.style.setProperty('--playhead', '0.38');
    timecode.textContent = toTimecode(LOOP_SECONDS * 0.38);
    return;
  }

  let rafId = null;
  let startedAt = 0;
  let elapsedBeforePause = 0;
  let lastFrame = -1;

  const tick = (now) => {
    const elapsed = (elapsedBeforePause + (now - startedAt) / 1000) % LOOP_SECONDS;
    const frame = Math.floor(elapsed * FPS);

    // Só escreve no DOM quando muda o frame (24x por segundo)
    if (frame !== lastFrame) {
      lastFrame = frame;
      tracks.style.setProperty('--playhead', (elapsed / LOOP_SECONDS).toFixed(4));
      timecode.textContent = toTimecode(elapsed);
    }

    rafId = requestAnimationFrame(tick);
  };

  const start = () => {
    if (rafId !== null) return;
    startedAt = performance.now();
    rafId = requestAnimationFrame(tick);
  };

  const stop = () => {
    if (rafId === null) return;
    cancelAnimationFrame(rafId);
    elapsedBeforePause += (performance.now() - startedAt) / 1000;
    rafId = null;
  };

  let visible = true;

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !document.hidden) start();
    else stop();
  });
  observer.observe(root);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (visible) start();
  });
}
