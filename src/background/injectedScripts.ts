import { TabOption } from '../shared/types';

export function setTitle(newTitle: string, option: TabOption) {
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

  if (document.title) {
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
