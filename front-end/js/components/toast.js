/**
 * Avisos rápidos (toasts). Cada aviso é criado, exibido e removido do DOM.
 * A região container tem aria-live, então leitores de tela anunciam a mensagem.
 */
import { createEl, createIcon, qs } from '../utils/dom.js';
import { afterAnimation } from '../utils/motion.js';

export function showToast(message, { icon = 'check', duration = 2600 } = {}) {
  const region = qs('[data-toast-region]');
  if (!region) return;

  const toast = createEl('div', { className: 'toast' }, [icon ? createIcon(icon) : null, message]);
  region.appendChild(toast);

  setTimeout(async () => {
    toast.classList.add('is-leaving');
    await afterAnimation(toast, 400);
    toast.remove();
  }, duration);
}
