import { TabOption } from '../shared/types';
import { KEY_DEFAULT_TAB_OPTION, PREFIX_REGEX } from '../shared/utils';
import {
  getAllSyncItems,
  removeSyncItems,
  setSyncItem,
  setLocalItem,
} from '../shared/storageUtils';
import { setDefaultOption } from '../shared/storageHandler';

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
    getAllSyncItems().then((items) => {
      const storage = items as LegacyStorageSchema;
      for (const key in storage) {
        // v0 tab lock mistake.
        if (key.startsWith('#')) {
          removeSyncItems(key);
          continue;
        }
        // v1 options key
        if (key === 'options') {
          const options = storage.options;
          let option: TabOption = 'onetime';
          if (options.domain) option = 'domain';
          if (options.tablock) option = 'tablock';
          if (options.exact) option = 'exact';
          setDefaultOption(option);
          removeSyncItems(key);
          continue;
        }
        const item = storage[key];
        // v1 regex URL matcher
        if (key.startsWith('Tab#')) {
          removeSyncItems(key); // TabLocks shouldn't be stored in sync anymore
          setLocalItem(key, item);
        }
        if (key.startsWith('*') && key.endsWith('*')) {
          removeSyncItems(key);
          setSyncItem(PREFIX_REGEX, item);
        }
      }
    });
  }
});
