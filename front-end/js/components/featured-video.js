/**
 * Vídeo em destaque (logo abaixo da Home).
 * Mostra miniatura + botão de play; o iframe do YouTube só é criado no clique.
 */
import { createEl, createIcon } from '../utils/dom.js';
import { getFormato } from '../data/formatos.js';
import { createYoutubePlayer, applyThumbnail, warmYoutubeConnections } from '../utils/youtube.js';

export function initFeaturedVideo(container, video) {
  if (!container || !video?.youtubeId) return;

  const { titulo = 'Vídeo em destaque', youtubeId, duracao } = video;

  const thumb = createEl('img', {
    className: 'player__thumb',
    attrs: {
      alt: '',
      width: 1920,
      height: 1080,
      loading: 'lazy',
      decoding: 'async',
    },
  });
  applyThumbnail(thumb, video, getFormato('horizontal').placeholder);

  const caption = createEl('span', { className: 'player__caption', attrs: { 'aria-hidden': 'true' } }, [
    createEl('span', {}, [createEl('span', { className: 'rec-dot' }), titulo]),
    duracao ? createEl('span', { text: duracao }) : null,
  ]);

  const facade = createEl(
    'button',
    {
      className: 'player__facade',
      attrs: { type: 'button', 'aria-label': `Reproduzir ${titulo}${duracao ? ` (${duracao})` : ''}` },
      on: {
        pointerenter: warmYoutubeConnections,
        focus: warmYoutubeConnections,
        click: play,
      },
    },
    [
      thumb,
      createEl('span', { className: 'player__shade' }),
      createEl('span', { className: 'player__play' }, [createIcon('play')]),
      caption,
    ],
  );

  function play() {
    const iframe = createYoutubePlayer(youtubeId, titulo);
    // Remove a miniatura/botão e insere o player no lugar
    container.replaceChildren(iframe);
    container.classList.add('is-playing');
    iframe.focus();
  }

  container.replaceChildren(facade);
}
