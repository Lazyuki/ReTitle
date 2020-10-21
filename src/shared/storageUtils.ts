export type GeneralStorageType = { [key: string]: unknown };

/**
 * Get all items
 */
export function getAllSyncItems(callback: (items: GeneralStorageType) => void) {
  chrome.storage.sync.get(callback);
}
export function getAllLocalItems(
  callback: (items: GeneralStorageType) => void
) {
  chrome.storage.local.get(callback);
}

/**
 * Get a single item with the key null otherwise
 */
export function getSyncItem<T = unknown>(
  key: string,
  callback: (item: T | null) => void
) {
  chrome.storage.sync.get(key, (items) => {
    if (key in items) {
      callback(items[key]);
    } else {
      callback(null);
    }
  });
}
export function getLocalItem<T = unknown>(
  key: string,
  callback: (item: T | null) => void
) {
  chrome.storage.local.get(key, (items) => {
    if (key in items) {
      callback(items[key]);
    } else {
      callback(null);
    }
  });
}

/**
 * Get items with multiple keys
 */
export function getSyncItems(
  keys: string[],
  callback: (items: GeneralStorageType) => void
) {
  chrome.storage.sync.get(keys, callback);
}
export function getLocalItems(
  keys: string[],
  callback: (items: GeneralStorageType) => void
) {
  chrome.storage.local.get(keys, callback);
}

/**
 * Set a key value pair
 */
export function setSyncItem(key: string, value: any, callback?: () => void) {
  chrome.storage.sync.set({ [key]: value }, callback);
}

export function setLocalItem(key: string, value: any, callback?: () => void) {
  chrome.storage.local.set({ [key]: value }, callback);
}

/**
 * Set key value pairs
 */
export function setSyncItems(
  items: Record<string, any>,
  callback?: () => void
) {
  chrome.storage.sync.set(items, callback);
}

export function setLocalItems(
  items: Record<string, any>,
  callback?: () => void
) {
  chrome.storage.local.set(items, callback);
}

/**
 * Remove items with the specified keys
 */
export function removeSyncItems(
  keys: string | string[],
  callback?: () => void
) {
  chrome.storage.sync.remove(keys, callback);
}

export function removeLocalItems(
  keys: string | string[],
  callback?: () => void
) {
  chrome.storage.local.remove(keys, callback);
}
