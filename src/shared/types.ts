export type TabOption = 'onetime' | 'tablock' | 'exact' | 'domain';
export interface TitleSettings {
  title: string;
  originalTitle?: string;
  option: TabOption;
}

export interface SavedTitles {
  [key: string]: TitleSettings;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'custom';
  language: 'english' | 'japanese';
  defaultTabOption: TabOption;
}

export interface TabCache {
  id: number;
  url: string;
  titleSettings: TitleSettings;
}
