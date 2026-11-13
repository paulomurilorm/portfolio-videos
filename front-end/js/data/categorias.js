/**
 * CATEGORIAS E SUBCATEGORIAS DO PORTFÓLIO
 * ---------------------------------------------------------------------------
 * A ordem deste array define a ordem dos botões na tela.
 * Para criar uma nova categoria ou subcategoria, adicione um objeto abaixo
 * e use os mesmos `id`s nos projetos de `projetos.js`. Nada mais precisa mudar.
 *
 * - id:            identificador único, sem espaços/acentos (usado na URL e nos projetos)
 * - nome:          texto exibido no botão
 * - descricao:     frase curta exibida ao selecionar a categoria
 * - formato:       formato padrão dos vídeos da categoria (ver `formatos.js`)
 * - subcategorias: lista de { id, nome }
 */
/** Categoria exibida ao abrir o site (use o `id` de uma categoria abaixo). */
export const CATEGORIA_INICIAL = 'longos';

export const categorias = [
  {
    id: 'longos',
    nome: 'Vídeos longos',
    descricao: 'Produções horizontais para YouTube, com narrativa, retenção e acabamento cinematográfico.',
    formato: 'horizontal',
    subcategorias: [
      { id: 'animes', nome: 'Animes' },
      { id: 'trailers', nome: 'Trailers' },
      { id: 'programacao', nome: 'Programação' },
    ],
  },
  {
    id: 'shorts',
    nome: 'Shorts',
    descricao: 'Vídeos verticais para Reels, TikTok e YouTube Shorts, com ganchos fortes e ritmo acelerado.',
    formato: 'vertical',
    subcategorias: [
      { id: 'nutricao', nome: 'Nutrição' },
      { id: 'camisetas', nome: 'Camisetas' },
      { id: 'marketing', nome: 'Marketing' },
    ],
  },
];
