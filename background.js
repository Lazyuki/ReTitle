chrome.tabs.onUpdated.addListener(function (id, info, tab) {
  if (info.url) {
    chrome.storate.sync.get(info.url, function (items) {
      if (items[info.url]) {
        title = items[info.url];
        chrome.tabs.executeScript(id,
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
