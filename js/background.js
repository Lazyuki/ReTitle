const REGEX_DOMAIN = /https?:\/\/([^\s/]+)(?:$|\/.*)/; 
const validRegex = /^\/((?:[^/]|\\\/)+)\/((?:[^/]|\\\/)+)\/(gi?|ig?)?$/

// const cache = {}; // To avoid eventListener reacting to its own change
const cache = [];
let wait = false;
const waitList = []; // for each tab?


// Returns a title specified by regex
function decodeTitle(oldTitle, newTitle) {
  let captured = validRegex.exec(newTitle);
  if (captured) {
    let pattern = captured[1];
    let replacement = captured[2];
    let flags = captured[3];
    newTitle = oldTitle.replace(new RegExp(pattern, flags), replacement);
    if (newTitle == oldTitle) newTitle += ' | Regex Error: No pattern Match';
  }
  newTitle = newTitle.replace('$0', oldTitle).replace(/\\/g, ''); // the first $0 turns into the previous title
  return newTitle;
}

function executeNext() {
  wait = false;
  if (waitList.length) {
    waitList.shift()();
  }
}

// Update the tab title
function insertTitle(tabId, url, newTitle) {
  if (!cache.includes(newTitle)) {
    cache.push(newTitle);
  }
  function execute() {
    wait = true;
    console.log('will execute ' + newTitle);
    chrome.tabs.executeScript(tabId,
      {code:`
        if (document.title) {
          document.title='${newTitle.replace(/'/g, '\\\'')}';
        } else {
          let t = document.createElement('title');
          t.appendChild(document.createTextNode('${newTitle.replace(/'/g, '\\\'')}'));
          if (document.head) {
            var h = document.getElementsByTagName('head')[0];
          } else {
            var h = document.createElement('head');
            let d = document.documentElement;
            setTimeout(function() {d.insertBefore(h, d.firstChild)}, 1000);
          }
          h.appendChild(t);
        }`
      }, executeNext
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
  console.log(info);
  console.log(tab.status + ' | ' + tab.title);
  if (info.title) {
    let url = tab.url;
    if (url.endsWith('/')) url = url.slice(0, -1);
    let index = cache.indexOf(info.title);
    if (index > -1) {
      cache.splice(index, 1);
      console.log('i changed it to ' + info.title);
      return;
    }
    chrome.storage.sync.get(function (items) {
      if (items[`Tab#${tabId}`]) { // Tab lock has the highest priority
        console.log('tablock change');
        let title = items[`Tab#${tabId}`]['title'];
        title = decodeTitle(tab.title, title);
        if (title == tab.title) return;
        insertTitle(tabId, url, title);
      } else if (items[url]) { // Exact URL match takes precedence over domain-level titles.
        console.log('exact match change');
        let title = items[url]['title'];
        title = decodeTitle(tab.title, title)
        if (title == tab.title) return; 
        insertTitle(tabId, url, title);
      } else { // Checks if domain -> title is specified
        let match = url.match(REGEX_DOMAIN);
        if (!match) return;
        let domainUrl = `*${match[1]}*`;
        if (items[domainUrl]) {
          console.log('domain change ' + tab.title);
          let title = items[domainUrl]['title'];
          title = decodeTitle(tab.title, title);
          if (title == tab.title) return; 
          insertTitle(tabId, url, title);
        }
      }
    })
  }
})

// When closing a tab, clean up tab lock titles
chrome.tabs.onRemoved.addListener(function (tabId, info) {
  chrome.storage.sync.get(`Tab#${tabId}`, function (items) {
    if (items[`Tab#${tabId}`]) {
      chrome.storage.sync.remove(`Tab#${tabId}`);
    }  
  })
}) 

// Listen for shortcut
chrome.commands.onCommand.addListener(function(command) {
  if (command == 'setTitle') {
   chrome.tabs.executeScript({code : 'if (!title) { var title } title = prompt("Enter a temporary title"); if (title) document.title = title'});
   // let title = prompt('Enter a temporary title');
   // if (title) insertTitle(null,title);  
  } 
});

// Context menu
chrome.contextMenus.create({id:'ctxmnu', title:'Set temporary title'});
chrome.contextMenus.onClicked.addListener(function (info, tab) {
  chrome.tabs.executeScript({code : 'let title2 = prompt("Enter a temporary title"); if (title2) document.title = title2'});
  // if (tab) {
  //   let title = prompt('Enter a temporary title');
  //   if (title) insertTitle(tab.id, title);
  // }
});

// Receives rename message from popup.js
chrome.runtime.onMessage.addListener(
  function(request) {
    insertTitle(request.id, request.url, decodeTitle(request.oldTitle,request.newTitle));
    // sendResponse(); // notify popup.js
  }
);

// Clean up any residuals from crash or something on startup
chrome.runtime.onStartup.addListener(function() {
  chrome.storage.sync.get(function (items) {
    for (let item in items) {
      if (item.startsWith('Tab#')) { // no old tablocks
        chrome.storage.sync.remove(item);
      }
    }
  });
});

// UPDATE PREVIOUSLY STORED TITLES ON EXTENSION UPDATE
chrome.runtime.onInstalled.addListener((details) => {
  chrome.storage.sync.get(function (items) {
    let obj = {};
    for (let item in items) {
      if (item.startsWith('#')) { // old tab lock mistake
        chrome.storage.sync.remove(item);
      }
      if (item.endsWith('/')) {
        let newItem = item.slice(0, -1);
        obj[newItem] = items[item];
        chrome.storage.sync.remove(item);
      }
    }
    chrome.storage.sync.set(obj);
  })
});
