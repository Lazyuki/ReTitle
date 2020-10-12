import { TabOption } from '../shared/types';
import { KEY_DEFAULT_TAB_OPTION, PREFIX_REGEX } from '../shared/utils';

// On Extension Update
interface LegacyUserOptionsSchema {
  options: { [key in TabOption]: boolean };
}
type LegacyStorageSchema = {
  [key: string]: { title: string };
} & LegacyUserOptionsSchema;

// UPDATE PREVIOUSLY STORED TITLES ON EXTENSION UPDATE
chrome.runtime.onInstalled.addListener((details) => {
  const prev = details.previousVersion;
  // Upgrading from v0 or v1
  if (prev && (prev.startsWith('0.') || prev.startsWith('1.'))) {
    chrome.storage.sync.get((items) => {
      const storage = items as LegacyStorageSchema;
      for (const key in storage) {
        // v0 tab lock mistake.
        if (key.startsWith('#')) {
          chrome.storage.sync.remove(key);
          continue;
        }
        // v1 options key
        if (key === 'options') {
          const options = storage.options;
          let option: TabOption = 'onetime';
          if (options.domain) option = 'domain';
          if (options.tablock) option = 'tablock';
          if (options.exact) option = 'exact';
          chrome.storage.sync.set({ [KEY_DEFAULT_TAB_OPTION]: option });
          continue;
        }
        const item = storage[key];
        // v1 regex URL matcher
        if (key.startsWith('*') && key.endsWith('*')) {
          chrome.storage.sync.remove(key);
          chrome.storage.sync.set({
            [`${PREFIX_REGEX}`]: item,
          });
        }
      }
    });
  }
});
