const REGEX_DOMAIN = /https?:\/\/(?:[^\s/]*\.)?([^./\s]+\.[a-z]+)(?:$|\/.*)/;

chrome.tabs.onUpdated.addListener(function (tabId, info, tab) {
  if (info.title) {
    let url = tab.url;
    chrome.storage.sync.get(url, function (items) {
      if (items[url]) { // Exact URL match takes precedence over domain-level titles.
        let title = items[url]['title'];
        if (title == info.title) return; // Unnecessary
        insertTitle(tabId, title);
      } else { // Checks if domain -> title is specified
        let match = url.match(REGEX_DOMAIN);
        if (!match) return;
        url = `*${match[1]}*`;
        chrome.storage.sync.get(url, function (domItems) {
          if (domItems[url]) {
            let title = domItems[url]['title'];
            if (title == info.title) return;
            insertTitle(tabId, title);
          }
        });
      }
    })
  }
})

function insertTitle(tabId, title) {
  chrome.tabs.executeScript(tabId,
    {code:`
      if (document.title) {
        document.title='${title}';
      } else {
        let t = document.createElement('title');
        t.appendChild(document.createTextNode('${title}'));
        if (document.head) {
          var h = document.getElementsByTagName('head')[0];
        } else {
          var h = document.createElement('head');
          let d = document.documentElement;
          setTimeout(function() {d.insertBefore(h, d.firstChild)}, 1000);
        }
        h.appendChild(t);
      }`
    }
  );
}

// Inject new title into the page
// @param tabId: Can be null if from popup.js.
// @required newTitle: New title name
// @param delay: Delay is used when inserting the <head> element for loading a local file.
// @param prepend: Prepend the given title to an existing title, if ther's one.
function injectTitle({tabId=null, newTitle, delay=false, prepend=false}) {
  if (delay) {
    var delayedInsert = 'setTimeout(function() {d.insertBefore(h, d.firstChild)}, 1000);';
  } else {
    var delayedInsert = 'd.insertBefore(h, d.firstChild);';
  }
  if (prepend) {
    var setTitle = `document.title = '${newTitle}: ' + document.title`;
  } else {
    var setTitle = `document.title = '${newTitle}'`;
  }
  chrome.tabs.executeScript(tabId,
    {code:`
      if (document.title) {
        ${setTitle}
      } else {
        let t = document.createElement('title');
        t.appendChild(document.createTextNode('${newTitle}'));
        if (document.head) {
          var h = document.getElementsByTagName('head')[0];
        } else {
          var h = document.createElement('head');
          let d = document.documentElement;
          ${delayedInsert}
        }
        h.appendChild(t);
      }`
    }
  );
}
