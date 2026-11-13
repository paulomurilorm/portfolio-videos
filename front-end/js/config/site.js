/**
 * CONFIGURAÇÕES GERAIS DO SITE
 * ---------------------------------------------------------------------------
 * Altere aqui seus contatos, redes sociais e o vídeo em destaque.
 * Tudo o que está aqui é renderizado dinamicamente pelo JavaScript.
 */
export const siteConfig = {
  nome: 'Paulo Murilo',

  /* Vídeo em destaque logo abaixo da Home */
  destaque: {
    titulo: 'Animes · Vídeo longo', // texto exibido sobre a miniatura
    youtubeId: 'jhfxZb8pF_4', // mesmo vídeo de "Animes #01"
    thumbnail: '', // '' = usa a miniatura do YouTube
    duracao: '', // opcional, ex.: '1:45'
  },

  contato: {
    whatsapp: {
      // Formato internacional, só números: 55 + DDD + número
      numero: '5519983844489',
      mensagem: 'Olá! Vi seu portfólio e gostaria de conversar sobre um projeto de vídeo.',
    },
    email: 'paulomurilo.work@gmail.com',
  },

  /* `icone` deve existir no sprite SVG do index.html (instagram, youtube, tiktok, linkedin) */
  redesSociais: [
    { nome: 'Instagram', usuario: '@paulomurilorm', url: 'https://www.instagram.com/paulomurilorm/', icone: 'instagram' },
    { nome: 'LinkedIn', usuario: 'in/paulomurilorm', url: 'https://www.linkedin.com/in/paulomurilorm/', icone: 'linkedin' },
    // Para voltar a exibir outras redes, adicione aqui (ícones disponíveis: youtube, tiktok)
  ],
};
