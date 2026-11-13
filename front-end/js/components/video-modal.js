/**
 * Modal de vídeo.
 * A cada abertura, um <dialog> novo é criado com o player do YouTube.
 * Ao fechar, o iframe e a modal são REMOVIDOS do DOM (o vídeo para na hora).
 */
import { createEl, createIcon } from '../utils/dom.js';
import { afterAnimation } from '../utils/motion.js';
import { getFormato } from '../data/formatos.js';
import { createYoutubePlayer, getWatchUrl } from '../utils/youtube.js';

let activeModal = null;
let modalCount = 0;

/**
 * @param {object} projeto
 * @param {object} [options]
 * @param {string} [options.metaLabel] - "Categoria · Subcategoria"
 * @param {HTMLElement} [options.trigger] - elemento que recebe o foco de volta ao fechar
 */
export function openVideoModal(projeto, { metaLabel = '', trigger } = {}) {
  // Garante uma única modal por vez
  activeModal?.destroy();

  const formato = getFormato(projeto.formato);
  const titleId = `modal-titulo-${++modalCount}`;
  const descId = `modal-desc-${modalCount}`;
  const root = document.documentElement;

  const closeButton = createEl('button', {
    className: 'modal__close',
    attrs: { type: 'button', 'aria-label': 'Fechar vídeo' },
  }, [createIcon('close')]);

  const player = createEl('div', { className: 'modal__player' }, [
    createYoutubePlayer(projeto.youtubeId, projeto.titulo),
  ]);

  const info = createEl('div', { className: 'modal__info' }, [
    createEl('p', { className: 'modal__meta', text: [metaLabel, formato.rotulo].filter(Boolean).join(' · ') }),
    createEl('h3', { className: 'modal__title', attrs: { id: titleId }, text: projeto.titulo }),
    createEl('p', { className: 'modal__desc', attrs: { id: descId }, text: projeto.descricao }),
    createEl('a', {
      className: 'modal__link',
      attrs: { href: getWatchUrl(projeto.youtubeId), target: '_blank', rel: 'noopener noreferrer' },
    }, ['Abrir no YouTube', createIcon('arrow-up-right')]),
  ]);

  const content = createEl('div', { className: 'modal__content' }, [player, info]);

  const dialog = createEl('dialog', {
    className: `modal modal--${projeto.formato}`,
    attrs: { 'aria-labelledby': titleId, 'aria-describedby': descId },
    style: { '--ratio': formato.proporcao },
  }, [closeButton, content]);

  let closing = false;

  /** Fecha com animação. */
  const close = async () => {
    if (closing) return;
    closing = true;
    dialog.classList.add('is-closing');
    await afterAnimation(content, 400);
    destroy();
  };

  /** Remove iframe e modal do DOM e devolve o foco. */
  const destroy = () => {
    if (!dialog.isConnected) return;
    player.querySelector('iframe')?.remove();
    if (dialog.open) dialog.close();
    dialog.remove();
    root.classList.remove('has-modal');
    activeModal = null;
    if (trigger?.isConnected) trigger.focus({ preventScroll: true });
  };

  closeButton.addEventListener('click', close);

  // Tecla Esc: animação de saída em vez do fechamento instantâneo
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    close();
  });

  // Fechamento por outros meios (ex.: navegador) também limpa o DOM
  dialog.addEventListener('close', destroy);

  // Clique fora do conteúdo (no fundo) fecha a modal
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) close();
  });

  document.body.appendChild(dialog);
  root.classList.add('has-modal');
  dialog.showModal();
  closeButton.focus();

  activeModal = { destroy, close };
  return activeModal;
}
