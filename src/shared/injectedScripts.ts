import { TabOption } from './types';

export function injectTitle(newTitle: string, option: TabOption) {
  const META_OPTION = 'retitle:option';
  const META_ORIGINAL = 'retitle:original';
  const META_MODIFIED = 'retitle:modified';

  let headElement: HTMLHeadElement = document.head;
  if (!headElement) {
    headElement = document.createElement('head');
    const docEl = document.documentElement;
    docEl.insertBefore(headElement, docEl.firstChild);
  }

  function getOrCreateMeta(name: string, content: string): HTMLMetaElement {
    let meta: HTMLMetaElement | null = document.querySelector(
      `meta[name='${name}']`
    );
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', name);
      meta.setAttribute('content', content);
      headElement.appendChild(meta);
    }
    return meta;
  }

  const metaOption = getOrCreateMeta(META_OPTION, option);
  const metaContent = metaOption.getAttribute('content');
  if (metaContent !== option) {
    metaOption.setAttribute('content', option);
  }

  if (document.querySelector('head > title')) {
    const metaOriginal = getOrCreateMeta(META_ORIGINAL, document.title);
    if (newTitle.includes('$0')) {
      // Make sure it doesn't use the cached old title and as an original title.
      const originalTitle = metaOriginal.getAttribute('content');
      if (originalTitle) {
        newTitle = newTitle.replace('$0', originalTitle); // the first $0 turns into the previous title
      }
    }
    document.title = newTitle;
  } else {
    const titleElement = document.createElement('title');
    titleElement.appendChild(document.createTextNode(newTitle));
    headElement.appendChild(titleElement);
  }
}

export function getCurrentOption() {
  const META_OPTION = 'retitle:option';
  const META_ORIGINAL = 'retitle:original';
  const metaOption = document.querySelector(`meta[name='${META_OPTION}']`);
  const metaOriginal = document.querySelector(`meta[name='${META_ORIGINAL}']`);
  if (metaOption && metaOriginal) {
    return [
      metaOption.getAttribute('content'),
      metaOriginal.getAttribute('content'),
    ] as const;
  }
  return null;
}

export function revertRetitle() {
  const META_ORIGINAL = 'retitle:original';
  const metaOriginal = document.querySelector(`meta[name='${META_ORIGINAL}']`);
  if (metaOriginal) {
    document.title = metaOriginal.getAttribute('content') || '';
    document
      .querySelectorAll('meta[name^="retitle"]')
      .forEach((n) => n.parentNode?.removeChild(n));
    return true;
  }
  return false;
}
