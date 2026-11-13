/**
 * PORTFÓLIO DINÂMICO
 * ---------------------------------------------------------------------------
 * Fluxo:
 *   1. Os botões de categoria são criados a partir de `categorias.js`.
 *   2. Ao clicar em uma categoria, o painel de subcategorias é CRIADO e
 *      substitui o anterior (replaceChildren).
 *   3. Ao selecionar uma subcategoria, os cards antigos são REMOVIDOS do DOM
 *      (remove) e os novos são criados e inseridos (createElement/appendChild).
 *
 * Nada é apenas escondido com CSS: a galeria contém somente os vídeos filtrados.
 */
import { categorias, CATEGORIA_INICIAL } from '../data/categorias.js';
import { projetos } from '../data/projetos.js';
import { getFormato } from '../data/formatos.js';
import { createEl, qs } from '../utils/dom.js';
import { wait } from '../utils/motion.js';
import { createVideoCard } from './video-card.js';
import { openVideoModal } from './video-modal.js';

const URL_PARAMS = { categoria: 'categoria', subcategoria: 'subcategoria' };

/* ------------------------------------------------------------------------- */
/* Dados                                                                      */
/* ------------------------------------------------------------------------- */

/** Completa campos opcionais e avisa (no console) sobre erros de configuração. */
function normalizeProjects(list) {
  return list
    .filter((projeto) => {
      const categoria = categorias.find((c) => c.id === projeto.categoria);
      const subOk = categoria?.subcategorias.some((s) => s.id === projeto.subcategoria);

      if (!categoria || !subOk || !projeto.youtubeId) {
        console.warn('[Portfólio] Projeto ignorado — verifique categoria, subcategoria e youtubeId:', projeto);
        return false;
      }
      return true;
    })
    .map((projeto) => {
      const categoria = categorias.find((c) => c.id === projeto.categoria);
      return { ...projeto, formato: projeto.formato || categoria.formato };
    });
}

/** Contador visível + texto extra apenas para leitores de tela. */
const createCount = (className, total) =>
  createEl('span', { className }, [
    String(total),
    createEl('span', { className: 'visually-hidden', text: total === 1 ? ' vídeo' : ' vídeos' }),
  ]);

const findCategory = (id) => categorias.find((c) => c.id === id);
const findSubcategory = (categoria, id) => categoria?.subcategorias.find((s) => s.id === id);

/* ------------------------------------------------------------------------- */
/* Componente                                                                 */
/* ------------------------------------------------------------------------- */

export function initPortfolio(section) {
  if (!section) return;

  const refs = {
    categories: qs('[data-categories]', section),
    subSlot: qs('[data-subcategories]', section),
    gallery: qs('[data-gallery]', section),
    status: qs('[data-gallery-status]', section),
    format: qs('[data-gallery-format]', section),
  };

  if (!refs.categories || !refs.gallery || !categorias.length) return;

  const items = normalizeProjects(projetos);
  const state = { categoria: null, subcategoria: null };
  let renderId = 0; // evita conflitos quando o usuário clica muito rápido

  const countBy = (categoriaId, subcategoriaId) =>
    items.filter(
      (p) => p.categoria === categoriaId && (!subcategoriaId || p.subcategoria === subcategoriaId),
    ).length;

  /* ---------------- Categorias ---------------- */

  function renderCategories() {
    const fragment = document.createDocumentFragment();

    for (const categoria of categorias) {
      const formato = getFormato(categoria.formato);

      const button = createEl(
        'button',
        {
          className: 'tab',
          attrs: { type: 'button', 'aria-pressed': 'false', 'aria-controls': 'galeria' },
          dataset: { categoria: categoria.id },
          style: { '--ratio': formato.proporcao },
        },
        [
          createEl('span', { className: 'tab__ratio', attrs: { 'aria-hidden': 'true' } }),
          createEl('span', { text: categoria.nome }),
          createCount('tab__count', countBy(categoria.id)),
        ],
      );

      button.addEventListener('click', () => selectCategory(categoria.id));
      fragment.appendChild(button);
    }

    refs.categories.replaceChildren(fragment);
  }

  function selectCategory(categoriaId, preferredSub, { updateUrl = true } = {}) {
    const categoria = findCategory(categoriaId) ?? categorias[0];
    if (state.categoria === categoria.id && !preferredSub) return;

    state.categoria = categoria.id;
    state.subcategoria = null;

    for (const button of refs.categories.children) {
      button.setAttribute('aria-pressed', String(button.dataset.categoria === categoria.id));
    }

    renderSubcategories(categoria);

    // Seleciona a subcategoria pedida (URL) ou a primeira que tenha vídeos
    const sub =
      findSubcategory(categoria, preferredSub) ??
      categoria.subcategorias.find((s) => countBy(categoria.id, s.id) > 0) ??
      categoria.subcategorias[0];

    if (sub) selectSubcategory(sub.id, { updateUrl });
    else renderGallery();
  }

  /* ---------------- Subcategorias ---------------- */

  function renderSubcategories(categoria) {
    const options = createEl('div', {
      className: 'filters__options',
      attrs: { role: 'group', 'aria-labelledby': 'rotulo-subcategorias' },
    });

    categoria.subcategorias.forEach((sub, index) => {
      const total = countBy(categoria.id, sub.id);

      const chip = createEl(
        'button',
        {
          className: 'chip',
          attrs: { type: 'button', 'aria-pressed': 'false', 'aria-controls': 'galeria' },
          dataset: { subcategoria: sub.id },
          style: { '--i': String(index) },
        },
        [
          createEl('span', { text: sub.nome }),
          createCount('chip__count', total),
        ],
      );

      chip.addEventListener('click', () => selectSubcategory(sub.id));
      options.appendChild(chip);
    });

    const panel = createEl('div', { className: 'subcategories' }, [
      createEl('p', { className: 'subcategories__hint', text: categoria.descricao }),
      createEl('div', { className: 'filters__row' }, [
        createEl('span', { className: 'filters__label', attrs: { id: 'rotulo-subcategorias' }, text: 'Nicho' }),
        options,
      ]),
    ]);

    // Substitui o painel anterior (o antigo é descartado do DOM)
    refs.subSlot.replaceChildren(panel);
  }

  function selectSubcategory(subcategoriaId, { updateUrl = true } = {}) {
    if (state.subcategoria === subcategoriaId) return;
    state.subcategoria = subcategoriaId;

    for (const chip of refs.subSlot.querySelectorAll('.chip')) {
      chip.setAttribute('aria-pressed', String(chip.dataset.subcategoria === subcategoriaId));
    }

    if (updateUrl) syncUrl();
    renderGallery();
  }

  /* ---------------- Galeria ---------------- */

  async function renderGallery() {
    const currentRender = ++renderId;
    const { gallery } = refs;

    const categoria = findCategory(state.categoria);
    const sub = findSubcategory(categoria, state.subcategoria);
    const formato = getFormato(categoria.formato);
    const metaLabel = [categoria.nome, sub?.nome].filter(Boolean).join(' · ');

    // 1) Animação de saída dos cards atuais
    const oldItems = [...gallery.children];
    if (oldItems.length) {
      gallery.style.minHeight = `${gallery.offsetHeight}px`; // evita "pulo" de layout
      oldItems.forEach((item) => item.classList.add('is-leaving'));
      await wait(240);
      if (currentRender !== renderId) return; // outro clique chegou antes
      oldItems.forEach((item) => item.remove()); // remove de fato do DOM
    }

    // 2) Configura colunas conforme o formato da categoria
    gallery.dataset.formato = categoria.formato;
    gallery.style.setProperty('--cols-base', formato.colunas.base);
    gallery.style.setProperty('--cols-md', formato.colunas.md);
    gallery.style.setProperty('--cols-lg', formato.colunas.lg);

    // 3) Cria os novos cards
    const filtered = items.filter(
      (p) => p.categoria === categoria.id && p.subcategoria === state.subcategoria,
    );

    if (filtered.length) {
      const fragment = document.createDocumentFragment();
      filtered.forEach((projeto, index) => {
        fragment.appendChild(
          createVideoCard(projeto, {
            index,
            metaLabel,
            onPlay: (item, trigger) => openVideoModal(item, { metaLabel, trigger }),
          }),
        );
      });
      gallery.appendChild(fragment);
    } else {
      gallery.replaceChildren(createEmptyState(sub?.nome));
    }

    updateStatus(filtered.length, metaLabel, formato);

    // Libera a altura mínima depois que o novo conteúdo foi pintado
    requestAnimationFrame(() => {
      if (currentRender === renderId) gallery.style.minHeight = '';
    });
  }

  function createEmptyState(nomeSub = 'esta categoria') {
    return createEl('li', { className: 'gallery__empty' }, [
      createEl('strong', { text: 'Novos projetos em breve' }),
      createEl('span', { text: `Ainda não há vídeos publicados em ${nomeSub}.` }),
    ]);
  }

  function updateStatus(total, metaLabel, formato) {
    const label = total === 1 ? 'vídeo' : 'vídeos';
    refs.status?.replaceChildren(
      createEl('strong', { text: `${total} ${label}` }),
      ` em ${metaLabel}`,
    );
    refs.format?.replaceChildren(`${formato.nome} ${formato.rotulo}`);
  }

  /* ---------------- URL compartilhável (?categoria=…&subcategoria=…) ---------------- */

  function readUrl() {
    const params = new URLSearchParams(location.search);
    return {
      categoria: params.get(URL_PARAMS.categoria),
      subcategoria: params.get(URL_PARAMS.subcategoria),
    };
  }

  function syncUrl() {
    const url = new URL(location.href);
    url.searchParams.set(URL_PARAMS.categoria, state.categoria);
    url.searchParams.set(URL_PARAMS.subcategoria, state.subcategoria);
    history.replaceState(null, '', url);
  }

  /* ---------------- Inicialização ---------------- */

  renderCategories();
  const initial = readUrl();
  selectCategory(initial.categoria ?? CATEGORIA_INICIAL ?? categorias[0].id, initial.subcategoria, { updateUrl: false });
}
