export type TabOption = 'onetime' | 'tablock' | 'exact' | 'domain' | 'regex';
export type ThemeState = 'light' | 'dark';

export interface StorageChanges {
  [key: string]: chrome.storage.StorageChange;
}

export type NewTitleRegex = {
  captureRegex: string;
  titleRegex: string;
  flags: string;
};

export type NewTitle = string | NewTitleRegex;

export interface BaseTitle {
  option: TabOption;
  newTitle: NewTitle | null; // empty string is allowed. Use null to delete
  disabled?: boolean;
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
  useFull?: boolean;
}

export interface RegexTitle extends BaseTitle {
  option: 'regex';
  urlPattern: string; // RegExp pattern to match URLs
  type: 'url' | 'title' | 'document' | 'function'; // where to perform regex capturing
  captureRegex: string; // valid RegExp string for captureing
  regexFlags?: string; // regex flags like i, g
  querySelector?: string; // only if type=document
  functionString?: string; // only if type=function
}

export type StoredTitle = TabLockTitle | ExactTitle | DomainTitle | RegexTitle;

export interface MessageRequest {
  id: number;
  oldTitle: string;
  newTitle: NewTitle;
  option: TabOption;
}
