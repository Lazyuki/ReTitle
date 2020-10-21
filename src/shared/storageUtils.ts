export type GeneralStorageType = { [key: string]: unknown };

type StorageArea = 'sync' | 'local';

async function getStorage<T = GeneralStorageType>(
  area: StorageArea,
  transformer: (items: GeneralStorageType) => T,
  keys?: string | string[]
): Promise<T> {
  if (BROWSER === 'firefox') {
    return transformer(await browser.storage[area].get(keys));
  }
  return new Promise((resolve) => {
    chrome.storage[area].get(keys || null, (items?: GeneralStorageType) => {
      resolve(transformer?.(items || {}));
    });
  });
}

async function modifyStorage(
  area: StorageArea,
  method: 'set',
  keys: GeneralStorageType
): Promise<void>;
async function modifyStorage(
  area: StorageArea,
  method: 'remove',
  keys: string | string[]
): Promise<void>;

async function modifyStorage(
  area: StorageArea,
  method: 'set' | 'remove',
  keys: string | string[] | GeneralStorageType
) {
  if (BROWSER === 'firefox') {
    return browser.storage[area][method](keys as any);
  }
  return new Promise((resolve) => {
    chrome.storage[area][method](keys as any, resolve);
  });
}

/**
 * Get all items
 */
export function getAllSyncItems(): Promise<GeneralStorageType> {
  return getStorage('sync', (i) => i);
}

export function getAllLocalItems(): Promise<GeneralStorageType> {
  return getStorage('local', (i) => i);
}

/**
 * Get a single item with the key null otherwise
 */
export function getSyncItem<T = unknown>(key: string): Promise<T | null> {
  return getStorage('sync', (items) => (items[key] as T) || null, key);
}

export function getLocalItem<T = unknown>(key: string): Promise<T | null> {
  return getStorage('local', (items) => (items[key] as T) || null, key);
}

/**
 * Get items with multiple keys
 */
export function getSyncItems<T extends GeneralStorageType>(
  keys: string[]
): Promise<T> {
  return getStorage('sync', (i) => i as T, keys);
}
export function getLocalItems<T extends GeneralStorageType>(
  keys: string[]
): Promise<T> {
  return getStorage('local', (i) => i as T, keys);
}

/**
 * Set a key value pair
 */
export function setSyncItem(key: string, value: any): Promise<void> {
  return modifyStorage('sync', 'set', { [key]: value });
}

export function setLocalItem(key: string, value: any): Promise<void> {
  return modifyStorage('local', 'set', { [key]: value });
}

/**
 * Set key value pairs
 */
export function setSyncItems(items: Record<string, any>): Promise<void> {
  return modifyStorage('sync', 'set', items);
}
export function setLocalItems(items: Record<string, any>): Promise<void> {
  return modifyStorage('local', 'set', items);
}

/**
 * Remove items with the specified keys
 */
export function removeSyncItems(keys: string | string[]): Promise<void> {
  return modifyStorage('sync', 'remove', keys);
}

export function removeLocalItems(keys: string | string[]): Promise<void> {
  return modifyStorage('local', 'remove', keys);
}
