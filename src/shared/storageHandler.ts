import {
  KEY_THEME,
  KEY_DEFAULT_TAB_OPTION,
  PREFIX_TABLOCK,
  PREFIX_EXACT,
  PREFIX_DOMAIN,
  PREFIX_REGEX,
  extractDomain,
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
} from './types';
import {
  getAllSyncItems,
  getAllLocalItems,
  getLocalItems,
  getLocalItem,
  setLocalItem,
  setSyncItem,
} from './storageUtils';

export function getKey(title: StoredTitle) {
  switch (title.option) {
    case 'tablock':
      return `${PREFIX_TABLOCK}${title.tabId}`;
    case 'exact':
      return `${PREFIX_EXACT}${title.url}`;
    case 'domain':
      return `${PREFIX_DOMAIN}${title.domain}`;
    case 'regex':
      return `${PREFIX_REGEX}${title.urlPattern}`;
  }
}

/**
 * Get all titles and call title setters
 */
export function getTitles({
  onTablockChange,
  onExactChange,
  onDomainChange,
  onRegexChange,
}: {
  onTablockChange?: (tabLock: TabLockTitle) => void;
  onExactChange?: (exact: ExactTitle) => void;
  onDomainChange?: (domain: DomainTitle) => void;
  onRegexChange?: (regex: RegexTitle) => void;
}) {
  getAllSyncItems((items) => {
    delete items[KEY_DEFAULT_TAB_OPTION];
    for (const titleKey of Object.keys(items)) {
      const newTitle = items[titleKey] as StoredTitle;
      switch (newTitle?.option) {
        case 'tablock':
          onTablockChange?.(newTitle);
          break;
        case 'exact':
          onExactChange?.(newTitle);
          break;
        case 'domain':
          onDomainChange?.(newTitle);
          break;
        case 'regex':
          onRegexChange?.(newTitle);
          break;
      }
    }
  });
  getAllLocalItems((items) => {
    delete items[KEY_THEME];
    for (const titleKey of Object.keys(items)) {
      const newTitle = items[titleKey] as StoredTitle;
      switch (newTitle?.option) {
        case 'tablock':
          onTablockChange?.(newTitle);
          break;
        case 'exact':
          onExactChange?.(newTitle);
          break;
        case 'domain':
          onDomainChange?.(newTitle);
          break;
        case 'regex':
          onRegexChange?.(newTitle);
          break;
      }
    }
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

// export default class StorageHandler {
//   // Options
//   private _theme: ThemeState;
//   private _defaultOption: TabOption;

//   // Title maps
//   private _tablock: Map<string, number>;
//   private _exact: Map<string, string>;
//   private _domain: Map<string, string>;
//   private _regex: Map<string, RegExp>;

//   constructor() {
//     this._theme = 'dark';
//     this._defaultOption = 'onetime';
//     this._tablock = new Map();
//     this._exact = new Map();
//     this._domain = new Map();
//     this._regex = new Map();
//   }

//   init() {
//     getAllItems(this.storageChangeHandler);
//     chrome.storage.onChanged.addListener(this.storageChangeHandler);
//   }

//   destroy() {
//     chrome.storage.onChanged.removeListener(this.storageChangeHandler);
//   }

//   storageChangeHandler = (changes: StorageChanges) => {
//     if (changes[KEY_THEME]?.newValue !== this._theme) {
//       this._theme = changes[KEY_THEME].newValue;
//     }
//     if (changes[KEY_DEFAULT_TAB_OPTION]?.newValue !== this._defaultOption) {
//       this._defaultOption = changes[KEY_DEFAULT_TAB_OPTION].newValue;
//     }
//     delete changes[KEY_THEME];
//     delete changes[KEY_DEFAULT_TAB_OPTION];
//     for (const changeKey of Object.keys(changes)) {
//       const newValue = changes[changeKey].newValue;
//       this.update(changeKey, newValue);
//     }
//   };

//   update(key: string, newValue: any) {
//     const [tabOption, value] = decodeTitleMatcher(key);
//     let map: Map<string, any> | null = null;
//     switch (tabOption) {
//       case 'tablock':
//         map = this._tablock;
//         break;
//       case 'exact':
//         map = this._exact;
//         break;
//       case 'domain':
//         map = this._domain;
//         break;
//       case 'regex':
//         map = this._regex;
//         break;
//     }
//     if (newValue) {
//       if (map) {
//         const oldValue = map.get(key);
//         if (oldValue !== newValue) {
//           map.set(key, value);
//         }
//       }
//     } else {
//       // delete the key
//       if (map) map.delete(key);
//     }
//   }

//   get theme(): ThemeState {
//     return this._theme;
//   }
//   set theme(theme: ThemeState) {
//     if (theme && theme !== this._theme) {
//       setTheme(theme);
//       this._theme = theme;
//     }
//   }

//   get defaultOption(): TabOption {
//     return this._defaultOption;
//   }
//   set defaultOption(option: TabOption) {
//     if (option && option !== this._defaultOption) {
//       setDefaultOption(option);
//       this._defaultOption = option;
//     }
//   }
// }

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
  onTablockChange?: (tabLock: TabLockTitle) => void;
  onExactChange?: (exact: ExactTitle) => void;
  onDomainChange?: (domain: DomainTitle) => void;
  onRegexChange?: (regex: RegexTitle) => void;
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
    const newValue: StoredTitle | undefined = changes[changeKey].newValue;
    if (newValue) {
      switch (newValue?.option) {
        case 'tablock':
          onTablockChange?.(newValue);
          break;
        case 'exact':
          onExactChange?.(newValue);
          break;
        case 'domain':
          onDomainChange?.(newValue);
          break;
        case 'regex':
          onRegexChange?.(newValue);
          break;
      }
    } else {
      const oldValue: StoredTitle = changes[changeKey].oldValue;
      switch (oldValue.option) {
        case 'tablock':
          onTablockChange?.({ ...oldValue, newTitle: null });
          break;
        case 'exact':
          onExactChange?.({ ...oldValue, newTitle: null });
          break;
        case 'domain':
          onDomainChange?.({ ...oldValue, newTitle: null });
          break;
        case 'regex':
          onRegexChange?.({ ...oldValue, newTitle: null });
          break;
      }
    }
  }
};

export function saveTitle(
  newTitle: NewTitle,
  tabOption: TabOption,
  currentTab: chrome.tabs.Tab,
  extraOptions?: any
) {
  const url = currentTab.url;
  switch (tabOption) {
    case 'tablock': {
      setLocalTitle(
        `${PREFIX_TABLOCK}${currentTab.id}`,
        { tabId: currentTab.id!, newTitle, option: tabOption },
        window.close
      );
      break;
    }
    case 'exact': {
      setSyncTitle(
        `${PREFIX_EXACT}${url}`,
        { url: url!, newTitle, option: tabOption },
        window.close
      );
      break;
    }
    case 'domain': {
      const urlDomain = extractDomain(url);
      setSyncTitle(
        `${PREFIX_DOMAIN}${urlDomain}`,
        { domain: urlDomain, newTitle, option: tabOption },
        window.close
      );
      break;
    }
    case 'regex': {
      setSyncTitle(
        `${PREFIX_REGEX}${extraOptions.urlPattern}`,
        {
          urlPattern: extraOptions.urlPattern,
          newTitle,
          type: extraOptions.type,
          captureRegex: extraOptions.captureRegex,
          option: tabOption,
        },
        window.close
      );
      break;
    }
    default:
      // Don't save anything
      window.close();
      return;
  }
}
