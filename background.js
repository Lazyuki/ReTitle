chrome.tabs.onUpdated.addListener(function (tabId, info, tab) {
  if (info.title) {
    let url = tab.url;
    chrome.storage.sync.get(url, function (items) {
      if (items[url]) {
        let title = items[url];
        if (title == info.title) return; // Unnecessary
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
          });
      }
    })
  }
})
