export type GeneralStorageType = { [key: string]: unknown };

function makePromise<T = GeneralStorageType>(
  api: (callback: (items?: GeneralStorageType) => void) => void,
  transformer?: (items: GeneralStorageType) => T
): Promise<T> {
  return new Promise((resolve) => {
    api((items?: GeneralStorageType) => {
      resolve(transformer?.(items || {}));
    });
  });
}

function makePromiseWithParam<
  T = GeneralStorageType,
  K = string | string[] | Object
>(
  api: (keys: K, callback: (items?: GeneralStorageType) => void) => void,
  keys: K,
  transformer?: (items: GeneralStorageType) => T
): Promise<T> {
  return new Promise((resolve) => {
    api(keys, (items?: GeneralStorageType) => {
      resolve(transformer?.(items || {}));
    });
  });
}

/**
 * Get all items
 */
export function getAllSyncItems(): Promise<GeneralStorageType> {
  return makePromise(chrome.storage.sync.get, (i) => i);
}

export function getAllLocalItems(): Promise<GeneralStorageType> {
  return makePromise(chrome.storage.local.get, (i) => i);
}

/**
 * Get a single item with the key null otherwise
 */
export function getSyncItem<T = unknown>(key: string): Promise<T | null> {
  return makePromiseWithParam<T | null>(
    chrome.storage.sync.get,
    key,
    (items) => {
      return (items[key] as T) || null;
    }
  );
}

export function getLocalItem<T = unknown>(key: string): Promise<T | null> {
  return makePromiseWithParam<T | null>(
    chrome.storage.local.get,
    key,
    (items) => {
      return (items[key] as T) || null;
    }
  );
}

/**
 * Get items with multiple keys
 */
export function getSyncItems<T extends GeneralStorageType>(
  keys: string[]
): Promise<T> {
  return makePromiseWithParam<T>(chrome.storage.sync.get, keys, (i) => i as T);
}
export function getLocalItems<T extends GeneralStorageType>(
  keys: string[]
): Promise<T> {
  return makePromiseWithParam<T>(chrome.storage.local.get, keys, (i) => i as T);
}

/**
 * Set a key value pair
 */
export function setSyncItem(key: string, value: any): Promise<void> {
  return makePromiseWithParam(chrome.storage.sync.set, { [key]: value });
}

export function setLocalItem(key: string, value: any): Promise<void> {
  return makePromiseWithParam(chrome.storage.local.set, { [key]: value });
}

/**
 * Set key value pairs
 */
export function setSyncItems(items: Record<string, any>): Promise<void> {
  return makePromiseWithParam(chrome.storage.sync.set, items);
}
export function setLocalItems(items: Record<string, any>): Promise<void> {
  return makePromiseWithParam(chrome.storage.local.set, items);
}

/**
 * Remove items with the specified keys
 */
export function removeSyncItems(keys: string | string[]): Promise<void> {
  return makePromiseWithParam(chrome.storage.sync.remove, keys);
}

export function removeLocalItems(keys: string | string[]): Promise<void> {
  return makePromiseWithParam(chrome.storage.local.remove, keys);
}
