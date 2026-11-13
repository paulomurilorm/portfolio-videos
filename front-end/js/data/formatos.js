/**
 * FORMATOS DE VÍDEO
 * ---------------------------------------------------------------------------
 * Define proporção, rótulo e quantidade de colunas da galeria para cada formato.
 * Para criar um novo formato (ex.: quadrado 1:1), basta adicionar uma entrada
 * aqui e usá-la em `categorias.js` ou em um projeto de `projetos.js`.
 *
 * - rotulo:    texto exibido nos badges
 * - proporcao: valor CSS de aspect-ratio ("largura / altura")
 * - colunas:   colunas da galeria em telas pequenas, médias (≥640px) e grandes (≥1024px)
 * - largura/altura: dimensões de referência da miniatura (evitam "pulos" de layout)
 * - placeholder: imagem exibida se a miniatura não carregar
 */
export const formatos = {
  vertical: {
    rotulo: '9:16',
    nome: 'Vertical',
    proporcao: '9 / 16',
    colunas: { base: 2, md: 3, lg: 4 },
    largura: 540,
    altura: 960,
    placeholder: './front-end/img/thumbnails/placeholder-vertical.svg',
  },
  horizontal: {
    rotulo: '16:9',
    nome: 'Horizontal',
    proporcao: '16 / 9',
    colunas: { base: 1, md: 2, lg: 2 },
    largura: 1280,
    altura: 720,
    placeholder: './front-end/img/thumbnails/placeholder-horizontal.svg',
  },
  quadrado: {
    rotulo: '1:1',
    nome: 'Quadrado',
    proporcao: '1 / 1',
    colunas: { base: 2, md: 3, lg: 4 },
    largura: 1080,
    altura: 1080,
    placeholder: './front-end/img/thumbnails/placeholder-quadrado.svg',
  },
};

export const FORMATO_PADRAO = 'horizontal';

/** Retorna a configuração de um formato (com fallback seguro). */
export function getFormato(id) {
  return formatos[id] ?? formatos[FORMATO_PADRAO];
}
