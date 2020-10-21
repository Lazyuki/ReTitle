import './onInstall';
import './manageTablock';
import { injectTitle } from './injectedScripts';

import { storageChangeHandler } from '../shared/storageHandler';
import {
  TabLockTitle,
  ExactTitle,
  DomainTitle,
  RegexTitle,
  TabOption,
  MessageRequest,
  NewTitle,
  StorageAction,
  StoredTitle,
} from '../shared/types';

function escapeRegExp(str: string) {
  return str.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

let tablocks: TabLockTitle[] = [];
let exacts: ExactTitle[] = [];
let domains: DomainTitle[] = [];
let regexes: RegexTitle[] = [];

const cache: string[] = []; // To avoid eventListener reacting to its own change
let wait = false;
const waitList: (() => void)[] = []; // for each tab?

function executeNext() {
  wait = false;
  if (waitList.length) {
    waitList.shift()?.();
  }
}

// Update the tab title
function insertTitle(tabId: number, newTitle: string, option: TabOption) {
  function execute() {
    wait = true;
    cache.push(newTitle);
    //if (recursionStopper.shouldStop(tabId)) return;
    console.log('Changing the title to ' + newTitle);
    const escapedTitle = newTitle.replace(/'/g, "\\'");
    const code = `${injectTitle.toString()}; injectTitle('${escapedTitle}', '${option}');`;
    chrome.tabs.executeScript(
      tabId,
      {
        code,
        runAt: 'document_end',
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
async function decodeTitle(
  oldTitle: string,
  newTitle: NewTitle,
  tabId: number,
  url: string | null = null,
  urlPattern: RegExp | null = null
): Promise<string> {
  if (typeof newTitle === 'object') {
    if (newTitle.replacerType === 'function') {
      const code = newTitle.func;
      return new Promise((resolve, reject) => {
        chrome.tabs.executeScript(
          tabId,
          {
            code,
            runAt: 'document_end',
          },
          (results: string[]) => {
            resolve(results[0]);
          }
        );
      });
    } else {
      const pattern = newTitle.captureRegex;
      const replacement = newTitle.titleRegex;
      const flags = newTitle.flags;
      newTitle = oldTitle.replace(new RegExp(pattern, flags), replacement);
    }
    return '';
  } else if (newTitle.includes('$0')) {
    // // Make sure it doesn't use the cached old title and as an original title.
    // const newTitleRegex = new RegExp(
    //   escapeRegExp(newTitle.replace('$0', 'RETITLE_ORIGINAL_TITLE')).replace(
    //     'RETITLE_ORIGINAL_TITLE',
    //     '(.+)'
    //   )
    // );
    // const match = newTitleRegex.exec(oldTitle);
    // if (match) {
    //   oldTitle = match[1];
    // }
    // newTitle = newTitle.replace('$0', oldTitle).replace(/\\/g, ''); // the first $0 turns into the previous title
  }
  if (url && urlPattern) {
    newTitle = newTitle.replace(/\$\{([0-9])\}/g, '$$$1');
    newTitle = url.replace(urlPattern, newTitle);
  }
  console.log(`New title decoded for ${oldTitle} is: ${newTitle}`);
  return newTitle;
}

const URL_PARAMS_REGEX = /(\?.*$|#.*$)/g;

function compareURLs(url1: string, url2: string, ignoreParams?: boolean) {
  if (ignoreParams) {
    url1 = url1.replace(URL_PARAMS_REGEX, '');
    url2 = url2.replace(URL_PARAMS_REGEX, '');
  }
  if (url1.endsWith('/')) url1 = url1.slice(0, url1.length - 2);
  if (url2.endsWith('/')) url2 = url2.slice(0, url2.length - 2);
  return url1 === url2;
}
function compareDomains(url: string, domain: string, useFull?: boolean) {
  if (useFull) {
    url = url.replace(URL_PARAMS_REGEX, '');
    url = url.replace(URL_PARAMS_REGEX, '');
  }
  return url === domain;
}

// Listens for tab title changes, and update them if necessary.
chrome.tabs.onUpdated.addListener(function (tabId, info, tab) {
  if (info.title) {
    const infoTitle = info.title;
    let url = tab.url || '';
    let index = cache.indexOf(infoTitle);
    if (index > -1) {
      // TODO: detect titles with $0
      cache.splice(index, 1);
      return; // I'm the one who changed the title to this
    }
    console.log(infoTitle);
    if (!infoTitle) return;
    (async () => {
      for (const tabTitle of tablocks) {
        if (tabTitle.tabId === tabId) {
          insertTitle(
            tabId,
            await decodeTitle(infoTitle, tabTitle.newTitle!, tabId),
            tabTitle.option
          );
          return;
        }
      }
      for (const exactTitle of exacts) {
        if (compareURLs(url, exactTitle.url, exactTitle.ignoreParams)) {
          insertTitle(
            tabId,
            await decodeTitle(infoTitle, exactTitle.newTitle!, tabId),
            exactTitle.option
          );
          return;
        }
      }
      for (const domainTitle of domains) {
        if (compareDomains(url, domainTitle.domain, true)) {
          insertTitle(
            tabId,
            await decodeTitle(infoTitle, domainTitle.newTitle!, tabId),
            domainTitle.option
          );
          return;
        }
      }
      for (const regexTitle of regexes) {
        const pattern = regexTitle.urlPattern;
        try {
          const urlPattern = new RegExp(pattern);
          if (urlPattern.test(url)) {
            insertTitle(
              tabId,
              await decodeTitle(
                infoTitle,
                regexTitle.newTitle!,
                tabId,
                url,
                urlPattern
              ),
              regexTitle.option
            );
          }
        } catch (e) {
          console.log(e);
        }
      }
    })();
  }
});

const generateActionHandler = <T extends StoredTitle>(
  state: T[],
  equals: (t1: T, t2: T) => boolean
) => (action: StorageAction, newTitle: T) => {
  switch (action) {
    case 'add':
      state.push(newTitle);
      break;
    case 'edit': {
      const index = state.findIndex((t) => equals(t, newTitle));
      if (index >= 0) {
        state[index] = newTitle;
      }
    }
    case 'remove': {
      const index = state.findIndex((t) => equals(t, newTitle));
      if (index >= 0) {
        state.splice(index, 1);
      }
    }
  }
};

const onTablockChange = generateActionHandler(
  tablocks,
  (t1, t2) => t1.tabId === t2.tabId
);
const onExactChange = generateActionHandler(
  exacts,
  (t1, t2) => t1.url === t2.url
);
const onDomainChange = generateActionHandler(
  domains,
  (t1, t2) => t1.domain === t2.domain
);
const onRegexChange = generateActionHandler(
  regexes,
  (t1, t2) => t1.urlPattern === t2.urlPattern
);

chrome.storage.onChanged.addListener(
  storageChangeHandler({
    onTablockChange,
    onExactChange,
    onDomainChange,
    onRegexChange,
  })
);

// Simple context menu
chrome.contextMenus.create({ id: 'ctxmnu', title: 'Set a temporary title' });
chrome.contextMenus.onClicked.addListener(function (info, tab) {
  chrome.tabs.executeScript({
    code: `const tempTitle = prompt("Enter a temporary title"); \
       ${injectTitle.toString()}; injectTitle(tempTitle, 'onetime');`,
  });
});

// Receives rename message from popup.js
chrome.runtime.onMessage.addListener(function (request: MessageRequest) {
  (async () => {
    insertTitle(
      request.id,
      await decodeTitle(request.oldTitle, request.newTitle, 3),
      request.option
    );
  })();
});
