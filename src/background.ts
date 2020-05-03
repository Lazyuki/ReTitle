import { TabOption } from './shared/types';
import { KEY_DEFAULT_TAB_OPTION } from './shared/utils';

const REGEX_DOMAIN = /https?:\/\/([^\s/]+)(?:$|\/.*)/;
const validRegex = /^\/((?:[^/]|\\\/)+)\/((?:[^/]|\\\/)+)\/(gi?|ig?)?$/;

const cache: string[] = []; // To avoid eventListener reacting to its own change
let wait = false;
const waitList: (() => void)[] = []; // for each tab?
// const recursionStopper = (function() {
//   let tabCounter = {}
//   const add = (tabId) => {
//     if (tabCounter[tabId]) {
//       tabCounter[tabId]++;
//     } else {
//       tabCounter[tabId] = 1;
//     }
//   }
//   const shouldStop = (tabId) => {
//     add(tabId);
//     return tabCounter[tabId] >= 10; // if tab title is changing more than 10 times within 5 seconds, stop.
//   }
//   const resetAll = () => {
//     tabCounter = {};
//   }
//   setInterval(resetAll, 5000);
//   return shouldStop;
// })();

// Returns a title specified by regex
function decodeTitle(
  oldTitle: string,
  newTitle: string,
  url: string | null = null,
  urlPattern: RegExp | null = null
) {
  let captured = validRegex.exec(newTitle);
  if (captured) {
    let pattern = captured[1];
    let replacement = captured[2];
    let flags = captured[3];
    newTitle = oldTitle.replace(new RegExp(pattern, flags), replacement);
    if (newTitle == oldTitle) newTitle += ' | Regex Error: No pattern Match';
  }
  if (url && urlPattern) {
    console.log('newTitle after title regex: ' + newTitle);
    newTitle = newTitle.replace(/\$\{(\d)\}/g, '$$$1');
    console.log('newTitle after replacing ${#} to $#: ' + newTitle);
    newTitle = url.replace(urlPattern, newTitle);
  }
  newTitle = newTitle.replace('$0', oldTitle).replace(/\\/g, ''); // the first $0 turns into the previous title
  console.log(`Title decoded from ${oldTitle} to ${newTitle}`);
  return newTitle;
}

function executeNext() {
  wait = false;
  if (waitList.length) {
    waitList.shift()?.();
  }
}

// Update the tab title
function insertTitle(tabId: number, newTitle: string) {
  function execute() {
    wait = true;
    cache.push(newTitle);
    //if (recursionStopper.shouldStop(tabId)) return;
    console.log('Changing the title to ' + newTitle);
    chrome.tabs.executeScript(
      tabId,
      {
        code: `
        if (document.title) {
          document.title='${newTitle.replace(/'/g, "\\'")}';
        } else {
          let t = document.createElement('title');
          t.appendChild(document.createTextNode('${newTitle.replace(
            /'/g,
            "\\'"
          )}'));
          if (document.head) {
            var h = document.getElementsByTagName('head')[0];
          } else {
            var h = document.createElement('head');
            let d = document.documentElement;
            setTimeout(function() {d.insertBefore(h, d.firstChild)}, 1000);
          }
          h.appendChild(t);
        }`,
      },
      executeNext
    );
  }

  if (wait) {
    waitList.push(execute);
  } else {
    execute();
  }
}

// Listens for tab title changes, and update them if necessary.
chrome.tabs.onUpdated.addListener(function (tabId, info, tab) {
  if (info.title) {
    const infoTitle = info.title;
    let url = tab.url!;
    let index = cache.indexOf(info.title);
    if (index > -1) {
      cache.splice(index, 1);
      return; // I'm the one who changed the title to this
    }
    chrome.storage.sync.get(function (items) {
      if (items[`Tab#${tabId}`]) {
        // Tab lock has the highest priority
        console.log('TabID ' + tabId + ' detected.');
        let title = items[`Tab#${tabId}`]['title'];
        if (title == info.title) return;
        insertTitle(tabId, decodeTitle(infoTitle, title));
      } else if (items[url]) {
        // Exact URL match takes precedence over domain-level titles.
        console.log('Exact URL ' + url + ' detected.');
        let title = items[url]['title'];
        if (title == info.title) return;
        insertTitle(tabId, decodeTitle(infoTitle, title));
      } else {
        // Checks if domain -> title is specified
        let match = url.match(REGEX_DOMAIN);
        if (match) {
          let domainUrl = `*${match[1]}*`;
          if (items[domainUrl]) {
            console.log('Domain ' + domainUrl + ' detected.');
            let title = items[domainUrl]['title'];
            if (title == info.title) return;
            insertTitle(tabId, decodeTitle(infoTitle, title));
            return;
          }
        }
        // Try Regex
        console.log('Trying Regex ');
        try {
          for (let regex in items) {
            if (regex[0] != '*') continue;
            let r = new RegExp(
              '.*?' + regex.substr(1, regex.length - 1) + '.*'
            );
            let title = items[regex]['title'];
            if (r.test(url)) {
              console.log(`Regex ${regex} matched ${url}`);
              title = decodeTitle(infoTitle, title, url, r);
              insertTitle(tabId, title);
              return; // only the first match
            }
          }
        } catch (e) {
          // probably regex fail
          console.log(e);
        }
      }
    });
  }
});

// When closing a tab, clean up tab lock titles
chrome.tabs.onRemoved.addListener(function (tabId, info) {
  chrome.storage.sync.get(`Tab#${tabId}`, function (items) {
    if (items[`Tab#${tabId}`]) {
      chrome.storage.sync.remove(`Tab#${tabId}`);
    }
  });
});

// Simple context menu
chrome.contextMenus.create({ id: 'ctxmnu', title: 'Set temporary title' });
chrome.contextMenus.onClicked.addListener(function (info, tab) {
  chrome.tabs.executeScript({
    code:
      'const tempTitle = prompt("Enter a temporary title"); \
       if (tempTitle) document.title = tempTitle;',
  });
});

// Receives rename message from popup.js
chrome.runtime.onMessage.addListener(function (request) {
  insertTitle(request.id, decodeTitle(request.oldTitle, request.newTitle));
});

// Clean up any residuals from crash or something on startup
chrome.runtime.onStartup.addListener(function () {
  chrome.storage.sync.get(function (items) {
    for (let item in items) {
      if (item.startsWith('Tab#')) {
        // no old tablocks
        chrome.storage.sync.remove(item);
      }
    }
  });
});

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
      const storage: LegacyStorageSchema = items as LegacyStorageSchema;
      for (const key in storage) {
        // v0 tab lock mistake.
        if (key.startsWith('#')) {
          chrome.storage.sync.remove(key);
        }
        if (key === 'options') {
          const options = storage.options;
          let option: TabOption = 'onetime';
          if (options.domain) option = 'domain';
          if (options.tablock) option = 'tablock';
          if (options.exact) option = 'exact';
          chrome.storage.sync.set({ [KEY_DEFAULT_TAB_OPTION]: option });
        }
      }
    });
  }
});
