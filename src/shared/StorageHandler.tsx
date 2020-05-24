import {
  KEY_THEME,
  KEY_DEFAULT_TAB_OPTION,
  PREFIX_TABLOCK,
  PREFIX_EXACT,
  PREFIX_DOMAIN,
  PREFIX_REGEX,
  extractDomain,
} from './utils';
import {
  ThemeState,
  TabOption,
  StorageChanges,
  TabLockTitle,
  DomainTitle,
  RegexTitle,
  ExactTitle,
  StoredTitle,
} from './types';

type GeneralStorageType = { [key: string]: any };

/**
 * This gets all items in storage. Use `getTitles` instead for
 * getting all title matchers
 */
export function getAllItems(callback: (items: GeneralStorageType) => void) {
  chrome.storage.sync.get(callback);
}

/**
 * Get all title matchers.
 */
export function getTitles(callback: (items: GeneralStorageType) => void) {
  chrome.storage.sync.get(function (items: GeneralStorageType) {
    delete items[KEY_THEME];
    delete items[KEY_DEFAULT_TAB_OPTION];
    callback(items);
  });
}

// Get all user options
export function getOptions(
  callback: (options: {
    [KEY_THEME]: ThemeState;
    [KEY_DEFAULT_TAB_OPTION]: TabOption;
  }) => void
) {
  chrome.storage.sync.get([KEY_THEME, KEY_DEFAULT_TAB_OPTION], function (
    items: GeneralStorageType
  ) {
    const theme = (items[KEY_THEME] as ThemeState) || 'dark';
    const defaultOption =
      (items[KEY_DEFAULT_TAB_OPTION] as TabOption) || 'onetime';
    callback({ [KEY_THEME]: theme, [KEY_DEFAULT_TAB_OPTION]: defaultOption });
  });
}

// Get theme option
export function getTheme(callback: (theme: ThemeState) => void) {
  chrome.storage.sync.get(KEY_THEME, function (items: GeneralStorageType) {
    callback((items[KEY_THEME] as ThemeState) || 'dark');
  });
}

// Get default tab option
export function getDefaultOption(callback: (defaultOption: TabOption) => void) {
  chrome.storage.sync.get(KEY_DEFAULT_TAB_OPTION, function (
    items: GeneralStorageType
  ) {
    callback((items[KEY_DEFAULT_TAB_OPTION] as TabOption) || 'onetime');
  });
}

// Get value for a given title matcher key
export function getTitle(key: string, callback: (item: any | null) => void) {
  chrome.storage.sync.get(key, function (items: GeneralStorageType) {
    callback(items[key] || null);
  });
}

// Set theme option
export function setTheme(theme: ThemeState, callback?: () => void) {
  chrome.storage.sync.set({ [KEY_THEME]: theme }, callback);
}

// Set default tab option
export function setDefaultOption(option: TabOption, callback?: () => void) {
  chrome.storage.sync.set({ [KEY_DEFAULT_TAB_OPTION]: option }, callback);
}

// Set title matcher
export function setTitle(key: string, value: any, callback?: () => void) {
  chrome.storage.sync.set({ [key]: value }, callback);
}

// Remove one or more key(s)
export function removeKeys(keys: string | string[], callback?: () => void) {
  chrome.storage.sync.remove(keys, callback);
}

export function decodeTitleMatcher(
  key: string,
  newTitle: string
): TabLockTitle | ExactTitle | DomainTitle | RegexTitle | null {
  if (key.startsWith(PREFIX_TABLOCK)) {
    const tabId = parseInt(key.replace(PREFIX_TABLOCK, ''));
    return { option: 'tablock', tabId, newTitle };
  } else if (key.startsWith(PREFIX_EXACT)) {
    const url = key.replace(PREFIX_EXACT, '');
    return { option: 'exact', url, newTitle };
  } else if (key.startsWith(PREFIX_DOMAIN)) {
    const domain = key.replace(PREFIX_DOMAIN, '');
    return { option: 'domain', domain, newTitle };
  } else if (key.startsWith(PREFIX_REGEX)) {
    try {
      const regex = new RegExp(key.replace(PREFIX_REGEX, ''));
      return { option: 'regex', regex, newTitle };
    } catch (e) {
      console.error(e);
    }
  }
  return null;
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
    const newValue: StoredTitle = changes[changeKey].newValue;
    const newTitle = decodeTitleMatcher(changeKey, newValue.newTitle);
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
};

export function saveTitle(
  newTitle: string,
  option: TabOption,
  currentTab: chrome.tabs.Tab,
  regex?: RegExp
) {
  const obj: { [key: string]: StoredTitle } = {};
  const url = currentTab.url;
  switch (option) {
    case 'tablock': {
      obj[`${PREFIX_TABLOCK}${currentTab.id}`] = { newTitle };
      break;
    }
    case 'exact': {
      obj[`${PREFIX_EXACT}${url}`] = { newTitle };
      break;
    }
    case 'domain': {
      const urlDomain = extractDomain(url);
      obj[`${PREFIX_DOMAIN}${urlDomain}`] = { newTitle };
      break;
    }
    case 'regex': {
      obj[`${PREFIX_REGEX}${regex}`] = { newTitle };
      break;
    }
    default:
      // Don't save anything
      window.close();
      return;
  }
  chrome.storage.sync.set(obj, () => window.close());
}
