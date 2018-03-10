function rename(newTitle) {
  chrome.tabs.executeScript(null,
    {code:`
      if (document.title) { 
        document.title='${newTitle}'; 
      } else { 
        let t = document.createElement('title');
        t.appendChild(document.createTextNode('${newTitle}'));
        if (document.head) {
          var h = document.getElementsByTagName('head')[0];
        } else {
          var h = document.createElement('head');
          let d = document.documentElement;
          d.insertBefore(h, d.firstChild);
        }

        h.appendChild(t)
      }`
    });
    // TODO: use insertBefore instead of appendChild? 
  document.getElementById('done').style.display = 'block';
  setStorage(newTitle);
  window.close();
}

function setStorage(title) {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function(tabs) {
    let obj = {};
    obj[tabs[0].url] = title;
    chrome.storage.sync.set(obj);
  })
}


let form = document.getElementById('form');
form.addEventListener('submit', function(e) {
  e.preventDefault();
  let title = form.elements[0].value;
  rename(title);
});
