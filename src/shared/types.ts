export type TabOption = 'onetime' | 'tablock' | 'exact' | 'domain' | 'regex';
export type ThemeState = 'light' | 'dark';

export interface StorageChanges {
  [key: string]: chrome.storage.StorageChange;
}

export interface BaseTitle {
  option: TabOption;
  newTitle: string | null; // null to delete
}

export interface TabLockTitle extends BaseTitle {
  option: 'tablock';
  tabId: number;
}

export interface ExactTitle extends BaseTitle {
  option: 'exact';
  url: string;
}

export interface DomainTitle extends BaseTitle {
  option: 'domain';
  domain: string;
}

export interface RegexTitle extends BaseTitle {
  option: 'regex';
  regex: RegExp;
}
