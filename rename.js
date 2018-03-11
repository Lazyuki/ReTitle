const DOMAIN_REGEX = /https?:\/\/(\S*\.)?([^.\s]+\.[a-z]+)($|\/.*)/;

function rename(newTitle, domain) {
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
  setStorage(newTitle, domain);
  window.close();
}

function setStorage(title, domain) {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function(tabs) {
    let obj = {};
    let url = tabs[0].url;
    if (domain) { // only for domain
      let urlDomain = url.match(DOMAIN_REGEX)[2];
      obj[`*${urlDomain}*`] = title;
    } else {
      obj[url] = title;
    }
    chrome.storage.sync.set(obj);
  })
}

let form = document.getElementById('form');
form.addEventListener('submit', function(e) {
  e.preventDefault();
  let domain = form.elements[1].checked;
  rename(form.elements[0].value, domain);
});
