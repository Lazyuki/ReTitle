import { PREFIX_TABLOCK } from '../shared/utils';
import {
  setLocalItems,
  getAllLocalItems,
  setLocalItem,
  removeLocalItems,
} from '../shared/storageUtils';

interface TablockCache {
  tabId: number;
  windowId: number;
  index: number;
  title: string;
  url?: string;
}
interface TablockCaches {
  [tabId: number]: TablockCache;
}

// Map tab position to IDs so that Tablock persists through sessions.
const tablockCaches: TablockCaches = {};
const previousTablockCaches: TablockCache[] = [];
let previousCrashed = false;

const debounce = <T extends any[]>(func: (...args: T) => any, wait = 250) => {
  let timer: any;
  return (...args: T) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), wait);
  };
};

function _recalculateTabPositionToId(windowId: number) {
  const tabIds = Object.keys(tablockCaches).map(parseInt);
  chrome.tabs.query({ windowId }, function (tabs) {
    tabs.forEach((tab) => {
      const { index, id: tabId, url } = tab;
      if (!tabId) return;
      if (tabIds.includes(tabId)) {
        const prev = tablockCaches[tabId];
        tablockCaches[tabId] = {
          tabId,
          windowId,
          index,
          url,
          title: prev.title,
        };
      }
    });
    // use local storage since it should not be synced
    setLocalItems({
      tablockCaches,
    });
  });
}

const recalculateTabPositionToId = debounce(
  (windowId: number) => _recalculateTabPositionToId(windowId),
  200
);

// Restore stored tablocks if possible
chrome.windows.onCreated.addListener(function (window) {
  if (window.type !== 'normal') return;
  window.tabs?.forEach((tab) => {
    if (tab.id === undefined || tab.id in tablockCaches) return;
    const matchedTab = previousTablockCaches.find(
      (t) => t.url === tab.url && t.index === tab.index
    );
    if (!matchedTab) return;
    const obj = {
      ...matchedTab,
      windowId: window.id,
    };
    setLocalItem(`${PREFIX_TABLOCK}${tab.id}`, obj);
    tablockCaches[tab.id] = obj;
  });
});

chrome.tabs.onCreated.addListener(function (tab) {
  recalculateTabPositionToId(tab.windowId);
});

// When closing a tab, clean up tab lock titles
chrome.tabs.onRemoved.addListener(function (tabId, info) {
  // Do not delete Tablock info when the window is closing.
  if (!info.isWindowClosing) {
    recalculateTabPositionToId(info.windowId);
    removeLocalItems(`${PREFIX_TABLOCK}${tabId}`);
  }
});

// Keep track of tab position to tabID
chrome.tabs.onMoved.addListener(function (tabId, info) {
  const windowId = info.windowId;
  // no need for debounce
  _recalculateTabPositionToId(windowId);
});

chrome.tabs.onDetached.addListener(function (tabId, info) {
  const windowId = info.oldWindowId;
  // no need for debounce
  _recalculateTabPositionToId(windowId);
});
chrome.tabs.onAttached.addListener(function (tabId, info) {
  const windowId = info.newWindowId;
  // no need for debounce
  _recalculateTabPositionToId(windowId);
});

chrome.tabs.onUpdated.addListener(function (tabId, info, tab) {
  if (tabId in tablockCaches) {
    tablockCaches[tabId] = {
      tabId,
      windowId: tab.windowId,
      index: tab.index,
      title: tab.title || '',
      url: tab.url,
    };
  }
});

// Get tablock caches when extension startsup
chrome.runtime.onStartup.addListener(function () {
  // tablock caches are stored locally
  getAllLocalItems().then(function (items) {
    const hasCrashed = items['crash'] as boolean | undefined;
    const tlc = items['tablockCaches'] as Record<string, TablockCache>;
    Object.keys(tlc).forEach((tabId) => {
      previousTablockCaches.push({
        ...tlc[tabId],
      });
    });
    previousCrashed = hasCrashed || false;
    setLocalItem('crash', true);
  });
  getAllLocalItems().then(function (items) {
    // Clean up residual Tablock keys stored in storage, since we fill those up through cache
    Object.keys(items).forEach((itemKey) => {
      if (itemKey.startsWith(PREFIX_TABLOCK)) {
        removeLocalItems(itemKey);
      }
    });
  });
});

// Indicate that all states are saved successfully
chrome.runtime.onSuspend.addListener(function () {
  removeLocalItems('crash');
});

// Flag that won't be cleaned if crashed
chrome.runtime.onSuspendCanceled.addListener(function () {
  setLocalItem('crash', true);
});
