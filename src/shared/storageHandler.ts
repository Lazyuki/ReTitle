import {
  KEY_THEME,
  KEY_DEFAULT_TAB_OPTION,
  KEY_CONTEXT_MENU,
  KEY_BOOKMARKS,
  PREFIX_TABLOCK,
  PREFIX_EXACT,
  PREFIX_DOMAIN,
  PREFIX_REGEX,
  extractDomain,
  PREFIX_CONTAINER,
} from './utils';
import type {
  ThemeState,
  TabOption,
  StorageChanges,
  TabLockTitle,
  DomainTitle,
  RegexTitle,
  ExactTitle,
  StoredTitle,
  NewTitle,
  TitleOptions,
  StorageAction,
} from './types';
import {
  getAllSyncItems,
  getAllLocalItems,
  getLocalItems,
  getLocalItem,
  setLocalItem,
  setSyncItem,
  removeLocalItems,
  GeneralStorageType,
} from './storageUtils';

/**
 * Get all titles and call title setters
 */
export async function initTitles({
  onTablockChange,
  onExactChange,
  onDomainChange,
  onRegexChange,
}: {
  onTablockChange?: (action: StorageAction, tabLock: TabLockTitle) => void;
  onExactChange?: (action: StorageAction, exact: ExactTitle) => void;
  onDomainChange?: (action: StorageAction, domain: DomainTitle) => void;
  onRegexChange?: (action: StorageAction, regex: RegexTitle) => void;
}) {
  const callHandlers = (items: GeneralStorageType) => {
    for (const titleKey of Object.keys(items)) {
      const newTitle = items[titleKey] as StoredTitle;
      switch (newTitle?.option) {
        case 'tablock':
          onTablockChange?.('add', newTitle);
          break;
        case 'exact':
          onExactChange?.('add', newTitle);
          break;
        case 'domain':
          onDomainChange?.('add', newTitle);
          break;
        case 'regex':
          onRegexChange?.('add', newTitle);
          break;
      }
    }
  };
  callHandlers(await getAllSyncItems());
  const localItems = await getAllLocalItems();
  delete localItems[KEY_DEFAULT_TAB_OPTION];
  delete localItems[KEY_THEME];
  callHandlers(localItems);
}

interface AllOptions extends GeneralStorageType {
  [KEY_THEME]: ThemeState;
  [KEY_DEFAULT_TAB_OPTION]: TabOption;
  [KEY_CONTEXT_MENU]: boolean;
}

// Get all user options
export async function getOptions(): Promise<AllOptions> {
  return getLocalItems<AllOptions>([
    KEY_THEME,
    KEY_DEFAULT_TAB_OPTION,
    KEY_CONTEXT_MENU,
  ]);
}

// Get theme option
export async function getTheme(): Promise<ThemeState> {
  return (await getLocalItem(KEY_THEME)) || 'dark';
}

// Get default tab option
export async function getDefaultOption(): Promise<TabOption> {
  return (await getLocalItem(KEY_DEFAULT_TAB_OPTION)) || 'onetime';
}

// Get context menu option
export async function getContextMenuOption(): Promise<boolean> {
  return Boolean(await getLocalItem(KEY_CONTEXT_MENU));
}

// Set theme option
export function setTheme(theme: ThemeState) {
  return setLocalItem(KEY_THEME, theme);
}

// Set default tab option
export function setDefaultOption(option: TabOption) {
  return setLocalItem(KEY_DEFAULT_TAB_OPTION, option);
}

// Set context menu option
export function setContextMenuOption(option: boolean) {
  return setLocalItem(KEY_CONTEXT_MENU, option);
}

// Set title matcher
export function setSyncTitle(key: string, value: StoredTitle) {
  return setSyncItem(key, value);
}

// Set title matcher in local storage
export function setLocalTitle(key: string, value: StoredTitle) {
  return setLocalItem(key, value);
}

export const storageChangeHandler = ({
  onThemeChange,
  onDefaultOptionChange,
  onTablockChange,
  onExactChange,
  onDomainChange,
  onRegexChange,
}: {
  onThemeChange?: (theme: ThemeState) => void;
  onDefaultOptionChange?: (defaultOption: TabOption) => void;
  onTablockChange?: (action: StorageAction, tabLock: TabLockTitle) => void;
  onExactChange?: (action: StorageAction, exact: ExactTitle) => void;
  onDomainChange?: (action: StorageAction, domain: DomainTitle) => void;
  onRegexChange?: (action: StorageAction, regex: RegexTitle) => void;
}) => (changes: StorageChanges) => {
  if (changes[KEY_THEME]) {
    onThemeChange?.(changes[KEY_THEME].newValue);
  }
  if (changes[KEY_DEFAULT_TAB_OPTION]) {
    onDefaultOptionChange?.(changes[KEY_DEFAULT_TAB_OPTION].newValue);
  }
  delete changes[KEY_THEME];
  delete changes[KEY_DEFAULT_TAB_OPTION];

  for (const changeKey of Object.keys(changes)) {
    let action: StorageAction = 'edit';
    const oldValue: StoredTitle | undefined = changes[changeKey].oldValue;
    let newValue: StoredTitle | undefined = changes[changeKey].newValue;
    if (!oldValue) {
      action = 'add';
    }
    if (!newValue) {
      action = 'remove';
      newValue = oldValue!;
    }

    switch (newValue.option) {
      case 'tablock':
        onTablockChange?.(action, newValue);
        break;
      case 'exact':
        onExactChange?.(action, newValue);
        break;
      case 'domain':
        onDomainChange?.(action, newValue);
        break;
      case 'regex':
        onRegexChange?.(action, newValue);
        break;
    }
  }
};

export function saveTitle(
  newTitle: NewTitle,
  tabOption: TabOption,
  currentTab: chrome.tabs.Tab,
  options?: TitleOptions & { [key: string]: any }
): Promise<void> {
  const url = currentTab.url;
  switch (tabOption) {
    case 'tablock': {
      return TablockRule.save(currentTab.id!, newTitle, options);
    }
    case 'exact': {
      return ExactRule.save(url!, newTitle, options);
    }
    case 'domain': {
      const urlDomain = extractDomain(url);
      return DomainRule.save(urlDomain, newTitle, options);
    }
    case 'regex': {
      const { urlPattern, ...rest } = options as TitleOptions & {
        urlPattern: string;
      };
      return RegexRule.save(urlPattern, newTitle, rest);
    }
  }
  return new Promise(() => {});
}

export class TablockRule {
  static option = 'tablock' as TabOption;
  static generateKey(tabId: number) {
    return `}${PREFIX_TABLOCK}${tabId}`;
  }
  static equals(t1: TabLockTitle, t2: TabLockTitle) {
    return t1.tabId === t2.tabId;
  }
  static save(tabId: number, newTitle: NewTitle, options?: TitleOptions) {
    return setLocalTitle(TablockRule.generateKey(tabId), {
      option: 'tablock',
      tabId,
      newTitle,
      ...options,
    });
  }
  static remove(tabId: number) {
    return removeLocalItems(TablockRule.generateKey(tabId));
  }
}

export class ExactRule {
  static option = 'exact' as TabOption;
  static generateKey(url: string, containerId?: string) {
    return `${
      containerId ? `${PREFIX_CONTAINER}${containerId}|` : ''
    }${PREFIX_EXACT}${url}`;
  }
  static equals(t1: ExactTitle, t2: ExactTitle) {
    return t1.url === t2.url && t1.containerId === t2.containerId;
  }
  static save(url: string, newTitle: NewTitle, options?: TitleOptions) {
    return setSyncTitle(ExactRule.generateKey(url, options?.containerId), {
      option: 'exact',
      url,
      newTitle,
      ...options,
    });
  }
  static remove(url: string, containerId?: string) {
    return removeLocalItems(ExactRule.generateKey(url, containerId));
  }
}

export class DomainRule {
  static option = 'domain' as TabOption;
  static generateKey(domain: string, containerId?: string) {
    return `${
      containerId ? `${PREFIX_CONTAINER}${containerId}|` : ''
    }${PREFIX_DOMAIN}${domain}`;
  }
  static save(domain: string, newTitle: NewTitle, options?: TitleOptions) {
    return setSyncTitle(DomainRule.generateKey(domain, options?.containerId), {
      option: 'domain',
      domain,
      newTitle,
      ...options,
    });
  }
  static remove(domain: string, containerId?: string) {
    return removeLocalItems(DomainRule.generateKey(domain, containerId));
  }
}

export class RegexRule {
  static option = 'regex' as TabOption;
  static generateKey(regex: string, containerId?: string) {
    return `${
      containerId ? `${PREFIX_CONTAINER}${containerId}|` : ''
    }${PREFIX_REGEX}${regex}`;
  }
  static save(urlPattern: string, newTitle: NewTitle, options?: TitleOptions) {
    return setSyncTitle(
      RegexRule.generateKey(urlPattern, options?.containerId),
      {
        option: 'regex',
        urlPattern,
        newTitle,
        ...options,
      }
    );
  }
  static remove(regex: string, containerId?: string) {
    return removeLocalItems(RegexRule.generateKey(regex, containerId));
  }
}
