import './onInstall';
import './manageTablock';
import { setTitle } from './injectedScripts';

import { storageChangeHandler } from '../shared/storageHandler';
import {
  TabLockTitle,
  ExactTitle,
  DomainTitle,
  RegexTitle,
  TabOption,
  MessageRequest,
  NewTitle,
} from '../shared/types';

const REGEX_DOMAIN = /https?:\/\/([^\s/]+)(?:$|\/.*)/;
const validRegex = /^\/((?:[^/]|\\\/)+)\/((?:[^/]|\\\/)+)\/(gi?|ig?)?$/;

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
    const code = `${setTitle.toString()}; setTitle('${escapedTitle}', '${option}');`;
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
function decodeTitle(
  oldTitle: string,
  newTitle: NewTitle,
  url: string | null = null,
  urlPattern: RegExp | null = null
) {
  if (typeof newTitle === 'object') {
    const pattern = newTitle.captureRegex;
    const replacement = newTitle.titleRegex;
    const flags = newTitle.flags;
    newTitle = oldTitle.replace(new RegExp(pattern, flags), replacement);
    if (newTitle === oldTitle) {
      console.log('pattern match error');
    }
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
      cache.splice(index, 1);
      return; // I'm the one who changed the title to this
    }
    console.log(infoTitle);
    for (const tabTitle of tablocks) {
      if (tabTitle.tabId === tabId) {
        insertTitle(
          tabId,
          decodeTitle(infoTitle, tabTitle.newTitle!),
          tabTitle.option
        );
        return;
      }
    }
    for (const exactTitle of exacts) {
      if (compareURLs(url, exactTitle.url, exactTitle.ignoreParams)) {
        insertTitle(
          tabId,
          decodeTitle(infoTitle, exactTitle.newTitle!),
          exactTitle.option
        );
        return;
      }
    }
    for (const domainTitle of domains) {
      if (compareDomains(url, domainTitle.domain, domainTitle.useFull)) {
        insertTitle(
          tabId,
          decodeTitle(infoTitle, domainTitle.newTitle!),
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
            decodeTitle(infoTitle, regexTitle.newTitle!, url, urlPattern),
            regexTitle.option
          );
        }
      } catch (e) {
        console.log(e);
      }
    }
  }
});

const onTablockChange = (tablock: TabLockTitle) => {
  if (tablock.newTitle !== null) {
    tablocks.push(tablock);
  } else {
    // remove
    const index = tablocks.findIndex((t) => t.tabId === tablock.tabId);
    if (index >= 0) {
      tablocks.splice(index, 1);
    }
  }
};

const onExactChange = (exact: ExactTitle) => {
  if (exact.newTitle !== null) {
    exacts.push(exact);
  } else {
    const index = exacts.findIndex((e) => e.url === exact.url);
    if (index >= 0) {
      exacts.splice(index, 1);
    }
  }
};

const onDomainChange = (domain: DomainTitle) => {
  if (domain.newTitle !== null) {
    domains.push(domain);
  } else {
    // remove
    const index = domains.findIndex((d) => d.domain === domain.domain);
    if (index >= 0) {
      domains.splice(index, 1);
    }
  }
};

const onRegexChange = (regex: RegexTitle) => {
  if (regex.newTitle !== null) {
    regexes.push(regex);
  } else {
    const index = regexes.findIndex((t) => t.urlPattern === regex.urlPattern);
    if (index >= 0) {
      regexes.splice(index, 1);
    }
  }
};

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
       ${setTitle.toString()}; setTitle(tempTitle, 'onetime');`,
  });
});

// Receives rename message from popup.js
chrome.runtime.onMessage.addListener(function (request: MessageRequest) {
  insertTitle(
    request.id,
    decodeTitle(request.oldTitle, request.newTitle),
    request.option
  );
});
