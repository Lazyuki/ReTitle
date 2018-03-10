function checkAndUpdate(tabId, url) {
}

chrome.tabs.onUpdated.addListener(function (tabId, info, tab) {
  if (info.status == 'complete' || info.title) {
    let url = tab.url;
    chrome.storage.sync.get(url, function (items) {
      if (items[url]) {
        let title = items[url];
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
                document.documentElement.appendChild(h);
              }
              h.appendChild(t)
            }`
          });
      }
    })
  }
})
