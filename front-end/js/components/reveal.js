/**
 * Animações discretas ao rolar:
 *  - elementos com [data-reveal] surgem suavemente ao entrar na tela;
 *  - números com [data-count-to] fazem contagem progressiva.
 */
import { qsa } from '../utils/dom.js';
import { prefersReducedMotion } from '../utils/motion.js';

function countUp(node, duration = 1400) {
  const target = Number(node.dataset.countTo);
  if (!Number.isFinite(target)) return;

  const start = performance.now();
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    node.textContent = String(Math.round(target * easeOut(progress)));
    if (progress < 1) requestAnimationFrame(step);
  };

  node.textContent = '0';
  requestAnimationFrame(step);
}

export function initReveal() {
  const revealItems = qsa('[data-reveal]');
  const counters = qsa('[data-count-to]');
  const supported = 'IntersectionObserver' in window;

  if (!supported || prefersReducedMotion()) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
    return; // contadores já exibem o valor final no HTML
  }

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.01, rootMargin: '0px 0px -8% 0px' },
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        countUp(entry.target);
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.6 },
  );

  counters.forEach((counter) => counterObserver.observe(counter));
}
