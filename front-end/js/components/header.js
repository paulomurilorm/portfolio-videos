/**
 * Cabeçalho: estado ao rolar, menu mobile, rolagem suave e link ativo (scrollspy).
 */
import { qs, qsa } from '../utils/dom.js';
import { prefersReducedMotion } from '../utils/motion.js';

export function initHeader() {
  const header = qs('[data-header]');
  if (!header) return;

  const toggle = qs('[data-nav-toggle]', header);
  const links = qsa('[data-nav-link]', header);
  const root = document.documentElement;

  /* ---------- Fundo sólido após rolar ---------- */
  const updateScrolled = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
  window.addEventListener('scroll', updateScrolled, { passive: true });
  updateScrolled();

  /* ---------- Menu mobile ---------- */
  const isOpen = () => toggle?.getAttribute('aria-expanded') === 'true';

  const setMenu = (open) => {
    if (!toggle) return;
    header.classList.toggle('is-menu-open', open);
    root.classList.toggle('has-menu', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };

  toggle?.addEventListener('click', () => setMenu(!isOpen()));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      setMenu(false);
      toggle.focus();
    }
  });

  // Fecha o menu ao voltar para o layout desktop
  window.matchMedia('(min-width: 900px)').addEventListener('change', (event) => {
    if (event.matches) setMenu(false);
  });

  /* ---------- Rolagem suave para âncoras internas ---------- */
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;

    const id = decodeURIComponent(link.getAttribute('href').slice(1));
    const target = id && document.getElementById(id);
    if (!target) return;

    event.preventDefault();
    setMenu(false);

    target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', `${location.pathname}${location.search}#${id}`);

    // Acessibilidade: move o foco para a seção sem "pular" a rolagem
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });

  /* ---------- Link ativo conforme a seção visível ---------- */
  // Seções sem link no menu (ex.: vídeo em destaque) ativam o link da seção anterior
  const linkedIds = new Set(links.map((link) => link.hash.slice(1)));
  const sections = qsa('main > section[id]');
  const owner = new Map();
  let lastLinked = null;

  for (const section of sections) {
    if (linkedIds.has(section.id)) lastLinked = section.id;
    owner.set(section, lastLinked);
  }

  const setActive = (id) => {
    for (const link of links) {
      const active = link.hash === `#${id}`;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
  };

  if ('IntersectionObserver' in window && sections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(owner.get(entry.target));
        }
      },
      // Considera "ativa" a seção que cruza a faixa central da tela
      { rootMargin: '-45% 0px -54% 0px' },
    );

    sections.forEach((section) => observer.observe(section));
  }
}
