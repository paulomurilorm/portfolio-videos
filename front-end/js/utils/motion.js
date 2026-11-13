/**
 * Utilitários de animação que respeitam a preferência de movimento reduzido.
 */

const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

export const prefersReducedMotion = () => reducedMotionQuery.matches;

/** Promessa que resolve após `ms` milissegundos (0 quando o movimento é reduzido). */
export const wait = (ms) =>
  new Promise((resolve) => setTimeout(resolve, prefersReducedMotion() ? 0 : ms));

/**
 * Resolve quando a animação CSS do elemento termina.
 * Tem um tempo-limite de segurança para nunca travar a interface.
 */
export function afterAnimation(node, timeout = 500) {
  if (prefersReducedMotion() || !node) return Promise.resolve();

  return new Promise((resolve) => {
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      node.removeEventListener('animationend', onEnd);
      resolve();
    };

    const onEnd = (event) => {
      if (event.target === node) finish();
    };

    node.addEventListener('animationend', onEnd);
    setTimeout(finish, timeout);
  });
}
