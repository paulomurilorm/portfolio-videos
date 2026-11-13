/**
 * Integração com o YouTube (sem API externa nem bibliotecas).
 * O iframe só é criado quando o usuário clica em "play" (técnica de "facade"),
 * o que deixa a página leve e rápida.
 */
import { createEl } from './dom.js';

const EMBED_ORIGIN = 'https://www.youtube-nocookie.com';

/** Monta a URL de embed com parâmetros padrão (autoplay, sem vídeos relacionados de outros canais…). */
export function getEmbedUrl(youtubeId, params = {}) {
  const query = new URLSearchParams({
    autoplay: '1',
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
    ...params,
  });

  return `${EMBED_ORIGIN}/embed/${encodeURIComponent(youtubeId)}?${query}`;
}

/** Link para assistir diretamente no YouTube. */
export const getWatchUrl = (youtubeId) =>
  `https://www.youtube.com/watch?v=${encodeURIComponent(youtubeId)}`;

/** Miniatura oficial gerada pelo YouTube. */
export const getYoutubeThumbnail = (youtubeId, quality = 'hqdefault') =>
  `https://i.ytimg.com/vi/${encodeURIComponent(youtubeId)}/${quality}.jpg`;

/** Cria o <iframe> do player. */
export function createYoutubePlayer(youtubeId, title, params) {
  return createEl('iframe', {
    className: 'player__iframe',
    attrs: {
      src: getEmbedUrl(youtubeId, params),
      title: `Player do YouTube: ${title}`,
      allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
      allowfullscreen: true,
      // Necessário para o YouTube identificar a origem do embed (evita o erro 153)
      referrerpolicy: 'strict-origin-when-cross-origin',
    },
  });
}

/**
 * Abre conexões antecipadas com o YouTube na primeira intenção de clique
 * (hover/foco), reduzindo o tempo até o vídeo começar.
 */
let warmed = false;
export function warmYoutubeConnections() {
  if (warmed) return;
  warmed = true;

  for (const href of [EMBED_ORIGIN, 'https://www.google.com']) {
    document.head.appendChild(createEl('link', { attrs: { rel: 'preconnect', href } }));
  }
}

/**
 * Define a miniatura de um <img> com uma cadeia de alternativas:
 *   1. `thumbnail` do projeto (se preenchida)
 *   2. miniatura do YouTube em alta resolução (maxresdefault)
 *   3. miniatura padrão do YouTube (hqdefault, sempre existe)
 *   4. placeholder local
 *
 * Quando uma resolução não existe, o YouTube devolve uma imagem cinza de 120×90 px
 * em vez de um erro, por isso o tamanho da imagem carregada também é verificado.
 */
export function applyThumbnail(img, item, placeholder) {
  const sources = [
    item.thumbnail?.trim(),
    getYoutubeThumbnail(item.youtubeId, 'maxresdefault'),
    getYoutubeThumbnail(item.youtubeId, 'hqdefault'),
    placeholder,
  ].filter((src, i, list) => src && list.indexOf(src) === i);

  let index = 0;

  const cleanup = () => {
    img.removeEventListener('error', next);
    img.removeEventListener('load', onLoad);
  };

  function next() {
    index += 1;
    if (index < sources.length) img.src = sources[index];
    else cleanup();
  }

  function onLoad() {
    const isYoutubeStub = sources[index].includes('ytimg.com') && img.naturalWidth <= 120;
    if (isYoutubeStub) next();
    else cleanup();
  }

  img.addEventListener('error', next);
  img.addEventListener('load', onLoad);
  img.src = sources[0];
}
