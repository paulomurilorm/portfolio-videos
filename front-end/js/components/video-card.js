/**
 * Card de vídeo da galeria (criado inteiramente via createElement).
 */
import { createEl, createIcon } from '../utils/dom.js';
import { getFormato } from '../data/formatos.js';
import { applyThumbnail, warmYoutubeConnections } from '../utils/youtube.js';

/**
 * @param {object} projeto - item de `projetos.js` (já normalizado)
 * @param {object} options
 * @param {number} options.index     - posição (usada no atraso da animação)
 * @param {string} options.metaLabel - texto "Categoria · Subcategoria"
 * @param {(projeto: object, trigger: HTMLElement) => void} options.onPlay
 * @returns {HTMLLIElement}
 */
export function createVideoCard(projeto, { index = 0, metaLabel = '', onPlay }) {
  const formato = getFormato(projeto.formato);

  const img = createEl('img', {
    className: 'card__img',
    attrs: {
      alt: `Miniatura do vídeo “${projeto.titulo}”`,
      width: formato.largura,
      height: formato.altura,
      loading: 'lazy',
      decoding: 'async',
    },
  });
  applyThumbnail(img, projeto, formato.placeholder);

  const badges = createEl('div', { className: 'card__badges' }, [
    createEl('span', { className: 'badge badge--accent', text: formato.rotulo }),
    projeto.duracao ? createEl('span', { className: 'badge badge--duration', text: projeto.duracao }) : null,
  ]);

  const media = createEl('div', { className: 'card__media' }, [
    img,
    badges,
    createEl('span', { className: 'card__play', attrs: { 'aria-hidden': 'true' } }, [createIcon('play')]),
  ]);

  const button = createEl(
    'button',
    {
      className: 'card__button',
      attrs: { type: 'button', 'aria-label': `Assistir: ${projeto.titulo}`, 'aria-haspopup': 'dialog' },
      on: {
        pointerenter: warmYoutubeConnections,
        focus: warmYoutubeConnections,
      },
    },
    [createIcon('play'), 'Assistir'],
  );

  button.addEventListener('click', () => onPlay?.(projeto, button));

  const body = createEl('div', { className: 'card__body' }, [
    metaLabel ? createEl('p', { className: 'card__meta', text: metaLabel }) : null,
    createEl('h3', { className: 'card__title', text: projeto.titulo }),
    createEl('p', { className: 'card__desc', text: projeto.descricao }),
    button,
  ]);

  const card = createEl(
    'article',
    {
      className: `card card--${projeto.formato}`,
      style: { '--ratio': formato.proporcao },
    },
    [media, body],
  );

  return createEl('li', { className: 'gallery__item', style: { '--i': String(index) } }, [card]);
}
