import {
  KEY_THEME,
  KEY_DEFAULT_TAB_OPTION,
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
export function getTitles({
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
  getAllSyncItems(callHandlers);
  getAllLocalItems((items) => {
    delete items[KEY_DEFAULT_TAB_OPTION];
    delete items[KEY_THEME];
    callHandlers(items);
  });
}

// Get all user options
export function getOptions(
  callback: (options: {
    [KEY_THEME]: ThemeState;
    [KEY_DEFAULT_TAB_OPTION]: TabOption;
  }) => void
) {
  getLocalItems([KEY_THEME, KEY_DEFAULT_TAB_OPTION], (items) => {
    const theme = (items[KEY_THEME] as ThemeState) || 'dark';
    const defaultOption =
      (items[KEY_DEFAULT_TAB_OPTION] as TabOption) || 'onetime';
    callback({ [KEY_THEME]: theme, [KEY_DEFAULT_TAB_OPTION]: defaultOption });
  });
}

// Get theme option
export function getTheme(callback: (theme: ThemeState) => void) {
  getLocalItem(KEY_THEME, (item: ThemeState | null) => {
    callback(item || 'dark');
  });
}

// Get default tab option
export function getDefaultOption(callback: (defaultOption: TabOption) => void) {
  getLocalItem(KEY_DEFAULT_TAB_OPTION, (item: TabOption | null) => {
    callback(item || 'onetime');
  });
}

// Set theme option
export function setTheme(theme: ThemeState, callback?: () => void) {
  setLocalItem(KEY_THEME, theme, callback);
}

// Set default tab option
export function setDefaultOption(option: TabOption, callback?: () => void) {
  setLocalItem(KEY_DEFAULT_TAB_OPTION, option, callback);
}

// Set title matcher
export function setSyncTitle(
  key: string,
  value: StoredTitle,
  callback?: () => void
) {
  setSyncItem(key, value, callback);
}

// Set title matcher in local storage
export function setLocalTitle(
  key: string,
  value: StoredTitle,
  callback?: () => void
) {
  setLocalItem(key, value, callback);
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
) {
  const url = currentTab.url;
  switch (tabOption) {
    case 'tablock': {
      TablockRule.save(currentTab.id!, newTitle, options, window.close);
      break;
    }
    case 'exact': {
      ExactRule.save(url!, newTitle, options, window.close);
      break;
    }
    case 'domain': {
      const urlDomain = extractDomain(url);
      DomainRule.save(urlDomain, newTitle, options, window.close);
      break;
    }
    case 'regex': {
      const { urlPattern, ...rest } = options as TitleOptions & {
        urlPattern: string;
      };
      RegexRule.save(urlPattern, newTitle, rest, window.close);
      break;
    }
    default:
      // Don't save anything
      window.close();
      return;
  }
}

export class TablockRule {
  static option = 'tablock' as TabOption;
  static generateKey(tabId: number) {
    return `}${PREFIX_TABLOCK}${tabId}`;
  }
  static equals(t1: TabLockTitle, t2: TabLockTitle) {
    return t1.tabId === t2.tabId;
  }
  static save(
    tabId: number,
    newTitle: NewTitle,
    options?: TitleOptions,
    callback?: () => void
  ) {
    setLocalTitle(
      TablockRule.generateKey(tabId),
      {
        option: 'tablock',
        tabId,
        newTitle,
        ...options,
      },
      callback
    );
  }
  static remove(tabId: number) {
    removeLocalItems(TablockRule.generateKey(tabId));
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
  static save(
    url: string,
    newTitle: NewTitle,
    options?: TitleOptions,
    callback?: () => void
  ) {
    setSyncTitle(
      ExactRule.generateKey(url, options?.containerId),
      {
        option: 'exact',
        url,
        newTitle,
        ...options,
      },
      callback
    );
  }
  static remove(url: string, containerId?: string) {
    removeLocalItems(ExactRule.generateKey(url, containerId));
  }
}

export class DomainRule {
  static option = 'domain' as TabOption;
  static generateKey(domain: string, containerId?: string) {
    return `${
      containerId ? `${PREFIX_CONTAINER}${containerId}|` : ''
    }${PREFIX_DOMAIN}${domain}`;
  }
  static save(
    domain: string,
    newTitle: NewTitle,
    options?: TitleOptions,
    callback?: () => void
  ) {
    setSyncTitle(
      DomainRule.generateKey(domain, options?.containerId),
      {
        option: 'domain',
        domain,
        newTitle,
        ...options,
      },
      callback
    );
  }
  static remove(domain: string, containerId?: string) {
    removeLocalItems(DomainRule.generateKey(domain, containerId));
  }
}

export class RegexRule {
  static option = 'regex' as TabOption;
  static generateKey(regex: string, containerId?: string) {
    return `${
      containerId ? `${PREFIX_CONTAINER}${containerId}|` : ''
    }${PREFIX_REGEX}${regex}`;
  }
  static save(
    urlPattern: string,
    newTitle: NewTitle,
    options?: TitleOptions,
    callback?: () => void
  ) {
    setSyncTitle(
      RegexRule.generateKey(urlPattern, options?.containerId),
      {
        option: 'regex',
        urlPattern,
        newTitle,
        ...options,
      },
      callback
    );
  }
  static remove(regex: string, containerId?: string) {
    removeLocalItems(RegexRule.generateKey(regex, containerId));
  }
}
