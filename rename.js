$(document).ready(function() {
  $('#form').submit(function(e) {
    e.preventDefault();
    let title = $('#title').val();
    console.log(title)
    rename(title);
  });
})

function rename(e) {
  chrome.tabs.executeScript(null,
    {code:`
      if (document.title) { 
        document.title='${e}'; 
      } else { 
        let t = document.createElement('title');
        t.appendChild(document.createTextNode('${e}'));
        if (document.head) {
          var h = document.getElementsByTagName('head')[0];
        } else {
          var h = document.createElement('head');
          document.documentElement.appendChild(h);
        }
        h.appendChild(t)
      }`
    });
    // TODO: use insertBefore instead of appendChild? 
  $('div').show();
  getCurrentTabUrl(function(url) {
    chrome.storage.sync.set({url: e});
  })
}

function getCurrentTabUrl(callback) {  
  var queryInfo = {
    active: true, 
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    var tab = tabs[0]; 
    var url = tab.url;
    callback(url);
  });
}

