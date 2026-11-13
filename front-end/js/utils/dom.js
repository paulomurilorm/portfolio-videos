/**
 * Utilitários de manipulação do DOM.
 * Tudo o que é dinâmico no site é criado com estas funções, que usam
 * document.createElement(), appendChild() e addEventListener().
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Cria um elemento HTML.
 *
 * @param {string} tag - nome da tag (ex.: 'button')
 * @param {object} [options]
 * @param {string} [options.className]
 * @param {string} [options.text]                - textContent (seguro contra HTML injetado)
 * @param {Object<string, string|boolean>} [options.attrs] - atributos (true = atributo booleano)
 * @param {Object<string, string>} [options.dataset]
 * @param {Object<string, string>} [options.style] - propriedades CSS, inclusive variáveis (--x)
 * @param {Object<string, Function>} [options.on]  - eventos { click: fn }
 * @param {Array<Node|string>|Node|string} [children]
 * @returns {HTMLElement}
 */
export function createEl(tag, options = {}, children = []) {
  const { className, text, attrs, dataset, style, on } = options;
  const node = document.createElement(tag);

  if (className) node.className = className;
  if (text != null) node.textContent = text;

  if (attrs) {
    for (const [name, value] of Object.entries(attrs)) {
      if (value === false || value == null) continue;
      node.setAttribute(name, value === true ? '' : String(value));
    }
  }

  if (dataset) Object.assign(node.dataset, dataset);

  if (style) {
    for (const [prop, value] of Object.entries(style)) {
      node.style.setProperty(prop, value);
    }
  }

  if (on) {
    for (const [type, handler] of Object.entries(on)) {
      node.addEventListener(type, handler);
    }
  }

  return appendChildren(node, children);
}

/** Anexa filhos (nós ou textos) a um elemento usando appendChild(). */
export function appendChildren(parent, children) {
  const list = Array.isArray(children) ? children : [children];

  for (const child of list) {
    if (child == null || child === false) continue;
    parent.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  }

  return parent;
}

/** Cria um ícone SVG que referencia o sprite do index.html (<symbol id="icon-NOME">). */
export function createIcon(name, className = 'icon') {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', className);
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');

  const use = document.createElementNS(SVG_NS, 'use');
  use.setAttribute('href', `#icon-${name}`);
  svg.appendChild(use);

  return svg;
}

/** Atalhos de seleção. */
export const qs = (selector, scope = document) => scope.querySelector(selector);
export const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];
