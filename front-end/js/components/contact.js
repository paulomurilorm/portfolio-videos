/**
 * Contato: botão de WhatsApp, e-mail (com cópia) e redes sociais,
 * todos gerados a partir de `config/site.js`.
 */
import { createEl, createIcon, qs } from '../utils/dom.js';
import { showToast } from './toast.js';

const getWhatsappUrl = ({ numero, mensagem }) =>
  `https://wa.me/${String(numero).replace(/\D/g, '')}?text=${encodeURIComponent(mensagem ?? '')}`;

async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // Fallback para navegadores antigos
  const field = createEl('textarea', { attrs: { readonly: true }, style: { position: 'fixed', opacity: '0' } });
  field.value = text;
  document.body.appendChild(field);
  field.select();
  const ok = document.execCommand('copy');
  field.remove();
  if (!ok) throw new Error('copy failed');
}

function createEmailGroup(email) {
  const link = createEl('a', { className: 'email-group__link', attrs: { href: `mailto:${email}` } }, [
    createIcon('mail'),
    email,
  ]);

  const copyButton = createEl('button', {
    className: 'email-group__copy',
    attrs: { type: 'button', 'aria-label': 'Copiar endereço de e-mail', title: 'Copiar e-mail' },
  }, [createIcon('copy')]);

  copyButton.addEventListener('click', async () => {
    try {
      await copyToClipboard(email);
      copyButton.replaceChildren(createIcon('check'));
      showToast('E-mail copiado!');
      setTimeout(() => copyButton.replaceChildren(createIcon('copy')), 2000);
    } catch {
      showToast(`Copie manualmente: ${email}`, { icon: 'mail' });
    }
  });

  return createEl('div', { className: 'email-group' }, [link, copyButton]);
}

function createSocialItem({ nome, usuario, url, icone }) {
  return createEl('li', {}, [
    createEl('a', {
      className: 'social',
      attrs: { href: url, target: '_blank', rel: 'noopener noreferrer', 'aria-label': `${nome}: ${usuario} (abre em nova aba)` },
    }, [
      createEl('span', { className: 'social__icon' }, [createIcon(icone)]),
      createEl('span', { className: 'social__text' }, [
        createEl('span', { className: 'social__name', text: nome }),
        createEl('span', { className: 'social__handle', text: usuario }),
      ]),
      createIcon('arrow-up-right', 'icon social__arrow'),
    ]),
  ]);
}

/** Botão flutuante de WhatsApp: aparece depois do hero e some na seção de contato. */
function createFloatingWhatsapp(url) {
  const hero = qs('#inicio');
  const contact = qs('#contato');
  if (!hero || !contact || !('IntersectionObserver' in window)) return;

  const fab = createEl('a', {
    className: 'fab',
    attrs: { href: url, target: '_blank', rel: 'noopener noreferrer', 'aria-label': 'Conversar pelo WhatsApp (abre em nova aba)' },
  }, [
    createIcon('whatsapp'),
    createEl('span', { className: 'fab__label', attrs: { 'aria-hidden': 'true' }, text: 'Vamos conversar?' }),
  ]);

  document.body.appendChild(fab);

  const visibility = { hero: true, contact: false };
  const update = () => fab.classList.toggle('is-visible', !visibility.hero && !visibility.contact);

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.target === hero) visibility.hero = entry.isIntersecting;
      if (entry.target === contact) visibility.contact = entry.isIntersecting;
    }
    update();
  }, { threshold: 0.1 });

  observer.observe(hero);
  observer.observe(contact);
}

export function initContact(config) {
  const actions = qs('[data-contact-actions]');
  const socials = qs('[data-socials]');
  const { whatsapp, email } = config.contato ?? {};

  const whatsappUrl = whatsapp?.numero ? getWhatsappUrl(whatsapp) : null;

  if (actions) {
    const children = [];

    if (whatsappUrl) {
      children.push(
        createEl('a', {
          className: 'btn btn--primary btn--xl',
          attrs: { href: whatsappUrl, target: '_blank', rel: 'noopener noreferrer' },
        }, [createIcon('whatsapp'), 'Chamar no WhatsApp', createIcon('arrow-right', 'icon icon--arrow')]),
      );
    }

    if (email) children.push(createEmailGroup(email));

    actions.replaceChildren(...children);
  }

  if (socials && config.redesSociais?.length) {
    const fragment = document.createDocumentFragment();
    config.redesSociais.forEach((rede) => fragment.appendChild(createSocialItem(rede)));
    socials.replaceChildren(fragment);
  }

  if (whatsappUrl) createFloatingWhatsapp(whatsappUrl);
}
