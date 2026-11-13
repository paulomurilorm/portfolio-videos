/**
 * Ponto de entrada do site (módulo ES6).
 * Cada parte da página é inicializada de forma independente: se uma falhar,
 * as demais continuam funcionando.
 */
import { siteConfig } from './config/site.js';
import { qs } from './utils/dom.js';
import { initHeader } from './components/header.js';
import { initHeroTimeline } from './components/hero-timeline.js';
import { initFeaturedVideo } from './components/featured-video.js';
import { initPortfolio } from './components/portfolio.js';
import { initContact } from './components/contact.js';
import { initReveal } from './components/reveal.js';

function safeInit(name, fn) {
  try {
    fn();
  } catch (error) {
    console.error(`[Portfólio] Falha ao iniciar "${name}":`, error);
  }
}

safeInit('cabeçalho', initHeader);
safeInit('timeline do hero', () => initHeroTimeline(qs('[data-timeline]')));
safeInit('vídeo em destaque', () => initFeaturedVideo(qs('[data-featured-player]'), siteConfig.destaque));
safeInit('portfólio', () => initPortfolio(qs('[data-portfolio]')));
safeInit('contato', () => initContact(siteConfig));
safeInit('animações', initReveal);
safeInit('ano do rodapé', () => {
  const year = qs('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
});
