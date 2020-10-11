interface TablockCache {
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
          windowId,
          index,
          url,
          title: prev.title,
        };
      }
    });
    // use local storage since it should not be synced
    chrome.storage.local.set({
      tablockCaches,
    });
  });
}

const recalculateTabPositionToId = debounce(
  (windowId: number) => _recalculateTabPositionToId(windowId),
  200
);

// Get tablock caches when extension startsup
chrome.runtime.onStartup.addListener(function () {
  // tablock caches are stored locally
  chrome.storage.local.get(function (items) {
    const tlc = items['tablockCaches'];
    Object.keys(tlc).forEach((tabId) => {
      previousTablockCaches.push({
        ...tlc[tabId],
      });
    });
  });
});

// Restore stored tablocks if possible
chrome.windows.onCreated.addListener(function (window) {
  if (window.type !== 'normal') return;
  window.tabs?.forEach((tab) => {
    if (tab.id === undefined || tab.id in tablockCaches) return;
    const matchedTab = previousTablockCaches.find(
      (t) => t.url === tab.url && t.index === tab.index
    );
    if (!matchedTab) return;
    tablockCaches[tab.id] = {
      ...matchedTab,
      windowId: window.id,
    };
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
    chrome.storage.sync.remove(`Tab#${tabId}`);
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
      windowId: tab.windowId,
      index: tab.index,
      title: tab.title || '',
      url: tab.url,
    };
  }
});
