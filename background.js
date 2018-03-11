const DOMAIN_REGEX = /https?:\/\/(\S*\.)?([^.\s]+\.[a-z]+)($|\/.*)/;
chrome.tabs.onUpdated.addListener(function (tabId, info, tab) {
  if (info.title) {
    let url = tab.url;
    chrome.storage.sync.get(url, function (items) {
      if (items[url]) { // Exact URL match takes precedence over domain-level titles.
        let title = items[url];
        if (title == info.title) return; // Unnecessary
        insertTitle(tabId, title);
      } else { // Checks if domain -> title is specified
        url = `*${url.match(DOMAIN_REGEX)[2]}*`;
        chrome.storage.sync.get(url, function (domItems) {
          if (domItems[url]) {
            let title = domItems[url];
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
