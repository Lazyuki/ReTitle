export type TabOption = 'onetime' | 'tablock' | 'exact' | 'domain' | 'regex';
export type ThemeState = 'light' | 'dark';
export type ReplacerType = 'url' | 'title' | 'function';

export interface StorageChanges {
  [key: string]: chrome.storage.StorageChange;
}

export type NewTitleFunc = {
  replacerType: 'function';
  func: string;
};

export type NewTitleRegex = {
  replacerType: 'url' | 'title';
  captureRegex: string;
  titleRegex: string;
  flags: string;
};

export type NewTitle = string | NewTitleRegex | NewTitleFunc;

// Optional settings for titles
export interface TitleOptions {
  name?: string; // Optional human readable name. Default to the storage key
  disabled?: boolean; // Temporarily Disabled
  containerId?: string; // Container ID if used
}

export interface BaseTitle extends TitleOptions {
  option: TabOption;
  newTitle: NewTitle; // empty string is allowed. Use null to delete
}

export interface TabLockTitle extends BaseTitle {
  option: 'tablock';
  tabId: number;
}

export interface ExactTitle extends BaseTitle {
  option: 'exact';
  url: string;
  ignoreParams?: boolean; // Ignore URL params like # & ?
}

export interface DomainTitle extends BaseTitle {
  option: 'domain';
  domain: string;
  allowSubdomains?: boolean; // Allow subdomains or not
}

export interface RegexTitle extends BaseTitle {
  option: 'regex';
  urlPattern: string; // RegExp pattern to match URLs. Capturing doesn't matter here
}

export type CustomFunction = (originalTitle: string, url: string) => string;

export type StoredTitle = TabLockTitle | ExactTitle | DomainTitle | RegexTitle;

export type StorageAction = 'add' | 'remove' | 'edit';

export interface MessageRequest {
  id: number;
  oldTitle: string;
  newTitle: NewTitle;
  option: TabOption;
}
